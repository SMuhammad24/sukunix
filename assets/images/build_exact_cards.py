import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Canvas: Standard 3.5" x 2.0" @ 600 DPI = 2100 x 1200 px
W, H = 2100, 1200

def get_font(name, size):
    paths = [
        f"C:/Windows/Fonts/{name}.ttf",
        f"C:/Windows/Fonts/{name.lower()}.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf"
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_heading = get_font("segoeuib", 50)
font_title = get_font("segoeuib", 44)
font_body = get_font("segoeui", 38)
font_small = get_font("segoeui", 32)
font_mono_tag = get_font("consola", 30)
font_pills = get_font("consola", 28)

def make_luxury_background():
    # 1. Base gradient
    base = Image.new("RGBA", (W, H), (7, 11, 23, 255))
    draw = ImageDraw.Draw(base)
    
    # 2. Subtle luxury radial lighting
    for r in range(700, 0, -25):
        alpha = int(22 * (1 - r/700))
        # Top right sapphire glow
        draw.ellipse([W - 350 - r, -150 - r, W - 350 + r, -150 + r], fill=(37, 99, 235, alpha))
        # Bottom left cyan glow
        draw.ellipse([250 - r, H + 100 - r, 250 + r, H + 100 + r], fill=(0, 212, 255, alpha))
        # Center soft illumination
        draw.ellipse([W//2 - r, H//2 - r, W//2 + r, H//2 + r], fill=(15, 23, 42, int(alpha * 0.8)))

    # 3. Geometric Tech Grid Mesh
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    step = 70
    for x in range(0, W, step):
        gdraw.line([(x, 0), (x, H)], fill=(255, 255, 255, 5), width=1)
    for y in range(0, H, step):
        gdraw.line([(0, y), (W, y)], fill=(255, 255, 255, 5), width=1)
    base = Image.alpha_composite(base, grid)
    
    # 4. Premium border & electric cyan bottom edge
    bdraw = ImageDraw.Draw(base)
    bdraw.rectangle([0, 0, W-1, H-1], outline=(37, 99, 235, 120), width=3)
    bdraw.line([(0, H-6), (W, H-6)], fill=(0, 212, 255, 230), width=6)
    
    return base

# -------------------------------------------------------------
# 1. FRONT CARD FLAT DESIGN
# -------------------------------------------------------------
def generate_front_card():
    card = make_luxury_background()
    
    # Place exact brand logo (with the blue dot on 'i' and gradient 'x')
    logo_path = 'assets/images/sukunix_exact_brand_logo.png'
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert('RGBA')
        # Target width 940 px
        tw = 940
        th = int(logo_img.height * (tw / logo_img.width))
        logo_resized = logo_img.resize((tw, th), Image.Resampling.LANCZOS)
        
        # Center-left placement
        logo_y = (H - th) // 2 - 20
        card.paste(logo_resized, (130, logo_y), logo_resized)
        
    draw = ImageDraw.Draw(card)
    
    # Top Left Brand Tag
    draw.text((140, 130), "GLOBAL ENTERPRISE ENGINEERING", fill=(0, 212, 255, 220), font=font_mono_tag)
    draw.line([(140, 180), (580, 180)], fill=(37, 99, 235, 150), width=2)
    
    # Center Divider Line
    draw.line([(1100, 280), (1100, 920)], fill=(255, 255, 255, 25), width=2)
    
    # Right Side Corporate Details Column
    rx = 1180
    
    # Division Title
    draw.text((rx, 310), "Cloud Engineering & Global IT Solutions", fill=(255, 255, 255, 255), font=font_heading)
    draw.line([(rx, 385), (rx + 760, 385)], fill=(37, 99, 235, 160), width=2)
    
    # Contact Entries (No personal name, pure company identity)
    draw.text((rx, 450), "OFFICIAL EMAIL", fill=(0, 212, 255, 210), font=font_mono_tag)
    draw.text((rx, 495), "contact@sukunix.com", fill=(241, 245, 249, 255), font=font_title)
    
    draw.text((rx, 610), "DIRECT INQUIRIES", fill=(0, 212, 255, 210), font=font_mono_tag)
    draw.text((rx, 655), "+1 (800) 840-7854", fill=(241, 245, 249, 255), font=font_title)
    
    draw.text((rx, 770), "WEB PLATFORM", fill=(0, 212, 255, 210), font=font_mono_tag)
    draw.text((rx, 815), "www.sukunix.com", fill=(241, 245, 249, 255), font=font_title)
    
    # Bottom Hubs Bar
    draw.line([(140, 1030), (W - 140, 1030)], fill=(255, 255, 255, 30), width=2)
    draw.text((140, 1065), "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI", fill=(148, 163, 184, 210), font=font_small)
    draw.text((W - 480, 1065), "SYSTEMS ARCHITECTURE", fill=(16, 185, 129, 220), font=font_mono_tag)
    
    # Save outputs
    out_desktop_png = "C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.png"
    out_desktop_jpg = "C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.jpg"
    out_assets_jpg = "assets/images/sukunix_card_FRONT_FLAT.jpg"
    
    card.convert("RGB").save(out_desktop_png, quality=100)
    card.convert("RGB").save(out_desktop_jpg, quality=96)
    card.convert("RGB").save(out_assets_jpg, quality=96)
    print("Generated FRONT card with exact blue dot and gradient 'x'.")

# -------------------------------------------------------------
# 2. BACK CARD FLAT DESIGN
# -------------------------------------------------------------
def generate_back_card():
    card = make_luxury_background()
    
    # 1. Large Hexagon Maze Emblem in center
    mark_path = 'assets/images/sukunix-mark-white@2x.png'
    if os.path.exists(mark_path):
        mark_img = Image.open(mark_path).convert('RGBA')
        target_h = 420
        target_w = int(mark_img.width * (target_h / mark_img.height))
        mark_resized = mark_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        mark_x = (W - target_w) // 2
        mark_y = 150
        
        # Subtle cyan halo glow behind the mark
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        for r in range(260, 0, -15):
            gdraw.ellipse([W//2 - r, mark_y + target_h//2 - r, W//2 + r, mark_y + target_h//2 + r], fill=(0, 212, 255, int(16 * (1 - r/260))))
        card = Image.alpha_composite(card, glow)
        
        card.paste(mark_resized, (mark_x, mark_y), mark_resized)
        
    # 2. Place exact colored wordmark (with blue dot on 'i' and gradient 'x')
    word_path = 'assets/images/sukunix_wordmark_colored.png'
    if os.path.exists(word_path):
        word_img = Image.open(word_path).convert('RGBA')
        tw = 620
        th = int(word_img.height * (tw / word_img.width))
        word_resized = word_img.resize((tw, th), Image.Resampling.LANCZOS)
        
        word_x = (W - tw) // 2
        word_y = 610
        card.paste(word_resized, (word_x, word_y), word_resized)
        
    draw = ImageDraw.Draw(card)
    
    # Tagline below wordmark
    tag_text = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    bbox_tag = draw.textbbox((0, 0), tag_text, font=font_mono_tag)
    tw_tag = bbox_tag[2] - bbox_tag[0]
    draw.text(((W - tw_tag) // 2, 790), tag_text, fill=(0, 212, 255, 230), font=font_mono_tag)
    
    # Capability Pills
    pills_text = "CLOUD INFRASTRUCTURE   •   DISTRIBUTED SYSTEMS   •   AI & DATA PODS   •   DEVSECOPS"
    bbox_p = draw.textbbox((0, 0), pills_text, font=font_pills)
    tw_p = bbox_p[2] - bbox_p[0]
    draw.text(((W - tw_p) // 2, 880), pills_text, fill=(203, 213, 225, 210), font=font_pills)
    
    # Bottom Divider & URL
    draw.line([(320, 970), (W - 320, 970)], fill=(255, 255, 255, 35), width=2)
    
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = draw.textbbox((0, 0), url_text, font=font_heading)
    tw_u = bbox_u[2] - bbox_u[0]
    draw.text(((W - tw_u) // 2, 1020), url_text, fill=(255, 255, 255, 255), font=font_heading)
    
    # Save outputs
    out_desktop_png = "C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.png"
    out_desktop_jpg = "C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.jpg"
    out_assets_jpg = "assets/images/sukunix_card_BACK_FLAT.jpg"
    
    card.convert("RGB").save(out_desktop_png, quality=100)
    card.convert("RGB").save(out_desktop_jpg, quality=96)
    card.convert("RGB").save(out_assets_jpg, quality=96)
    print("Generated BACK card with exact blue dot and gradient 'x'.")

if __name__ == '__main__':
    generate_front_card()
    generate_back_card()
