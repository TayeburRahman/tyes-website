import re

files = ['public/landing.html', 'public/landing/index.html']

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace accent color in tailwind config
    content = re.sub(r"accent:\s*'#[0-9a-fA-F]+'[^,]*", "accent: '#2DD4BF'", content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

