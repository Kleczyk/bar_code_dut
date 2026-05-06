#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "============================================"
echo " Generator identyfikatorów - Budowanie EXE"
echo "============================================"
echo ""

# ---- Sprawdzenie wymaganych narzędzi ----

echo "[0/5] Sprawdzanie wymaganych narzędzi..."

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "BŁĄD: $1 nie jest zainstalowany lub nie jest w PATH."
        echo "  $2"
        exit 1
    fi
}

check_cmd python3 "Zainstaluj Python 3.12+: https://www.python.org/downloads/"
check_cmd node "Zainstaluj Node.js: https://nodejs.org/"
check_cmd npm "npm powinien być zainstalowany razem z Node.js"

echo "  Python: $(python3 --version)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# ---- Instalacja zależności Python ----

echo "[1/5] Instalacja zależności Python..."
pip3 install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet
pip3 install pyinstaller --quiet 2>/dev/null || pip install pyinstaller --quiet
echo "  Zależności Python: OK"
echo ""

# ---- Instalacja i budowanie frontendu ----

echo "[2/5] Instalacja zależności frontendu..."
cd "../app/frontend"
npm install --silent
echo "  npm install: OK"
echo ""

echo "[3/5] Budowanie frontendu (npm run build)..."
npm run build
echo "  Frontend: OK"
echo ""
cd "../../packaging"

# ---- Budowanie EXE ----

echo "[4/5] Budowanie EXE (PyInstaller)..."
pyinstaller --noconfirm pyinstaller.spec
echo "  PyInstaller: OK"
echo ""

# ---- Kopiowanie do folderu release ----

echo "[5/5] Przygotowanie folderu release..."
mkdir -p release

EXE_NAME="GeneratorIdentyfikatorow"
if [ -f "dist/${EXE_NAME}.exe" ]; then
    cp "dist/${EXE_NAME}.exe" "release/${EXE_NAME}.exe"
    RESULT="release/${EXE_NAME}.exe"
elif [ -f "dist/${EXE_NAME}" ]; then
    cp "dist/${EXE_NAME}" "release/${EXE_NAME}"
    RESULT="release/${EXE_NAME}"
else
    echo "BŁĄD: Plik nie został znaleziony w dist/"
    exit 1
fi

cp odinstaluj.bat "release/odinstaluj.bat" 2>/dev/null || true

echo ""
echo "============================================"
echo " GOTOWE!"
echo "============================================"
echo ""
echo "  Plik: $(pwd)/${RESULT}"
echo "  Odinstalowanie: $(pwd)/release/odinstaluj.bat"
echo "  Rozmiar: $(du -h "${RESULT}" | cut -f1)"
echo ""
echo "  Skopiuj OBA pliki na pendrive:"
echo "    - ${RESULT##*/}"
echo "    - odinstaluj.bat"
echo ""

if [[ "$(uname -s)" != *MINGW* ]] && [[ "$(uname -s)" != *CYGWIN* ]] && [[ "$(uname -s)" != *MSYS* ]]; then
    echo "  UWAGA: Budowanie na Linux/macOS tworzy plik binarny,"
    echo "  który NIE jest .exe dla Windows."
    echo "  Aby uzyskać .exe, buduj na Windows lub użyj GitHub Actions."
    echo ""
fi
