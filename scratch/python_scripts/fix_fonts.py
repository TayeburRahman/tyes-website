import os

files = ['public/landing.html', 'public/landing/index.html']

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # In both files, update heading and accent fonts
    # finding the fontFamily block
    import re
    # We will just replace specific lines
    content = re.sub(r"heading:\s*\['[^']+',\s*'[^']+'\],", "heading: ['League Spartan', 'sans-serif'],", content)
    content = re.sub(r"accent:\s*\['[^']+',\s*'[^']+'\],", "accent: ['Montserrat', 'sans-serif'],", content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

