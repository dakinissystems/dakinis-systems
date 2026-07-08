#!/usr/bin/env python3
"""Regenera carrusel Instagram con capturas reales + colores DES."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
REFS = ROOT / "refs"
OUT = ROOT

W, H = 1080, 1350

# Dakinis DES tokens (dark)
S0 = (8, 17, 29)       # #08111d
S1 = (18, 40, 64)      # #122840
S2 = (23, 52, 78)      # #17344e
TEXT = (240, 244, 249)  # #f0f4f9
MUTED = (184, 198, 217)  # #b8c6d9
PRIMARY = (45, 212, 191)  # #2dd4bf
AI = (124, 58, 237)  # #7c3aed
DANGER = (239, 68, 68)  # #ef4444


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def cover_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Cover crop center."""
    sw, sh = img.size
    scale = max(target_w / sw, target_h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - target_w) // 2
    top = (nh - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def gradient_overlay(base: Image.Image, top_alpha: float = 0.55, bottom_alpha: float = 0.75) -> Image.Image:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(H):
        t = y / H
        if t < 0.35:
            a = int(255 * top_alpha * (1 - t / 0.35))
        elif t > 0.55:
            a = int(255 * bottom_alpha * ((t - 0.55) / 0.45))
        else:
            a = 0
        draw.line([(0, y), (W, y)], fill=(*S0, a))
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def badge(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, font) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 14
    draw.rounded_rectangle(
        (x, y, x + tw + pad * 2, y + th + pad * 2),
        radius=20,
        fill=(*S2, 220),
        outline=PRIMARY,
        width=2,
    )
    draw.text((x + pad, y + pad), text, fill=TEXT, font=font)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textlength(test, font=font) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_headline(draw: ImageDraw.ImageDraw, lines: list[str], y: int, font, color=TEXT, line_gap: int = 12) -> int:
    for line in lines:
        draw.text((72, y), line, fill=color, font=font)
        y += font.size + line_gap
    return y


def slide_footer(draw: ImageDraw.ImageDraw, n: int) -> None:
    f_brand = load_font(28, bold=True)
    f_num = load_font(24)
    draw.text((72, H - 88), "Dakinis Systems", fill=PRIMARY, font=f_brand)
    draw.text((W - 120, H - 88), f"{n}/5", fill=MUTED, font=f_num)


def slide_01() -> None:
    landing = Image.open(REFS / "landing.png").convert("RGBA")
    lw, lh = landing.size
    crop = landing.crop((0, 0, lw, int(lh * 0.58)))
    base = cover_resize(crop, W, H)
    base = gradient_overlay(base, 0.72, 0.35)
    draw = ImageDraw.Draw(base)

    f_h = load_font(62, bold=True)
    f_sub = load_font(30)
    lines = wrap_text(
        draw,
        "¿Gestionas tu empresa con demasiadas herramientas?",
        f_h,
        W - 144,
    )
    y = draw_headline(draw, lines, 140, f_h)
    draw.line([(72, y + 16), (220, y + 16)], fill=PRIMARY, width=5)
    draw.text((72, y + 40), "Empieza en tu Hub", fill=PRIMARY, font=f_sub)
    slide_footer(draw, 1)
    base.convert("RGB").save(OUT / "instagram-carousel-01-portada.png", quality=95)


def slide_02() -> None:
    core = Image.open(REFS / "core-web.png").convert("RGBA")
    cw, ch = core.size
    bg_crop = cover_resize(core.crop((0, 0, int(cw * 0.7), int(ch * 0.45))), W, H)
    bg_crop = bg_crop.filter(ImageFilter.GaussianBlur(6))
    base = Image.new("RGBA", (W, H), (*S0, 255))
    bg_crop.putalpha(70)
    base.paste(bg_crop, (0, 0), bg_crop)
    overlay = Image.new("RGBA", (W, H), (*S0, 200))
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)

    f_label = load_font(28, bold=True)
    f_b = load_font(36, bold=True)
    f_sub = load_font(30)

    draw.text((72, 110), "EL PROBLEMA", fill=DANGER, font=f_label)
    problems = [
        "Clientes en Excel",
        "Ventas en otro sistema",
        "Facturas en otro lugar",
    ]
    y = 210
    for p in problems:
        draw.rounded_rectangle((72, y, W - 72, y + 92), radius=16, fill=S2, outline=DANGER, width=2)
        draw.ellipse((96, y + 30, 124, y + 58), fill=DANGER)
        draw.text((140, y + 26), p, fill=TEXT, font=f_b)
        y += 112

    sub_lines = wrap_text(
        draw,
        "Datos que no hablan entre sí. Suscripciones duplicadas. Tiempo perdido.",
        f_sub,
        W - 144,
    )
    draw_headline(draw, sub_lines, y + 32, f_sub, color=MUTED, line_gap=10)
    slide_footer(draw, 2)
    base.convert("RGB").save(OUT / "instagram-carousel-02-problema.png", quality=95)


def slide_03() -> None:
    core = Image.open(REFS / "core-web.png").convert("RGBA")
    base = cover_resize(core, W, H)
    base = gradient_overlay(base, 0.78, 0.25)
    draw = ImageDraw.Draw(base)

    f_label = load_font(28, bold=True)
    f_h = load_font(56, bold=True)
    f_sub = load_font(32, bold=True)

    draw.text((72, 120), "LA SOLUCIÓN", fill=PRIMARY, font=f_label)
    lines = wrap_text(draw, "Todo tu negocio en un solo lugar", f_h, W - 144)
    y = draw_headline(draw, lines, 185, f_h)
    draw.text((72, y + 12), "Dakinis One — desde tu Hub", fill=PRIMARY, font=f_sub)
    slide_footer(draw, 3)
    base.convert("RGB").save(OUT / "instagram-carousel-03-solucion.png", quality=95)


def slide_04() -> None:
    landing = Image.open(REFS / "landing.png").convert("RGBA")
    lw, lh = landing.size
    # Hub mockup (right side of landing)
    hub_crop = landing.crop((int(lw * 0.48), int(lh * 0.05), int(lw * 0.98), int(lh * 0.58)))
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)

    f_label = load_font(28, bold=True)
    f_h = load_font(50, bold=True)
    f_card = load_font(30, bold=True)

    draw.text((72, 100), "TODO INCLUIDO", fill=PRIMARY, font=f_label)
    lines = wrap_text(draw, "Un login · Un Hub · Una plataforma", f_h, W - 144)
    draw_headline(draw, lines, 165, f_h)

    benefits = [
        ("CRM", PRIMARY),
        ("Inventario", PRIMARY),
        ("Facturación", PRIMARY),
        ("IA Copilot", AI),
        ("Reportes", PRIMARY),
    ]
    y = 380
    col_w = (W - 144 - 24) // 2
    for i, (label, color) in enumerate(benefits):
        col = i % 2
        row = i // 2
        x = 72 + col * (col_w + 24)
        cy = y + row * 110
        draw.rounded_rectangle((x, cy, x + col_w, cy + 88), radius=16, fill=S2, outline=color, width=2)
        draw.text((x + 24, cy + 26), label, fill=TEXT, font=f_card)

    hub_img = cover_resize(hub_crop, W - 144, int(H * 0.38))
    base.paste(hub_img, (72, H - int(H * 0.38) - 120))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(
        (68, H - int(H * 0.38) - 124, 72 + hub_img.width + 4, H - 116),
        radius=20,
        outline=PRIMARY,
        width=2,
    )
    slide_footer(draw, 4)
    base.convert("RGB").save(OUT / "instagram-carousel-04-beneficios.png", quality=95)


def slide_05() -> None:
    core = Image.open(REFS / "core-web.png").convert("RGBA")
    base = cover_resize(core, W, H)
    # Strong bottom gradient for CTA
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        if y > H * 0.35:
            a = int(255 * min(1.0, (y - H * 0.35) / (H * 0.45)) * 0.92)
            od.line([(0, y), (W, y)], fill=(*S0, a))
    base = Image.alpha_composite(base.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(base)

    f_h = load_font(58, bold=True)
    f_btn = load_font(36, bold=True)
    f_url = load_font(28)

    lines = wrap_text(draw, "Solicita una demo gratuita", f_h, W - 144)
    y = int(H * 0.38)
    draw_headline(draw, lines, y, f_h)

    btn_text = "Empezar gratis"
    btn_font = f_btn
    tw = draw.textlength(btn_text, font=btn_font)
    bx, by = (W - tw) // 2 - 40, y + 200
    bw, bh = int(tw) + 80, 88
    draw.rounded_rectangle((bx, by, bx + bw, by + bh), radius=44, fill=PRIMARY)
    draw.text((bx + 40, by + 22), btn_text, fill=S0, font=btn_font)

    draw.text((72, by + 120), "dakinissystems.com/empieza", fill=MUTED, font=f_url)
    draw.text((72, by + 165), "Sistema operativo para empresas modernas", fill=MUTED, font=f_url)

    logo = Image.open(ROOT.parent.parent.parent.parent / "packages" / "shared-brand" / "assets" / "hub-logos" / "core.png").convert("RGBA")
    logo.thumbnail((140, 140), Image.Resampling.LANCZOS)
    base.paste(logo, (W - 200, H - 280), logo)

    slide_footer(draw, 5)
    base.convert("RGB").save(OUT / "instagram-carousel-05-cta.png", quality=95)


def main() -> None:
    for ref in ("landing.png", "core-web.png"):
        if not (REFS / ref).exists():
            raise SystemExit(f"Falta captura: {REFS / ref}")
    slide_01()
    slide_02()
    slide_03()
    slide_04()
    slide_05()
    print("Carrusel generado en", OUT)


if __name__ == "__main__":
    main()
