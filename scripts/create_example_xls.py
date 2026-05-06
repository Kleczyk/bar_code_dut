"""Tworzy plik testowy example_data.xls w folderze example (format Excel 97-2003)."""
import xlwt
from pathlib import Path

OUTPUT = Path(__file__).parent.parent / "example" / "example_data.xls"

ROWS = [
    ["1001", "Anna Kowalska", "Kalisz", "SEMESTR 7"],
    ["1002", "Jan Nowak", "Rzeszów", "SEMESTR 7"],
    ["1003", "Maria Wiśniewska", "Kraków", "SEMESTR 7"],
    ["1004", "Piotr Lewandowski", "Warszawa", "SEMESTR 7"],
    ["1005", "Katarzyna Dąbrowska", "Gdańsk", "SEMESTR 7"],
]

wb = xlwt.Workbook()
ws = wb.add_sheet("Dane")
for row_idx, row in enumerate(ROWS):
    for col_idx, value in enumerate(row):
        ws.write(row_idx, col_idx, value)
wb.save(OUTPUT)
print(f"Utworzono {OUTPUT}")
