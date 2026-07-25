const fs = require('fs');

const file = 'public/services.html';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div class="ap-scroll" id="ap-scroll">';
const endMarker = '<!-- Nav arrows -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newScrollHtml = `<div class="ap-scroll" id="ap-scroll">
            <div style="color: #fff; padding: 40px; text-align: center; width: 100%;">Loading pricing plans...</div>
          </div>
          `;

  content = content.substring(0, startIndex) + newScrollHtml + '\n          ' + content.substring(endIndex);

  const scriptToInject = `
  <script>
    async function loadPlans() {
      try {
        const res = await fetch('/api/plans');
        if (!res.ok) throw new Error('Failed to fetch');
        const plans = await res.json();
        
        const scrollEl = document.getElementById('ap-scroll');
        scrollEl.innerHTML = '';
        
        plans.forEach(plan => {
          const isFeatured = plan.badge === 'Best Value' || plan.badge === 'Enterprise' || plan.price > 20; // heuristic or check DB
          const cardClass = plan.badge && plan.badge.toLowerCase().includes('value') ? 'ap-card featured' : 'ap-card default';
          
          let badgeHtml = '';
          if (plan.badge) {
            let bg = '#4ecdc4'; let color = '#000';
            if (plan.badge.toLowerCase() === 'free') { bg = '#22c55e'; color = '#fff'; }
            else if (plan.badge.toLowerCase() === 'popular') { bg = '#ef4444'; color = '#fff'; }
            else if (plan.badge.toLowerCase() === 'new') { bg = '#ec4899'; color = '#fff'; }
            else if (plan.badge.toLowerCase() === 'enterprise') { bg = '#a855f7'; color = '#fff'; }
            badgeHtml = \`<div class="ap-badge" style="background:\${bg};color:\${color};">\${plan.badge}</div>\`;
          }
          
          const priceDisplay = plan.price === 0 && plan.name === 'Custom' ? 'Let\\'s talk' : \`$\${plan.price}\`;
          
          let featuresHtml = '';
          if (plan.features && Array.isArray(plan.features)) {
            featuresHtml = plan.features.map(f => {
              const svg = f.icon === 'clock' 
                ? \`<svg class="it" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>\`
                : \`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>\`;
              return \`<div class="ap-feat">\${svg}\${f.text}</div>\`;
            }).join('');
          }

          let btnClass = 'ap-btn ghost';
          if (plan.price === 0 && plan.name !== 'Custom') btnClass = 'ap-btn fill';
          else if (plan.badge && plan.badge.toLowerCase().includes('value')) btnClass = 'ap-btn fill';
          else if (plan.badge && plan.badge.toLowerCase().includes('new')) btnClass = 'ap-btn accent';

          let btnText = 'Get Started';
          if (plan.price === 0 && plan.name !== 'Custom') btnText = 'Claim Free Image';
          else if (plan.name === 'Custom') btnText = 'Contact Us';
          else if (plan.name === 'Social Media Pack') btnText = 'Get a Quote';
          
          let qtyDesc = \`\${plan.images} AI image\${plan.images !== 1 ? 's' : ''}\`;
          if (plan.name === 'Free Image' || plan.name === 'Free Test') qtyDesc = '1 AI image · Quality assurance';
          if (plan.name === 'Social Media Pack') qtyDesc = '7 images · 7-day visual story';
          if (plan.name === 'Custom') qtyDesc = 'Custom quantity';

          const cardHtml = \`
            <div class="\${cardClass}">
              <div class="card-glow"></div>
              \${badgeHtml}
              <div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%;">
                <h3 class="ap-name">\${plan.name}</h3>
                <p class="ap-desc">\${plan.description || ''}</p>
                <div style="margin:0;"><span class="ap-price" \${priceDisplay === "Let's talk" ? 'style="font-size:2.25rem;"' : ''}>\${priceDisplay}</span></div>
                <p class="ap-qty">\${qtyDesc}</p>
                <div style="margin:0;">
                  \${featuresHtml}
                </div>
                <div style="flex-grow:1;min-height:6px;"></div>
                <button onclick="window.location.href='signin.html'" class="\${btnClass}">\${btnText}</button>
              </div>
            </div>
          \`;
          scrollEl.insertAdjacentHTML('beforeend', cardHtml);
        });
      } catch (e) {
        console.error(e);
        document.getElementById('ap-scroll').innerHTML = '<div style="color:red;padding:20px;">Error loading pricing plans</div>';
      }
    }
    loadPlans();
  </script>
</body>`;

  content = content.replace('</body>', scriptToInject);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Patched successfully');
} else {
  console.error('Markers not found');
}
