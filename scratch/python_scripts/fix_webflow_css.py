import re

with open('public/css/tyes-d93dec.webflow.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace Gliker with Montserrat in .featured-text
old_featured = """.featured-text {
  color: #4ecdc4;
  text-transform: capitalize;
  padding-right: 10px;
  font-family: Gliker, serif;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0;
}"""

new_featured = """.featured-text, .accent {
  color: #2DD4BF;
  text-transform: capitalize;
  padding-right: 10px;
  font-family: 'Montserrat', sans-serif !important;
  font-style: italic !important;
  font-weight: 700 !important;
  letter-spacing: 0;
}"""

css = css.replace(old_featured, new_featured)

with open('public/css/tyes-d93dec.webflow.css', 'w', encoding='utf-8') as f:
    f.write(css)

