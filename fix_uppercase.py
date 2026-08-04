import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_style = "style=\"font-family:'League Spartan',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-2px;margin-bottom:0.25rem;font-size:clamp(44px, 7vw, 84px);line-height:1.06;white-space:nowrap;max-width:100%;\""
new_style = "style=\"font-family:'League Spartan',sans-serif;font-weight:700;text-transform:none !important;letter-spacing:-2px;margin-bottom:0.25rem;font-size:clamp(44px, 7vw, 84px);line-height:1.06;white-space:nowrap;max-width:100%;\""

content = content.replace(old_style, new_style)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)
