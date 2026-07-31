const fs = require('fs');

let content = fs.readFileSync('page.jsx.old', 'utf8');

// 1. Extract SuccessPage
const successPageRegex = /\/\/ ══════════════════════════════════════\n\s*\/\/ SUCCESS PAGE\n\s*\/\/ ══════════════════════════════════════\n\s*const SuccessPage = \(\) => \(([\s\S]*?)\);/m;
const successPageMatch = content.match(successPageRegex);
if (!successPageMatch) throw new Error("Could not find SuccessPage");

const successPageOriginal = successPageMatch[0];
const successPageNew = `// ══════════════════════════════════════
// SUCCESS PAGE
// ══════════════════════════════════════
const SuccessPage = ({ setPage }) => (${successPageMatch[1]});`;

content = content.replace(successPageOriginal, '');

// 2. Extract NewOrderPage
const newOrderPageRegex = /\/\/ ══════════════════════════════════════\n\s*\/\/ NEW ORDER PAGE\n\s*\/\/ ══════════════════════════════════════\n\s*const NewOrderPage = \(\) => {([\s\S]*?)  };\n\n\s*\/\/ ══════════════════════════════════════\n\s*\/\/ MESSAGES PAGE/m;
const newOrderPageMatch = content.match(newOrderPageRegex);
if (!newOrderPageMatch) throw new Error("Could not find NewOrderPage");

const newOrderPageOriginal = newOrderPageMatch[0];
const newOrderPageBody = newOrderPageMatch[1];
const newOrderPageNew = `// ══════════════════════════════════════
// NEW ORDER PAGE
// ══════════════════════════════════════
const NewOrderPage = ({ supabase, addToast, clientInfo, pricingPlans, setPage, fetchData }) => {${newOrderPageBody}  };`;

content = content.replace(newOrderPageOriginal, `  // ══════════════════════════════════════
  // MESSAGES PAGE`);

// 3. Insert them before TyesClient
const tyesClientRegex = /export default function TyesClient\(\) \{/;
content = content.replace(tyesClientRegex, `${newOrderPageNew}\n\n${successPageNew}\n\nexport default function TyesClient() {`);

// 4. Update renderPage inside TyesClient
content = content.replace(
  /case "new-order": return <NewOrderPage \/>;/,
  'case "new-order": return <NewOrderPage supabase={supabase} addToast={addToast} clientInfo={clientInfo} pricingPlans={pricingPlans} setPage={setPage} fetchData={fetchData} />;'
);
content = content.replace(
  /case "success": return <SuccessPage \/>;/,
  'case "success": return <SuccessPage setPage={setPage} />;'
);

fs.writeFileSync('src/app/dashboard/client/page.jsx', content);
console.log("Refactoring complete.");
