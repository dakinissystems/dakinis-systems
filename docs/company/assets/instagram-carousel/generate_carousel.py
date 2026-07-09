#!/usr/bin/env python3
"""Carrusel Instagram v6 — Dakinis · 7 slides · prueba social + UI premium."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
OUT = ROOT
REPO = ROOT.parent.parent.parent.parent
LOGO_PATH = REPO / "packages" / "shared-brand" / "assets" / "hub-logos" / "core.png"

W, H = 1080, 1350
TOTAL = 7
MX = 52  # margen izquierdo reducido (~20 px vs v5)

S0 = (8, 17, 29)
S1 = (18, 40, 64)
S2 = (23, 52, 78)
TEXT = (240, 244, 249)
MUTED = (184, 198, 217)
PRIMARY = (45, 212, 191)
AI = (124, 58, 237)
DANGER = (239, 68, 68)
WARNING = (245, 158, 11)
SUCCESS = (34, 197, 94)


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


def brand_logo(size: int = 52) -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo.thumbnail((size, size), Image.Resampling.LANCZOS)
    return logo


def draw_subtle_grid(draw: ImageDraw.ImageDraw, w: int = W, h: int = H) -> None:
    for x in range(0, w, 48):
        draw.line([(x, 0), (x, h)], fill=(*S1, 35), width=1)
    for y in range(0, h, 48):
        draw.line([(0, y), (w, y)], fill=(*S1, 35), width=1)


def draw_footer(draw: ImageDraw.ImageDraw, n: int) -> None:
    draw.text((MX + 58, H - 66), "DAKINIS", fill=PRIMARY, font=load_font(26, bold=True))
    draw.text((W - 96, H - 66), f"{n}/{TOTAL}", fill=MUTED, font=load_font(22))


def paste_footer_logo(base: Image.Image) -> None:
    logo = brand_logo(52)
    base.paste(logo, (MX, H - 80), logo)


def card_shadow(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int = 16) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + 4, y1 + 6, x2 + 4, y2 + 6), radius=radius, fill=(0, 0, 0, 70))


def draw_arrow(draw: ImageDraw.ImageDraw, cx: int, y1: int, y2: int) -> None:
    draw.line([(cx, y1), (cx, y2)], fill=MUTED, width=3)
    draw.polygon([(cx - 10, y2 - 14), (cx + 10, y2 - 14), (cx, y2)], fill=MUTED)


def draw_red_x(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 28) -> None:
    draw.ellipse((x, y, x + size, y + size), outline=DANGER, width=3)
    pad = 7
    draw.line([(x + pad, y + pad), (x + size - pad, y + size - pad)], fill=DANGER, width=3)
    draw.line([(x + size - pad, y + pad), (x + pad, y + size - pad)], fill=DANGER, width=3)


def draw_icon_tile(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    emoji: str,
    label: str,
    tile: int = 100,
) -> tuple[int, int]:
    x, y = cx - tile // 2, cy
    card_shadow(draw, (x, y, x + tile, y + tile), 18)
    draw.rounded_rectangle((x, y, x + tile, y + tile), radius=18, fill=S2, outline=MUTED, width=2)
    emo_size = max(28, int(tile * 0.38))
    f_emo = load_emoji_font(emo_size)
    f_lbl = load_font(max(18, int(tile * 0.2)), bold=True)
    ew = draw.textlength(emoji, font=f_emo)
    draw.text((x + (tile - ew) // 2, y + tile // 2 - emo_size // 2 - 4), emoji, fill=TEXT, font=f_emo)
    lw = draw.textlength(label, font=f_lbl)
    draw.text((x + (tile - lw) // 2, y + tile + 12), label, fill=TEXT, font=f_lbl)
    return cx, cy + tile // 2


def draw_connection(
    draw: ImageDraw.ImageDraw,
    p1: tuple[int, int],
    p2: tuple[int, int],
    width: int = 2,
    solid: bool = False,
) -> None:
    x1, y1 = p1
    x2, y2 = p2
    mx, my = (x1 + x2) // 2, (y1 + y2) // 2 - 40
    steps = 16
    prev = p1
    for i in range(1, steps + 1):
        t = i / steps
        px = int((1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2)
        py = int((1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2)
        if solid or i % 2 == 0:
            draw.line([prev, (px, py)], fill=(*MUTED, 160 if solid else 100), width=width)
        prev = (px, py)


def draw_stressed_person(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float = 1.8) -> None:
    s = scale
    color = (*MUTED, 180)
    hx, hy = int(36 * s), int(72 * s)
    draw.ellipse((cx - hx, cy, cx + hx, cy + hy * 2), outline=color, width=4)
    draw.arc((cx - int(50 * s), cy + int(68 * s), cx + int(50 * s), cy + int(200 * s)), 200, 340, fill=color, width=4)
    draw.line([(cx - int(28 * s), cy + int(28 * s)), (cx - int(10 * s), cy + int(38 * s))], fill=color, width=4)
    draw.line([(cx + int(28 * s), cy + int(28 * s)), (cx + int(10 * s), cy + int(38 * s))], fill=color, width=4)
    draw.arc((cx - int(14 * s), cy + int(44 * s), cx + int(14 * s), cy + int(58 * s)), 0, 180, fill=color, width=3)
    for dx in (-40, -20, 0, 20, 40):
        draw.line([(cx + int(dx * s), cy - int(30 * s)), (cx + int(dx * s + 8), cy - int(50 * s))], fill=color, width=3)


def draw_solution_dashboard(dw: int, dh: int) -> Image.Image:
    dash = Image.new("RGBA", (dw, dh), (*S1, 255))
    draw = ImageDraw.Draw(dash)
    pad, gap = 20, 16

    draw_subtle_grid(draw, dw, dh)
    draw.rounded_rectangle((0, 0, dw, 58), radius=12, fill=S2)
    draw.text((pad, 16), "Dakinis", fill=PRIMARY, font=load_font(24, bold=True))
    draw.text((dw - 190, 20), "Panel de control", fill=MUTED, font=load_font(18))

    top = 74
    kpi_w = (dw - pad * 2 - gap * 2) // 3
    kpi_h = 188
    kpis = [
        ("Ventas este mes", "24.350 €", "↑ +24%", SUCCESS),
        ("Clientes activos", "128", "↑ +18%", SUCCESS),
        ("Facturación", "18.920 €", "↑ +21%", SUCCESS),
    ]
    for i, (title, value, delta, accent) in enumerate(kpis):
        x = pad + i * (kpi_w + gap)
        box = (x, top, x + kpi_w, top + kpi_h)
        card_shadow(draw, box, 14)
        draw.rounded_rectangle(box, radius=14, fill=S0, outline=PRIMARY, width=2)
        draw.text((x + 14, top + 12), title, fill=MUTED, font=load_font(17))
        draw.text((x + 14, top + 44), value, fill=WARNING, font=load_font(32, bold=True))
        draw.text((x + 14, top + 88), delta, fill=accent, font=load_font(22, bold=True))
        if i == 1:
            avatars = load_emoji_font(22)
            draw.text((x + 14, top + 124), "👤 👤 👤 +125", fill=MUTED, font=avatars)
        bx, by = x + 14, top + kpi_h - 28
        pts = [(bx + j * 16, by - [6, 12, 8, 18, 14, 22][j]) for j in range(6)]
        for j in range(len(pts) - 1):
            draw.line([pts[j], pts[j + 1]], fill=accent, width=2)

    row2 = top + kpi_h + gap
    row2_h = dh - row2 - pad
    half = (dw - pad * 2 - gap) // 2

    x = pad
    inv_box = (x, row2, x + half, row2 + row2_h)
    card_shadow(draw, inv_box, 14)
    draw.rounded_rectangle(inv_box, radius=14, fill=S0, outline=PRIMARY, width=2)
    draw.text((x + 16, row2 + 14), "Inventario", fill=PRIMARY, font=load_font(22, bold=True))
    items = [("Pizza Margarita", "142 uds"), ("Cerveza IPA", "38 uds"), ("Harina 000", "5 uds")]
    iy = row2 + 56
    for name, qty in items:
        low = name == "Harina 000"
        draw.text((x + 18, iy), name, fill=TEXT, font=load_font(22))
        draw.text((x + half - 110, iy), qty, fill=DANGER if low else TEXT, font=load_font(22, bold=True))
        iy += 48
    draw.text((x + 18, row2 + row2_h - 42), "Actualizado en tiempo real", fill=PRIMARY, font=load_font(18, bold=True))

    x2 = pad + half + gap
    ai_box = (x2, row2, x2 + half, row2 + row2_h)
    card_shadow(draw, ai_box, 14)
    draw.rounded_rectangle(ai_box, radius=14, fill=S0, outline=AI, width=2)
    glow = Image.new("RGBA", (half + 20, row2_h + 20), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle((0, 0, half + 20, row2_h + 20), radius=18, outline=(*AI, 60), width=8)
    dash.paste(glow, (x2 - 10, row2 - 10), glow)
    draw = ImageDraw.Draw(dash)

    draw.text((x2 + 16, row2 + 14), "IA Copilot", fill=AI, font=load_font(22, bold=True))
    chat_y = row2 + 52
    draw.rounded_rectangle((x2 + 16, chat_y, x2 + half - 16, chat_y + 36), radius=10, fill=S2)
    draw.text((x2 + 28, chat_y + 8), "Resumen semanal", fill=MUTED, font=load_font(17))
    chat_y += 48
    bubbles = [
        ("Ventas ↑18%", AI),
        ("Top producto: Coca Cola", S2),
        ("Reposición: Harina", S2),
        ("3 facturas pendientes", S2),
    ]
    for text, bg in bubbles:
        tw = draw.textlength(text, font=load_font(18))
        bw = min(int(tw) + 28, half - 40)
        bh = 36
        fill = (*AI, 90) if bg == AI else S2
        draw.rounded_rectangle((x2 + 16, chat_y, x2 + 16 + bw, chat_y + bh), radius=10, fill=fill)
        draw.text((x2 + 28, chat_y + 8), text, fill=TEXT, font=load_font(18))
        chat_y += bh + 10

    return dash


def slide_01() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_h = load_font(58, bold=True)
    f_big = load_font(60, bold=True)

    draw.text((MX, 88), "¿Tu empresa trabaja", fill=TEXT, font=f_h)
    draw.text((MX, 158), "así?", fill=PRIMARY, font=f_h)

    # tile: grande / mediana / pequeña — jerarquía visual
    tools = [
        ("📊", "Excel", 220, 320, 124),
        ("💰", "Facturas", 780, 340, 100),
        ("💬", "WhatsApp", 520, 280, 76),
        ("📁", "Drive", 120, 520, 76),
        ("📦", "Inventario", 680, 520, 100),
        ("📝", "Notas", 400, 560, 76),
        ("📧", "Correo", 260, 700, 76),
        ("📅", "Calendario", 820, 680, 76),
    ]
    centers: list[tuple[int, int]] = []
    for emo, label, cx, cy, size in tools:
        centers.append(draw_icon_tile(draw, cx, cy, emo, label, size))

    connections = [
        (0, 1, 4, True), (1, 2, 2, False), (2, 4, 3, True), (4, 7, 2, False),
        (7, 6, 3, False), (6, 5, 2, False), (5, 3, 4, True), (3, 0, 2, False),
        (0, 4, 2, False), (1, 5, 3, False),
    ]
    for a, b, w, solid in connections:
        draw_connection(draw, centers[a], centers[b], width=w, solid=solid)

    draw.text((MX, H - 200), "Todo separado.", fill=TEXT, font=f_big)
    draw.text((MX, H - 128), "Todo duplicado.", fill=PRIMARY, font=f_big)

    draw_footer(draw, 1)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-01-portada.png", quality=95)


def slide_02() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_title = load_font(54, bold=True)
    f_pain = load_font(36, bold=True)
    f_sub = load_font(28)

    draw.text((MX, 88), "El", fill=TEXT, font=f_title)
    draw.text((MX + 58, 88), "problema", fill=DANGER, font=f_title)

    pains = [
        ("📊", "Información aislada", "Clientes en Excel, facturas en otro sitio"),
        ("📋", "Información duplicada", "La misma info en cinco sitios distintos"),
        ("⏱", "Horas perdidas", "Buscando datos en lugar de vender"),
    ]
    py = 250
    for emo, title, sub in pains:
        draw_red_x(draw, MX, py + 8)
        draw.text((MX + 58, py + 2), emo, fill=TEXT, font=load_emoji_font(36))
        draw.text((MX + 116, py), title, fill=TEXT, font=f_pain)
        sub_y = py + 46
        for line in wrap_text(draw, sub, f_sub, W - MX - 320):
            draw.text((MX + 116, sub_y), line, fill=MUTED, font=f_sub)
            sub_y += 34
        py = sub_y + 24

    draw_stressed_person(draw, W - 200, 300, scale=2.0)

    close = "Cuando la información está separada, las decisiones también lo están."
    f_close = load_font(40, bold=True)
    draw_lines(draw, wrap_text(draw, close, f_close, W - MX * 2), MX, H - 210, f_close, PRIMARY, gap=8)

    draw_footer(draw, 2)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-02-problema.png", quality=95)


def slide_03() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_title = load_font(50, bold=True)
    f_step = load_font(36)
    f_big = load_font(48, bold=True)
    f_punch = load_font(40, bold=True)
    f_emoji = load_emoji_font(34)

    y = draw_lines(
        draw,
        wrap_text(draw, "¿Cuánto cuesta trabajar así?", f_title, W - MX * 2),
        MX,
        80,
        f_title,
    )

    draw.text((MX, y + 24), "⏰", fill=TEXT, font=f_emoji)
    draw.text((MX + 46, y + 28), "10 horas/semana", fill=TEXT, font=f_step)

    cx = W // 2
    ay = y + 96
    for text, color in [("40 horas/mes", WARNING), ("480 horas/año", WARNING)]:
        draw_arrow(draw, cx, ay, ay + 44)
        ay += 54
        tw = draw.textlength(text, font=f_big)
        draw.text(((W - tw) // 2, ay), text, fill=color, font=f_big)
        ay += 64

    draw_arrow(draw, cx, ay, ay + 44)
    ay += 54
    for i, line in enumerate(["Estás pagando un sueldo...", "solo para buscar información."]):
        color = DANGER if i == 1 else TEXT
        tw = draw.textlength(line, font=f_punch)
        draw.text(((W - tw) // 2, ay), line, fill=color, font=f_punch)
        ay += f_punch.size + 14

    draw_footer(draw, 3)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-03-costo.png", quality=95)


def slide_04() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_title = load_font(54, bold=True)
    draw.text((MX, 48), "Así se ve una empresa", fill=TEXT, font=load_font(36, bold=True))
    draw.text((MX, 96), "conectada.", fill=PRIMARY, font=f_title)

    dash_h = H - 188
    dash = draw_solution_dashboard(W - MX * 2, dash_h)
    dy = 168
    base.paste(dash, (MX, dy))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((MX - 4, dy - 4, MX + dash.width + 4, dy + dash.height + 4), radius=20, outline=PRIMARY, width=2)

    draw_footer(draw, 4)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-04-solucion.png", quality=95)


def slide_05() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_h = load_font(40, bold=True)
    f_label = load_font(28, bold=True)
    f_emoji = load_emoji_font(38)
    f_trust = load_font(20)

    draw.text((MX, 72), "Empieza con lo que necesitas.", fill=TEXT, font=f_h)
    draw.text((MX, 122), "Crece cuando quieras.", fill=PRIMARY, font=f_h)

    modules = [
        ("👥", "CRM"),
        ("💰", "Facturación"),
        ("📦", "Inventario"),
        ("📅", "Agenda"),
        ("📊", "Reportes"),
        ("📱", "WhatsApp"),
        ("📄", "Documentos"),
        ("🤖", "IA Copilot"),
    ]
    y = 200
    row_h = 96
    cols, col_w = 2, (W - MX * 2 - 20) // 2
    for i, (emo, label) in enumerate(modules):
        col, row = i % cols, i // cols
        x = MX + col * (col_w + 20)
        cy = y + row * row_h
        is_ai = label == "IA Copilot"
        outline = AI if is_ai else PRIMARY
        box = (x, cy, x + col_w, cy + 80)
        card_shadow(draw, box, 12)
        draw.rounded_rectangle(box, radius=14, fill=S1, outline=outline, width=2 if is_ai else 1)
        if is_ai:
            draw.rounded_rectangle((x - 2, cy - 2, x + col_w + 2, cy + 82), radius=16, outline=(*AI, 80), width=4)
        draw.text((x + 20, cy + 20), emo, fill=TEXT, font=f_emoji)
        draw.text((x + 76, cy + 24), label, fill=AI if is_ai else TEXT, font=f_label)

    ty = y + 4 * row_h + 20
    trust = [("✓", "Sin instalaciones"), ("☁", "100% en la nube"), ("🛡", "Seguro y confiable")]
    slot = (W - MX * 2) // 3
    for i, (icon, text) in enumerate(trust):
        tx = MX + i * slot
        draw.text((tx, ty), icon, fill=PRIMARY, font=load_emoji_font(28))
        draw.text((tx + 36, ty + 2), text, fill=MUTED, font=f_trust)

    draw_footer(draw, 5)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-05-beneficios.png", quality=95)


def slide_06() -> None:
    """Prueba social — credibilidad antes del CTA."""
    base = Image.new("RGBA", (W, H), (*S0, 255))
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_h = load_font(38, bold=True)
    f_stat = load_font(52, bold=True)
    f_lbl = load_font(28)
    f_quote = load_font(36, bold=True)

    intro = "Empresas como la tuya ya están ahorrando horas cada semana."
    y = draw_lines(draw, wrap_text(draw, intro, f_h, W - MX * 2), MX, 100, f_h, MUTED, gap=8)

    stats = [
        ("+24%", "productividad"),
        ("128", "clientes gestionados"),
        ("Tiempo real", "inventario actualizado"),
        ("Segundos", "IA respondiendo consultas"),
    ]
    sy = y + 48
    for val, lbl in stats:
        card_shadow(draw, (MX, sy, W - MX, sy + 110), 14)
        draw.rounded_rectangle((MX, sy, W - MX, sy + 110), radius=14, fill=S1, outline=PRIMARY, width=1)
        draw.text((MX + 24, sy + 18), val, fill=WARNING, font=f_stat)
        draw.text((MX + 24, sy + 72), lbl, fill=TEXT, font=f_lbl)
        sy += 128

    quote = "Deja de buscar información. Empieza a tomar decisiones."
    draw_lines(draw, wrap_text(draw, quote, f_quote, W - MX * 2), MX, H - 200, f_quote, PRIMARY, gap=10)

    draw_footer(draw, 6)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-06-social.png", quality=95)


def slide_07() -> None:
    base = Image.new("RGBA", (W, H), (*S0, 255))

    dash = draw_solution_dashboard(W, int(H * 0.55))
    dash_big = dash.resize((W + 80, int(H * 0.7)), Image.Resampling.LANCZOS)
    bg = Image.new("RGBA", (W, H), (*S0, 255))
    bg.paste(dash_big, (-40, H // 2 - 100))
    bg = bg.filter(ImageFilter.GaussianBlur(14))
    bg.putalpha(90)
    base = Image.alpha_composite(base, bg)
    overlay = Image.new("RGBA", (W, H), (*S0, 200))
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)
    draw_subtle_grid(draw)

    f_h = load_font(46, bold=True)
    f_sub = load_font(30)
    f_btn = load_font(30, bold=True)
    f_small = load_font(24)

    y = draw_lines(
        draw,
        wrap_text(draw, "Descubre cómo ahorrar hasta 480 horas al año.", f_h, W - MX * 2),
        MX,
        140,
        f_h,
    )

    draw.text((MX, y + 16), "Te mostramos Dakinis en TU empresa.", fill=MUTED, font=f_sub)

    btn = "Agenda una demo gratuita"
    tw = draw.textlength(btn, font=f_btn)
    bx, by = MX, y + 80
    bw = int(tw) + 72
    card_shadow(draw, (bx, by, bx + bw, by + 76), 38)
    draw.rounded_rectangle((bx, by, bx + bw, by + 76), radius=38, fill=PRIMARY)
    draw.text((bx + 24, by + 18), "📅", fill=S0, font=load_emoji_font(30))
    draw.text((bx + 68, by + 18), btn, fill=S0, font=f_btn)

    draw.text((MX, by + 92), "20 min · Gratis · Sin compromiso", fill=MUTED, font=f_small)
    draw.text((MX, by + 132), "dakinissystems.com/empieza", fill=PRIMARY, font=load_font(26))

    draw_footer(draw, 7)
    paste_footer_logo(base)
    base.convert("RGB").save(OUT / "instagram-carousel-07-cta.png", quality=95)


def main() -> None:
    if not LOGO_PATH.exists():
        raise SystemExit(f"Falta logo: {LOGO_PATH}")
    slide_01()
    slide_02()
    slide_03()
    slide_04()
    slide_05()
    slide_06()
    slide_07()
    print("Carrusel v6 generado en", OUT)


if __name__ == "__main__":
    main()
