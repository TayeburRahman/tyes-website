import re

with open('public/pricing.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS
custom_css = """
        .custom { border: 2px solid #2DD4BF; border-radius: 12px; background: #1a1a1a; margin-top: 34px; padding: 30px 34px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
        @media (max-width: 800px) { .custom { grid-template-columns: 1fr; } }
        .custom .desc { font-size: 14px; color: #C8C8C8; margin-top: 8px; line-height: 1.5; }
        .custom h3 { margin-bottom: 0; }
"""
if '.custom {' not in content:
    content = content.replace('</style>', custom_css + '\n    </style>')

# 2. Add HTML
custom_html = """
                <!-- ======= CUSTOM / ENTERPRISE ======= -->
                <div class="custom">
                    <div>
                        <div class="tag" style="font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#2DD4BF; font-weight:700;">Enterprise</div>
                        <h3 style="font-size:26px; font-family:'League Spartan', sans-serif;">Custom. <span class="accent">Not just visuals.</span></h3>
                        <p class="desc">Custom number of images · Custom revisions · Dedicated manager · + FREE Brand Strategy Snapshot · + 30-min strategy call</p>
                    </div>
                    <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                        <a class="cta-btn" href="contact-us.html?intent=custom" style="flex:1;">Contact Us &rarr;</a>
                        <a class="cta-btn" href="https://calendly.com/raluca-tyes/30min" style="flex:1; background:transparent; border:1px solid #2DD4BF; color:#2DD4BF;">Book a Call &rarr;</a>
                    </div>
                </div>
"""

# Inject before DEEP DIVE SECTION
target = "<!-- ======= DEEP DIVE SECTION ======= -->"
if custom_html.strip()[:20] not in content:
    content = content.replace(target, custom_html + '\n                ' + target)

with open('public/pricing.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected Custom/Enterprise tier successfully.")
