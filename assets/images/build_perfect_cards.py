import os
from PIL import Image, ImageDraw, ImageFont

W, H = 2100, 1200

# Exact Colors from Logo:
# Royal Blue: (26, 116, 184) -> #1a74b8
# Bright Blue: (30, 136, 229) -> #1e88e5
# Emerald Green: (78, 165, 142) -> #4ea58e
# Bright Emerald: (16, 185, 129) -> #10b981

COLOR_BLUE = (30, 136, 229)
COLOR_EMERALD = (16, 185, 129)
COLOR_TEXT_WHITE = (248, 250, 252)
COLOR_TEXT_MUTED = (148, 163, 184)

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

font_heading = get_font("segoeuib", 52)
font_title = get_font("segoeuib", 44)
font_body = get_font("segoeui", 38)
font_small = get_font("segoeui", 32)
font_mono_tag = get_font("consola", 30)
font_pills = get_font("consola", 28)

def draw_gradient_line(draw, x1, y1, x2, y2, c1, c2, width=3):
    # Linear interpolation between c1 (blue) and c2 (emerald)
    dx = x2 - x1
    dy = y2 - y1
    steps = max(abs(dx), abs(dy), 1)
    for i in range(steps):
        t = i / steps
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        px = int(x1 + dx * t)
        py = int(y1 + dy * t)
        if dx >= dy:
            draw.line([(px, py - width//2), (px, py + width//2)], fill=(r, g, b, 255), width=1)
        else:
            draw.line([(px - width//2, py), (px + width//2, py)], fill=(r, g, b, 255), width=1)

# =============================================================================
# DARK EDITION WITH EXACT LOGO & DUAL GRADIENT ACCENTS
# =============================================================================
def build_dark_cards():
    # --- 1. FRONT ---
    front = Image.new("RGBA", (W, H), (7, 11, 25, 255))
    fdraw = ImageDraw.Draw(front)
    
    # Ambient glows in the exact brand colors (blue on left, emerald on right)
    for r in range(500, 0, -25):
        # Royal Blue glow on bottom-left near the logo
        fdraw.ellipse([300 - r, H - 100 - r, 300 + r, H - 100 + r], fill=(26, 116, 184, int(18 * (1 - r/500))))
        # Emerald glow on top-right
        fdraw.ellipse([W - 350 - r, 100 - r, W - 350 + r, 100 + r], fill=(16, 185, 129, int(15 * (1 - r/500))))
        
    # Micro grid
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    for x in range(0, W, 70):
        gdraw.line([(x, 0), (x, H)], fill=(255, 255, 255, 4), width=1)
    for y in range(0, H, 70):
        gdraw.line([(0, y), (W, y)], fill=(255, 255, 255, 4), width=1)
    front = Image.alpha_composite(front, grid)
    fdraw = ImageDraw.Draw(front)
    
    # Outer frame with gradient
    fdraw.rectangle([0, 0, W-1, H-1], outline=(30, 58, 138, 120), width=3)
    # Top & Bottom Gradient Accent Bars
    draw_gradient_line(fdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(fdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Place Exact Logo with blue dot and gradient 'x'
    logo = Image.open('assets/images/logo_for_dark_card.png')
    tw = 950
    th = int(logo.height * (tw / logo.width))
    logo_res = logo.resize((tw, th), Image.Resampling.LANCZOS)
    front.paste(logo_res, (130, (H - th) // 2 - 20), logo_res)
    
    # Top Tag
    fdraw.text((140, 125), "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS", fill=COLOR_EMERALD, font=font_mono_tag)
    draw_gradient_line(fdraw, 140, 175, 750, 175, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    # Vertical Divider Line
    draw_gradient_line(fdraw, 1110, 270, 1110, 930, COLOR_BLUE, COLOR_EMERALD, width=3)
    
    # Right Column Contact Details
    rx = 1190
    fdraw.text((rx, 305), "Cloud Engineering & Global IT Solutions", fill=COLOR_TEXT_WHITE, font=font_heading)
    draw_gradient_line(fdraw, rx, 380, rx + 750, 380, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    fdraw.text((rx, 445), "OFFICIAL CONTACT", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 490), "contact@sukunix.com", fill=COLOR_TEXT_WHITE, font=font_title)
    
    fdraw.text((rx, 605), "DIRECT TELEPHONE", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 650), "+1 (800) 840-7854", fill=COLOR_TEXT_WHITE, font=font_title)
    
    fdraw.text((rx, 765), "ONLINE PLATFORM", fill=COLOR_EMERALD, font=font_mono_tag)
    fdraw.text((rx, 810), "www.sukunix.com", fill=COLOR_TEXT_WHITE, font=font_title)
    
    # Bottom Hubs Bar
    fdraw.line([(140, 1030), (W - 140, 1030)], fill=(255, 255, 255, 25), width=2)
    fdraw.text((140, 1065), "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI", fill=COLOR_TEXT_MUTED, font=font_small)
    fdraw.text((W - 480, 1065), "HIGH-THROUGHPUT PODS", fill=COLOR_EMERALD, font=font_mono_tag)
    
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.jpg", quality=96)
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.png", quality=100)
    
    # --- 2. BACK ---
    back = Image.new("RGBA", (W, H), (7, 11, 25, 255))
    bdraw = ImageDraw.Draw(back)
    
    # Centered Dual Glow (Blue + Emerald)
    for r in range(450, 0, -20):
        bdraw.ellipse([W//2 - 120 - r, 360 - r, W//2 - 120 + r, 360 + r], fill=(26, 116, 184, int(15 * (1 - r/450))))
        bdraw.ellipse([W//2 + 120 - r, 360 - r, W//2 + 120 + r, 360 + r], fill=(16, 185, 129, int(15 * (1 - r/450))))
        
    back = Image.alpha_composite(back, grid)
    bdraw = ImageDraw.Draw(back)
    
    # Outer frame & gradient bars
    bdraw.rectangle([0, 0, W-1, H-1], outline=(30, 58, 138, 120), width=3)
    draw_gradient_line(bdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(bdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Hexagon mark
    mark = Image.open('assets/images/sukunix-mark-white@2x.png')
    target_h = 430
    target_w = int(mark.width * (target_h / mark.height))
    mark_res = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mark_x = (W - target_w) // 2
    mark_y = 150
    back.paste(mark_res, (mark_x, mark_y), mark_res)
    
    # Wordmark with exact blue dot and gradient 'x'
    word = Image.open('assets/images/wordmark_for_dark_card.png')
    tw_w = 640
    th_w = int(word.height * (tw_w / word.width))
    word_res = word.resize((tw_w, th_w), Image.Resampling.LANCZOS)
    word_x = (W - tw_w) // 2
    word_y = 615
    back.paste(word_res, (word_x, word_y), word_res)
    
    # Tagline
    tag_text = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    bbox_tag = bdraw.textbbox((0, 0), tag_text, font=font_mono_tag)
    tw_tag = bbox_tag[2] - bbox_tag[0]
    bdraw.text(((W - tw_tag) // 2, 790), tag_text, fill=COLOR_EMERALD, font=font_mono_tag)
    
    # Capability Pills
    pills_text = "CLOUD INFRASTRUCTURE   •   DISTRIBUTED SYSTEMS   •   AI & DATA PODS   •   DEVSECOPS"
    bbox_p = bdraw.textbbox((0, 0), pills_text, font=font_pills)
    tw_p = bbox_p[2] - bbox_p[0]
    bdraw.text(((W - tw_p) // 2, 880), pills_text, fill=(203, 213, 225, 210), font=font_pills)
    
    # Bottom Divider & URL
    draw_gradient_line(bdraw, 340, 970, W - 340, 970, COLOR_BLUE, COLOR_EMERALD, width=3)
    
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = bdraw.textbbox((0, 0), url_text, font=font_heading)
    tw_u = bbox_u[2] - bbox_u[0]
    bdraw.text(((W - tw_u) // 2, 1020), url_text, fill=COLOR_TEXT_WHITE, font=font_heading)
    
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.jpg", quality=96)
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.png", quality=100)
    print("Saved Dark Edition Flat Cards.")

# =============================================================================
# LIGHT ENTERPRISE EDITION (100% ORIGINAL LOGO ON CRISP WHITE/SLATE)
# =============================================================================
def build_light_cards():
    # --- 1. LIGHT FRONT ---
    front = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    fdraw = ImageDraw.Draw(front)
    
    # Subtle soft slate gradient tint on corners
    for r in range(400, 0, -20):
        fdraw.ellipse([W - r, -r, W + r, r], fill=(239, 246, 255, int(40 * (1 - r/400))))
        fdraw.ellipse([-r, H - r, r, H + r], fill=(236, 253, 245, int(40 * (1 - r/400))))
        
    # Outer frame
    fdraw.rectangle([0, 0, W-1, H-1], outline=(226, 232, 240, 255), width=3)
    draw_gradient_line(fdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(fdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Place 100% original logo (Black letters + Blue dot + Emerald/Teal 'x')
    logo = Image.open('assets/images/logo_for_light_card.png')
    tw = 950
    th = int(logo.height * (tw / logo.width))
    logo_res = logo.resize((tw, th), Image.Resampling.LANCZOS)
    front.paste(logo_res, (130, (H - th) // 2 - 20), logo_res)
    
    # Top Tag
    fdraw.text((140, 125), "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS", fill=COLOR_EMERALD, font=font_mono_tag)
    draw_gradient_line(fdraw, 140, 175, 750, 175, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    # Vertical Divider Line
    draw_gradient_line(fdraw, 1110, 270, 1110, 930, COLOR_BLUE, COLOR_EMERALD, width=3)
    
    # Right Column Contact Details
    rx = 1190
    fdraw.text((rx, 305), "Cloud Engineering & Global IT Solutions", fill=(15, 23, 42, 255), font=font_heading)
    draw_gradient_line(fdraw, rx, 380, rx + 750, 380, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    fdraw.text((rx, 445), "OFFICIAL CONTACT", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 490), "contact@sukunix.com", fill=(30, 41, 59, 255), font=font_title)
    
    fdraw.text((rx, 605), "DIRECT TELEPHONE", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 650), "+1 (800) 840-7854", fill=(30, 41, 59, 255), font=font_title)
    
    fdraw.text((rx, 765), "ONLINE PLATFORM", fill=COLOR_EMERALD, font=font_mono_tag)
    fdraw.text((rx, 810), "www.sukunix.com", fill=(30, 41, 59, 255), font=font_title)
    
    # Bottom Hubs Bar
    fdraw.line([(140, 1030), (W - 140, 1030)], fill=(226, 232, 240, 255), width=2)
    fdraw.text((140, 1065), "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI", fill=(100, 116, 139, 255), font=font_small)
    fdraw.text((W - 480, 1065), "HIGH-THROUGHPUT PODS", fill=COLOR_EMERALD, font=font_mono_tag)
    
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_LIGHT.jpg", quality=96)
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_LIGHT.png", quality=100)
    
    # --- 2. LIGHT BACK ---
    back = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    bdraw = ImageDraw.Draw(back)
    
    # Outer frame & gradient bars
    bdraw.rectangle([0, 0, W-1, H-1], outline=(226, 232, 240, 255), width=3)
    draw_gradient_line(bdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(bdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Hexagon mark (Dark)
    mark = Image.open('assets/images/sukunix-mark-dark@2x.png')
    target_h = 430
    target_w = int(mark.width * (target_h / mark.height))
    mark_res = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mark_x = (W - target_w) // 2
    mark_y = 150
    back.paste(mark_res, (mark_x, mark_y), mark_res)
    
    # Wordmark with exact blue dot and gradient 'x' (Dark letters)
    word = Image.open('assets/images/wordmark_for_light_card.png')
    tw_w = 640
    th_w = int(word.height * (tw_w / word.width))
    word_res = word.resize((tw_w, th_w), Image.Resampling.LANCZOS)
    word_x = (W - tw_w) // 2
    word_y = 615
    back.paste(word_res, (word_x, word_y), word_res)
    
    # Tagline
    tag_text = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    bbox_tag = bdraw.textbbox((0, 0), tag_text, font=font_mono_tag)
    tw_tag = bbox_tag[2] - bbox_tag[0]
    bdraw.text(((W - tw_tag) // 2, 790), tag_text, fill=COLOR_EMERALD, font=font_mono_tag)
    
    # Capability Pills
    pills_text = "CLOUD INFRASTRUCTURE   •   DISTRIBUTED SYSTEMS   •   AI & DATA PODS   •   DEVSECOPS"
    bbox_p = bdraw.textbbox((0, 0), pills_text, font=font_pills)
    tw_p = bbox_p[2] - bbox_p[0]
    bdraw.text(((W - tw_p) // 2, 880), pills_text, fill=(71, 85, 105, 255), font=font_pills)
    
    # Bottom Divider & URL
    draw_gradient_line(bdraw, 340, 970, W - 340, 970, COLOR_BLUE, COLOR_EMERALD, width=3)
    
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = bdraw.textbbox((0, 0), url_text, font=font_heading)
    tw_u = bbox_u[2] - bbox_u[0]
    bdraw.text(((W - tw_u) // 2, 1020), url_text, fill=(15, 23, 42, 255), font=font_heading)
    
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_LIGHT.jpg", quality=96)
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_LIGHT.png", quality=100)
    print("Saved Light Edition Flat Cards.")

if __name__ == '__main__':
    build_dark_cards()
    build_light_cards()
