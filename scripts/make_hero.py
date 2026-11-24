"""Build a photographic Soukly hero: teal / forest green + soft gold."""
from __future__ import annotations

import math
import os
import urllib.request

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")
OUT = os.path.join(PUBLIC, "hero-soukly.jpg")
SRC = os.path.join(PUBLIC, "_hero_src.jpg")

SRC_URL = (
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a"
    "?auto=format&fit=crop&w=2400&q=85"
)


def download() -> Image.Image:
    if not os.path.exists(SRC) or os.path.getsize(SRC) < 50_000:
        urllib.request.urlretrieve(SRC_URL, SRC)
    return Image.open(SRC).convert("RGB")


def remap_to_soukly(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    w, h = 2400, 1350
    img = ImageOps.fit(img, (w, h), method=Image.Resampling.LANCZOS)
    px = img.load()

    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            mx = max(r, g, b)
            mn = min(r, g, b)
            sat = (mx - mn) / (mx + 1e-6)
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

            # Reds / pinks / berries → rich teal/emerald (keep luminance)
            if r > g + 18 and r > b + 10 and sat > 0.12:
                # map luminance into teal channel mix
                t = lum / 255
                nr = int(8 + 55 * t + 10 * (g / 255))
                ng = int(40 + 140 * t)
                nb = int(36 + 110 * t)
                # soft gold ribbon highlights when very bright
                if lum > 200:
                    nr = int(nr * 0.7 + 210 * 0.3)
                    ng = int(ng * 0.7 + 180 * 0.3)
                    nb = int(nb * 0.75 + 90 * 0.25)
                px[x, y] = (
                    max(0, min(255, nr)),
                    max(0, min(255, ng)),
                    max(0, min(255, nb)),
                )
                continue

            # Soft cool cast on neutrals toward teal
            if sat < 0.12:
                nr = int(r * 0.86 + 18)
                ng = int(g * 0.92 + 28)
                nb = int(b * 0.90 + 26)
                px[x, y] = (
                    max(0, min(255, nr)),
                    max(0, min(255, ng)),
                    max(0, min(255, nb)),
                )

    # Light brand wash (not a heavy overlay)
    wash = Image.new("RGB", (w, h))
    wp = wash.load()
    for y in range(h):
        t = y / (h - 1)
        for x in range(w):
            u = x / (w - 1)
            gold = max(0.0, 1 - math.hypot(u - 0.8, t - 0.2) / 0.75) ** 2
            wp[x, y] = (
                min(255, int(20 + 70 * gold + 10 * (1 - t))),
                min(255, int(55 + 45 * gold + 20 * (1 - t))),
                min(255, int(48 + 8 * gold + 12 * (1 - t))),
            )

    img = Image.blend(img, wash, 0.16)
    img = ImageEnhance.Color(img).enhance(1.05)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Brightness(img).enhance(1.04)

    # Gentle left-side darkening for text legibility
    shade = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(shade)
    for i in range(0, 1100, 8):
        alpha = int(max(0, 160 - i * 0.14))
        sd.rectangle([i, 0, i + 8, h], fill=alpha)
    shade = shade.filter(ImageFilter.GaussianBlur(40))
    dark = Image.new("RGB", (w, h), (8, 24, 22))
    img = Image.composite(img, dark, ImageOps.invert(shade))

    return img


def main() -> None:
    photo = download()
    out = remap_to_soukly(photo)
    out.save(OUT, "JPEG", quality=92, optimize=True)
    print("wrote", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    main()
