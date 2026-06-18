# source_to_json.py

Converts a PAD (Prosopography of Ancient Drama) character spreadsheet (`.xlsx` or `.ods`) to a JSON file matching the project's standard character-record format.

## Requirements

- Python 3.10+
- [openpyxl](https://openpyxl.readthedocs.io/) — for `.xlsx` files
- [odfpy](https://github.com/eea/odfpy) — for `.ods` files

Install both at once:

```bash
pip install openpyxl odfpy
```

Or install only the one you need:

```bash
pip install openpyxl   # .xlsx only
pip install odfpy      # .ods only
```

## Usage

```bash
python3 source_to_json.py <input> [output.json]
```

| Argument | Required | Description |
|---|---|---|
| `input` | Yes | Path to the source spreadsheet (`.xlsx` or `.ods`) |
| `output.json` | No | Path for the output file. Defaults to the same name and location as the input with a `.json` extension. |

### Examples

```bash
# .xlsx — output next to the input file
python3 source_to_json.py "data/Aided Lóegairi Búadaig_Version II_edition_GC.xlsx"

# .ods — output next to the input file
python3 source_to_json.py "data/Aidedh Ferghusa meic Léide_edition_GC.ods"

# Explicit output path
python3 source_to_json.py "data/Aided Lóegairi Búadaig_Version II_edition_GC.xlsx" \
    "data/Aided Lóegairi Búadaig_Version II_edition_GC.json"
```

## Spreadsheet format

The script reads the **first sheet** of the workbook. The first row must be a header row. Column order is detected automatically from the header names.

| Header cell | JSON field | Type |
|---|---|---|
| `Character Name` | `character_name` | string |
| `Alternate Names` | `alternate_names` | string or null |
| `Page` | `page` | integer or null |
| `Role/Notes` | `role_notes` | string or null |
| `Gender` | `gender` | `"M"`, `"F"`, or null |
| `Friendly` | `friendly` | array of strings |
| `Hostile` | `hostile` | array of strings |
| `Familial links` | `familial_links` | array of strings |
| `Foster links` | `foster_links` | string or null |

### Multi-value columns

`Friendly`, `Hostile`, and `Familial links` can span multiple adjacent columns. Any column whose header cell is **blank** is treated as a continuation of the previous named column. For example:

| F | G | H | I |
|---|---|---|---|
| Friendly | _(blank)_ | _(blank)_ | Hostile |
| Alice | Bob | Carol | Dave |

produces `"friendly": ["Alice", "Bob", "Carol"]` and `"hostile": ["Dave"]`.

This applies to both `.xlsx` and `.ods` files; the `.ods` files tend to use more continuation columns.

### Skipped rows

Rows where `Character Name` is blank are silently skipped.

## Output format

Each character becomes one JSON object. Records are written as a JSON array, with `id` values assigned sequentially starting at 1.

```json
[
  {
    "id": 1,
    "character_name": "Lóegaire Búadach",
    "alternate_names": null,
    "page": 22,
    "role_notes": null,
    "gender": "M",
    "friendly": ["Aed mac Ainninne"],
    "hostile": [],
    "familial_links": [],
    "foster_links": null
  },
  ...
]
```

## Notes

- Unicode characters (Irish diacritics, etc.) are preserved exactly — the JSON is written with `ensure_ascii=False`.
- **ODS cell annotations** (LibreOffice comments) are automatically stripped from cell values. Only the cell text itself is written to JSON.
- LibreOffice ODS files often encode long runs of empty cells at the end of each row using a large `number-columns-repeated` attribute. The script handles this efficiently without expanding millions of empty cells into memory.
