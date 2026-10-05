from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size, top, bottom):
    width, height = size
    image = Image.new("RGB", size)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        t = y / max(height - 1, 1)
        draw.line([(0, y), (width, y)], fill=mix(top, bottom, t))
    return image.convert("RGBA")


def glow(base, center, radius, color):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(radius * 0.45)))


def shadow(base, mask, blur, offset, color):
    alpha = Image.new("L", base.size, 0)
    alpha.paste(mask, offset)
    layer = Image.new("RGBA", base.size, color)
    layer.putalpha(alpha.filter(ImageFilter.GaussianBlur(blur)))
    base.alpha_composite(layer)


def draw_dashed_line(draw, points, fill, width, dash):
    for start, end in zip(points, points[1:]):
        x1, y1 = start
        x2, y2 = end
        length = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
        if length == 0:
            continue
        steps = max(1, int(length / dash))
        for i in range(0, steps, 2):
            a = i / steps
            b = min((i + 1) / steps, 1)
            draw.line(
                [
                    (x1 + (x2 - x1) * a, y1 + (y2 - y1) * a),
                    (x1 + (x2 - x1) * b, y1 + (y2 - y1) * b),
                ],
                fill=fill,
                width=width,
            )


def draw_panel(base, polygon, fill, fold_color, line_color, scale=1):
    panel = Image.new("RGBA", base.size, (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(panel)
    panel_draw.polygon(polygon, fill=fill)

    min_x = int(min(x for x, _ in polygon))
    max_x = int(max(x for x, _ in polygon))
    min_y = int(min(y for _, y in polygon))
    max_y = int(max(y for _, y in polygon))
    for y in range(min_y + 48 * scale, max_y, 86 * scale):
        panel_draw.line(
            [(min_x - 20 * scale, y), (max_x + 30 * scale, y + 26 * scale)],
            fill=line_color,
            width=7 * scale,
        )
    for x in range(min_x + 42 * scale, max_x, 92 * scale):
        panel_draw.line(
            [(x, min_y - 10 * scale), (x - 24 * scale, max_y + 10 * scale)],
            fill=line_color,
            width=6 * scale,
        )
    panel_draw.line([polygon[1], polygon[2]], fill=fold_color, width=8 * scale)
    panel_draw.line([polygon[0], polygon[3]], fill=(255, 255, 255, 62), width=5 * scale)

    mask = Image.new("L", base.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    shadow(base, mask, 24 * scale, (0, 22 * scale), (10, 31, 48, 42))
    panel.putalpha(mask)
    base.alpha_composite(panel)


def draw_map_mark(base, compact=False, monochrome=False, scale=1):
    draw = ImageDraw.Draw(base)
    point = lambda p: (round(p[0] * scale), round(p[1] * scale))
    points = lambda items: [point(p) for p in items]
    value = lambda n: round(n * scale)
    if monochrome:
        ink = (255, 255, 255, 255)
        soft = (255, 255, 255, 130)
        map_a = (255, 255, 255, 255)
        map_b = (255, 255, 255, 214)
        route = (255, 255, 255, 255)
        pin = (255, 255, 255, 255)
        pin_dark = (255, 255, 255, 255)
    else:
        ink = (20, 49, 67, 255)
        soft = (20, 49, 67, 56)
        map_a = (249, 245, 228, 255)
        map_b = (232, 244, 235, 255)
        route = (236, 91, 79, 255)
        pin = (255, 191, 73, 255)
        pin_dark = (204, 79, 63, 255)

    if compact:
        panels = [
            points([(160, 172), (258, 102), (258, 394), (138, 446)]),
            points([(258, 102), (360, 154), (360, 432), (258, 394)]),
            points([(360, 154), (466, 106), (470, 370), (360, 432)]),
        ]
        route_points = points([(174, 376), (232, 330), (286, 356), (338, 288), (394, 236)])
        pin_center = point((394, 206))
        pin_r = value(42)
    else:
        panels = [
            points([(185, 354), (418, 246), (420, 792), (176, 858)]),
            points([(418, 246), (614, 332), (620, 848), (420, 792)]),
            points([(614, 332), (838, 236), (852, 744), (620, 848)]),
        ]
        route_points = points([(265, 746), (374, 650), (496, 688), (586, 548), (682, 460)])
        pin_center = point((682, 416))
        pin_r = value(74)

    if monochrome:
        for poly in panels:
            draw.polygon(poly, fill=map_a)
    else:
        draw_panel(base, panels[0], map_a, (195, 179, 143, 122), soft, scale)
        draw_panel(base, panels[1], map_b, (30, 118, 108, 118), soft, scale)
        draw_panel(base, panels[2], map_a, (195, 179, 143, 122), soft, scale)

    draw_dashed_line(
        draw,
        route_points,
        route,
        value(22 if not compact else 12),
        value(34 if not compact else 18),
    )
    for x, y in route_points[::2]:
        dot = value(14)
        draw.ellipse((x - dot, y - dot, x + dot, y + dot), fill=route if not compact else ink)

    cx, cy = pin_center
    r = pin_r
    if not monochrome:
        pin_shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
        ps = ImageDraw.Draw(pin_shadow)
        ps.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(9, 29, 43, 50))
        ps.polygon([(cx - r * 0.58, cy + r * 0.42), (cx + r * 0.58, cy + r * 0.42), (cx, cy + r * 1.58)], fill=(9, 29, 43, 50))
        base.alpha_composite(pin_shadow.filter(ImageFilter.GaussianBlur(value(14 if not compact else 7))))

    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=pin_dark)
    draw.polygon([(cx - r * 0.54, cy + r * 0.34), (cx + r * 0.54, cy + r * 0.34), (cx, cy + r * 1.48)], fill=pin_dark)
    draw.ellipse((cx - r * 0.76, cy - r * 0.76, cx + r * 0.76, cy + r * 0.76), fill=pin)
    draw.ellipse((cx - r * 0.30, cy - r * 0.30, cx + r * 0.30, cy + r * 0.30), fill=ink if not monochrome else (0, 0, 0, 0))


def render_icon(size=1024):
    scale = 3
    canvas_size = (size * scale, size * scale)
    image = gradient(canvas_size, (19, 123, 125), (34, 59, 96))
    glow(image, (235 * scale, 175 * scale), 260 * scale, (255, 210, 111, 72))
    glow(image, (840 * scale, 865 * scale), 340 * scale, (42, 199, 167, 64))

    draw = ImageDraw.Draw(image)
    for x in range(-180 * scale, 1220 * scale, 150 * scale):
        draw.line([(x, -30 * scale), (x + 350 * scale, 1050 * scale)], fill=(255, 255, 255, 22), width=5 * scale)
    for y in range(88 * scale, 990 * scale, 150 * scale):
        draw.line([(-40 * scale, y), (1070 * scale, y - 110 * scale)], fill=(255, 255, 255, 18), width=4 * scale)

    mark = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    draw_map_mark(mark, scale=scale)
    image.alpha_composite(mark)

    return image.resize((size, size), Image.Resampling.LANCZOS).convert("RGB")


def render_adaptive_foreground(size=512):
    scale = 3
    image = Image.new("RGBA", (size * scale, size * scale), (0, 0, 0, 0))
    draw_map_mark(image, compact=True, scale=scale)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def render_android_background(size=512):
    scale = 3
    image = gradient((size * scale, size * scale), (19, 123, 125), (34, 59, 96))
    glow(image, (112 * scale, 84 * scale), 140 * scale, (255, 210, 111, 72))
    glow(image, (420 * scale, 430 * scale), 165 * scale, (42, 199, 167, 64))
    draw = ImageDraw.Draw(image)
    for x in range(-120 * scale, 640 * scale, 100 * scale):
        draw.line([(x, 0), (x + 180 * scale, 520 * scale)], fill=(255, 255, 255, 25), width=3 * scale)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def render_monochrome(size=432):
    scale = 3
    source_size = 512
    image = Image.new("RGBA", (source_size * scale, source_size * scale), (0, 0, 0, 0))
    draw_map_mark(image, compact=True, monochrome=True, scale=scale)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main():
    icon = render_icon(1024)
    icon.save(ROOT / "assets" / "icon.png", optimize=True)
    icon.save(ROOT / "assets" / "splash-icon.png", optimize=True)
    icon.resize((512, 512), Image.Resampling.LANCZOS).save(
        ROOT / "dist" / "play-console" / "icon-512.png", optimize=True
    )
    icon.resize((48, 48), Image.Resampling.LANCZOS).save(ROOT / "assets" / "favicon.png", optimize=True)

    render_android_background(512).save(ROOT / "assets" / "android-icon-background.png", optimize=True)
    render_adaptive_foreground(512).save(ROOT / "assets" / "android-icon-foreground.png", optimize=True)
    render_monochrome(432).save(ROOT / "assets" / "android-icon-monochrome.png", optimize=True)


if __name__ == "__main__":
    main()
