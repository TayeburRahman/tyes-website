import re

exact_pricing_html = """
  <h2>Find the <span class="accent">Perfect Package.</span></h2>
  <p class="pay">Pay per campaign. Scale when ready.</p>

  <div class="group-label">Campaign Images</div>
  <div class="tier-row img">
    <div class="tier">
      <div class="tag">Free</div><h3>Free Image</h3><div class="price">$0</div>
      <ul><li>1 AI image</li><li>From 3H delivery</li><li>AI-generated + designer-polished</li></ul>
      <div class="foot">+ Add Brand Strategy · $25</div>
      <a class="cta-pill" href="signin.html">Claim Free Image →</a>
    </div>
    <div class="tier popular">
      <span class="badge">Popular</span>
      <div class="tag">Popular</div><h3>Campaign 5</h3><div class="price">$25</div>
      <ul><li>5 AI campaign images</li><li>1 revision / image</li><li>From 24H delivery</li><li>AI-generated + designer-polished</li></ul>
      <div class="foot">+ FREE Brand Strategy Snapshot</div>
      <a class="cta-pill" href="signin.html">Get Campaign 5 →</a>
    </div>
    <div class="tier">
      <div class="tag">Go Big</div><h3>Campaign 10</h3><div class="price">$45</div>
      <ul><li>10 AI campaign images</li><li>1 revision / image</li><li>From 24H delivery</li><li>AI-generated + designer-polished</li></ul>
      <div class="foot">+ FREE Brand Strategy Snapshot</div>
      <a class="cta-pill" href="signin.html">Get Campaign 10 →</a>
    </div>
  </div>

  <div class="group-label">Brand Strategy</div>
  <div class="tier-row strat">
    <div class="tier">
      <div class="tag">Strategy-First</div><h3>Brand Strategy</h3><div class="price">$25</div>
      <ul><li>LLM visibility audit</li><li>Viral product angles for your niche</li><li>Retail buyer shortlist (US + EU)</li><li>3-day delivery</li><li>Delivered to your dashboard</li></ul>
      <a class="cta-pill" href="signin.html">Get Brand Strategy →</a>
    </div>
    <div class="tier">
      <div class="tag">Retail-Ready</div><h3>Deep Dive Brand Strategy</h3><div class="price"><small>Priced per scope</small></div>
      <ul><li>Full LLM audit + 90-day roadmap</li><li>Viral product concepts for your niche</li><li>Warm intros to retail buyers we know</li><li>Packaging &amp; positioning direction</li><li>1-hour strategy call</li></ul>
      <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
        <a class="cta-pill" href="services.html" style="flex:1;">Contact Us →</a>
        <a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min" style="flex:1; text-align:center;">Book a Call →</a>
      </div>
    </div>
  </div>

  <div class="custom">
    <div>
      <div class="tag" style="font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#2DD4BF; font-weight:700;">Enterprise</div>
      <h3 style="font-size:26px; padding:0; margin:0;">Custom. <span class="accent">Not just visuals.</span></h3>
      <p class="desc" style="padding:0; margin:0; margin-top:8px;">Custom number of images · Custom revisions · Dedicated manager · + FREE Brand Strategy Snapshot · + 30-min strategy call</p>
    </div>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <a class="cta-pill" href="services.html">Contact Us →</a>
      <a class="cta-ghost" href="https://calendly.com/raluca-tyes/30min">Book a Call →</a>
    </div>
  </div>
"""

files_to_update = ['public/services.html', 'public/pricing.html']

for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace from <div class="tagline">Pricing</div> down to just before <!-- ======= DEEP DIVE SECTION ======= -->
    start_str = '<div class="tagline">Pricing</div>'
    start_idx = content.find(start_str)
    
    if start_idx != -1:
        end_str = '<!-- ======= DEEP DIVE SECTION ======= -->'
        end_idx = content.find(end_str, start_idx)
        
        if end_idx != -1:
            old_block = content[start_idx:end_idx]
            content = content.replace(old_block, exact_pricing_html + '\n\n                ')
            print(f"Successfully replaced top section in {filepath}")
        else:
            print(f"Could not find end of top section in {filepath}")
    else:
        print(f"Could not find start of top section in {filepath}")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
