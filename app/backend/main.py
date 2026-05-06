"""
FastAPI backend for barcode badge generator.
"""
import io
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse

from services.render import BadgeRenderer

app = FastAPI(title="Generator identyfikatorów z kodem kreskowym")

# Static frontend: PyInstaller uses _MEIPASS, else find app root (app/ or /app in Docker)
if getattr(sys, "frozen", False):
    _BASE = Path(sys._MEIPASS)
else:
    _here = Path(__file__).resolve().parent
    # Dev: app/backend/main.py -> app/; Docker: /app/main.py -> /app
    _BASE = _here.parent if (_here.parent / "frontend").exists() else _here
FRONTEND_DIR = _BASE / "frontend"
STATIC_DIR = FRONTEND_DIR / "dist" if (FRONTEND_DIR / "dist").exists() else FRONTEND_DIR


@app.get("/")
async def root():
    index = STATIC_DIR / "index.html"
    if index.exists():
        return FileResponse(index)
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/favicon.svg")
async def favicon():
    path = STATIC_DIR / "favicon.svg"
    if path.exists():
        return FileResponse(path, media_type="image/svg+xml")
    raise HTTPException(404)


_assets_dir = STATIC_DIR / "assets"
if _assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")


@app.post("/api/template/upload")
async def upload_template(file: UploadFile = File(...)):
    """Upload template image (PNG, JPG, SVG). Returns temp path for session."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".png", ".jpg", ".jpeg", ".svg"):
        raise HTTPException(400, "Obsługiwane formaty: PNG, JPG, SVG")
    content = await file.read()
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        return {"path": tmp.name}


@app.post("/api/import")
async def import_data(file: UploadFile = File(...)):
    """Import CSV/XLS/XLSX. Returns list of rows: [{numer, imie, miejscowosc, semestr}]."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".csv", ".xls", ".xlsx"):
        raise HTTPException(400, "Obsługiwane formaty: CSV, XLS, XLSX")
    content = await file.read()
    df = BadgeRenderer.parse_data(content, ext)
    rows = df.to_dict("records")
    return {"rows": rows, "count": len(rows)}


@app.post("/api/export")
async def export_badges(
    template_file: UploadFile = File(...),
    data_file: UploadFile = File(None),
    layout_json: str = Form(...),
    columns: int = Form(3),
    spacing: int = Form(20),
    single_numer: str = Form(""),
    single_imie: str = Form(""),
    single_miejscowosc: str = Form(""),
    single_semestr: str = Form(""),
):
    """
    Generate badges. Either data_file (CSV/XLS) or single_* fields must be provided.
    Returns PNG with all badges in a grid.
    """
    content = await template_file.read()
    ext = Path(template_file.filename or "").suffix.lower()
    layout = BadgeRenderer.parse_layout(layout_json)

    if data_file and data_file.filename:
        data_content = await data_file.read()
        data_ext = Path(data_file.filename or "").suffix.lower()
        rows = BadgeRenderer.parse_data(data_content, data_ext).to_dict("records")
    else:
        if not single_numer and not single_imie:
            raise HTTPException(400, "Podaj plik z danymi lub dane pojedynczej osoby")
        rows = [{
            "numer": single_numer,
            "imie": single_imie,
            "miejscowosc": single_miejscowosc,
            "semestr": single_semestr,
        }]

    try:
        img_bytes = BadgeRenderer.render_badges(
            template_content=content,
            template_ext=ext,
            rows=rows,
            layout=layout,
            columns=columns,
            spacing=spacing,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

    return StreamingResponse(
        io.BytesIO(img_bytes),
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=wizytowki.png"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
