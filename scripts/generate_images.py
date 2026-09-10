"""
Generates tasteful, offline, license-free placeholder imagery for the hotel
site: gradient backdrops in the luxury palette with a subtle gold monogram
and arc motif. No external network access required.
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT_DIR, exist_ok=True)

# Luxury palette
CHARCOAL_DARK = (16, 14, 11)
CHARCOAL = (26, 22, 18)
BRONZE = (58, 40, 24)
BRONZE_LIGHT = (94, 64, 34)
GOLD = (201, 162, 75)
GOLD_SOFT = (168, 133, 68)
IVORY = (243, 236, 223)

PALETTES = [
    [(14, 13, 11), (42, 33, 22), (74, 52, 26)],   # warm charcoal -> bronze
    [(12, 15, 14), (24, 34, 30), (46, 58, 44)],   # deep pine charcoal
    [(15, 12, 14), (36, 24, 30), (62, 38, 42)],   # plum charcoal
    [(13, 13, 15), (28, 28, 36), (48, 46, 58)],   # slate charcoal
]


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_gradient(w, h, palette, angle_deg=115):
    """Diagonal multi-stop gradient."""
    base = Image.new("RGB", (w, h), palette[0])
    px = base.load()
    angle = math.radians(angle_deg)
    dx, dy = math.cos(angle), math.sin(angle)
    # project corners to find min/max
    corners = [(0, 0), (w, 0), (0, h), (w, h)]
    projs = [x * dx + y * dy for x, y in corners]
    pmin, pmax = min(projs), max(projs)
    n = len(palette) - 1
    for y in range(h):
        row_cache = {}
        for x in range(0, w, 2):
            p = (x * dx + y * dy - pmin) / (pmax - pmin)
            p = min(max(p, 0), 1)
            seg = min(int(p * n), n - 1)
            t = p * n - seg
            color = lerp(palette[seg], palette[seg + 1], t)
            row_cache[x] = color
        keys = sorted(row_cache)
        for i, x in enumerate(keys):
            color = row_cache[x]
            px[x, y] = color
            if x + 1 < w:
                px[x + 1, y] = color
    return base


def add_vignette(img, strength=0.55):
    w, h = img.size
    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    max_r = math.hypot(w / 2, h / 2)
    steps = 60
    for i in range(steps, 0, -1):
        r = max_r * i / steps
        val = int(255 * (1 - (i / steps)) * strength)
        vd.ellipse(
            [w / 2 - r, h / 2 - r * 0.85, w / 2 + r, h / 2 + r * 0.85],
            fill=val,
        )
    vignette = vignette.filter(ImageFilter.GaussianBlur(w * 0.04))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(img, Image.blend(img, black, 1.0), vignette.point(lambda p: 255 - p))


def add_grain(img, amount=6):
    w, h = img.size
    random.seed(42)
    noise = Image.effect_noise((w, h), amount).convert("L")
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, noise_rgb, 0.035)


def draw_arcs(draw, cx, cy, base_r, count, color, width, gap, alpha_img):
    for i in range(count):
        r = base_r + i * gap
        bbox = [cx - r, cy - r * 0.9, cx + r, cy + r * 0.9]
        start = -55 + i * 3
        end = start + 120
        draw.arc(bbox, start=start, end=end, fill=color, width=width)


def draw_monogram(img, letter, center, size, color, weight_scale=1.0):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    font = None
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]:
        if os.path.exists(path):
            font = ImageFont.truetype(path, size)
            break
    if font is None:
        font = ImageFont.load_default()
    bbox = d.textbbox((0, 0), letter, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(
        (center[0] - tw / 2 - bbox[0], center[1] - th / 2 - bbox[1]),
        letter,
        font=font,
        fill=color,
    )
    overlay = overlay.filter(ImageFilter.GaussianBlur(1))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    return img


def generate(name, w, h, palette_idx, motif="arcs", monogram="H", angle=115):
    palette = PALETTES[palette_idx % len(PALETTES)]
    img = make_gradient(w, h, palette, angle_deg=angle)

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    gold_soft = GOLD_SOFT + (70,)
    gold_faint = GOLD + (40,)

    if motif == "arcs":
        cx, cy = w * 0.82, h * 0.28
        draw_arcs(draw, cx, cy, min(w, h) * 0.18, 5, gold_soft, 2, min(w, h) * 0.045, overlay)
        cx2, cy2 = w * 0.12, h * 0.85
        draw_arcs(draw, cx2, cy2, min(w, h) * 0.14, 4, gold_faint, 1, min(w, h) * 0.04, overlay)
    elif motif == "lines":
        for i in range(6):
            y = h * (0.15 + i * 0.14)
            draw.line([(w * 0.05, y), (w * 0.32, y)], fill=gold_faint, width=1)
        for i in range(6):
            y = h * (0.2 + i * 0.13)
            draw.line([(w * 0.68, y), (w * 0.95, y)], fill=gold_faint, width=1)

    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    # faint monogram watermark
    mono_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    md = ImageDraw.Draw(mono_overlay)
    font_size = int(min(w, h) * 0.7)
    font = None
    for path in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]:
        if os.path.exists(path):
            font = ImageFont.truetype(path, font_size)
    if font is None:
        font = ImageFont.load_default()
    bbox = md.textbbox((0, 0), monogram, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    md.text(
        (w * 0.62 - tw / 2 - bbox[0], h * 0.5 - th / 2 - bbox[1]),
        monogram,
        font=font,
        fill=(255, 255, 255, 10),
    )
    img = Image.alpha_composite(img.convert("RGBA"), mono_overlay).convert("RGB")

    img = add_vignette(img, strength=0.5)
    img = add_grain(img, amount=8)

    path = os.path.join(OUT_DIR, f"{name}.jpg")
    img.save(path, "JPEG", quality=88)
    print("wrote", path)


# Hero images (wide)
generate("hero-home", 1920, 1080, 0, motif="arcs", monogram="A")
generate("hero-rooms", 1600, 900, 1, motif="lines", monogram="R")
generate("hero-addons", 1600, 900, 2, motif="arcs", monogram="T")
generate("hero-about", 1600, 900, 3, motif="lines", monogram="A")
generate("hero-contact", 1600, 900, 0, motif="arcs", monogram="C")
generate("hero-blog", 1600, 900, 1, motif="lines", monogram="J")

# Room cards
generate("room-deluxe", 1200, 800, 0, motif="arcs", monogram="D")
generate("room-suite", 1200, 800, 1, motif="lines", monogram="S")
generate("room-executive", 1200, 800, 2, motif="arcs", monogram="E")
generate("room-family", 1200, 800, 3, motif="lines", monogram="F")

# Tours / add-ons
generate("tour-city", 1200, 800, 1, motif="arcs", monogram="C")
generate("tour-sunset", 1200, 800, 2, motif="lines", monogram="S")
generate("tour-spa", 1200, 800, 3, motif="arcs", monogram="S")
generate("tour-transfer", 1200, 800, 0, motif="lines", monogram="T")

# Blog
generate("blog-1", 1200, 800, 0, motif="lines", monogram="J")
generate("blog-2", 1200, 800, 1, motif="arcs", monogram="J")
generate("blog-3", 1200, 800, 2, motif="lines", monogram="J")
generate("blog-4", 1200, 800, 3, motif="arcs", monogram="J")

# About
generate("about-story", 1400, 1000, 2, motif="lines", monogram="A")
generate("about-team", 1400, 1000, 1, motif="arcs", monogram="A")

print("done")
