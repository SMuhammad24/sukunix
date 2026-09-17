import os
import shutil
import base64
from PIL import Image, ImageFilter
import numpy as np

src_path = r'C:\Users\muham\.gemini\antigravity-ide\brain\6305d0d0-84ff-4b96-b0d6-705a8b8a1537\.user_uploaded\media_1789666846252.png'
root_dir = r'c:\Users\muham\OneDrive\Desktop\sukunix.com'
assets_dir = os.path.join(root_dir, 'assets', 'images')

# 1. Load source image
img = Image.open(src_path).convert('RGBA')
arr = np.array(img)
alpha = arr[:, :, 3]

# 2. Crop tightly to bounding box
y_min, y_max = np.where(alpha > 15)[0].min(), np.where(alpha > 15)[0].max()
x_min, x_max = np.where(alpha > 15)[1].min(), np.where(alpha > 15)[1].max()

cropped = img.crop((x_min, y_min, x_max + 1, y_max + 1))
print(f"Tight cropped size: {cropped.size}")

# 3. Create 512x512 canvas with comfortable padding
canvas_size = 512
content_size = 430
resized_logo = cropped.resize((content_size, content_size), Image.Resampling.LANCZOS)

base_layer = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
offset = ((canvas_size - content_size) // 2, (canvas_size - content_size) // 2)
base_layer.paste(resized_logo, offset, resized_logo)

# 4. Generate adaptive master with subtle white keyline for dark tab contrast
alpha_chan = base_layer.split()[-1]
# Dilation for ~5px crisp white edge
outline_mask = alpha_chan.filter(ImageFilter.MaxFilter(7))
white_edge = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 230))

master = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
master.paste(white_edge, (0, 0), outline_mask)
master.paste(base_layer, (0, 0), base_layer)

# 5. Save master 512x512
p512 = master.copy()
p192 = master.resize((192, 192), Image.Resampling.LANCZOS)
p180 = master.resize((180, 180), Image.Resampling.LANCZOS)
p48  = master.resize((48, 48), Image.Resampling.LANCZOS)
p32  = master.resize((32, 32), Image.Resampling.LANCZOS)
p16  = master.resize((16, 16), Image.Resampling.LANCZOS)

# 6. Save PNGs in assets/images and root
files_to_save = {
    'android-chrome-512x512.png': p512,
    'android-chrome-192x192.png': p192,
    'apple-touch-icon.png': p180,
    'favicon-32x32.png': p32,
    'favicon-16x16.png': p16,
}

for name, img_obj in files_to_save.items():
    p_root = os.path.join(root_dir, name)
    p_asset = os.path.join(assets_dir, name)
    img_obj.save(p_root, format='PNG', optimize=True)
    img_obj.save(p_asset, format='PNG', optimize=True)
    print(f"Saved {name}")

# 7. Generate multi-size favicon.ico
ico_root = os.path.join(root_dir, 'favicon.ico')
ico_asset = os.path.join(assets_dir, 'favicon.ico')
p48.save(ico_root, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p32, p16])
p48.save(ico_asset, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p32, p16])
print("Saved favicon.ico")

# 8. Generate favicon.svg with embedded base64
with open(os.path.join(root_dir, 'android-chrome-512x512.png'), 'rb') as f:
    b64_data = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_data}" width="512" height="512"/>
</svg>
'''

with open(os.path.join(root_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
with open(os.path.join(assets_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
print("Saved favicon.svg")

print("All favicon assets generated successfully!")
