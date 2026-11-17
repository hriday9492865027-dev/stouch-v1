import os
import math
from PIL import Image, ImageDraw, ImageFont

public_dir = os.path.join(os.path.dirname(__file__), "Mobile-App", "public")
os.makedirs(public_dir, exist_ok=True)

def create_stouch_icon(size, is_maskable=False):
    # Create RGBA canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = 0 if is_maskable else int(size * 0.04)
    # Background rounded rect
    bg_box = [margin, margin, size - margin, size - margin]
    radius = int(size * 0.22) if not is_maskable else 0

    # Draw dark navy/slate gradient background
    bg = Image.new("RGBA", (size, size), (2, 6, 23, 255))
    bg_draw = ImageDraw.Draw(bg)
    
    # Inner glow circles
    center = size / 2
    for r in range(int(size * 0.45), int(size * 0.15), -int(size * 0.05)):
        alpha = int(25 * (1 - r / (size * 0.45)))
        bg_draw.ellipse(
            [center - r, center - r, center + r, center + r],
            fill=(6, 182, 212, alpha)
        )

    # Mask with rounded rectangle if not maskable
    if not is_maskable:
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle(bg_box, radius=radius, fill=255)
        img.paste(bg, (0, 0), mask)
        
        # Draw border
        draw.rounded_rectangle(bg_box, radius=radius, outline=(6, 182, 212, 160), width=max(2, int(size * 0.02)))
    else:
        img.paste(bg, (0, 0))

    # Draw the STouch branding: An elegant glowing trackpad surface + stylized 'S'
    cx, cy = size / 2, size / 2
    
    # Trackpad outline inside
    pad_scale = 0.55 if is_maskable else 0.65
    pw, ph = int(size * pad_scale), int(size * pad_scale * 0.72)
    px0, py0 = int(cx - pw / 2), int(cy - ph / 2)
    px1, py1 = px0 + pw, py0 + ph
    pad_r = int(pw * 0.14)
    
    draw.rounded_rectangle([px0, py0, px1, py1], radius=pad_r, outline=(34, 211, 238, 220), width=max(2, int(size * 0.025)))
    
    # Touch dots/radar in the center
    dot_r = max(2, int(size * 0.02))
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=(34, 211, 238, 255))
    
    radar_r = int(pw * 0.22)
    draw.ellipse([cx - radar_r, cy - radar_r, cx + radar_r, cy + radar_r], outline=(6, 182, 212, 140), width=max(1, int(size * 0.015)))
    
    # Bottom click divider line
    div_y = py1 - int(ph * 0.28)
    draw.line([px0 + pad_r, div_y, px1 - pad_r, div_y], fill=(6, 182, 212, 140), width=max(1, int(size * 0.012)))
    draw.line([cx, div_y, cx, py1], fill=(6, 182, 212, 140), width=max(1, int(size * 0.012)))

    # Stylized S in the upper radar or top center
    # Let's draw high-contrast "S"
    font_size = int(ph * 0.5)
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw / 2
    ty = cy - th / 2 - int(ph * 0.12)
    
    # Text shadow / glow
    draw.text((tx + 2, ty + 2), text, font=font, fill=(0, 0, 0, 180))
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    return img

# Generate icons
create_stouch_icon(192, is_maskable=False).save(os.path.join(public_dir, "icon-192.png"))
create_stouch_icon(512, is_maskable=False).save(os.path.join(public_dir, "icon-512.png"))
create_stouch_icon(192, is_maskable=True).save(os.path.join(public_dir, "icon-maskable-192.png"))
create_stouch_icon(512, is_maskable=True).save(os.path.join(public_dir, "icon-maskable-512.png"))
create_stouch_icon(180, is_maskable=False).save(os.path.join(public_dir, "apple-touch-icon.png"))
create_stouch_icon(64, is_maskable=False).save(os.path.join(public_dir, "favicon.ico"), format="ICO")

print("All PWA icons generated successfully in", public_dir)
