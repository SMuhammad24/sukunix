import numpy as np
from PIL import Image

# 1. Load original logo
img = Image.open('assets/images/sukunix-logo-full.jpg').convert('RGB')
arr = np.array(img, dtype=np.float32)

# Crop: Y 240 to 575, X 115 to 1155
crop = arr[240:575, 115:1155].copy()
H, W, _ = crop.shape

# BG estimation
bg_val = np.median(np.concatenate([crop[:5, :, :].reshape(-1, 3), crop[-5:, :, :].reshape(-1, 3)]), axis=0)

# Distance to background
diff = np.linalg.norm(crop - bg_val, axis=2)
alpha = np.clip((diff - 10) / 22, 0, 1)

# Detect color (blue dot and gradient x)
diff_rg = np.abs(crop[:, :, 0] - crop[:, :, 1])
diff_gb = np.abs(crop[:, :, 1] - crop[:, :, 2])
diff_rb = np.abs(crop[:, :, 0] - crop[:, :, 2])
sat = diff_rg + diff_gb + diff_rb
is_colored = (sat > 30) & (diff > 20)

# A. For White Card (100% Original Colors: Black text + Blue dot + Teal/Green 'x')
white_card_logo = np.zeros((H, W, 4), dtype=np.uint8)
# For colored parts: original colors
# For dark parts: rich crisp dark (#090D1A)
for c in range(3):
    chan = np.where(is_colored, crop[:, :, c], np.clip(crop[:, :, c] * 0.35, 0, 255))
    white_card_logo[:, :, c] = chan.astype(np.uint8)
white_card_logo[:, :, 3] = (alpha * 255).astype(np.uint8)

Image.fromarray(white_card_logo).save('assets/images/logo_for_light_card.png')
print("Saved logo_for_light_card.png")

# B. For Dark Card (Crisp White Text + Exact Bright Royal Blue Dot + Vibrant Teal/Emerald 'x')
dark_card_logo = np.zeros((H, W, 4), dtype=np.uint8)
# Boost the colored parts so they are ultra-vibrant on dark background
boost_colored = crop.copy()
# Boost blue in the dot (x: 870 to 935)
dot_area = np.zeros((H, W), dtype=bool)
dot_area[60:140, 860:940] = True
boost_colored[dot_area & is_colored, 0] = np.clip(crop[dot_area & is_colored, 0] * 0.7, 0, 255) # lower red
boost_colored[dot_area & is_colored, 1] = np.clip(crop[dot_area & is_colored, 1] * 1.25, 0, 255) # boost green/cyan
boost_colored[dot_area & is_colored, 2] = np.clip(crop[dot_area & is_colored, 2] * 1.45, 0, 255) # boost royal blue

# Boost teal/emerald in the top of 'x' (x: 940 to 1030, y: 60 to 140)
x_top_area = np.zeros((H, W), dtype=bool)
x_top_area[60:140, 940:1030] = True
boost_colored[x_top_area & is_colored, 0] = np.clip(crop[x_top_area & is_colored, 0] * 0.8, 0, 255)
boost_colored[x_top_area & is_colored, 1] = np.clip(crop[x_top_area & is_colored, 1] * 1.45, 0, 255) # boost emerald
boost_colored[x_top_area & is_colored, 2] = np.clip(crop[x_top_area & is_colored, 2] * 1.15, 0, 255)

for c in range(3):
    chan = np.where(is_colored, boost_colored[:, :, c], 255)
    dark_card_logo[:, :, c] = chan.astype(np.uint8)
dark_card_logo[:, :, 3] = (alpha * 255).astype(np.uint8)

Image.fromarray(dark_card_logo).save('assets/images/logo_for_dark_card.png')
print("Saved logo_for_dark_card.png")
