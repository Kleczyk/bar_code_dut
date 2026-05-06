# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec dla Generatora identyfikatorów.
Uruchom z katalogu packaging/: pyinstaller --noconfirm pyinstaller.spec
"""
import os

SPEC_DIR = os.path.dirname(os.path.abspath(SPEC))
REPO_ROOT = os.path.normpath(os.path.join(SPEC_DIR, ".."))
APP_BACKEND = os.path.join(REPO_ROOT, "app", "backend")
APP_FRONTEND_DIST = os.path.join(REPO_ROOT, "app", "frontend", "dist")
PACKAGING_FONTS = os.path.join(SPEC_DIR, "fonts")
ICON_FILE = os.path.join(SPEC_DIR, "icon.ico")

datas = []
if os.path.isdir(APP_BACKEND):
    datas.append((APP_BACKEND, "backend"))
if os.path.isdir(APP_FRONTEND_DIST):
    datas.append((APP_FRONTEND_DIST, os.path.join("frontend", "dist")))
else:
    import sys
    print("UWAGA: Brak app/frontend/dist/ – najpierw uruchom 'npm run build' w app/frontend/", file=sys.stderr)
if os.path.isdir(PACKAGING_FONTS):
    datas.append((PACKAGING_FONTS, "fonts"))

icon = ICON_FILE if os.path.isfile(ICON_FILE) else None

a = Analysis(
    [os.path.join(SPEC_DIR, "launcher.py")],
    pathex=[SPEC_DIR],
    datas=datas,
    hiddenimports=[
        "uvicorn.logging",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.http.httptools_impl",
        "uvicorn.loops.auto",
        "uvicorn.lifespan.on",
        "fastapi",
        "starlette",
        "starlette.responses",
        "starlette.routing",
        "starlette.middleware",
        "PIL",
        "PIL.Image",
        "barcode",
        "barcode.codex",
        "barcode.writer",
        "barcode.writer.image",
        "pandas",
        "openpyxl",
        "xlrd",
        "multipart",
        "multipart.multipart",
    ],
    excludes=[
        "tkinter",
        "matplotlib",
        "scipy",
        "numpy.distutils",
        "cairosvg",
        "cairocffi",
        "pytest",
        "unittest",
        "IPython",
        "notebook",
    ],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="GeneratorIdentyfikatorow",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=icon,
)
