"""Dense photographic-feel Soukly cover — fills entire 16:9 frame."""
from __future__ import annotations

import math
import os
import random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "hero-soukly.jpg")
RNG = random.Random(11)


def main() -> None:
    w, h = 2400, 1350
    img = Image.new("RGB", (w, h))
    px = img.load()

    for y in range(h):
        t = y / (h - 1)
        for x in range(w):
            u = x / (w - 1)
            # Continuous teal field — no empty flat zone
            r = int(16 + 28 * (1 - t) + 14 * math.sin((u + t) * math.pi))
            g = int(48 + 58 * (1 - t * 0.55) + 18 * math.cos(u * 2.2))
            b = int(42 + 42 * (1 - t * 0.65) + 10 * math.sin(u * 3.1))
            # Multiple gold wells across width
            for cx, cy, strength, rad in (
                (0.15, 0.25, 0.55, 0.48),
                (0.5, 0.15, 0.7, 0.55),
                (0.85, 0.3, 0.6, 0.5),
                (0.35, 0.7, 0.35, 0.45),
                (0.7, 0.75, 0.4, 0.48),
            ):
                gld = max(0.0, 1 - math.hypot(u - cx, t - cy) / rad) ** 2
                r = min(255, int(r + 95 * strength * gld))
                g = min(255, int(g + 65 * strength * gld))
                b = min(255, int(b + 12 * strength * gld))
            px[x, y] = (r, g, b)

    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Dense lattice everywhere
    step = 64
    for y in range(-30, h + 40, step):
        offset = (y // step % 2) * (step // 2)
        for x in range(-30, w + 40, step):
            cx, cy = x + offset, y
            a = 16 + int(14 * abs(math.sin(cx * 0.012 + cy * 0.01)))
            d.polygon(
                [(cx, cy - 16), (cx + 16, cy), (cx, cy + 16), (cx - 16, cy)],
                outline=(212, 175, 80, a),
            )

    # Many cream/teal/gold tiles covering full width & height mid-band
    colors = [
        (240, 232, 214, 175),
        (28, 86, 74, 185),
        (205, 175, 98, 170),
        (248, 244, 234, 160),
        (48, 108, 92, 175),
        (175, 148, 78, 165),
        (220, 210, 190, 150),
    ]
    # Grid of rounded tiles across entire frame
    cols, rows = 7, 4
    for row in range(rows):
        for col in range(cols):
            bw = RNG.randint(220, 320)
            bh = RNG.randint(110, 160)
            x = int(col * (w / cols) + RNG.randint(20, 60))
            y = int(280 + row * 220 + RNG.randint(-30, 40))
            if x + bw > w - 20:
                bw = w - 40 - x
            if bw < 120:
                continue
            fill = colors[(row * cols + col) % len(colors)]
            rad = RNG.randint(18, 32)
            d.rounded_rectangle([x, y, x + bw, y + bh], radius=rad, fill=fill)
            mid = y + bh // 2
            d.rectangle([x + 8, mid - 5, x + bw - 8, mid + 5], fill=(212, 175, 80, 120))
            d.rectangle(
                [x + bw // 2 - 5, y + 8, x + bw // 2 + 5, y + bh - 8],
                fill=(212, 175, 80, 100),
            )

    # Soft leaf silhouettes sprinkled full width
    for _ in range(22):
        lx = RNG.randint(40, w - 40)
        ly = RNG.randint(520, h - 40)
        sc = RNG.uniform(0.5, 1.35)
        ang = RNG.uniform(-50, 50)
        a = RNG.randint(25, 50)
        pts = []
        for deg in list(range(0, 180, 14)) + list(range(180, 360, 14)):
            rad = math.radians(deg)
            px_ = math.cos(rad) * 140 * sc
            py_ = math.sin(rad) * 36 * sc
            ar = math.radians(ang)
            rx = px_ * math.cos(ar) - py_ * math.sin(ar)
            ry = px_ * math.sin(ar) + py_ * math.cos(ar)
            pts.append((lx + rx, ly + ry))
        d.polygon(pts, fill=(30, 95, 78, a))

    layer = layer.filter(ImageFilter.GaussianBlur(0.9))
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

    # Even vignette
    vig = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vig)
    for i in range(55):
        vd.ellipse([i * 14, i * 9, w - i * 14, h - i * 9], fill=int(i * 2.2))
    vig = ImageOps.invert(vig).filter(ImageFilter.GaussianBlur(50))
    dark = Image.new("RGB", (w, h), (6, 18, 16))
    img = Image.composite(img, dark, vig.point(lambda p: int(p * 0.32)))

    grain = Image.effect_noise((w, h), 11).convert("L")
    img = Image.blend(img, Image.merge("RGB", (grain, grain, grain)), 0.03)
    img = ImageEnhance.Color(img).enhance(1.05)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img.save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print("wrote", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    main()
