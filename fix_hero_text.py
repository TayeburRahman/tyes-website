import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_h1 = """                  <h1 class="heading-title"
                    style="font-family:'League Spartan',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-0.05em;margin-bottom:0.25rem;">
                    Free Image. <span class="accent">Free Strategy.</span></h1>"""

new_h1 = """                  <h1 class="heading-title"
                    style="font-family:'League Spartan',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-2px;margin-bottom:0.25rem;font-size:clamp(44px, 7vw, 84px);line-height:1.06;white-space:nowrap;max-width:100%;">
                    Free Image. <span class="accent">Free Strategy.</span></h1>"""

content = content.replace(old_h1, new_h1)

# Also let's override _3d-block's padding-top to bring the 3D items closer to the new shorter text
old_3d = '<div class="_3d-block">'
new_3d = '<div class="_3d-block" style="padding-top:14rem !important;">'
content = content.replace(old_3d, new_3d)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed hero text size and layout.")
