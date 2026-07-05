"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { EU_COUNTRIES_LIST } from "@/utils/eu-vat-rates";

type Tab = "signin" | "signup" | "forgot" | "otp" | "forgot_otp";

// ══════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════
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

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const initialTab = (searchParams.get("tab") as Tab) || "signin";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("RO");
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const title = tab === "signin" ? "Welcome back" : tab === "signup" ? "Create account" : tab === "otp" || tab === "forgot_otp" ? "Check your email" : "Reset password";
  const subtitle = tab === "signin" ? "Sign in to your account or create a new one" : tab === "signup" ? "Get started with tyes today" : tab === "otp" ? "Enter the 6-digit code we sent to your email" : tab === "forgot_otp" ? "Enter the recovery code and your new password" : "We'll help you get back in";

  if (!mounted) return null;

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Attempting Sign In...", email, password);
    setError("");
    if (!email || !password) { addToast("Please enter your credentials", "error"); return; }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch real role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || data.user.user_metadata?.role || "client";
        console.log("Verified Role:", role);

        addToast("Signed in successfully!", "success");
        const isAdmin = ["admin", "superAdmin"].includes(role);
        console.log("Is Admin:", isAdmin);
        window.location.href = isAdmin ? "/dashboard/admin" : "/dashboard/client";
      }
    } catch (err: any) {
      addToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Attempting Sign Up...");
    setError("");
    if (!fullName || !email || !password) { addToast("Please fill in all required fields", "error"); return; }
    if (password !== confirmPassword) { addToast("Passwords do not match", "error"); return; }
    
    // Split full name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            country: country,
            is_business: isBusiness,
            company_name: isBusiness ? companyName : null,
            vat_number: isBusiness ? vatNumber : null,
            registered_address: isBusiness ? registeredAddress : null,
            billing_email: isBusiness ? billingEmail : null,
            role: "client", // New users start as clients by default
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          addToast("This email is already registered. Please sign in instead.", "warning");
          setTab("signin");
          return;
        }
        throw error;
      }

      if (data.user) {
        // If there is no session, it means email confirmation is required
        if (!data.session) {
          addToast("Verification code sent to your email!", "success");
          setTab("otp");
        } else {
          addToast("Account created successfully!", "success");
          const role = data.user.user_metadata?.role || "client";
          const isAdmin = ["admin", "superAdmin"].includes(role);
          window.location.href = isAdmin ? "/dashboard/admin" : "/dashboard/client";
        }
      }
    } catch (err: any) {
      addToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetEmail) { addToast("Please enter your email", "error"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      addToast("Recovery code sent to your email!", "success");
      setTab("forgot_otp");
    } catch (err: any) {
      addToast(err.message || "Failed to send recovery code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetOtpCode || resetOtpCode.length !== 6) { addToast("Please enter a valid 6-digit code", "error"); return; }
    if (!newPassword || newPassword.length < 6) { addToast("Password must be at least 6 characters", "error"); return; }
    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetOtpCode,
        type: "recovery"
      });
      if (verifyError) throw verifyError;
      
      if (data.session) {
        // Update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
        
        addToast("Password reset successfully! You can now sign in.", "success");
        setTab("signin");
        setResetEmail("");
        setResetOtpCode("");
        setNewPassword("");
      }
    } catch (err: any) {
      addToast(err.message || "Invalid code or error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) { addToast("Please enter a valid 6-digit code", "error"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup"
      });
      if (error) throw error;
      if (data.session && data.user) {
        addToast("Account verified successfully!", "success");
        // Fetch role...
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        const role = profile?.role || data.user?.user_metadata?.role || "client";
        const isAdmin = ["admin", "superAdmin"].includes(role);
        window.location.href = isAdmin ? "/dashboard/admin" : "/dashboard/client";
      }
    } catch (err: any) {
      addToast(err.message || "Invalid or expired code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      addToast("A new code has been sent!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to resend code", "error");
    } finally {
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
        .auth-input:focus { border-color:#58b2ad; }
        .auth-btn { width:100%; padding:0.9rem; background:#58b2ad; color:#fff; border:none; border-radius:6px; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:opacity 0.3s; margin-top:0.5rem; }
        .auth-btn:hover { opacity:0.85; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .auth-btn-outline { width:100%; padding:0.9rem; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:6px; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:all 0.3s; margin-top:0.5rem; }
        .auth-btn-outline:hover { background:rgba(255,255,255,0.05); }
        .auth-tab { flex:1; padding:0.75rem; text-align:center; font-family:Montserrat,sans-serif; font-size:0.85rem; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; background:transparent; border:none; color:rgba(255,255,255,0.4); transition:all 0.3s; }
        .auth-tab.active { background:#58b2ad; color:#fff; }
        .auth-link { color:#58b2ad; text-decoration:none; font-size:0.85rem; font-weight:500; }
        .auth-link:hover { text-decoration:underline; }
        .auth-checkbox-container { display:flex; align-items:flex-start; gap:0.75rem; background:#6223e8; padding:1.25rem 1rem; border-radius:6px; margin-bottom:1rem; cursor:pointer; }
        .auth-checkbox { width:1.2rem; height:1.2rem; cursor:pointer; margin-top:2px; accent-color:#fff; }
        .auth-section-title { font-family:Montserrat,sans-serif; font-size:0.75rem; font-weight:700; color:#fff; background:#6223e8; padding:0.25rem 0.5rem; border-radius:4px; display:inline-block; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.05em; }
        .auth-label { font-family:Montserrat,sans-serif; font-size:0.8rem; font-weight:600; color:#fff; margin-bottom:0.4rem; display:block; }
        .auth-input-container { margin-bottom:0.5rem; }
        .auth-dropdown-scroll::-webkit-scrollbar { width: 6px; }
        .auth-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .auth-dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "2rem" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem" }}>
          <img src="/images/tyes-logo-new.svg" alt="tyes" style={{ height: 36 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span style={{ fontFamily: "'League Spartan',sans-serif", fontSize: "1.5rem", color: "#4ecdc4" }}>tyes</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'League Spartan',sans-serif", fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>{title}</h1>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "2.5rem" }}>{subtitle}</p>

        {/* Tabs */}
        {(tab === "signin" || tab === "signup") && (
          <div style={{ display: "flex", gap: 0, marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
            <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
          </div>
        )}


        {/* Sign In Form */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn}>
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
              <button type="button" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }} onClick={() => setTab("forgot")}>Forgot password?</button>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 500 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} /> or <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
            <button type="button" className="auth-btn-outline" onClick={() => addToast("Google sign-in coming soon", "warning")}>Continue with Google</button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp}>
            <div className="auth-input-container">
              <label className="auth-label">Full name</label>
              <input className="auth-input" style={{ marginBottom: 0 }} type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="auth-input-container">
              <label className="auth-label">Email</label>
              <input className="auth-input" style={{ marginBottom: 0 }} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-input-container" style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label className="auth-label">Password</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="auth-label">Confirm Password</label>
                <input className="auth-input" style={{ marginBottom: 0 }} type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className="auth-input-container" style={{ marginBottom: "1.5rem", position: "relative" }}>
              <label className="auth-label">Country</label>
              <div 
                className="auth-input" 
                style={{ marginBottom: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              >
                <span>{EU_COUNTRIES_LIST.find(c => c.code === country)?.name || "Select country"}</span>
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
                    {EU_COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                      <div 
                        key={c.code}
                        onClick={() => {
                          setCountry(c.code);
                          setIsCountryDropdownOpen(false);
                          setCountrySearch("");
                        }}
                        style={{ padding: "0.6rem", cursor: "pointer", borderRadius: "4px", background: country === c.code ? "rgba(88,178,173,0.15)" : "transparent", color: country === c.code ? "#58b2ad" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = country === c.code ? "rgba(88,178,173,0.25)" : "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = country === c.code ? "rgba(88,178,173,0.15)" : "transparent"}
                      >
                        {c.name}
                        {country === c.code && <span style={{ fontSize: "0.9rem" }}>✓</span>}
                      </div>
                    ))}
                    {EU_COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: "0.6rem", color: "rgba(255,255,255,0.4)", textAlign: "center", fontSize: "0.85rem" }}>No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="auth-checkbox-container" onClick={() => setIsBusiness(!isBusiness)}>
              <input type="checkbox" className="auth-checkbox" checked={isBusiness} onChange={() => {}} />
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

            <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: "1rem" }}>{loading ? "Creating account…" : "Create Account"}</button>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 500 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} /> or <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
            <button type="button" className="auth-btn-outline" onClick={() => addToast("Google sign-in coming soon", "warning")}>Continue with Google</button>
          </form>
        )}

        {/* Forgot Password Form */}
        {tab === "forgot" && (
          <form onSubmit={handleReset}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", textAlign: "center" }}>
              Enter your email and we'll send you a recovery code.
            </p>
            <input className="auth-input" type="email" placeholder="Email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Sending..." : "Send Reset Code"}</button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button type="button" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setTab("signin")}>← Back to Sign In</button>
            </div>
          </form>
        )}

        {/* OTP Verification Form */}
        {tab === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", textAlign: "center", lineHeight: 1.5 }}>
              We sent a code to <br/><strong style={{ color: "#4ecdc4" }}>{email}</strong>
            </p>
            <input className="auth-input" type="text" placeholder="6-digit code" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5em", fontWeight: 700 }} required />
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Verifying…" : "Verify Account"}</button>
            <div style={{ textAlign: "center", marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Didn't receive the code? <button type="button" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={handleResendOtp} disabled={loading}>Resend</button>
              </p>
              <button type="button" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", alignSelf: "center", fontSize: "0.8rem" }} onClick={() => setTab("signup")}>← Back to Sign Up</button>
            </div>
          </form>
        )}

        {/* Forgot OTP Form */}
        {tab === "forgot_otp" && (
          <form onSubmit={handleResetVerify}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", textAlign: "center", lineHeight: 1.5 }}>
              We sent a recovery code to <br/><strong style={{ color: "#4ecdc4" }}>{resetEmail}</strong>
            </p>
            <input className="auth-input" type="text" placeholder="6-digit code" maxLength={6} value={resetOtpCode} onChange={e => setResetOtpCode(e.target.value.replace(/\D/g, ''))} style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5em", fontWeight: 700, marginBottom: "0.5rem" }} required />
            <input className="auth-input" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Resetting…" : "Reset Password"}</button>
            <div style={{ textAlign: "center", marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button type="button" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", alignSelf: "center", fontSize: "0.8rem" }} onClick={() => setTab("forgot")}>← Back</button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          <a href="/main.html" className="auth-link">← Back to home</a>
        </div>

      </div>
    </div>
  );
}
