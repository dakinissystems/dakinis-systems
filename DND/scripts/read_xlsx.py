import zipfile
import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path

xlsx = Path(__file__).resolve().parent.parent / "DnDHojaPersonaje.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def col_to_num(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n


with zipfile.ZipFile(xlsx) as z:
    ss: list[str] = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall(".//m:si", NS):
            texts = [t.text or "" for t in si.findall(".//m:t", NS)]
            ss.append("".join(texts))

    wb = ET.fromstring(z.read("xl/workbook.xml"))
    sheets = []
    for sh in wb.findall(".//m:sheet", NS):
        sheets.append({"name": sh.get("name"), "id": sh.get(RID)})

    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rid_to_target = {rel.get("Id"): rel.get("Target") for rel in rels}

    print("SHEETS:", json.dumps(sheets, ensure_ascii=False, indent=2))

    def cell_val(c):
        t = c.get("t")
        v = c.find("m:v", NS)
        if v is None or v.text is None:
            return ""
        if t == "s":
            return ss[int(v.text)]
        return v.text

    for sh in sheets:
        target = "xl/" + rid_to_target[sh["id"]].lstrip("/")
        root = ET.fromstring(z.read(target))
        rows: dict[int, dict[str, str]] = {}
        for row in root.findall(".//m:sheetData/m:row", NS):
            for c in row.findall("m:c", NS):
                ref = c.get("r")
                m = re.match(r"([A-Z]+)(\d+)", ref)
                if not m:
                    continue
                col, rn = m.group(1), int(m.group(2))
                val = cell_val(c)
                if val:
                    rows.setdefault(rn, {})[col] = val
        print(f"\n=== {sh['name']} ({len(rows)} rows with data) ===")
        for rn in sorted(rows.keys()):
            cells = rows[rn]
            line = " | ".join(f"{k}:{cells[k]}" for k in sorted(cells.keys(), key=col_to_num))
            print(f"R{rn}: {line}")
