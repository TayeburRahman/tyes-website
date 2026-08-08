import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure League Spartan and Montserrat are loaded
fonts_link = """
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap" rel="stylesheet">
"""
if "League+Spartan" not in html:
    html = html.replace('</head>', fonts_link + '</head>')
elif "Montserrat:ital" not in html:
    html = html.replace('family=Montserrat:wght@400;500;600&display=swap', 'family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap')

# Insert the global font rules right before </head>
global_fonts_css = """
  <style>
    /* ============ SITE FONT SYSTEM ============ */
    /* Gliker = ONLY for the brand name "tyes". */
    /* Titles = League Spartan 800 white */
    /* Accents = Montserrat Italic 700 teal */
    h1, h2, h3, .heading-title { 
      font-family: "League Spartan", sans-serif !important; 
      font-weight: 800 !important; 
    }
    .accent { 
      font-family: "Montserrat", sans-serif !important; 
      font-style: italic !important; 
      font-weight: 700 !important; 
      color: #2DD4BF !important; 
    }
    .brand, .tyes-brand {
      font-family: "Gliker", serif !important;
    }
  </style>
"""
if "/* ============ SITE FONT SYSTEM ============ */" not in html:
    html = html.replace('</head>', global_fonts_css + '</head>')

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(html)

