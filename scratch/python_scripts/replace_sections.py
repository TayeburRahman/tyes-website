import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace Categories (lines ~650 to ~692)
categories_start_marker = '<h2 class="header-text _01">Categories</h2>'
# Find the <section> right before categories_start_marker
idx_cat = content.find(categories_start_marker)
start_sec = content.rfind('<section', 0, idx_cat)
end_sec = content.find('</section>', idx_cat) + len('</section>')

new_categories_html = """      <!-- ================================================================
      SECTION 3 · CATEGORIES — new meaningful sub-line
      ================================================================ -->
      <section class="cats center">
        <h2>CATEGORIES <span class="accent">We Serve.</span></h2>
        <p class="subline">Scroll-stopping campaign visuals. Strategy that puts you on shelves.</p>
        <p class="list">Beauty &middot; Personal Care &middot; Fragrance &middot; Fashion</p>
      </section>"""

content = content[:start_sec] + new_categories_html + content[end_sec:]

# 2. Replace Share Your Brief (lines ~813 to ~879)
share_start_marker = '<h2 class="header-text _01">Share Your Brief</h2>'
idx_share = content.find(share_start_marker)
if idx_share != -1:
    start_share_sec = content.rfind('<section', 0, idx_share)
    end_share_sec = content.find('</section>', idx_share) + len('</section>')

    new_hiw_html = """      <!-- ================================================================
        SECTION 2 · HOW IT WORKS — 5 flip cards in ONE row
      ================================================================ -->
      <section class="hiw">
        <h2 class="center">HOW IT <span class="accent">Works.</span></h2>
        <div class="badges">
          <span><b>✓</b> From 3H Delivery</span><span><b>✓</b> AI + Designer Touch</span><span><b>✓</b> Brand Strategy</span><span><b>✓</b> Retail Access</span>
        </div>
        <div class="hiw-grid">
          <div class="flip"><div class="flip-inner">
            <div class="face front"><div><div class="num">01</div><div class="t">BRIEF IT.</div></div><div class="hint">⟳</div></div>
            <div class="face back"><div class="bt">Brief It.</div><p>Share your product and your vision, in any language. From one short brief, we build your entire campaign direction.</p></div>
          </div></div>
          <div class="flip"><div class="flip-inner">
            <div class="face front"><div><div class="num">02</div><div class="t">AI CREATES.</div></div><div class="hint">⟳</div></div>
            <div class="face back"><div class="bt">AI Creates.</div><p>Studio-grade campaign visuals without the photoshoot — no studio, no crew, no weeks of waiting.</p></div>
          </div></div>
          <div class="flip"><div class="flip-inner">
            <div class="face front"><div><div class="num">03</div><div class="t">SPECIALISTS PERFECT.</div></div><div class="hint">⟳</div></div>
            <div class="face back"><div class="bt">Specialists Perfect.</div><p>Our design specialists refine every image — brand accuracy, text sharpness, perfect details — so your brand always looks premium, never AI-generic.</p></div>
          </div></div>
          <div class="flip"><div class="flip-inner">
            <div class="face front"><div><div class="num">04</div><div class="t">YOU LAUNCH.</div></div><div class="hint">⟳</div></div>
            <div class="face back"><div class="bt">You Launch.</div><p>Launch in hours, not weeks. Campaign-ready visuals for every platform and promo, delivered to your dashboard — from 3H per image, 24H per campaign.</p></div>
          </div></div>
          <div class="flip strategy"><div class="flip-inner">
            <div class="face front"><div><div class="num">＋</div><div class="t">YOUR STRATEGY. FREE.</div></div><div class="hint">⟳</div></div>
            <div class="face back"><div class="bt">Your Strategy. Free.</div><p>Every order includes your growth plan: where your brand shows up in AI search, the viral products your niche is missing, and the retail buyers who fit you. In 3 days.</p></div>
          </div></div>
        </div>
      </section>"""
    
    content = content[:start_share_sec] + new_hiw_html + content[end_share_sec:]

# 3. Add CSS for new sections
new_css = """
  /* ============ 2. HOW IT WORKS — 5 flip cards, ONE row ============ */
  .hiw h2 { font-family: 'League Spartan', sans-serif; font-weight: 800; font-size: clamp(32px, 4vw, 48px); text-align: center; margin-bottom: 10px; color: #fff; text-transform: uppercase; }
  .hiw .badges { display: flex; gap: 22px; justify-content: center; flex-wrap: wrap; margin: 18px 0 44px; font-size: 14px; color: #C8C8C8; font-family: 'Montserrat', sans-serif; }
  .hiw .badges span b { color: #2DD4BF; margin-right: 6px; }
  .hiw-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; padding: 0 5%; max-width: 1400px; margin: 0 auto; }
  @media (max-width: 1000px) { .hiw-grid { grid-template-columns: repeat(2, 1fr); } .hiw-grid .flip:last-child { grid-column: 1 / -1; } }
  @media (max-width: 560px)  { .hiw-grid { grid-template-columns: 1fr; padding: 0 20px; } .flip, .flip-inner { min-height: 240px; } }

  .flip { perspective: 1200px; min-height: 320px; cursor: pointer; }
  .flip-inner { position: relative; width: 100%; height: 100%; min-height: 320px; transition: transform .5s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
  .flip:hover .flip-inner, .flip.tapped .flip-inner { transform: rotateY(180deg); }
  .face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 14px; background: #141414; padding: 26px 22px; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.05); }
  .face.front { justify-content: space-between; }
  .face.back { transform: rotateY(180deg); background: #1A1A1A; overflow-y: auto; display: block; }
  
  .num { font-family: 'Montserrat', sans-serif; font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
  .t { font-family: 'League Spartan', sans-serif; font-size: 28px; font-weight: 800; color: #FFFFFF; line-height: 1.1; text-transform: uppercase; }
  .hint { align-self: flex-end; font-size: 20px; color: rgba(255,255,255,0.2); }
  
  .bt { font-family: 'League Spartan', sans-serif; font-size: 22px; font-weight: 800; color: #2DD4BF; margin-bottom: 12px; }
  .face.back p { font-family: 'Montserrat', sans-serif; font-size: 14px; color: #C8C8C8; line-height: 1.6; margin: 0; }
  
  .strategy .face.front { background: rgba(45, 212, 191, 0.05); border: 2px solid #2DD4BF; }
  .strategy .num { color: #2DD4BF; }
  .strategy .t { color: #2DD4BF; }

  /* ============ 3. CATEGORIES ============ */
  .cats { padding: 80px 0; }
  .cats h2 { font-family: 'League Spartan', sans-serif; font-weight: 800; font-size: clamp(32px, 4vw, 48px); margin-bottom: 10px; color: #fff; text-transform: uppercase; }
  .cats .subline { font-family: 'Montserrat', sans-serif; font-size: 16px; color: #C8C8C8; margin-bottom: 24px; }
  .cats .list { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #2DD4BF; letter-spacing: 1px; text-transform: uppercase; }
  .center { text-align: center; }
"""

if '/* ============ 2. HOW IT WORKS' not in content:
    content = content.replace('</style>', new_css + '\n  </style>')

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced Categories and How It Works sections.")
