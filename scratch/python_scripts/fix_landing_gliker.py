with open('public/landing/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

if "@font-face" not in content:
    gliker_css = """
    @font-face {
      font-family: Gliker;
      src: url('/fonts/gliker-regular.ttf') format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
"""
    content = content.replace('<style>', '<style>' + gliker_css)
    with open('public/landing/index.html', 'w', encoding='utf-8') as f:
        f.write(content)

