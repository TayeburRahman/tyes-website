import re

font_link = '<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@500;600;700;800&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">'

# 1. Update landing/index.html
with open('public/landing/index.html', 'r', encoding='utf-8') as f:
    landing_index = f.read()

# Replace the old font link
landing_index = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=League\+Spartan[^"]+" rel="stylesheet">', font_link, landing_index)

# Ensure Tailwind config is correct
landing_index = re.sub(r"heading:\s*\['[^']+',\s*'[^']+'\],", "heading: ['League Spartan', 'sans-serif'],", landing_index)
landing_index = re.sub(r"accent:\s*\['[^']+',\s*'[^']+'\],", "accent: ['Montserrat', 'sans-serif'],", landing_index)

# Add global style to enforce italic and teal for font-accent if used as a class in React
if "/* ENFORCE ACCENT FOR REACT */" not in landing_index:
    landing_index = landing_index.replace('</style>', '  /* ENFORCE ACCENT FOR REACT */\n  .font-accent, .accent, .text-accent { font-family: "Montserrat", sans-serif !important; font-style: italic !important; font-weight: 700 !important; color: #2DD4BF !important; }\n  h1, h2, h3, h4, h5, h6 { font-family: "League Spartan", sans-serif !important; font-weight: 800 !important; color: #FFFFFF !important; }\n  .tyes-brand, .brand { font-family: "Gliker", serif !important; }\n</style>')

with open('public/landing/index.html', 'w', encoding='utf-8') as f:
    f.write(landing_index)


# 2. Update landing.html
with open('public/landing.html', 'r', encoding='utf-8') as f:
    landing = f.read()

# Replace the old font link
landing = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=League\+Spartan[^"]+" rel="stylesheet">', font_link, landing)

# Ensure Tailwind config is correct
landing = re.sub(r"heading:\s*\['[^']+',\s*'[^']+'\],", "heading: ['League Spartan', 'sans-serif'],", landing)
landing = re.sub(r"accent:\s*\['[^']+',\s*'[^']+'\],", "accent: ['Montserrat', 'sans-serif'],", landing)

# Add global style
if "/* ENFORCE ACCENT FOR REACT */" not in landing:
    landing = landing.replace('</style>', '  /* ENFORCE ACCENT FOR REACT */\n  .font-accent, .accent, .text-accent { font-family: "Montserrat", sans-serif !important; font-style: italic !important; font-weight: 700 !important; color: #2DD4BF !important; }\n  h1, h2, h3, h4, h5, h6 { font-family: "League Spartan", sans-serif !important; font-weight: 800 !important; color: #FFFFFF !important; }\n  .tyes-brand, .brand { font-family: "Gliker", serif !important; }\n</style>')

with open('public/landing.html', 'w', encoding='utf-8') as f:
    f.write(landing)

# 3. Update main.html
with open('public/main.html', 'r', encoding='utf-8') as f:
    main = f.read()

# Ensure we have the correct font link
main = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=League\+Spartan[^"]+" rel="stylesheet">', font_link, main)
main = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Montserrat[^"]+" rel="stylesheet">', '', main) # Remove duplicate Montserrat if present

# The previous script already added the block, let's just make sure it's correct.
if font_link not in main:
    main = main.replace('</head>', font_link + '\n</head>')

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(main)

