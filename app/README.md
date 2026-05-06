# Generator wizytówek z kodem kreskowym

Aplikacja webowa do generowania wizytówek/identyfikatorów z kodem kreskowym Code 128.

## Uruchomienie (Docker)

```bash
cd app
docker compose up --build
```

Aplikacja dostępna pod: http://localhost:8000

## Funkcje

- **Wzór wizytówki** – upload PNG, JPG lub SVG
- **Pozycje pól** – ustawienie współrzędnych dla: numer, imię, miejscowość, semestr, kod kreskowy
- **Import danych** – CSV, XLS, XLSX (kolumny: numer, imię, miejscowość, semestr)
- **Pojedyncza osoba** – wpisanie danych ręcznie
- **Eksport** – jeden plik PNG z wieloma wizytówkami w siatce

## Przykład

Plik `example_data.csv` zawiera przykładowe dane (numer, imię, miejscowość, semestr). Jako wzór można użyć pliku z folderu `../example/`.
