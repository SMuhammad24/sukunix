import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Standard 3.5" x 2.0" at 600 DPI for ultra-high print clarity: 2100 x 1200 px
W, H = 2100, 1200

# Try to find high quality standard windows fonts
def get_font(name, size):
    font_paths = [
        f"C:/Windows/Fonts/{name}.ttf",
        f"C:/Windows/Fonts/{name.lower()}.ttf",
        "C:/Windows/Fonts/segoeuib.ttf", # Segoe UI Bold
        "C:/Windows/Fonts/segoeui.ttf",  # Segoe UI
        "C:/Windows/Fonts/arialbd.ttf",  # Arial Bold
        "C:/Windows/Fonts/arial.ttf"
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_title_bold = get_font("segoeuib", 68)
font_bold_md = get_font("segoeuib", 52)
font_regular = get_font("segoeui", 42)
font_regular_sm = get_font("segoeui", 36)
font_mono = get_font("consola", 34)

def create_base_canvas():
    # Luxury Midnight Navy Gradient (#0a0f24 to #060914)
    base = Image.new("RGBA", (W, H), (6, 9, 20, 255))
    draw = ImageDraw.Draw(base)
    
    # Subtle radial glow
    for r in range(600, 0, -20):
        alpha = int(18 * (1 - r/600))
        # subtle sapphire glow at top right
        draw.ellipse([W - 400 - r, -100 - r, W - 400 + r, -100 + r], fill=(37, 99, 235, alpha))
        # subtle cyan glow at bottom left
        draw.ellipse([200 - r, H - r, 200 + r, H + r], fill=(0, 212, 255, alpha))
        
    # Micro grid lines (2D blueprint/tech texture)
    grid_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid_overlay)
    grid_size = 60
    for x in range(0, W, grid_size):
        gdraw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, grid_size):
        gdraw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)
    base = Image.alpha_composite(base, grid_overlay)
    
    # Outer crisp edge border (Cyan/Blue micro-frame)
    bdraw = ImageDraw.Draw(base)
    bdraw.rectangle([0, 0, W-1, H-1], outline=(37, 99, 235, 160), width=4)
    # Bottom electric cyan accent line
    bdraw.line([(0, H-6), (W, H-6)], fill=(0, 212, 255, 240), width=6)
    
    return base

# -------------------------------------------------------------
# 1. PURE FLAT 2D FRONT CARD
# -------------------------------------------------------------
def build_flat_front():
    card = create_base_canvas()
    
    # Load and place official white logo
    logo_path = 'assets/images/sukunix-logo-white@2x.png'
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert('RGBA')
        # Resize logo: original is ~2080x670. For card width 2100, target width ~880px
        target_w = 920
        target_h = int(logo_img.height * (target_w / logo_img.width))
        logo_resized = logo_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Paste on left side
        card.paste(logo_resized, (140, 480), logo_resized)
        
    draw = ImageDraw.Draw(card)
    
    # Top Left micro-tag
    draw.text((150, 140), "GLOBAL ENTERPRISE ENGINEERING", fill=(0, 212, 255, 230), font=font_mono)
    draw.line([(150, 190), (600, 190)], fill=(37, 99, 235, 180), width=2)
    
    # Right Side Corporate Details Column
    right_x = 1180
    
    # Corporate Department
    draw.text((right_x, 320), "Cloud Engineering & Global IT Solutions", fill=(248, 250, 252, 255), font=font_bold_md)
    draw.line([(right_x, 395), (right_x + 720, 395)], fill=(255, 255, 255, 40), width=2)
    
    # Contact Entries (No personal name, pure corporate)
    draw.text((right_x, 460), "EMAIL", fill=(0, 212, 255, 200), font=font_mono)
    draw.text((right_x, 505), "contact@sukunix.com", fill=(240, 244, 250, 255), font=font_regular)
    
    draw.text((right_x, 620), "PHONE", fill=(0, 212, 255, 200), font=font_mono)
    draw.text((right_x, 665), "+1 (800) 840-7854", fill=(240, 244, 250, 255), font=font_regular)
    
    draw.text((right_x, 780), "PLATFORM", fill=(0, 212, 255, 200), font=font_mono)
    draw.text((right_x, 825), "www.sukunix.com", fill=(240, 244, 250, 255), font=font_bold_md)
    
    # Bottom Hubs Bar
    hubs_text = "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI"
    draw.line([(150, 1020), (W - 150, 1020)], fill=(255, 255, 255, 30), width=2)
    draw.text((150, 1055), hubs_text, fill=(148, 163, 184, 220), font=font_regular_sm)
    draw.text((W - 520, 1055), "SECURE CLOUD ARCHITECTURE", fill=(16, 185, 129, 230), font=font_mono)
    
    card.convert('RGB').save('C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.png', quality=100)
    card.convert('RGB').save('C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.jpg', quality=95)
    print("Saved sukunix_card_FRONT_FLAT.png and .jpg")

# -------------------------------------------------------------
# 2. PURE FLAT 2D BACK CARD
# -------------------------------------------------------------
def build_flat_back():
    card = create_base_canvas()
    
    # Centered Large Logo Mark
    mark_path = 'assets/images/sukunix-mark-white@2x.png'
    if os.path.exists(mark_path):
        mark_img = Image.open(mark_path).convert('RGBA')
        target_h = 420
        target_w = int(mark_img.width * (target_h / mark_img.height))
        mark_resized = mark_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Center horizontally
        mark_x = (W - target_w) // 2
        mark_y = 200
        
        # Glow behind mark
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        for r in range(250, 0, -15):
            gdraw.ellipse([W//2 - r, mark_y + target_h//2 - r, W//2 + r, mark_y + target_h//2 + r], fill=(37, 99, 235, int(15 * (1 - r/250))))
        card = Image.alpha_composite(card, glow)
        
        card.paste(mark_resized, (mark_x, mark_y), mark_resized)
        
    draw = ImageDraw.Draw(card)
    
    # "S U K U N I X" bold letterspaced
    title_text = "S U K U N I X"
    bbox = draw.textbbox((0, 0), title_text, font=font_title_bold)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 670), title_text, fill=(255, 255, 255, 255), font=font_title_bold)
    
    # Tagline
    tag_text = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    bbox_tag = draw.textbbox((0, 0), tag_text, font=font_mono)
    tw_tag = bbox_tag[2] - bbox_tag[0]
    draw.text(((W - tw_tag) // 2, 770), tag_text, fill=(0, 212, 255, 230), font=font_mono)
    
    # Capability Badges Bar
    pills = ["CLOUD INFRASTRUCTURE", "DISTRIBUTED SYSTEMS", "AI & DATA PODS", "DEVSECOPS"]
    pill_font = font_mono
    pill_text = "   |   ".join(pills)
    bbox_p = draw.textbbox((0, 0), pill_text, font=pill_font)
    tw_p = bbox_p[2] - bbox_p[0]
    draw.text(((W - tw_p) // 2, 870), pill_text, fill=(203, 213, 225, 200), font=pill_font)
    
    # Bottom Domain URL
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = draw.textbbox((0, 0), url_text, font=font_bold_md)
    tw_u = bbox_u[2] - bbox_u[0]
    draw.line([(300, 970), (W - 300, 970)], fill=(255, 255, 255, 35), width=2)
    draw.text(((W - tw_u) // 2, 1020), url_text, fill=(255, 255, 255, 255), font=font_bold_md)
    
    card.convert('RGB').save('C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.png', quality=100)
    card.convert('RGB').save('C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.jpg', quality=95)
    print("Saved sukunix_card_BACK_FLAT.png and .jpg")

if __name__ == '__main__':
    build_flat_front()
    build_flat_back()
