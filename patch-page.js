const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/client/page.jsx', 'utf8');

// 1. Add fields to clientInfo in fetchData
content = content.replace(
  'country: resolvedCountry,\n        });',
  'country: resolvedCountry,\n          is_business: profile.is_business || false,\n          vat_number: profile.vat_number || "",\n        });'
);

content = content.replace(
  'country: authUser.user_metadata?.country || null,\n        });',
  'country: authUser.user_metadata?.country || null,\n          is_business: authUser.user_metadata?.is_business || false,\n          vat_number: authUser.user_metadata?.vat_number || "",\n        });'
);

// 2. Add states to NewOrderPage
const newOrderPageStart = `const NewOrderPage = ({ supabase, addToast, clientInfo, pricingPlans, setPage, fetchData }) => {
  const [step, setStep] = useState(1);`;

const newOrderPageStates = `const NewOrderPage = ({ supabase, addToast, clientInfo, pricingPlans, setPage, fetchData }) => {
  const [step, setStep] = useState(1);
  const [vatNumber, setVatNumber] = useState(clientInfo?.vat_number || "");
  const [vatResult, setVatResult] = useState(null);
  const [isValidatingVat, setIsValidatingVat] = useState(false);`;

content = content.replace(newOrderPageStart, newOrderPageStates);

// 3. Update the step 3 Continue button
const continueBtnRegex = /\/\/ Pre-fetch client secret when reaching Step 3 for paid plans[\s\S]*?if \(nextStep === 3\) \{[\s\S]*?const selectedPlan = plans\.find\(p => p\.id === plan\);[\s\S]*?if \(selectedPlan && selectedPlan\.price > 0\) \{[\s\S]*?try \{[\s\S]*?const res = await fetch\('\/api\/stripe\/payment-intent', \{[\s\S]*?method: 'POST',[\s\S]*?headers: \{ 'Content-Type': 'application\/json' \},[\s\S]*?body: JSON\.stringify\(\{ price: selectedPlan\.price, planName: selectedPlan\.name \}\)[\s\S]*?\}\);[\s\S]*?const data = await res\.json\(\);[\s\S]*?if \(data\.clientSecret\) setClientSecret\(data\.clientSecret\);[\s\S]*?else setStripeError\('Could not initialize payment\. Please try again\.'\);[\s\S]*?\} catch \(e\) \{[\s\S]*?setStripeError\('Payment setup failed\. Please try again\.'\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}/;

content = content.replace(continueBtnRegex, `// Client secret and VAT will be handled in step 3 useEffect`);

// 4. Add useEffect for VAT and ClientSecret in NewOrderPage
const useEffectsInsertPoint = `const plans = pricingPlans;`;

const newUseEffects = `const plans = pricingPlans;

  // Real-time VAT validation and Stripe Intent generation
  useEffect(() => {
    if (step === 3) {
      const selectedPlan = plans.find(p => p.id === plan);
      if (!selectedPlan || selectedPlan.price <= 0) return;

      let isMounted = true;
      const setupCheckout = async () => {
        setIsValidatingVat(true);
        setStripeError(null);
        let currentVatResult = vatResult;
        
        try {
          // 1. Validate VAT
          const vatRes = await fetch('/api/vat/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              countryCode: clientInfo?.country || 'RO',
              isCompany: clientInfo?.is_business || !!vatNumber,
              vatNumber: vatNumber
            })
          });
          const vatData = await vatRes.json();
          if (!vatRes.ok) throw new Error(vatData.error);
          
          if (isMounted) {
            setVatResult(vatData);
            currentVatResult = vatData;
            if (vatData.viesDown) {
              addToast("EU VAT validation service is currently down. 21% VAT has been applied.", "warning");
            } else if (vatData.viesValid) {
              addToast("VAT number verified! 0% Reverse charge applied.", "success");
            }
          }

          // 2. Setup Stripe Payment Intent with exact total
          const totalAmount = selectedPlan.price + (selectedPlan.price * (currentVatResult.vatRate / 100));
          
          const piRes = await fetch('/api/stripe/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              price: totalAmount, 
              planName: selectedPlan.name,
              vatRate: currentVatResult.vatRate,
              viesConsultationId: currentVatResult.viesConsultationId 
            })
          });
          const piData = await piRes.json();
          if (!piRes.ok) throw new Error(piData.error);
          
          if (isMounted && piData.clientSecret) {
            setClientSecret(piData.clientSecret);
          }
        } catch (err) {
          console.error(err);
          if (isMounted) setStripeError(err.message || 'Checkout setup failed.');
        } finally {
          if (isMounted) setIsValidatingVat(false);
        }
      };

      setupCheckout();

      return () => { isMounted = false; };
    }
  }, [step, plan, plans]); // note: deliberately omits vatNumber to only trigger when explicitly asked
`;

content = content.replace(useEffectsInsertPoint, newUseEffects);

// 5. Update Order Summary in step 3
const orderSummaryRegex = /const orderSummary = \[([\s\S]*?)\];/;
content = content.replace(orderSummaryRegex, (match, inside) => {
  return `const orderSummary = [
${inside}
          ];
          if (vatResult) {
            orderSummary.push({ label: "Subtotal", val: \`$\${selectedPlan.price}\` });
            orderSummary.push({ label: \`VAT (\${vatResult.vatRate}%)\`, val: \`$\${(selectedPlan.price * (vatResult.vatRate / 100)).toFixed(2)}\` });
          }`;
});

const totalRegex = /<span style=\{\{ color: isPaid \? "#4ecdc4" : "#34d399", fontWeight: 800 \}\}>\{isPaid \? \`\\\$\{selectedPlan\.price\}\` : "Free"\}<\/span>/g;
content = content.replace(totalRegex, `<span style={{ color: isPaid ? "#4ecdc4" : "#34d399", fontWeight: 800 }}>{isPaid ? \`$\${vatResult ? (selectedPlan.price + (selectedPlan.price * (vatResult.vatRate / 100))).toFixed(2) : selectedPlan.price}\` : "Free"}</span>`);

// 6. Add VAT input in Step 3
const orderSummaryDivEnd = /\{\/\* Free plan submit button \*\/\}/;
const vatInputHtml = `
                {isPaid && (
                  <div style={{ marginTop: 24, padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Company VAT Number (Optional)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        type="text" 
                        value={vatNumber} 
                        onChange={e => setVatNumber(e.target.value)} 
                        placeholder="e.g. RO123456" 
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                      <button 
                        onClick={() => {
                          setClientSecret(null);
                          setStep(2); 
                          setTimeout(() => setStep(3), 0); // Hack to trigger useEffect re-run
                        }} 
                        disabled={isValidatingVat}
                        style={{ padding: "0 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: isValidatingVat ? "not-allowed" : "pointer" }}
                      >
                        {isValidatingVat ? "Validating..." : "Update"}
                      </button>
                    </div>
                    {vatResult && vatResult.viesDown && (
                      <div style={{ color: "#fbbf24", fontSize: 11, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertCircle size={12} /> VIES validation service is down. 21% VAT applied.
                      </div>
                    )}
                  </div>
                )}
                {/* Free plan submit button */}`;

content = content.replace(orderSummaryDivEnd, vatInputHtml);

// Save
fs.writeFileSync('src/app/dashboard/client/page.jsx', content);
console.log('Patch complete.');
