"""
xlsx_to_json.py — Convierte data/preguntas.xlsx → data/preguntas.json

Ejecutar desde la raíz del proyecto:
    python scripts/xlsx_to_json.py

Usar cuando se actualicen las preguntas en el xlsx.
Requiere: pip install openpyxl
"""

import json
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: instala openpyxl con:  pip install openpyxl")
    sys.exit(1)

ROOT      = Path(__file__).parent.parent
XLSX_PATH = ROOT / 'data' / 'preguntas.xlsx'
JSON_PATH = ROOT / 'data' / 'preguntas.json'
SHEET     = 'Preguntas'

def convert():
    if not XLSX_PATH.exists():
        print(f"ERROR: no se encontró {XLSX_PATH}")
        sys.exit(1)

    wb = openpyxl.load_workbook(XLSX_PATH)
    if SHEET not in wb.sheetnames:
        print(f"ERROR: hoja '{SHEET}' no encontrada. Hojas disponibles: {wb.sheetnames}")
        sys.exit(1)

    ws = wb[SHEET]
    questions = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[0]:
            continue
        opciones = [
            str(row[i]).strip()
            for i in range(4, 19)
            if row[i] and str(row[i]).strip()
        ]
        cod = str(row[1]) if row[1] else ''
        questions.append({
            'id':      row[0],
            'codigo':  cod,
            'modulo':  cod[:3].upper(),
            'texto':   str(row[2]).strip() if row[2] else '',
            'tipo':    str(row[3]).strip() if row[3] else 'Selección única',
            'opciones': opciones,
        })

    JSON_PATH.write_text(
        json.dumps(questions, ensure_ascii=False, separators=(',', ':')),
        encoding='utf-8'
    )

    size_kb = JSON_PATH.stat().st_size / 1024
    print(f"✓ {len(questions)} preguntas exportadas → {JSON_PATH}  ({size_kb:.1f} KB)")

if __name__ == '__main__':
    convert()