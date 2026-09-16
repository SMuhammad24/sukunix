import os
from PIL import Image
import numpy as np

os.makedirs('assets/images', exist_ok=True)

def make_transparent_and_inverted():
    # 1. Full Logo
    img_full = Image.open('assets/images/sukunix-logo-full.jpg').convert('RGB')
    arr_full = np.array(img_full, dtype=np.float32)
    # Crop: Y: 245 to 575, X: 115 to 1155
    crop = arr_full[240:575, 115:1155].copy()
    
    # Border samples for background
    top_edge = crop[:5, :, :]
    bottom_edge = crop[-5:, :, :]
    left_edge = crop[:, :5, :]
    right_edge = crop[:, -5:, :]
    bg_samples = np.concatenate([
        top_edge.reshape(-1, 3),
        bottom_edge.reshape(-1, 3),
        left_edge.reshape(-1, 3),
        right_edge.reshape(-1, 3)
    ], axis=0)
    bg_color = np.median(bg_samples, axis=0)
    print("Full Logo detected BG:", bg_color)
    
    # Distance from background
    dist = np.linalg.norm(crop - bg_color, axis=2)
    alpha = np.clip((dist - 14) / 24, 0, 1) * 255.0
    
    # Colored check (the blue dot on 'i' and green/blue 'x')
    # Cyan/blue dot has high B, low R. Green has high G.
    is_blue_or_green = (crop[:, :, 2] - crop[:, :, 0] > 35) | (crop[:, :, 1] - crop[:, :, 0] > 35)
    
    # Dark version (for light backgrounds)
    dark_full = np.zeros((crop.shape[0], crop.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        # Keep colored pixels vibrant; for black pixels make them crisp #090D1A
        chan = np.where(is_blue_or_green, crop[:, :, c], np.clip(crop[:, :, c] * 0.4, 0, 255))
        dark_full[:, :, c] = chan.astype(np.uint8)
    dark_full[:, :, 3] = alpha.astype(np.uint8)
    Image.fromarray(dark_full).save('assets/images/sukunix-logo-dark.png')
    print("Saved sukunix-logo-dark.png")

    # Inverted White version (for dark cards)
    # Black elements become crisp pure white (#FFFFFF), while blue/green colored accents stay vibrant!
    white_full = np.zeros((crop.shape[0], crop.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        chan = np.where(is_blue_or_green, crop[:, :, c], 255)
        white_full[:, :, c] = chan.astype(np.uint8)
    white_full[:, :, 3] = alpha.astype(np.uint8)
    Image.fromarray(white_full).save('assets/images/sukunix-logo-white.png')
    print("Saved sukunix-logo-white.png")

    # 2. Standalone Hexagon Mark
    img_mark = Image.open('assets/images/sukunix-logo-mark.png').convert('RGB')
    arr_mark = np.array(img_mark, dtype=np.float32)
    # Mark Y range: 250 to 715, X range: 570 to 965
    crop_m = arr_mark[250:715, 570:965].copy()
    
    # BG color
    bg_samples_m = np.concatenate([
        crop_m[:5, :, :].reshape(-1, 3),
        crop_m[-5:, :, :].reshape(-1, 3),
        crop_m[:, :5, :].reshape(-1, 3),
        crop_m[:, -5:, :].reshape(-1, 3)
    ], axis=0)
    bg_color_m = np.median(bg_samples_m, axis=0)
    print("Mark detected BG:", bg_color_m)
    
    dist_m = np.linalg.norm(crop_m - bg_color_m, axis=2)
    alpha_m = np.clip((dist_m - 14) / 24, 0, 1) * 255.0
    
    # Dark mark (for light backgrounds)
    dark_m = np.zeros((crop_m.shape[0], crop_m.shape[1], 4), dtype=np.uint8)
    dark_m[:, :, :3] = (np.clip(crop_m * 0.3, 0, 255)).astype(np.uint8)
    dark_m[:, :, 3] = alpha_m.astype(np.uint8)
    Image.fromarray(dark_m).save('assets/images/sukunix-mark-dark.png')
    print("Saved sukunix-mark-dark.png")
    
    # White mark (for dark backgrounds)
    white_m = np.zeros((crop_m.shape[0], crop_m.shape[1], 4), dtype=np.uint8)
    white_m[:, :, :3] = 255
    white_m[:, :, 3] = alpha_m.astype(np.uint8)
    Image.fromarray(white_m).save('assets/images/sukunix-mark-white.png')
    print("Saved sukunix-mark-white.png")

    # Cyan/Neon Mark (for ultra modern high-tech card back)
    cyan_m = np.zeros((crop_m.shape[0], crop_m.shape[1], 4), dtype=np.uint8)
    # Vibrant electric cyan (#00f0ff) gradient to royal blue
    for y in range(crop_m.shape[0]):
        ratio = y / crop_m.shape[0]
        r = int(0 * (1-ratio) + 37 * ratio)
        g = int(220 * (1-ratio) + 99 * ratio)
        b = int(255 * (1-ratio) + 235 * ratio)
        cyan_m[y, :, 0] = r
        cyan_m[y, :, 1] = g
        cyan_m[y, :, 2] = b
    cyan_m[:, :, 3] = alpha_m.astype(np.uint8)
    Image.fromarray(cyan_m).save('assets/images/sukunix-mark-cyan.png')
    print("Saved sukunix-mark-cyan.png")

if __name__ == '__main__':
    make_transparent_and_inverted()
