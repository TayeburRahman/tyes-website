with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert _3d-block inline style
old_3d = '<div class="_3d-block" style="padding-top:14rem !important;">'
new_3d = '<div class="_3d-block">'
content = content.replace(old_3d, new_3d)

# 2. Add CTA styles
cta_css = """
  <style>
    /* COMMON CTAs */
    .cta-pill { display: inline-flex; align-items: center; justify-content: center; background: #2DD4BF; color: #0A0A0A; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 999px; text-decoration: none; white-space: nowrap; transition: 0.3s; }
    .cta-pill:hover { background: #fff; transform: translateY(-2px); color:#0A0A0A; }
    .cta-ghost { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 2px solid #2DD4BF; color: #2DD4BF; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 999px; text-decoration: none; white-space: nowrap; transition: 0.3s; }
    .cta-ghost:hover { background: #2DD4BF; color: #000; transform: translateY(-2px); }
  </style>
"""

if '/* COMMON CTAs */' not in content:
    content = content.replace('</head>', cta_css + '\n</head>')

# Let's ensure the heading title has correct z-index so it doesn't get hidden behind the 3D block
# The 3D block might have a higher z-index.
# The .header-content-block should have a higher z-index.
old_header_block = '<div class="header-content-block">'
new_header_block = '<div class="header-content-block" style="z-index: 10; position: relative;">'
# wait, if header-content-block has `position: absolute;` in CSS, adding `position: relative` inline might break its layout?
# Let's just set z-index: 10
new_header_block_2 = '<div class="header-content-block" style="z-index: 10;">'
content = content.replace(old_header_block, new_header_block_2)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed overlaps and added CTA styles.")
