const fs = require('fs');
const file = 'public/services.html';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div class="ap-scroll" id="ap-scroll">';
const endMarker = '<!-- Nav arrows -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

const newSkeleton = `
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
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%;">
    <div class="skeleton-shimmer" style="height: 20px; width: 50%; border-radius: 4px; margin-bottom: 6px;"></div>
    <div class="skeleton-shimmer" style="height: 14px; width: 70%; border-radius: 4px; margin-bottom: 16px;"></div>
    
    <div class="skeleton-shimmer" style="height: 36px; width: 30%; border-radius: 6px; margin-bottom: 12px;"></div>
    
    <div class="skeleton-shimmer" style="height: 14px; width: 60%; border-radius: 4px; margin-bottom: 16px;"></div>
    
    <div style="margin: 0;">
      <div class="skeleton-shimmer" style="height: 14px; width: 85%; border-radius: 4px; margin-bottom: 10px;"></div>
      <div class="skeleton-shimmer" style="height: 14px; width: 90%; border-radius: 4px; margin-bottom: 10px;"></div>
      <div class="skeleton-shimmer" style="height: 14px; width: 75%; border-radius: 4px; margin-bottom: 10px;"></div>
      <div class="skeleton-shimmer" style="height: 14px; width: 80%; border-radius: 4px; margin-bottom: 10px;"></div>
    </div>
    
    <div style="flex-grow:1;min-height:24px;"></div>
    <div class="skeleton-shimmer" style="height: 42px; width: 100%; border-radius: 8px;"></div>
  </div>
</div>
`).join('');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex + startMarker.length) + '\n' + newSkeleton + '\n          </div>\n\n          ' + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Loader updated');
} else {
  console.log('Markers not found');
}
