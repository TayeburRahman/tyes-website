import re

with open('public/pricing.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CSS
old_css_1 = '.custom .cta-pill { display: inline-block; background: #2DD4BF; color: #0A0A0A; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 999px; text-decoration: none; text-align: center; }'
new_css_1 = '.custom .cta-pill { display: inline-flex; align-items: center; justify-content: center; background: #2DD4BF; color: #0A0A0A; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 999px; text-decoration: none; white-space: nowrap; }'
content = content.replace(old_css_1, new_css_1)

old_css_2 = '.custom .cta-ghost { display: inline-block; background: transparent; border: 2px solid #2DD4BF; color: #2DD4BF; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 999px; text-decoration: none; text-align: center; }'
new_css_2 = '.custom .cta-ghost { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 2px solid #2DD4BF; color: #2DD4BF; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 999px; text-decoration: none; white-space: nowrap; }'
content = content.replace(old_css_2, new_css_2)

# Remove flex:1 from inline styles
old_btn_1 = '<a class="cta-pill" href="contact-us.html?intent=custom" style="flex:1;">Contact Us &rarr;</a>'
new_btn_1 = '<a class="cta-pill" href="contact-us.html?intent=custom">Contact Us &rarr;</a>'
content = content.replace(old_btn_1, new_btn_1)

old_btn_2 = '<a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min" style="flex:1;">Book a Call &rarr;</a>'
new_btn_2 = '<a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min">Book a Call &rarr;</a>'
content = content.replace(old_btn_2, new_btn_2)

with open('public/pricing.html', 'w', encoding='utf-8') as f:
    f.write(content)

