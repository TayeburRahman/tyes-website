import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

retail_network_html = """
    <!-- Retail Network Section -->
    <section class="section-home-retail-network" style="padding: 6rem 0; background: #000000; border-top: 1px solid rgba(255,255,255,0.1);">
      <div class="padding-global">
        <div class="container-large">
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <span style="display: inline-block; background: rgba(45,212,191,0.15); border: 1px solid rgba(45,212,191,0.4); color: #2DD4BF; font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.15em; padding: 0.5rem 1rem; border-radius: 999px; text-transform: uppercase; font-weight: 700;">
              Unlocked with the Deep Dive Brand Strategy
            </span>
          </div>

          <div class="heading-wrapper" style="text-align: center; margin-bottom: 3.5rem;">
            <h2 style="font-family:'League Spartan',sans-serif;font-size:clamp(2.5rem,5vw,3.75rem);font-weight:800;color:#fff;margin:0 0 1rem;">
              The Retail <span style="font-family:'Montserrat',sans-serif;font-style:italic;font-weight:700;color:#2DD4BF;">Network.</span>
            </h2>
            <div style="font-family:'Montserrat',sans-serif;font-weight:500;font-size:1rem;color:rgba(255,255,255,0.7);max-width:600px;margin:0 auto;line-height:1.6;">
              A working network of buyer relationships across <strong>5 retail categories</strong>.
              This is what your <span style="color:#2DD4BF; font-style:italic;">Deep Dive Brand Strategy</span> gives you access to.
              Not a directory. Not cold outreach.
            </div>
          </div>

          <div class="retail-cats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; justify-content: center;">
            <div class="retail-cat-item" style="background: #141414; border-left: 3px solid #2DD4BF; padding: 1.5rem; border-radius: 4px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div class="rc-num" style="font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; color: #2DD4BF; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">01 · Mass Market</div>
              <div class="rc-name" style="font-family:'Inter',sans-serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Mass Market Retail</div>
            </div>
            <div class="retail-cat-item" style="background: #141414; border-left: 3px solid #2DD4BF; padding: 1.5rem; border-radius: 4px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div class="rc-num" style="font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; color: #2DD4BF; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">02 · Prestige</div>
              <div class="rc-name" style="font-family:'Inter',sans-serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Premium Retail</div>
            </div>
            <div class="retail-cat-item" style="background: #141414; border-left: 3px solid #2DD4BF; padding: 1.5rem; border-radius: 4px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div class="rc-num" style="font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; color: #2DD4BF; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">03 · Volume</div>
              <div class="rc-name" style="font-family:'Inter',sans-serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Hyperstores</div>
            </div>
            <div class="retail-cat-item" style="background: #141414; border-left: 3px solid #2DD4BF; padding: 1.5rem; border-radius: 4px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div class="rc-num" style="font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; color: #2DD4BF; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">04 · Beauty Pharmacy</div>
              <div class="rc-name" style="font-family:'Inter',sans-serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Hyperpharmacies</div>
            </div>
            <div class="retail-cat-item" style="background: #141414; border-left: 3px solid #2DD4BF; padding: 1.5rem; border-radius: 4px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div class="rc-num" style="font-family:'Montserrat',sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; color: #2DD4BF; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">05 · Digital-First</div>
              <div class="rc-name" style="font-family:'Inter',sans-serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Marketplaces</div>
            </div>
          </div>

          <div style="text-align: center; font-family:'Montserrat',sans-serif; font-size: 1rem; color: rgba(255,255,255,0.7); margin-top: 3rem;">
            Coverage: <span style="font-size:1.2rem;margin-right:4px;">🇺🇸</span> <strong style="color:#fff;">United States</strong> <span style="margin: 0 1.5rem; color: #444;">|</span> <span style="font-size:1.2rem;margin-right:4px;">🇪🇺</span> <strong style="color:#fff;">Europe</strong>
          </div>
          
        </div>
      </div>
    </section>
"""

target_str = '<section id="pricing-section"'
if target_str in content:
    new_content = content.replace(target_str, retail_network_html + "\n      " + target_str)
    with open('public/main.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Injected Retail Network HTML successfully.")
else:
    print("Could not find <section id=\"pricing-section\"")
