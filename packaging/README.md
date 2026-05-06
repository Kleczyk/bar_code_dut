# Generator identyfikatorów -- budowanie EXE (Windows)

Jednoklikowy, przenośny plik `.exe` -- skopiuj na pendrive, uruchom na dowolnym Windowsie.

## Szybki start (pendrive)

1. Pobierz `GeneratorIdentyfikatorow.exe` z [GitHub Releases](../../releases) lub zbuduj sam (patrz niżej).
2. Skopiuj plik na pendrive.
3. Na docelowym komputerze: **podwójne kliknięcie** na EXE.
4. Przeglądarka otworzy się automatycznie -- gotowe.

**Nie wymaga** instalacji Python, Node.js, ani żadnych bibliotek na docelowym komputerze.

## Budowanie lokalne

### Wymagania (komputer budujący)

- **Windows** (budowanie na Linux/WSL tworzy plik bez `.exe`)
- **Python 3.12+**
- **Node.js 18+**
- **pip**

### Kroki

```bash
cd packaging
build.bat
```

Skrypt automatycznie:
1. Sprawdza czy Python, Node.js, npm są dostępne
2. Instaluje zależności Python (`requirements.txt` + PyInstaller)
3. Instaluje zależności frontendu (`npm install`)
4. Buduje frontend (`npm run build`)
5. Buduje EXE (PyInstaller)
6. Kopiuje wynik do `packaging/release/GeneratorIdentyfikatorow.exe`

### Linux / WSL

```bash
cd packaging
./build.sh
```

> **Uwaga:** Budowanie na Linux tworzy plik binarny, który nie jest `.exe` dla Windows.
> Aby uzyskać prawdziwy `.exe`, buduj na Windows lub użyj GitHub Actions.

## Budowanie przez GitHub Actions (CI/CD)

Repozytorium zawiera workflow `.github/workflows/build-exe.yml`, który automatycznie buduje EXE na Windows runnerze.

### Automatyczny release

Wypchnij tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions zbuduje EXE i doda go do GitHub Release.

### Ręczne uruchomienie

W zakładce **Actions** na GitHub wybierz workflow "Build Windows EXE" i kliknij **Run workflow**.
Gotowy EXE pojawi się jako artefakt do pobrania.

## Co robi EXE po uruchomieniu

1. Znajduje wolny port (domyślnie 8000, jeśli zajęty -- kolejny).
2. Uruchamia serwer w tle.
3. Otwiera przeglądarkę z aplikacją.
4. Na Windows pokazuje okno informacyjne o starcie.
5. Zamknięcie okna konsoli lub Ctrl+C zatrzymuje aplikację.

## Ograniczenia wersji EXE

- **SVG**: format SVG nie jest obsługiwany (brak biblioteki Cairo). Użyj PNG lub JPG jako wzoru.
- **Rozmiar**: ok. 150--250 MB (Python + zależności).
- **Start**: pierwsze uruchomienie może trwać kilka sekund (rozpakowanie).

## Struktura

```
packaging/
├── build.bat           # Skrypt budowania (Windows)
├── build.sh            # Skrypt budowania (Linux/WSL)
├── launcher.py         # Punkt wejścia EXE
├── pyinstaller.spec    # Konfiguracja PyInstaller
├── requirements.txt    # Zależności Pythona
├── icon.ico            # Ikona aplikacji
├── fonts/              # Czcionka DejaVu (dla Pillow)
├── run.bat             # Uruchamianie zbudowanego EXE
├── release/            # Folder z wynikowym EXE (po build)
└── README.md
```
