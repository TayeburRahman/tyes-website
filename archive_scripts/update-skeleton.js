const fs = require('fs');
const file = 'public/services.html';
let content = fs.readFileSync(file, 'utf8');

// Find the start and end of the skeleton HTML block
const startMarker = '<style>\n.skeleton-shimmer {';
const endMarker = 'function loadPlans() {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf('</script>', startIndex); // We can just replace the whole loader section inside id="ap-scroll"
// Wait, the skeleton html is INSIDE <div class="ap-scroll" id="ap-scroll"> before <script>

// Let's use regex to replace everything inside <div class="ap-scroll" id="ap-scroll"> up to </div>\n          <!-- Nav arrows -->

