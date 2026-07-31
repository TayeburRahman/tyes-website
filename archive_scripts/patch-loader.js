const fs = require('fs');
const file = 'public/services.html';
let content = fs.readFileSync(file, 'utf8');

const targetStr = '<div style="color: #fff; padding: 40px; text-align: center; width: 100%;">Loading pricing plans...</div>';

const skeletonHtml = `
<style>
.skeleton-shimmer {
  background: #1f1f22;
  background-image: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
` + Array(6).fill(`
<div class="ap-card default" style="border: 1px solid rgba(255,255,255,0.05); cursor: default;">
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%; gap: 14px;">
    <div class="skeleton-shimmer" style="height: 24px; width: 50%; border-radius: 6px;"></div>
    <div class="skeleton-shimmer" style="height: 16px; width: 70%; border-radius: 4px;"></div>
    <div class="skeleton-shimmer" style="height: 40px; width: 35%; border-radius: 8px; margin-top: 6px;"></div>
    <div class="skeleton-shimmer" style="height: 14px; width: 60%; border-radius: 4px; margin-bottom: 12px;"></div>
    
    <div class="skeleton-shimmer" style="height: 18px; width: 85%; border-radius: 4px;"></div>
    <div class="skeleton-shimmer" style="height: 18px; width: 90%; border-radius: 4px;"></div>
    <div class="skeleton-shimmer" style="height: 18px; width: 75%; border-radius: 4px;"></div>
    <div class="skeleton-shimmer" style="height: 18px; width: 80%; border-radius: 4px;"></div>
    
    <div style="flex-grow:1;min-height:16px;"></div>
    <div class="skeleton-shimmer" style="height: 46px; width: 100%; border-radius: 12px;"></div>
  </div>
</div>
`).join('');

content = content.replace(targetStr, skeletonHtml);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched loader successfully');
