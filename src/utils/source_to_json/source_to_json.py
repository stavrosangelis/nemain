#!/usr/bin/env python3
"""Convert a PAD character spreadsheet (.xlsx or .ods) to JSON."""

import json
import sys
from pathlib import Path

try:
    import openpyxl
    HAS_XLSX = True
except ImportError:
    HAS_XLSX = False

try:
    from odf.opendocument import load as odf_load
    from odf.table import Table as OdfTable, TableRow as OdfTableRow, TableCell as OdfTableCell
    from odf import teletype
    HAS_ODS = True
except ImportError:
    HAS_ODS = False

# ODF qualified name for <text:p> (paragraph) elements
_ODS_TEXT_P = ("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "p")

# Cap for number-columns-repeated expansion; prevents blowing up on trailing
# empty-cell blocks that LibreOffice encodes with very large repeat counts.
_ODS_MAX_REPEAT = 1024

# Maps spreadsheet header names to JSON keys (used only for missing-header warnings)
HEADER_MAP = {
    "Character Name": "character_name",
    "Alternate Names": "alternate_names",
    "Page": "page",
    "Role/Notes": "role_notes",
    "Gender": "gender",
    "Friendly": "friendly",
    "Hostile": "hostile",
    "Familial links": "familial_links",
    "Foster links": "foster_links",
}


# ---------------------------------------------------------------------------
# File readers — both return a list of tuples (one per row, values only)
# ---------------------------------------------------------------------------

def read_xlsx_rows(path: str) -> list[tuple]:
    if not HAS_XLSX:
        print("Error: openpyxl is required for .xlsx files.  pip install openpyxl")
        sys.exit(1)
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = list(wb.active.iter_rows(values_only=True))
    wb.close()
    return rows


def _ods_cell_text(cell) -> str | None:
    """Extract text from an ODS cell, skipping embedded <office:annotation> nodes."""
    parts = []
    for child in cell.childNodes:
        if getattr(child, "qname", None) == _ODS_TEXT_P:
            parts.append(teletype.extractText(child))
    text = "\n".join(p for p in parts if p).strip()
    return text or None


def read_ods_rows(path: str) -> list[tuple]:
    if not HAS_ODS:
        print("Error: odfpy is required for .ods files.  pip install odfpy")
        sys.exit(1)
    doc = odf_load(path)
    sheet = doc.spreadsheet.getElementsByType(OdfTable)[0]
    rows = []
    for odf_row in sheet.getElementsByType(OdfTableRow):
        cells = odf_row.getElementsByType(OdfTableCell)
        row_values: list = []
        for cell in cells:
            repeat = min(int(cell.getAttribute("numbercolumnsrepeated") or 1), _ODS_MAX_REPEAT)
            val = _ods_cell_text(cell)
            row_values.extend([val] * repeat)
        # Trim trailing Nones produced by repeated empty cells at row end
        while row_values and row_values[-1] is None:
            row_values.pop()
        if row_values:
            rows.append(tuple(row_values))
    return rows


# ---------------------------------------------------------------------------
# Core transformation (format-agnostic)
# ---------------------------------------------------------------------------

def clean(value) -> str | None:
    """Return None for blank/whitespace values, otherwise a stripped string."""
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def parse_header_groups(header_row: tuple) -> dict[str, list[int]]:
    """
    Map each named header to the column indices that belong to its group.
    Columns whose header cell is None are continuation slots of the most
    recent named header.

    e.g. ('Friendly', None, None, 'Hostile') → {'Friendly': [0,1,2], 'Hostile': [3]}
    """
    groups: dict[str, list[int]] = {}
    current: str | None = None
    for i, cell in enumerate(header_row):
        if cell is not None:
            current = str(cell).strip()
            groups[current] = [i]
        elif current is not None:
            groups[current].append(i)
    return groups


def row_to_record(row: tuple, groups: dict, row_id: int) -> dict:
    """Convert one spreadsheet row to a JSON-ready dict."""

    def scalar(field_name: str):
        indices = groups.get(field_name, [])
        if not indices:
            return None
        idx = indices[0]
        return clean(row[idx]) if idx < len(row) else None

    def as_list(field_name: str) -> list:
        return [
            v
            for idx in groups.get(field_name, [])
            if idx < len(row) and (v := clean(row[idx])) is not None
        ]

    page = scalar("Page")
    if page is not None:
        try:
            page = int(float(page))
        except (ValueError, TypeError):
            page = None

    return {
        "id": row_id,
        "character_name": scalar("Character Name"),
        "alternate_names": scalar("Alternate Names"),
        "page": page,
        "role_notes": scalar("Role/Notes"),
        "gender": scalar("Gender"),
        "friendly": as_list("Friendly"),
        "hostile": as_list("Hostile"),
        "familial_links": as_list("Familial links"),
        "foster_links": scalar("Foster links"),
    }


def convert(input_path: str, output_path: str | None = None) -> Path:
    suffix = Path(input_path).suffix.lower()
    if suffix == ".xlsx":
        all_rows = read_xlsx_rows(input_path)
    elif suffix == ".ods":
        all_rows = read_ods_rows(input_path)
    else:
        print(f"Error: unsupported format '{suffix}'. Use .xlsx or .ods.")
        sys.exit(1)

    if not all_rows:
        raise ValueError(f"{input_path}: spreadsheet is empty")

    groups = parse_header_groups(all_rows[0])

    missing = [h for h in HEADER_MAP if h not in groups]
    if missing:
        print(f"Warning: expected header(s) not found: {missing}")

    records = []
    for row in all_rows[1:]:
        record = row_to_record(row, groups, len(records) + 1)
        if record["character_name"] is None:
            continue
        records.append(record)

    out = Path(output_path) if output_path else Path(input_path).with_suffix(".json")
    with out.open("w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)

    return out


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 xlsx_to_json.py <input.xlsx|input.ods> [output.json]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    if not Path(input_file).exists():
        print(f"Error: file not found: {input_file}")
        sys.exit(1)

    out_path = convert(input_file, output_file)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
