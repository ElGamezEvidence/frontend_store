"""Clean Soukly hero: soft teal atmosphere, no posterization."""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "hero-soukly.jpg")


def build() -> Image.Image:
    w, h = 2400, 1350
    img = Image.new("RGB", (w, h))
    px = img.load()

    # Soft photographic teal gradient (readable for white RTL text on the start side)
    for y in range(h):
        t = y / (h - 1)
        for x in range(w):
            u = x / (w - 1)
            # base forest → mid teal
            r = int(10 + 22 * (1 - t) + 8 * u)
            g = int(36 + 48 * (1 - t * 0.55) + 10 * (1 - u))
            b = int(32 + 36 * (1 - t * 0.65))
            # warm gold bloom top-right (image side for RTL: text is on the right)
            gold = max(0.0, 1 - math.hypot(u - 0.78, t - 0.22) / 0.62) ** 2
            r = min(255, int(r + 110 * gold))
            g = min(255, int(g + 78 * gold))
            b = min(255, int(b + 18 * gold))
            # soft aqua glow bottom-left
            aqua = max(0.0, 1 - math.hypot(u - 0.18, t - 0.82) / 0.55) ** 2
            r = min(255, int(r + 12 * aqua))
            g = min(255, int(g + 40 * aqua))
            b = min(255, int(b + 36 * aqua))
            px[x, y] = (r, g, b)

    # Subtle Moroccan lattice (very soft)
    lattice = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lattice)
    step = 100
    for y in range(40, h - 40, step):
        for x in range(40, w - 40, step):
            cx = x + ((y // step) % 2) * (step // 2)
            cy = y
            ld.polygon(
                [(cx, cy - 22), (cx + 22, cy), (cx, cy + 22), (cx - 22, cy)],
                outline=(212, 175, 80, 22),
            )
    lattice = lattice.filter(ImageFilter.GaussianBlur(0.8))
    img = Image.alpha_composite(img.convert("RGBA"), lattice).convert("RGB")

    # Soft gift parcels on the LEFT (visual weight), keep RIGHT clearer for Arabic text
    parcels = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(parcels)
    boxes = [
        (180, 520, 560, 220, 36, (236, 228, 210, 205)),
        (280, 360, 500, 200, 32, (22, 78, 68, 215)),
        (360, 230, 440, 170, 28, (198, 168, 96, 200)),
        (460, 120, 380, 140, 24, (245, 240, 230, 190)),
    ]
    for x, y, bw, bh, rad, fill in boxes:
        pd.rounded_rectangle([x, y, x + bw, y + bh], radius=rad, fill=fill)
        mid = y + bh // 2
        pd.rectangle([x, mid - 7, x + bw, mid + 7], fill=(212, 175, 80, 150))
        pd.rectangle([x + bw // 2 - 7, y, x + bw // 2 + 7, y + bh], fill=(212, 175, 80, 130))

    # Soft leaf accents
    for lx, ly, ang, sc, a in [
        (820, 880, -20, 1.1, 55),
        (900, 960, 18, 0.9, 45),
        (200, 980, 30, 1.0, 40),
    ]:
        pts = []
        for deg in list(range(0, 180, 10)) + list(range(180, 360, 10)):
            rad = math.radians(deg)
            px_ = math.cos(rad) * 150 * sc
            py_ = math.sin(rad) * 42 * sc
            ar = math.radians(ang)
            rx = px_ * math.cos(ar) - py_ * math.sin(ar)
            ry = px_ * math.sin(ar) + py_ * math.cos(ar)
            pts.append((lx + rx, ly + ry))
        pd.polygon(pts, fill=(34, 95, 80, a))

    parcels = parcels.filter(ImageFilter.GaussianBlur(1.8))
    img = Image.alpha_composite(img.convert("RGBA"), parcels).convert("RGB")

    # Gentle vignette — stronger on left (image), lighter on right (Arabic copy)
    shade = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(shade)
    for i in range(0, 900, 10):
        alpha = int(max(0, 90 - i * 0.08))
        sd.rectangle([i, 0, i + 10, h], fill=alpha)
    shade = shade.filter(ImageFilter.GaussianBlur(50))
    dark = Image.new("RGB", (w, h), (8, 22, 20))
    img = Image.composite(img, dark, ImageOps.invert(shade))

    # Light film grain (subtle)
    grain = Image.effect_noise((w, h), 12).convert("L")
    grain_rgb = Image.merge("RGB", (grain, grain, grain))
    img = Image.blend(img, grain_rgb, 0.03)

    img = ImageEnhance.Color(img).enhance(1.04)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Brightness(img).enhance(1.02)
    return img


def main() -> None:
    out = build()
    out.save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print("wrote", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    main()
