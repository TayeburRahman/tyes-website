import re

with open('public/pricing.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add button CSS
btn_css = """
        .custom .cta-pill { display: inline-block; background: #2DD4BF; color: #0A0A0A; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 999px; text-decoration: none; text-align: center; }
        .custom .cta-ghost { display: inline-block; background: transparent; border: 2px solid #2DD4BF; color: #2DD4BF; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 999px; text-decoration: none; text-align: center; }
"""
if '.custom .cta-pill {' not in content:
    content = content.replace('.custom h3 { margin-bottom: 0; }', '.custom h3 { margin-bottom: 0; }' + btn_css)

# Replace broken buttons
old_buttons = """<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                        <a class="cta-btn" href="contact-us.html?intent=custom" style="flex:1;">Contact Us &rarr;</a>
                        <a class="cta-btn" href="https://calendly.com/raluca-tyes/30min" style="flex:1; background:transparent; border:1px solid #2DD4BF; color:#2DD4BF;">Book a Call &rarr;</a>
                    </div>"""
new_buttons = """<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                        <a class="cta-pill" href="contact-us.html?intent=custom" style="flex:1;">Contact Us &rarr;</a>
                        <a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min" style="flex:1;">Book a Call &rarr;</a>
                    </div>"""
content = content.replace(old_buttons, new_buttons)

with open('public/pricing.html', 'w', encoding='utf-8') as f:
    f.write(content)

