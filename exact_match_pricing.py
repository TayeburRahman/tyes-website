import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace my custom CSS block with the exact CSS block from the client's file
old_css_pattern = re.compile(r'/\* ============ 4\. PRICING — grouped, NO carousel ============ \*/.*?@media \(max-width: 800px\) \{ \.custom \{ grid-template-columns: 1fr; \} \}', re.DOTALL)

exact_css = """/* ============ 4. PRICING — grouped, NO carousel ============ */
  .pricing { padding: 90px 24px; max-width: 1200px; margin: 0 auto; }
  .pricing h2 { font-family: "League Spartan", sans-serif; font-weight: 800; color: #FFFFFF; font-size: clamp(32px, 4vw, 48px); text-align: center; }
  .pricing .pay { font-family: "Montserrat", sans-serif; text-align: center; color: #B8B8B8; margin: 8px 0 40px; }
  .group-label { font-family: "League Spartan", sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #2DD4BF; margin: 34px 0 14px; display: flex; align-items: center; gap: 14px; }
  .group-label::after { content: ""; flex: 1; height: 1px; background: #2A2A2A; }
  .tier-row { display: grid; gap: 16px; }
  .tier-row.img { grid-template-columns: repeat(3, 1fr); }
  .tier-row.strat { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 900px) { .tier-row.img, .tier-row.strat { grid-template-columns: 1fr; } }
  .tier { background: #141414; border: 1px solid #2A2A2A; border-radius: 12px; padding: 28px 24px; position: relative; display: flex; flex-direction: column; }
  .tier.popular { border: 2px solid #2DD4BF; background: #1a1a1a; }
  .tier .badge { position: absolute; top: -12px; right: 18px; background: #2DD4BF; color: #0A0A0A; font-family: "Montserrat", sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; }
  .tier .tag { font-family: "Montserrat", sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #2DD4BF; font-weight: 700; margin-bottom: 8px; }
  .tier h3 { font-family: "League Spartan", sans-serif; font-weight: 800; color: #FFFFFF; font-size: 22px; }
  .tier .price { font-family: "League Spartan", sans-serif; font-weight: 800; font-size: 40px; color: #fff; margin: 10px 0 14px; letter-spacing: -1px; }
  .tier .price small { font-family: "Montserrat", sans-serif; font-size: 15px; color: #888; font-weight: 500; }
  .tier ul { list-style: none; flex: 1; margin: 0; padding: 0; }
  .tier ul li { font-family: "Montserrat", sans-serif; font-size: 13.5px; font-weight: 500; color: #C8C8C8; padding-left: 20px; position: relative; margin-bottom: 8px; }
  .tier ul li::before { content: "✓"; color: #2DD4BF; font-weight: 700; position: absolute; left: 0; top: 0; }
  .tier .foot { border-top: 1px dashed #2DD4BF; margin-top: 14px; padding-top: 12px; font-family: "Montserrat", sans-serif; font-size: 12.5px; color: #2DD4BF; font-weight: 700; }
  .tier .cta-pill, .tier .cta-ghost { text-align: center; margin-top: 16px; font-size: 13px; padding: 12px 20px; }
  .custom { border: 2px solid #2DD4BF; border-radius: 12px; background: #1a1a1a; margin-top: 34px; padding: 30px 34px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
  .custom .desc { font-family: "Montserrat", sans-serif; font-size: 14px; color: #C8C8C8; margin-top: 8px; }
  @media (max-width: 800px) { .custom { grid-template-columns: 1fr; } }"""

content = re.sub(old_css_pattern, exact_css, content)

# Check if .custom .desc is already in the HTML to avoid duplication
# In my previous injection, I put style="font-size:14px;..." inline on the desc tag for custom.
# Let's clean the HTML of .custom to match the exact HTML.
old_custom_pattern = re.compile(r'<div class="custom">.*?</section>', re.DOTALL)
exact_custom_html = """<div class="custom">
    <div>
      <div class="tag" style="font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#2DD4BF; font-weight:700;">Enterprise</div>
      <h3 style="font-size:26px;">Custom. <span class="accent">Not just visuals.</span></h3>
      <p class="desc">Custom number of images · Custom revisions · Dedicated manager · + FREE Brand Strategy Snapshot · + 30-min strategy call</p>
    </div>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <a class="cta-pill" href="services.html">Contact Us →</a>
      <a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min">Book a Call →</a>
    </div>
  </div>
</section>"""
content = re.sub(old_custom_pattern, exact_custom_html, content)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Pricing CSS matched exactly!")
