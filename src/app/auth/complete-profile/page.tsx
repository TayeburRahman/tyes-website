"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ALL_COUNTRIES_LIST } from "@/utils/eu-vat-rates";

const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);
  const addToast = useCallback((message: string, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
};

const ToastContainer = ({ toasts }: { toasts: any[] }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding: "10px 18px",
        borderRadius: 10,
        background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f",
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44`
      }}>
        {t.message}
      </div>
    ))}
  </div>
);

function CompleteProfileContent() {
  const router = useRouter();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [country, setCountry] = useState("RO");
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Could not find user session");

      const updates = {
        country,
        is_business: isBusiness,
        company_name: isBusiness ? companyName : null,
        vat_number: isBusiness ? vatNumber : null,
        registered_address: isBusiness ? registeredAddress : null,
        billing_email: isBusiness ? billingEmail : null,
      };

      // 1. Update user metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: updates
      });
      if (metaError) throw metaError;

      // 2. Also manually update profiles table in case the trigger doesn't handle updates
      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (profileError) {
        console.error("Error updating profiles table:", profileError);
        // Continue anyway as metadata might be enough depending on RLS
      }

      addToast("Profile updated successfully!", "success");
      
      // Determine redirect
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const role = profile?.role || user.user_metadata?.role || "client";
      const isAdmin = ["admin", "superAdmin"].includes(role);
      
      window.location.href = isAdmin ? "/dashboard/admin" : "/dashboard/client";
    } catch (err: any) {
      addToast(err.message || "An error occurred", "error");
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "Montserrat, sans-serif",
      background: "#050505",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <ToastContainer toasts={toasts} />
      <style>{`
        .auth-input { width:100%; padding:0.85rem 1rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; margin-bottom:1rem; outline:none; transition:border-color 0.3s; }
        .auth-input::placeholder { color:rgba(255,255,255,0.3); }
        .auth-input:focus { border-color:#4ecdc4; }
        .auth-btn { width:100%; padding:0.9rem; background:#4ecdc4; color:#fff; border:none; border-radius:6px; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:opacity 0.3s; margin-top:0.5rem; }
        .auth-btn:hover { opacity:0.85; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .auth-checkbox-container { display:flex; align-items:flex-start; gap:0.75rem; background:#4ecdc4; padding:1.25rem 1rem; border-radius:6px; margin-bottom:1rem; cursor:pointer; }
        .auth-checkbox { width:1.2rem; height:1.2rem; cursor:pointer; margin-top:2px; accent-color:#fff; }
        .auth-section-title { font-family:Montserrat,sans-serif; font-size:0.75rem; font-weight:700; color:#fff; background:#4ecdc4; padding:0.25rem 0.5rem; border-radius:4px; display:inline-block; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.05em; }
        .auth-label { font-family:Montserrat,sans-serif; font-size:0.8rem; font-weight:600; color:#fff; margin-bottom:0.4rem; display:block; }
        .auth-input-container { margin-bottom:0.5rem; }
        .auth-dropdown-scroll::-webkit-scrollbar { width: 6px; }
        .auth-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .auth-dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "2rem" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem" }}>
          <img src="/images/tyes-logo-new.svg" alt="tyes icon" style={{ height: 36 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <img src="/images/tyes-wordmark.svg" alt="tyes" style={{ height: 36 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'League Spartan',sans-serif", fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>Almost there!</h1>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "2.5rem" }}>
          We just need a few more details to complete your account setup.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-container" style={{ marginBottom: "1.5rem", position: "relative" }}>
            <label className="auth-label">Country</label>
            <div
              className="auth-input"
              style={{ marginBottom: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            >
              <span>{ALL_COUNTRIES_LIST.find(c => c.code === country)?.name || "Select country"}</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", transition: "transform 0.3s", transform: isCountryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </div>

            {isCountryDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", marginTop: "4px", padding: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.8)" }}>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", outline: "none", marginBottom: "0.5rem", fontSize: "0.85rem", fontFamily: "Montserrat, sans-serif" }}
                  autoFocus
                />
                <div className="auth-dropdown-scroll" style={{ maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
                  {ALL_COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                    <div
                      key={c.code}
                      onClick={() => {
                        setCountry(c.code);
                        setIsCountryDropdownOpen(false);
                        setCountrySearch("");
                      }}
                      style={{ padding: "0.6rem", cursor: "pointer", borderRadius: "4px", background: country === c.code ? "rgba(88,178,173,0.15)" : "transparent", color: country === c.code ? "#4ecdc4" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = country === c.code ? "rgba(88,178,173,0.25)" : "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = country === c.code ? "rgba(88,178,173,0.15)" : "transparent"}
                    >
                      {c.name}
                      {country === c.code && <span style={{ fontSize: "0.9rem" }}>✓</span>}
                    </div>
                  ))}
                  {ALL_COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: "0.6rem", color: "rgba(255,255,255,0.4)", textAlign: "center", fontSize: "0.85rem" }}>No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="auth-checkbox-container" onClick={() => setIsBusiness(!isBusiness)}>
            <input type="checkbox" className="auth-checkbox" checked={isBusiness} onChange={() => { }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>I'm buying for a business</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>Get invoices with company VAT for tax deduction.</span>
            </div>
          </div>

          {isBusiness && (
            <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              <div className="auth-section-title">BUSINESS DETAILS</div>
              <div className="auth-input-container">
                <label className="auth-label">Company name</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="text" placeholder="Company name" value={companyName} onChange={e => setCompanyName(e.target.value)} required={isBusiness} />
              </div>
              <div className="auth-input-container">
                <label className="auth-label">VAT / Tax number</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="text" placeholder="VAT / Tax number" value={vatNumber} onChange={e => setVatNumber(e.target.value)} required={isBusiness} />
              </div>
              <div className="auth-input-container">
                <label className="auth-label">Registered address</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="text" placeholder="Registered address" value={registeredAddress} onChange={e => setRegisteredAddress(e.target.value)} required={isBusiness} />
              </div>
              <div className="auth-input-container">
                <label className="auth-label">Billing email (optional)</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="email" placeholder="Billing email (optional)" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} />
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: "1rem" }}>{loading ? "Saving…" : "Complete Setup"}</button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }}></div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}
