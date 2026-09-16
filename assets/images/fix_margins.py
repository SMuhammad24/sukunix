import os
from PIL import Image, ImageDraw, ImageFont

# Canvas: Standard 3.5" x 2.0" @ 600 DPI = 2100 x 1200 px
W, H = 2100, 1200

# Exact Colors from Logo
COLOR_BLUE = (26, 116, 184)       # #1a74b8 (Royal Blue from dot & bottom of x)
COLOR_EMERALD = (16, 185, 129)     # #10b981 (Emerald Green from top of x)
COLOR_TEXT_DARK = (15, 23, 42)     # #0f172a
COLOR_TEXT_BODY_DARK = (51, 65, 85)# #334155
COLOR_TEXT_WHITE = (248, 250, 252) # #f8fafc
COLOR_TEXT_MUTED = (148, 163, 184) # #94a3b8

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

# Well-proportioned typography that never overflows
font_heading = get_font("segoeuib", 40)
font_title = get_font("segoeuib", 38)
font_body = get_font("segoeui", 34)
font_small = get_font("segoeui", 28)
font_mono_tag = get_font("consola", 26)
font_pills = get_font("consola", 25)

def draw_gradient_line(draw, x1, y1, x2, y2, c1, c2, width=3):
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
# 1. LIGHT ENTERPRISE EDITION (The one user showed, with generous margins)
# =============================================================================
def render_light_cards():
    # --- FRONT LIGHT ---
    front = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    fdraw = ImageDraw.Draw(front)
    
    # Soft corner glows
    for r in range(400, 0, -25):
        fdraw.ellipse([W - r, -r, W + r, r], fill=(239, 246, 255, int(35 * (1 - r/400))))
        fdraw.ellipse([-r, H - r, r, H + r], fill=(236, 253, 245, int(35 * (1 - r/400))))
        
    # Card outer border and top/bottom gradient accent lines
    fdraw.rectangle([0, 0, W-1, H-1], outline=(226, 232, 240, 255), width=3)
    draw_gradient_line(fdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(fdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Place Exact Logo on Left (Original colors: black text + royal blue dot + emerald gradient 'x')
    logo = Image.open('assets/images/logo_for_light_card.png')
    tw = 880
    th = int(logo.height * (tw / logo.width))
    logo_res = logo.resize((tw, th), Image.Resampling.LANCZOS)
    front.paste(logo_res, (130, (H - th) // 2 - 20), logo_res)
    
    # Top Tag with matching gradient underline
    top_tag = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    fdraw.text((130, 120), top_tag, fill=COLOR_EMERALD, font=font_mono_tag)
    bbox_tag = fdraw.textbbox((130, 120), top_tag, font=font_mono_tag)
    draw_gradient_line(fdraw, 130, 160, bbox_tag[2], 160, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    # Vertical Center Divider Line
    draw_gradient_line(fdraw, 1070, 280, 1070, 920, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    # Right Column Contact Details (Starts at 1140, safely ends well before 2100)
    rx = 1140
    heading_text = "Cloud Engineering & Global IT Solutions"
    fdraw.text((rx, 310), heading_text, fill=COLOR_TEXT_DARK, font=font_heading)
    bbox_h = fdraw.textbbox((rx, 310), heading_text, font=font_heading)
    # Underline exactly matches the text width
    draw_gradient_line(fdraw, rx, 370, bbox_h[2], 370, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    # Contact rows with ample spacing
    fdraw.text((rx, 440), "OFFICIAL CONTACT", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 480), "contact@sukunix.com", fill=COLOR_TEXT_BODY_DARK, font=font_title)
    
    fdraw.text((rx, 590), "DIRECT TELEPHONE", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 630), "+1 (800) 840-7854", fill=COLOR_TEXT_BODY_DARK, font=font_title)
    
    fdraw.text((rx, 740), "ONLINE PLATFORM", fill=COLOR_EMERALD, font=font_mono_tag)
    fdraw.text((rx, 780), "www.sukunix.com", fill=COLOR_TEXT_BODY_DARK, font=font_title)
    
    # Bottom Hubs Bar with generous 130px margins on both sides
    fdraw.line([(130, 1040), (W - 130, 1040)], fill=(226, 232, 240, 255), width=2)
    fdraw.text((130, 1070), "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI", fill=(100, 116, 139, 255), font=font_small)
    
    right_tag = "HIGH-THROUGHPUT PODS"
    bbox_rt = fdraw.textbbox((0, 0), right_tag, font=font_mono_tag)
    rt_w = bbox_rt[2] - bbox_rt[0]
    fdraw.text((W - 130 - rt_w, 1070), right_tag, fill=COLOR_EMERALD, font=font_mono_tag)
    
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_LIGHT.jpg", quality=96)
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_LIGHT.png", quality=100)
    
    # --- BACK LIGHT ---
    back = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    bdraw = ImageDraw.Draw(back)
    
    # Outer frame & gradient bars
    bdraw.rectangle([0, 0, W-1, H-1], outline=(226, 232, 240, 255), width=3)
    draw_gradient_line(bdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(bdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    # Hexagon mark (Dark)
    mark = Image.open('assets/images/sukunix-mark-dark@2x.png')
    target_h = 420
    target_w = int(mark.width * (target_h / mark.height))
    mark_res = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mark_x = (W - target_w) // 2
    mark_y = 150
    back.paste(mark_res, (mark_x, mark_y), mark_res)
    
    # Wordmark with exact blue dot and gradient 'x' (Dark letters)
    word = Image.open('assets/images/wordmark_for_light_card.png')
    tw_w = 600
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
    
    # Capability Pills (Centered with 400px+ margins)
    pills_text = "CLOUD INFRASTRUCTURE   •   DISTRIBUTED SYSTEMS   •   AI & DATA PODS   •   DEVSECOPS"
    bbox_p = bdraw.textbbox((0, 0), pills_text, font=font_pills)
    tw_p = bbox_p[2] - bbox_p[0]
    bdraw.text(((W - tw_p) // 2, 875), pills_text, fill=(71, 85, 105, 255), font=font_pills)
    
    # Bottom Divider & URL
    draw_gradient_line(bdraw, 400, 960, W - 400, 960, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = bdraw.textbbox((0, 0), url_text, font=font_heading)
    tw_u = bbox_u[2] - bbox_u[0]
    bdraw.text(((W - tw_u) // 2, 1010), url_text, fill=COLOR_TEXT_DARK, font=font_heading)
    
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_LIGHT.jpg", quality=96)
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_LIGHT.png", quality=100)
    print("Saved Perfected Light Edition.")

# =============================================================================
# 2. DARK OBSIDIAN EDITION (With the same safe margins)
# =============================================================================
def render_dark_cards():
    # --- FRONT DARK ---
    front = Image.new("RGBA", (W, H), (7, 11, 25, 255))
    fdraw = ImageDraw.Draw(front)
    
    # Ambient glows
    for r in range(500, 0, -25):
        fdraw.ellipse([300 - r, H - 100 - r, 300 + r, H - 100 + r], fill=(26, 116, 184, int(16 * (1 - r/500))))
        fdraw.ellipse([W - 350 - r, 100 - r, W - 350 + r, 100 + r], fill=(16, 185, 129, int(14 * (1 - r/500))))
        
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    for x in range(0, W, 70):
        gdraw.line([(x, 0), (x, H)], fill=(255, 255, 255, 4), width=1)
    for y in range(0, H, 70):
        gdraw.line([(0, y), (W, y)], fill=(255, 255, 255, 4), width=1)
    front = Image.alpha_composite(front, grid)
    fdraw = ImageDraw.Draw(front)
    
    fdraw.rectangle([0, 0, W-1, H-1], outline=(30, 58, 138, 120), width=3)
    draw_gradient_line(fdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(fdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    logo = Image.open('assets/images/logo_for_dark_card.png')
    tw = 880
    th = int(logo.height * (tw / logo.width))
    logo_res = logo.resize((tw, th), Image.Resampling.LANCZOS)
    front.paste(logo_res, (130, (H - th) // 2 - 20), logo_res)
    
    top_tag = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    fdraw.text((130, 120), top_tag, fill=COLOR_EMERALD, font=font_mono_tag)
    bbox_tag = fdraw.textbbox((130, 120), top_tag, font=font_mono_tag)
    draw_gradient_line(fdraw, 130, 160, bbox_tag[2], 160, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    draw_gradient_line(fdraw, 1070, 280, 1070, 920, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    rx = 1140
    heading_text = "Cloud Engineering & Global IT Solutions"
    fdraw.text((rx, 310), heading_text, fill=COLOR_TEXT_WHITE, font=font_heading)
    bbox_h = fdraw.textbbox((rx, 310), heading_text, font=font_heading)
    draw_gradient_line(fdraw, rx, 370, bbox_h[2], 370, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    fdraw.text((rx, 440), "OFFICIAL CONTACT", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 480), "contact@sukunix.com", fill=COLOR_TEXT_WHITE, font=font_title)
    
    fdraw.text((rx, 590), "DIRECT TELEPHONE", fill=COLOR_BLUE, font=font_mono_tag)
    fdraw.text((rx, 630), "+1 (800) 840-7854", fill=COLOR_TEXT_WHITE, font=font_title)
    
    fdraw.text((rx, 740), "ONLINE PLATFORM", fill=COLOR_EMERALD, font=font_mono_tag)
    fdraw.text((rx, 780), "www.sukunix.com", fill=COLOR_TEXT_WHITE, font=font_title)
    
    fdraw.line([(130, 1040), (W - 130, 1040)], fill=(255, 255, 255, 25), width=2)
    fdraw.text((130, 1070), "SAN FRANCISCO   •   LONDON   •   SINGAPORE   •   DUBAI", fill=COLOR_TEXT_MUTED, font=font_small)
    
    right_tag = "HIGH-THROUGHPUT PODS"
    bbox_rt = fdraw.textbbox((0, 0), right_tag, font=font_mono_tag)
    rt_w = bbox_rt[2] - bbox_rt[0]
    fdraw.text((W - 130 - rt_w, 1070), right_tag, fill=COLOR_EMERALD, font=font_mono_tag)
    
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.jpg", quality=96)
    front.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_FRONT_FLAT.png", quality=100)
    
    # --- BACK DARK ---
    back = Image.new("RGBA", (W, H), (7, 11, 25, 255))
    bdraw = ImageDraw.Draw(back)
    
    for r in range(450, 0, -20):
        bdraw.ellipse([W//2 - 120 - r, 360 - r, W//2 - 120 + r, 360 + r], fill=(26, 116, 184, int(15 * (1 - r/450))))
        bdraw.ellipse([W//2 + 120 - r, 360 - r, W//2 + 120 + r, 360 + r], fill=(16, 185, 129, int(15 * (1 - r/450))))
        
    back = Image.alpha_composite(back, grid)
    bdraw = ImageDraw.Draw(back)
    
    bdraw.rectangle([0, 0, W-1, H-1], outline=(30, 58, 138, 120), width=3)
    draw_gradient_line(bdraw, 0, 4, W, 4, COLOR_BLUE, COLOR_EMERALD, width=8)
    draw_gradient_line(bdraw, 0, H-4, W, H-4, COLOR_BLUE, COLOR_EMERALD, width=8)
    
    mark = Image.open('assets/images/sukunix-mark-white@2x.png')
    target_h = 420
    target_w = int(mark.width * (target_h / mark.height))
    mark_res = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mark_x = (W - target_w) // 2
    mark_y = 150
    back.paste(mark_res, (mark_x, mark_y), mark_res)
    
    word = Image.open('assets/images/wordmark_for_dark_card.png')
    tw_w = 600
    th_w = int(word.height * (tw_w / word.width))
    word_res = word.resize((tw_w, th_w), Image.Resampling.LANCZOS)
    word_x = (W - tw_w) // 2
    word_y = 615
    back.paste(word_res, (word_x, word_y), word_res)
    
    tag_text = "ENTERPRISE SOFTWARE & CLOUD ENGINEERING PODS"
    bbox_tag = bdraw.textbbox((0, 0), tag_text, font=font_mono_tag)
    tw_tag = bbox_tag[2] - bbox_tag[0]
    bdraw.text(((W - tw_tag) // 2, 790), tag_text, fill=COLOR_EMERALD, font=font_mono_tag)
    
    pills_text = "CLOUD INFRASTRUCTURE   •   DISTRIBUTED SYSTEMS   •   AI & DATA PODS   •   DEVSECOPS"
    bbox_p = bdraw.textbbox((0, 0), pills_text, font=font_pills)
    tw_p = bbox_p[2] - bbox_p[0]
    bdraw.text(((W - tw_p) // 2, 875), pills_text, fill=(203, 213, 225, 210), font=font_pills)
    
    draw_gradient_line(bdraw, 400, 960, W - 400, 960, COLOR_BLUE, COLOR_EMERALD, width=2)
    
    url_text = "WWW.SUKUNIX.COM"
    bbox_u = bdraw.textbbox((0, 0), url_text, font=font_heading)
    tw_u = bbox_u[2] - bbox_u[0]
    bdraw.text(((W - tw_u) // 2, 1010), url_text, fill=COLOR_TEXT_WHITE, font=font_heading)
    
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.jpg", quality=96)
    back.convert("RGB").save("C:/Users/muham/OneDrive/Desktop/sukunix_card_BACK_FLAT.png", quality=100)
    print("Saved Perfected Dark Edition.")

if __name__ == '__main__':
    render_light_cards()
    render_dark_cards()
