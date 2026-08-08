import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The regex matches the NEW badge, handling potential newlines and spaces before 'style'
pattern = r' <span\s*style="background:#4ecdc4;color:#000;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:8px;vertical-align:middle;">NEW</span>'

new_content = re.sub(pattern, '', content)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

