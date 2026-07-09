#!/usr/bin/env python3
"""Extrae 6 slides del composite ChatGPT (rejilla 3×2) → 1080×1350 para Instagram."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent.parent.parent
LOGO_PATH = REPO / "packages" / "shared-brand" / "assets" / "hub-logos" / "core.png"
BG = (8, 17, 29)
DEFAULT_SRC = (
    Path(r"C:\Users\Christian\.cursor\projects\d-dakinis-systems\assets")
    / "c__Users_Christian_AppData_Roaming_Cursor_User_workspaceStorage_a1c63e04e2437d70d8d2b188b90a1405_images_ChatGPT_Image_9_jul_2026__12_13_16_a.m-4f183c10-9acb-4563-b434-139c827386d5.png"
)
OUT = ROOT / "publish-6"
TARGET_W, TARGET_H = 1080, 1350

NAMES = [
    "instagram-carousel-01-portada.png",
    "instagram-carousel-02-problema.png",
    "instagram-carousel-03-costo.png",
    "instagram-carousel-04-solucion.png",
    "instagram-carousel-05-beneficios.png",
    "instagram-carousel-06-cta.png",
]


def brand_footer_logo(height: int = 52) -> Image.Image:
    src = Image.open(LOGO_PATH).convert("RGBA")
    icon = src.crop((27, 28, 128, 80))
    icon.thumbnail((height, height), Image.Resampling.LANCZOS)
    return icon


def content_box(rgb: np.ndarray) -> tuple[int, int, int, int]:
    bg = np.array(BG, dtype=np.int16)
    h, w = rgb.shape[:2]
    mask = np.linalg.norm(rgb.astype(np.int16) - bg, axis=2) > 18
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return 0, 0, w, h
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def footer_brand_region(rgb: np.ndarray, x0: int, y1: int, row: int) -> tuple[int, int, int, int]:
    if row == 0:
        return x0 + 4, y1 - 145, x0 + 210, y1 - 55
    return x0 + 4, y1 - 295, x0 + 210, y1 - 205


def apply_brand_logo(img: Image.Image, row: int) -> Image.Image:
    if not LOGO_PATH.exists():
        raise SystemExit(f"Falta logo: {LOGO_PATH}")

    base = img.convert("RGBA")
    rgb = np.array(base.convert("RGB"))
    x0, _y0, _x1, y1 = content_box(rgb)

    left, top, right, bottom = footer_brand_region(rgb, x0, y1, row)
    sample_strip = rgb[max(top - 8, 0) : top, left:right]
    if sample_strip.size:
        fill = tuple(int(v) for v in np.median(sample_strip.reshape(-1, 3), axis=0))
    else:
        fill = tuple(int(v) for v in rgb[max(top - 4, 0), min(left + 12, TARGET_W - 1)])

    draw = ImageDraw.Draw(base)
    draw.rectangle((left, top, right, bottom), fill=tuple(int(c) for c in fill) + (255,))

    logo = brand_footer_logo(52)
    logo_y = top + max((bottom - top - logo.height) // 2, 0)
    base.paste(logo, (left + 6, logo_y), logo)
    return base.convert("RGB")


def fit_resize(img: Image.Image, tw: int, th: int, bg: tuple[int, int, int] = BG) -> Image.Image:
    sw, sh = img.size
    scale = min(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (tw, th), bg)
    canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def bright_bands(profile: np.ndarray, thresh: float = 120.0, min_len: int = 4) -> list[tuple[int, int]]:
    bands: list[tuple[int, int]] = []
    start: int | None = None
    for i, v in enumerate(profile):
        if float(v) >= thresh:
            if start is None:
                start = i
        elif start is not None:
            if i - start >= min_len:
                bands.append((start, i))
            start = None
    if start is not None and len(profile) - start >= min_len:
        bands.append((start, len(profile)))
    return bands


def detect_grid_boxes(arr: np.ndarray) -> list[tuple[int, int, int, int]]:
    h, w = arr.shape[:2]

    row_prof = arr.mean(axis=(1, 2))
    col_prof = arr.mean(axis=(0, 2))

    top = next((y for y in range(h) if row_prof[y] < 80), 0)
    bottom = next((y for y in range(h - 1, -1, -1) if row_prof[y] < 80), h - 1)
    left = next((x for x in range(w) if col_prof[x] < 80), 0)
    right = next((x for x in range(w - 1, -1, -1) if col_prof[x] < 80), w - 1)

    grid = arr[top : bottom + 1, left : right + 1]
    gh, gw = grid.shape[:2]

    footer_band = bright_bands(grid.mean(axis=(0, 2)), thresh=120, min_len=6)
    footer_top = footer_band[-1][0] if footer_band else gh
    grid_h = footer_top

    row_prof_g = grid[:grid_h].mean(axis=(1, 2))
    col_prof_g = grid[:grid_h].mean(axis=(0, 2))

    h_bands = bright_bands(row_prof_g, thresh=120, min_len=4)
    v_bands = bright_bands(col_prof_g, thresh=120, min_len=4)

    if len(h_bands) != 1 or len(v_bands) != 2:
        # Fallback manual bounds from composite analysis
        y_splits = [0, 426, 484, grid_h]
        x_splits = [0, 336, 356, 677, 695, gw]
    else:
        hy0, hy1 = h_bands[0]
        vx0, vx1 = v_bands[0]
        vx2, vx3 = v_bands[1]
        y_splits = [0, hy0, hy1, grid_h]
        x_splits = [0, vx0, vx1, vx2, vx3, gw]

    boxes: list[tuple[int, int, int, int]] = []
    for row in range(2):
        y0 = top + y_splits[row * 2]
        y1 = top + y_splits[row * 2 + 1]
        for col in range(3):
            x0 = left + x_splits[col * 2]
            x1 = left + x_splits[col * 2 + 1]
            boxes.append((x0, y0, x1, y1))
    return boxes


def main(src: Path = DEFAULT_SRC) -> None:
    if not src.exists():
        raise SystemExit(f"No existe: {src}")

    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGB")
    arr = np.array(im)
    boxes = detect_grid_boxes(arr)

    for i, (name, box) in enumerate(zip(NAMES, boxes, strict=True)):
        tile = im.crop(box)
        row = i // 3
        final = apply_brand_logo(fit_resize(tile, TARGET_W, TARGET_H), row)
        final.save(OUT / name, quality=95)
        print("OK", OUT / name, f"({tile.width}x{tile.height} -> {TARGET_W}x{TARGET_H})")

    print("6 slides en", OUT)


if __name__ == "__main__":
    main()
