"""
Badge rendering: load template, overlay text/barcode, arrange in grid.
"""
import io
import json
import sys
from pathlib import Path
from typing import Any

import barcode
from barcode.writer import ImageWriter
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

try:
    import cairosvg
    SVG_SUPPORTED = True
except (ImportError, OSError):
    cairosvg = None
    SVG_SUPPORTED = False


def _load_template(content: bytes, ext: str) -> Image.Image:
    ext = ext.lower()
    if ext == ".svg":
        if not SVG_SUPPORTED:
            raise ValueError(
                "SVG nie jest obsługiwane w wersji .exe. Użyj PNG lub JPG."
            )
        png_bytes = cairosvg.svg2png(bytestring=content)
        return Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    return Image.open(io.BytesIO(content)).convert("RGBA")


def _generate_barcode(value: str, width: float = 2, height: float = 60) -> Image.Image:
    code = barcode.get("code128", value, writer=ImageWriter())
    buf = io.BytesIO()
    code.write(buf, options={"module_width": width, "module_height": height, "write_text": False})
    buf.seek(0)
    img = Image.open(buf).convert("RGBA")
    return img


def _get_font(size: int = 24):
    font_paths = []
    if getattr(sys, "frozen", False):
        font_paths.append(Path(sys._MEIPASS) / "fonts" / "DejaVuSans-Bold.ttf")
    base = Path(__file__).resolve().parent.parent.parent
    font_paths.extend([
        base / "fonts" / "DejaVuSans-Bold.ttf",
        base / "packaging" / "fonts" / "DejaVuSans-Bold.ttf",
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ])
    for p in font_paths:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                continue
    return ImageFont.load_default()


class BadgeRenderer:
    DEFAULT_LAYOUT = {
        "numer": {"x": 50, "y": 80, "font_size": 24},
        "imie": {"x": 50, "y": 110, "font_size": 24},
        "barcode": {"x": 50, "y": 150, "width": 200, "height": 60},
        "miejscowosc": {"x": 50, "y": 220, "font_size": 18},
        "semestr": {"x": 50, "y": 250, "font_size": 18},
    }

    @staticmethod
    def parse_layout(layout_json: str) -> dict[str, Any]:
        try:
            return json.loads(layout_json)
        except json.JSONDecodeError:
            return BadgeRenderer.DEFAULT_LAYOUT.copy()

    @staticmethod
    def parse_data(content: bytes, ext: str) -> pd.DataFrame:
        ext = ext.lower()
        if ext == ".csv":
            df = pd.read_csv(io.BytesIO(content), encoding="utf-8-sig", header=None)
        elif ext == ".xls":
            df = pd.read_excel(io.BytesIO(content), header=None, engine="xlrd")
        elif ext == ".xlsx":
            df = pd.read_excel(io.BytesIO(content), header=None, engine="openpyxl")
        else:
            raise ValueError(f"Nieobsługiwany format: {ext}")

        result = pd.DataFrame()
        for i, c in enumerate(["numer", "imie", "miejscowosc", "semestr"]):
            result[c] = df.iloc[:, i].astype(str).str.strip() if i < len(df.columns) else ""
        return result.fillna("")

    @staticmethod
    def render_single_badge(
        template: Image.Image,
        row: dict[str, str],
        layout: dict[str, Any],
    ) -> Image.Image:
        base = template.copy()
        draw = ImageDraw.Draw(base)

        # Text fields
        for key in ("numer", "imie", "miejscowosc", "semestr"):
            cfg = layout.get(key, {})
            x = int(cfg.get("x", 50))
            y = int(cfg.get("y", 50))
            size = int(cfg.get("font_size", 24))
            text = str(row.get(key, ""))
            if not text:
                continue
            font = _get_font(size)
            draw.text((x, y), text, fill=(0, 0, 0), font=font)

        # Barcode
        barcode_val = str(row.get("numer", ""))
        if barcode_val:
            cfg = layout.get("barcode", {})
            x = int(cfg.get("x", 50))
            y = int(cfg.get("y", 150))
            w = int(cfg.get("width", 200))
            h = int(cfg.get("height", 60))
            bc_img = _generate_barcode(barcode_val, width=1.5, height=h / 10)
            bc_img = bc_img.resize((w, h), Image.Resampling.LANCZOS)
            base.paste(bc_img, (x, y), bc_img)

        return base

    @staticmethod
    def render_badges(
        template_content: bytes,
        template_ext: str,
        rows: list[dict[str, str]],
        layout: dict[str, Any],
        columns: int = 3,
        spacing: int = 20,
    ) -> bytes:
        template = _load_template(template_content, template_ext)
        w, h = template.size

        badges = []
        for row in rows:
            badge = BadgeRenderer.render_single_badge(template, row, layout)
            badges.append(badge)

        cols = min(columns, len(badges))
        rows_count = (len(badges) + cols - 1) // cols
        out_w = cols * w + (cols + 1) * spacing
        out_h = rows_count * h + (rows_count + 1) * spacing

        out = Image.new("RGBA", (out_w, out_h), (255, 255, 255, 255))
        for i, badge in enumerate(badges):
            col = i % cols
            row_idx = i // cols
            x = spacing + col * (w + spacing)
            y = spacing + row_idx * (h + spacing)
            out.paste(badge, (x, y))

        buf = io.BytesIO()
        out.convert("RGB").save(buf, format="PNG")
        return buf.getvalue()
