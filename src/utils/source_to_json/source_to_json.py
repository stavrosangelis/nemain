#!/usr/bin/env python3
"""
Merge all PAD character spreadsheets (.xlsx / .ods) from a folder into one JSON.

Usage:
    python3 xlsx_to_json.py [data_folder] [output.json]

Defaults:
    data_folder  →  data/02-NEMAIN/data
    output.json  →  output-merged.json
"""

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

_ODS_TEXT_P = ("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "p")
_ODS_MAX_REPEAT = 1024

# Relation fields and their output JSON keys
RELATION_FIELDS: dict[str, str] = {
    "Friendly": "friendly",
    "Hostile": "hostile",
    "Familial links": "familial_links",
    "Foster links": "foster_links",
}

# Character-level scalar fields (merged across sources; first non-null wins)
CHAR_SCALAR_FIELDS: dict[str, str] = {
    "Gender": "gender",
    "Allegiance": "allegiance",
    "Faction": "faction",
}

# Per-source scalar fields (stored inside each sources entry)
SOURCE_SCALAR_FIELDS: dict[str, str] = {
    "Page": "page",
    "Role/Notes": "role_notes",
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
        while row_values and row_values[-1] is None:
            row_values.pop()
        if row_values:
            rows.append(tuple(row_values))
    return rows


# ---------------------------------------------------------------------------
# Row helpers
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


def scalar_from_row(row: tuple, groups: dict, field: str) -> str | None:
    indices = groups.get(field, [])
    if not indices:
        return None
    idx = indices[0]
    return clean(row[idx]) if idx < len(row) else None


def list_from_row(row: tuple, groups: dict, field: str) -> list[str]:
    return [
        v
        for idx in groups.get(field, [])
        if idx < len(row) and (v := clean(row[idx])) is not None
    ]


# ---------------------------------------------------------------------------
# Merge logic
# ---------------------------------------------------------------------------

def merge_all(data_folder: str, output_path: str) -> Path:
    folder = Path(data_folder)
    files = sorted(folder.glob("*.xlsx")) + sorted(folder.glob("*.ods"))

    if not files:
        print(f"No .xlsx or .ods files found in {data_folder}")
        sys.exit(1)

    characters: dict[int, dict] = {}          # id → character dict
    name_to_id: dict[str, int] = {}           # any name (primary or alt) → id
    raw_relations: dict[int, dict[str, list]] = {}  # id → {field: [(name, source)]}
    next_id = 1

    def lookup_id(primary: str, alts: list[str]) -> int | None:
        cid = name_to_id.get(primary)
        if cid:
            return cid
        for alt in alts:
            cid = name_to_id.get(alt)
            if cid:
                return cid
        return None

    for f in files:
        source_name = f.stem
        suffix = f.suffix.lower()

        try:
            all_rows = read_xlsx_rows(str(f)) if suffix == ".xlsx" else read_ods_rows(str(f))
        except Exception as exc:
            print(f"Warning: skipping {f.name} — {exc}")
            continue

        if not all_rows:
            continue

        groups = parse_header_groups(all_rows[0])

        for row in all_rows[1:]:
            char_name = scalar_from_row(row, groups, "Character Name")
            # Skip blank rows and section-heading rows (marked with %)
            if not char_name or char_name.startswith("%"):
                continue

            alt_names: list[str] = list_from_row(row, groups, "Alternate Names")

            existing_id = lookup_id(char_name, alt_names)

            if existing_id is None:
                cid = next_id
                next_id += 1

                char: dict = {
                    "id": cid,
                    "character_name": char_name,
                    "alternate_names": list(alt_names),
                    "gender": None,
                    "allegiance": None,
                    "faction": None,
                    "friendly": [],
                    "hostile": [],
                    "familial_links": [],
                    "foster_links": [],
                    "sources": [],
                }
                characters[cid] = char
                raw_relations[cid] = {field: [] for field in RELATION_FIELDS}

                name_to_id[char_name] = cid
                for alt in alt_names:
                    name_to_id.setdefault(alt, cid)
            else:
                cid = existing_id
                char = characters[cid]

                # Register this primary name in the lookup (may have been found via an alt)
                name_to_id.setdefault(char_name, cid)

                # Merge any new alternate names
                existing_alts: set[str] = set(char["alternate_names"])
                for alt in alt_names:
                    if alt not in existing_alts:
                        char["alternate_names"].append(alt)
                        existing_alts.add(alt)
                    name_to_id.setdefault(alt, cid)

            # Character-level scalars: first non-null value across all sources wins
            for field, key in CHAR_SCALAR_FIELDS.items():
                if char[key] is None:
                    val = scalar_from_row(row, groups, field)
                    if val is not None:
                        char[key] = val

            # Per-source entry
            page_raw = scalar_from_row(row, groups, "Page")
            page: int | str | None = None
            if page_raw is not None:
                try:
                    page = int(float(page_raw))
                except (ValueError, TypeError):
                    page = page_raw

            char["sources"].append({
                "name": source_name,
                "page": page,
                "role_notes": scalar_from_row(row, groups, "Role/Notes"),
            })

            # Accumulate raw relation entries for second-pass resolution
            for field in RELATION_FIELDS:
                for name in list_from_row(row, groups, field):
                    raw_relations[cid][field].append((name, source_name))

    # Second pass: resolve relation names → character ids
    for cid, rels in raw_relations.items():
        char = characters[cid]
        for field, json_key in RELATION_FIELDS.items():
            seen: set[tuple] = set()
            entries: list[dict] = []
            for (name, source) in rels[field]:
                rel_id = name_to_id.get(name)
                sig = (rel_id, name, source)
                if sig not in seen:
                    seen.add(sig)
                    entries.append({
                        "id": rel_id,
                        "character_name": name,
                        "source": source,
                    })
            char[json_key] = entries

    result = list(characters.values())

    out = Path(output_path)
    with out.open("w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print(f"Merged {len(files)} file(s) → {len(result)} unique character(s) → {out}")
    return out


def main():
    data_folder = "data/02-NEMAIN/data"
    output_path = "output-merged.json"

    if len(sys.argv) >= 2:
        data_folder = sys.argv[1]
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]

    if not Path(data_folder).is_dir():
        print(f"Error: folder not found: {data_folder}")
        sys.exit(1)

    merge_all(data_folder, output_path)


if __name__ == "__main__":
    main()
