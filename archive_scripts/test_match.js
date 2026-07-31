const userRetailPresence = ["✓ Mass Market Retail", "Premium Retail"];
const rt = { name: "Mass Market Retail", label: "Mass Market Retail" };

const isPresentOld = userRetailPresence.some(p => typeof p === 'string' && (p.toLowerCase().trim() === rt.label.toLowerCase().trim() || p.toLowerCase().trim() === rt.name.toLowerCase().trim()));

const isPresentNew = userRetailPresence.some(p => {
  if (typeof p !== 'string') return false;
  const cleanP = p.replace(/[✓✗★]/g, '').toLowerCase().trim();
  return cleanP === rt.label.toLowerCase().trim() || cleanP === rt.name.toLowerCase().trim();
});

console.log("Old match:", isPresentOld);
console.log("New match:", isPresentNew);
