import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the inline style of the heading-title
old_style = "style=\"font-family:'League Spartan',sans-serif;font-weight:700;letter-spacing:-2px;margin-bottom:0.25rem;font-size:clamp(44px, 7vw, 84px);line-height:1.06;white-space:nowrap;max-width:100%;\""
new_style = "style=\"text-transform:none !important;font-family:'League Spartan',sans-serif;font-weight:700;letter-spacing:-2px;margin-bottom:0.25rem;font-size:clamp(44px, 7vw, 84px);line-height:1.06;white-space:nowrap;max-width:100%;\""

content = content.replace(old_style, new_style)

# Also let's check if there are any other text-transform:uppercase on heading-title
with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)
