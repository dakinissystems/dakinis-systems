#!/usr/bin/env python3
"""Carrusel Instagram — capturas reales + colores DES + copy conversión."""
from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
REFS = ROOT / "refs"
OUT = ROOT
REPO = ROOT.parent.parent.parent.parent

W, H = 1080, 1350
DEMO_URL = "https://dakinissystems.com/empieza"

# Dakinis DES (dark)
S0 = (8, 17, 29)
S1 = (18, 40, 64)
S2 = (23, 52, 78)
TEXT = (240, 244, 249)
MUTED = (184, 198, 217)
PRIMARY = (45, 212, 191)
AI = (124, 58, 237)
DANGER = (239, 68, 68)
WARNING = (245, 158, 11)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def load_emoji_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    p = Path("C:/Windows/Fonts/seguiemj.ttf")
    if p.exists():
        return ImageFont.truetype(str(p), size)
    return load_font(size)


def cover_resize(img: Image.Image, tw: int, th: int) -> Image.Image:
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left, top = (nw - tw) // 2, (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        test = f"{cur} {w}".strip()
        if draw.textlength(test, font=font) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_lines(draw: ImageDraw.ImageDraw, lines: list[str], x: int, y: int, font, color=TEXT, gap: int = 10) -> int:
    for line in lines:
        draw.text((x, y), line, fill=color, font=font)
        y += font.size + gap
    return y


def slide_indicator(draw: ImageDraw.ImageDraw, n: int, brand: bool = False) -> None:
    if brand:
        draw.text((72, H - 72), "Dakinis", fill=(*PRIMARY, 180), font=load_font(22))
    draw.text((W - 88, H - 72), f"{n}/5", fill=MUTED, font=load_font(22))


def draw_arrow(draw: ImageDraw.ImageDraw, cx: int, y1: int, y2: int) -> None:
    draw.line([(cx, y1), (cx, y2)], fill=MUTED, width=3)
    draw.polygon([(cx - 10, y2 - 14), (cx + 10, y2 - 14), (cx, y2)], fill=MUTED)


def make_qr(url: str, size: int = 200) -> Image.Image:
    qr = qrcode.QRCode(box_size=8, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    return img.resize((size, size), Image.Resampling.NEAREST)


def slide_01() -> None:
    """¿Tu empresa trabaja así? — identificación, sin marca enorme."""
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)

    f_h = load_font(64, bold=True)
    f_chip = load_font(28, bold=True)

    lines = wrap_text(draw, "¿Tu empresa trabaja así?", f_h, W - 120)
    y = draw_lines(draw, lines, 72, 130, f_h)

    chaos = [
        ("Excel", (120, y + 50)),
        ("WhatsApp", (520, y + 80)),
        ("Facturas", (200, y + 200)),
        ("Inventario", (600, y + 240)),
        ("Correo", (140, y + 360)),
        ("Google Drive", (480, y + 400)),
        ("Notas", (320, y + 520)),
        ("Otra app…", (680, y + 560)),
    ]
    for label, (cx, cy) in chaos:
        tw = draw.textlength(label, font=f_chip)
        pad = 18
        w, h = int(tw) + pad * 2, 56
        draw.rounded_rectangle(
            (cx, cy, cx + w, cy + h),
            radius=14,
            fill=S2,
            outline=DANGER,
            width=2,
        )
        draw.text((cx + pad, cy + 12), label, fill=TEXT, font=f_chip)

    # líneas caóticas entre chips
    for i in range(len(chaos) - 1):
        x1, y1 = chaos[i][1][0] + 60, chaos[i][1][1] + 28
        x2, y2 = chaos[i + 1][1][0] + 40, chaos[i + 1][1][1] + 28
        draw.line([(x1, y1), (x2, y2)], fill=(*DANGER, 120), width=2)

    f_sub = load_font(32)
    draw.text((72, H - 200), "Demasiadas herramientas.", fill=MUTED, font=f_sub)
    draw.text((72, H - 155), "Demasiados sitios donde buscar.", fill=MUTED, font=f_sub)

    slide_indicator(draw, 1)
    base.convert("RGB").save(OUT / "instagram-carousel-01-portada.png", quality=95)


def slide_02() -> None:
    """El problema — flujo Excel → … → Caos."""
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)

    f_title = load_font(52, bold=True)
    f_step = load_font(36, bold=True)
    f_sub = load_font(32)
    f_x = load_font(28)

    draw.text((72, 100), "El problema", fill=DANGER, font=f_title)

    pains = [
        "Clientes en Excel",
        "WhatsApp lleno de conversaciones",
        "Facturas en otro programa",
        "Inventario desactualizado",
        "Información duplicada",
        "Horas perdidas buscando datos",
    ]
    py = 200
    for pain in pains:
        draw.text((72, py), "✕", fill=DANGER, font=load_font(30, bold=True))
        draw.text((110, py), pain, fill=TEXT, font=f_x)
        py += 46

    pipeline = ["Excel", "WhatsApp", "Facturación", "Notas", "Google Drive", "Caos"]
    cx = W - 200
    y = 200
    box_h = 58
    gap = 28

    for i, step in enumerate(pipeline):
        tw = draw.textlength(step, font=f_step)
        bx = cx - int(tw) // 2 - 18
        is_chaos = step == "Caos"
        draw.rounded_rectangle(
            (bx, y, bx + int(tw) + 36, y + box_h),
            radius=12,
            fill=DANGER if is_chaos else S1,
            outline=DANGER if is_chaos else PRIMARY,
            width=2,
        )
        draw.text((bx + 18, y + 12), step, fill=TEXT, font=f_step)
        if i < len(pipeline) - 1:
            draw_arrow(draw, cx, y + box_h + 2, y + box_h + gap - 6)
        y += box_h + gap

    sub = "Cada herramienta guarda una parte de tu negocio."
    draw_lines(draw, wrap_text(draw, sub, f_sub, W - 144), 72, H - 160, f_sub, PRIMARY)

    slide_indicator(draw, 2, brand=True)
    base.convert("RGB").save(OUT / "instagram-carousel-02-problema.png", quality=95)


def slide_03() -> None:
    """¿Y si todo estuviera conectado? — captura Hub limpia."""
    landing = Image.open(REFS / "landing.png").convert("RGBA")
    lw, lh = landing.size
    hub = landing.crop((int(lw * 0.42), int(lh * 0.08), int(lw * 0.98), int(lh * 0.55)))
    base = Image.new("RGBA", (W, H), (*S0, 255))

    f_title = load_font(48, bold=True)
    f_flow = load_font(38, bold=True)
    draw = ImageDraw.Draw(base)

    title_lines = wrap_text(draw, "¿Y si todo estuviera conectado?", f_title, W - 144)
    y = draw_lines(draw, title_lines, 72, 90, f_title, PRIMARY)

    flow = ["Un login", "Un Hub", "Toda tu empresa"]
    fy = y + 40
    for i, line in enumerate(flow):
        draw.text((72, fy), line, fill=TEXT, font=f_flow)
        if i < len(flow) - 1:
            draw.text((72, fy + 44), "↓", fill=PRIMARY, font=load_font(36, bold=True))
        fy += 88

    hub_img = cover_resize(hub, W - 120, int(H * 0.48))
    hy = int(H * 0.42)
    base.paste(hub_img, (60, hy))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((56, hy - 4, 60 + hub_img.width + 4, hy + hub_img.height + 4), radius=20, outline=PRIMARY, width=3)

    slide_indicator(draw, 3, brand=True)
    base.convert("RGB").save(OUT / "instagram-carousel-03-solucion.png", quality=95)


def slide_04() -> None:
    """Beneficios emocionales + módulos con emoji."""
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)

    f_benefit = load_font(30)
    f_emoji = load_emoji_font(34)
    f_label = load_font(26, bold=True)
    f_small = load_font(22)
    f_h = load_font(40, bold=True)

    benefits = [
        "Recupera horas cada semana",
        "Toda tu empresa en un solo lugar",
        "Menos errores",
        "Más ventas",
        "IA que conoce tu negocio",
        "Información siempre actualizada",
    ]
    y = 88
    for b in benefits:
        draw.ellipse((72, y + 6, 100, y + 34), fill=PRIMARY)
        draw.text((80, y + 4), "✓", fill=S0, font=load_font(22, bold=True))
        draw.text((112, y), b, fill=TEXT, font=f_benefit)
        y += 48

    modules = [
        ("👥", "Clientes"),
        ("📦", "Inventario"),
        ("💰", "Facturación"),
        ("📊", "Reportes"),
        ("🤖", "IA"),
        ("📅", "Agenda"),
        ("📱", "WhatsApp"),
        ("📄", "Documentos"),
    ]
    y += 20
    cols, col_w = 2, (W - 144 - 20) // 2
    for i, (emo, label) in enumerate(modules):
        col, row = i % cols, i // cols
        x = 72 + col * (col_w + 20)
        cy = y + row * 72
        draw.rounded_rectangle((x, cy, x + col_w, cy + 58), radius=12, fill=S1, outline=PRIMARY, width=1)
        draw.text((x + 14, cy + 10), emo, fill=TEXT, font=f_emoji)
        draw.text((x + 56, cy + 14), label, fill=TEXT, font=f_label)

    y = y + 4 * 72 + 24
    draw.text((72, y), "Todo incluido.", fill=TEXT, font=f_h)
    draw.text((72, y + 52), "Sin cambiar de aplicación.", fill=PRIMARY, font=f_benefit)
    draw.text((72, y + 100), "CRM · Inventario · Facturación · Reportes", fill=MUTED, font=f_small)

    slide_indicator(draw, 4, brand=True)
    base.convert("RGB").save(OUT / "instagram-carousel-04-beneficios.png", quality=95)


def slide_05() -> None:
    """CTA demo + QR."""
    core = Image.open(REFS / "core-web.png").convert("RGBA")
    bg = cover_resize(core.crop((0, 0, core.width, int(core.height * 0.4))), W, H)
    bg = bg.filter(ImageFilter.GaussianBlur(8))
    bg.putalpha(60)
    base = Image.new("RGBA", (W, H), (*S0, 255))
    base.paste(bg, (0, 0), bg)
    overlay = Image.new("RGBA", (W, H), (*S0, 210))
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)

    f_h = load_font(50, bold=True)
    f_sub = load_font(34)
    f_btn = load_font(32, bold=True)
    f_tag = load_font(26)

    lines = wrap_text(draw, "¿Quieres ver cómo funcionaría en tu empresa?", f_h, W - 144)
    y = draw_lines(draw, lines, 72, 160, f_h)

    draw.text((72, y + 24), "Demo gratuita.", fill=PRIMARY, font=f_sub)
    draw.text((72, y + 72), "Sin compromiso.", fill=MUTED, font=f_tag)

    btn = "Solicitar demo"
    tw = draw.textlength(btn, font=f_btn)
    bx, by = 72, y + 140
    bw = int(tw) + 64
    draw.rounded_rectangle((bx, by, bx + bw, by + 72), radius=36, fill=PRIMARY)
    draw.text((bx + 32, by + 18), btn, fill=S0, font=f_btn)

    qr = make_qr(DEMO_URL, 220)
    qx, qy = W - 72 - 220, by - 20
    draw.rounded_rectangle((qx - 12, qy - 12, qx + 232, qy + 232), radius=16, fill=(255, 255, 255, 255))
    base.paste(qr, (qx, qy), qr)
    draw.text((qx, qy + 232), "dakinissystems.com", fill=MUTED, font=load_font(20))

    logo = Image.open(REPO / "packages" / "shared-brand" / "assets" / "hub-logos" / "core.png").convert("RGBA")
    logo.thumbnail((100, 100), Image.Resampling.LANCZOS)
    base.paste(logo, (72, H - 160), logo)

    slide_indicator(draw, 5, brand=True)
    base.convert("RGB").save(OUT / "instagram-carousel-05-cta.png", quality=95)


def main() -> None:
    if not (REFS / "landing.png").exists():
        raise SystemExit(f"Falta {REFS / 'landing.png'}")
    slide_01()
    slide_02()
    slide_03()
    slide_04()
    slide_05()
    print("Carrusel v2 generado en", OUT)


if __name__ == "__main__":
    main()
