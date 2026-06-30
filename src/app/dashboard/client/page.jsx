"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Bell, ChevronDown, ChevronRight, ChevronLeft, Download, MoreVertical, Plus, Eye, Check, X, Clock, RefreshCw, Upload, Image, Settings, LogOut, Home, Package, CreditCard, FileText, MessageSquare, User, Camera, Paperclip, Send, Star, ArrowUpRight, Menu, AlertCircle, Zap, ExternalLink, Trash2, Edit, Save, CheckCircle } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// stripePromise is lazy-loaded per component instance to avoid the global Stripe badge

// ══════════════════════════════════════
// CHECKOUT FORM (top-level for stable identity)
// ══════════════════════════════════════
const CheckoutForm = ({ onPaymentSuccess, stripeError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const handlePay = async () => {
    if (!stripe || !elements || paying) return;
    setPaying(true);
    setPayError(null);
    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setPayError(submitErr.message);
        setPaying(false);
        return;
      }

      const { error: confirmErr } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (confirmErr) {
        setPayError(confirmErr.message);
        setPaying(false);
        return;
      }

      // Payment confirmed — hand off to parent for uploads + DB insert
      await onPaymentSuccess();
    } catch (e) {
      setPayError(e.message || "Payment failed");
      setPaying(false);
    }
  };

  return (
    <div>
      {paying && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "16px 32px", background: "rgba(17,24,39,0.95)", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", maxWidth: "90vw" }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: "#4ecdc4" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Processing Payment...</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Please do not close this window</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 4, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <CreditCard size={14} color="#4ecdc4" /> Payment Details
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </div>
      {(stripeError || payError) && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{payError || stripeError}</div>}
      <button
        onClick={handlePay}
        disabled={paying || !stripe || !elements}
        style={{ marginTop: 20, width: "100%", padding: "14px", borderRadius: 10, border: "none", background: paying ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: paying ? "#4b5563" : "#fff", fontSize: 14, fontWeight: 700, cursor: paying ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s" }}>
        {paying ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : <><Send size={14} /> Pay &amp; Submit Order</>}
      </button>
    </div>
  );
};

// ══════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);
  return { toasts, addToast };
};

const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ padding: "10px 18px", borderRadius: 10, background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f", color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease", border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44` }}>
        {t.message}
      </div>
    ))}
  </div>
);

// ══════════════════════════════════════
// MODAL SYSTEM
// ══════════════════════════════════════
const Modal = ({ open, onClose, title, children, width }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: width || 440, maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#6b7280" }}><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// HELPERS & COMPONENTS
// ══════════════════════════════════════
const statusConfig = {
  pending: { label: "Pending", bg: "rgba(107,114,128,0.15)", color: "#9ca3af", icon: Clock },
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", icon: Clock },
  revision: { label: "Revision", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", icon: RefreshCw },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  delivered: { label: "Delivered", bg: "rgba(78,205,196,0.15)", color: "#4ecdc4", icon: Package },
};

const StatusBadge = ({ status }) => {
  const c = statusConfig[status] || statusConfig.pending;
  const Icon = c.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={11} /> {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent, onClick }) => (
  <div onClick={onClick} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 180, cursor: onClick ? "pointer" : "default", transition: "all 0.2s" }} onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = "rgba(78,205,196,0.2)"; }} onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
      <Icon size={16} color="#fff" />
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#fff", marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{sub}</div>}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed, badge }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#6b7280", background: active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent", transition: "all 0.2s", justifyContent: collapsed ? "center" : "flex-start", position: "relative" }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent"; }}>
    <Icon size={17} style={{ flexShrink: 0 }} />
    {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
    {!collapsed && badge && <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{badge}</span>}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type, required = false }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
  </div>
);

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
const navPages = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "new-order", label: "New Order", icon: Plus },
  // { id: "messages", label: "Messages", icon: MessageSquare, badge: "1" },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "account", label: "Account", icon: User },
];

// ══════════════════════════════════════
// NEW ORDER PAGE
// ══════════════════════════════════════
const NewOrderPage = ({ supabase, addToast, clientInfo, pricingPlans, setPage, fetchData }) => {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [briefDesc, setBriefDesc] = useState("");
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [productPhotos, setProductPhotos] = useState([]);
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [fontFiles, setFontFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeError, setStripeError] = useState(null);

  // Lazy-load Stripe only when this page mounts (prevents global badge on other tabs)
  const stripePromiseRef = useRef(null);
  if (!stripePromiseRef.current) {
    stripePromiseRef.current = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  const stripePromise = stripePromiseRef.current;

  const plans = pricingPlans;

  const toggleStyle = (style) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const removeFile = (type, index) => {
    if (type === 'photo') setProductPhotos(prev => prev.filter((_, i) => i !== index));
    else setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (files) => {
    const urls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tyes_preset");
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.secure_url) {
          urls.push(data.secure_url);
        } else {
          console.error("Cloudinary upload failed:", data);
          throw new Error(data.error?.message || "Upload failed");
        }
      } catch (err) {
        console.error("Cloudinary error:", err);
        throw err;
      }
    }
    return urls;
  };

  const handleSubmitOrder = async (stripeObj, elementsObj) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Please sign in to place an order.");

      const selectedPlan = plans.find(p => p.id === plan);
      if (!selectedPlan) throw new Error("Please select a plan first.");

      // --- Upload files after payment confirmed (or for free orders) ---
      let photoUrls = [];
      let refUrls = [];
      let fontUrls = [];

      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        if (productPhotos.length > 0) {
          addToast(`Uploading ${productPhotos.length} product photos...`, "info");
          photoUrls = await uploadToCloudinary(productPhotos);
        }
        if (referencePhotos.length > 0) {
          addToast(`Uploading ${referencePhotos.length} reference images...`, "info");
          refUrls = await uploadToCloudinary(referencePhotos);
        }
        if (fontFiles.length > 0) {
          addToast(`Uploading ${fontFiles.length} fonts/labels...`, "info");
          fontUrls = await uploadToCloudinary(fontFiles);
        }
      }

      const structuredItems = productPhotos.map((file, index) => ({
        name: file.name,
        mainImage: photoUrls[index] || "",
        finishImage: "",
        status: "pending"
      }));

      const { data: newOrder, error: insertError } = await supabase.from("orders").insert([{
        user_id: currentUser.id,
        customer_email: currentUser.email,
        customer_name: clientInfo.name || currentUser.user_metadata?.first_name || "Client",
        title: projectTitle || `New ${selectedPlan.name} Order`,
        plan: selectedPlan.name,
        images_count: selectedPlan.images || 0,
        status: "pending",
        revenue: selectedPlan.price || 0,
        revisions: 0,
        max_revisions: selectedPlan.max_revisions || 3,
        progress: 0,
        attachments: { photos: photoUrls },
        reference_images: refUrls,
        font_label_files: fontUrls,
        items: structuredItems,
        brief_description: briefDesc,
        selected_styles: selectedStyles,
        created_at: new Date().toISOString()
      }]).select().single();

      if (insertError) throw insertError;

      // Trigger invoice generation and order confirmation email
      try {
        await fetch('/api/orders/post-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrder.id })
        });
      } catch (postPaymentErr) {
        console.error("Post payment processing error:", postPaymentErr);
      }

      fetchData();
      setStep(1);
      setPage("success");
    } catch (err) {
      console.error("Submission error:", err);
      addToast(err.message || "Failed to submit order", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingBottom: 40 }}>
      {isSubmitting && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "16px 32px", background: "rgba(17,24,39,0.95)", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", maxWidth: "90vw" }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: "#4ecdc4" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Processing Order...</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Please do not close this window</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>New Order</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 32px" }}>Fill in your brief and we'll get started right away.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {["Choose Plan", "Upload Brief", "Review & Submit"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: step > i + 1 ? "#34d399" : step === i + 1 ? "linear-gradient(135deg,#4ecdc4,#2ab7a9)" : "rgba(255,255,255,0.06)", color: step >= i + 1 ? "#fff" : "#4b5563" }}>
                {step > i + 1 ? <Check size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: step === i + 1 ? "#fff" : "#4b5563", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "#34d399" : "rgba(255,255,255,0.06)", margin: "0 8px" }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {plans.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>Loading plans...</p>
              </div>
            ) : (
              plans.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)} style={{ background: plan === p.id ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)", border: `2px solid ${plan === p.id ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                  {p.badge && <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(78,205,196,0.15)", color: "#4ecdc4", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{p.badge}</span>}
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>${p.price}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{p.images} image{p.images > 1 ? "s" : ""} · 3 revisions</div>
                  {plan === p.id && <div style={{ position: "absolute", top: 12, left: 12 }}><Check size={16} color="#4ecdc4" /></div>}
                </div>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ width: "100%" }}>
            <InputField label="Project Title" value={projectTitle} onChange={setProjectTitle} placeholder="e.g. Summer Skincare Launch" required={true} />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Brief / Mood Description <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea value={briefDesc} onChange={e => setBriefDesc(e.target.value)} placeholder="Describe the mood, style, angles you want..." rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Style (click to select)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Product Shot", "Editorial", "Lifestyle", "Flat Lay", "Minimal", "Mood Lighting", "Artistic"].map(s => (
                  <button key={s} onClick={() => toggleStyle(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${selectedStyles.includes(s) ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.08)"}`, background: selectedStyles.includes(s) ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", color: selectedStyles.includes(s) ? "#4ecdc4" : "#9ca3af", fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
              {/* Product Photos */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Product Photos <span style={{ color: "#ef4444" }}>*</span></label>
                <div onClick={() => document.getElementById('photoInput').click()}
                  style={{ display: "grid", justifyItems: "center", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "rgba(255,255,255,0.01)" }}>
                  <input type="file" id="photoInput" multiple accept="image/*" style={{ display: "none" }} onChange={e => {
                    const selectedPlan = plans.find(p => p.id === plan);
                    const limit = selectedPlan ? selectedPlan.images : 0;
                    const newFiles = Array.from(e.target.files);
                    if (productPhotos.length + newFiles.length > limit) {
                      addToast(`Plan limit: ${limit} photos`, "warning");
                      return;
                    }
                    setProductPhotos(prev => [...prev, ...newFiles]);
                  }} />
                  <Camera size={20} color="#4ecdc4" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>Main Products</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>Required</div>
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {productPhotos.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 11 }}>
                      <span style={{ flex: 1, color: "#d1d5db", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                      <button onClick={() => setProductPhotos(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Images */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Reference Images</label>
                <div onClick={() => document.getElementById('refInput').click()}
                  style={{ display: "grid", justifyItems: "center", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "rgba(255,255,255,0.01)" }}>
                  <input type="file" id="refInput" multiple accept="image/*" style={{ display: "none" }} onChange={e => setReferencePhotos(prev => [...prev, ...Array.from(e.target.files)])} />
                  <Image size={20} color="#4ecdc4" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>Style References</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>Mood, angles, etc.</div>
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {referencePhotos.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 11 }}>
                      <span style={{ flex: 1, color: "#d1d5db", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                      <button onClick={() => setReferencePhotos(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonts / Label */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Fonts / Label</label>
                <div onClick={() => document.getElementById('fontInput').click()}
                  style={{ display: "grid", justifyItems: "center", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "rgba(255,255,255,0.01)" }}>
                  <input type="file" id="fontInput" multiple style={{ display: "none" }} onChange={e => setFontFiles(prev => [...prev, ...Array.from(e.target.files)])} />
                  <FileText size={20} color="#4ecdc4" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>Label Files</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>PDF, PNG, OTF, etc.</div>
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {fontFiles.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 11 }}>
                      <span style={{ flex: 1, color: "#d1d5db", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                      <button onClick={() => setFontFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (() => {
          const selectedPlan = plans.find(p => p.id === plan);
          const isPaid = selectedPlan && selectedPlan.price > 0;
          const orderSummary = [
            { label: "Plan", val: selectedPlan?.name || "—" },
            { label: "Project", val: projectTitle || "Untitled" },
            { label: "Images", val: selectedPlan?.images || 0 },
            { label: "Style", val: selectedStyles.join(", ") || "Not specified" },
            { label: "Product Photos", val: `${productPhotos.length} files` },
            { label: "Ref. Images", val: `${referencePhotos.length} files` },
            { label: "Fonts / Labels", val: `${fontFiles.length} files` },
            { label: "Revisions", val: "3 included" },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: isPaid ? "1fr 1fr" : "1fr", gap: 24, width: "100%" }}>
              {/* LEFT: Order Summary */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Order Summary</h3>
                {orderSummary.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 14 }}>
                    <span style={{ color: "#9ca3af" }}>{r.label}</span><span style={{ color: "#fff", fontWeight: 500 }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontSize: 20 }}>
                  <span style={{ color: "#9ca3af", fontWeight: 600 }}>Total</span>
                  <span style={{ color: isPaid ? "#4ecdc4" : "#34d399", fontWeight: 800 }}>{isPaid ? `${selectedPlan.price}` : "Free"}</span>
                </div>
                {/* Free plan submit button */}
                {!isPaid && (
                  <button
                    onClick={() => handleSubmitOrder(null, null)}
                    disabled={isSubmitting}
                    style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: isSubmitting ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#34d399,#10b981)", color: isSubmitting ? "#4b5563" : "#fff", fontSize: 14, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
                    {isSubmitting ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Order</>}
                  </button>
                )}
              </div>
              {/* RIGHT: Payment form for paid plans */}
              {isPaid && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Secure Payment</h3>
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#4ecdc4", colorBackground: "#111827", colorText: "#f9fafb", colorDanger: "#ef4444", fontFamily: '"Inter", -apple-system, sans-serif', borderRadius: "8px" } } }}>
                      <CheckoutForm onPaymentSuccess={handleSubmitOrder} stripeError={stripeError} />
                    </Elements>
                  ) : stripeError ? (
                    <div style={{ color: "#ef4444", fontSize: 13, padding: 16 }}>{stripeError}</div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#6b7280", fontSize: 13, padding: 16 }}>
                      <RefreshCw size={14} className="animate-spin" /> Setting up secure payment...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          {step > 1 && <button onClick={() => { setStep(step - 1); if (step === 3) { setClientSecret(null); setStripeError(null); } }} style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer", minWidth: 100 }}>Back</button>}
          {step < 3 && (
            <button
              onClick={async () => {
                if (step === 1 && !plan) return;
                if (step === 2) {
                  if (!projectTitle.trim() || !briefDesc.trim() || productPhotos.length === 0) return;
                }
                const nextStep = step + 1;
                setStep(nextStep);
                // Pre-fetch client secret when reaching Step 3 for paid plans
                if (nextStep === 3) {
                  const selectedPlan = plans.find(p => p.id === plan);
                  if (selectedPlan && selectedPlan.price > 0) {
                    try {
                      const res = await fetch('/api/stripe/payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ price: selectedPlan.price, planName: selectedPlan.name })
                      });
                      const data = await res.json();
                      if (data.clientSecret) setClientSecret(data.clientSecret);
                      else setStripeError('Could not initialize payment. Please try again.');
                    } catch (e) {
                      setStripeError('Payment setup failed. Please try again.');
                    }
                  }
                }
              }}
              disabled={(step === 1 && !plan) || (step === 2 && (!projectTitle.trim() || !briefDesc.trim() || productPhotos.length === 0))}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: ((step === 1 && !plan) || (step === 2 && (!projectTitle.trim() || !briefDesc.trim() || productPhotos.length === 0))) ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#4ecdc4,#2ab7a9)",
                color: ((step === 1 && !plan) || (step === 2 && (!projectTitle.trim() || !briefDesc.trim() || productPhotos.length === 0))) ? "#4b5563" : "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: ((step === 1 && !plan) || (step === 2 && (!projectTitle.trim() || !briefDesc.trim() || productPhotos.length === 0))) ? "not-allowed" : "pointer",
                minWidth: 120,
                transition: "all 0.3s ease"
              }}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// TAWK.TO CHAT COMPONENT
// ══════════════════════════════════════
const TawkToChat = () => {
  useEffect(() => {
    if (window.Tawk_API) {
      if (window.Tawk_API.showWidget) window.Tawk_API.showWidget();
    } else {
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/622aee3ba34c2456412a8539/1ftrr56e8';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    }
    return () => {
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);
  return null;
};

// ══════════════════════════════════════
// SUCCESS PAGE
// ══════════════════════════════════════
const SuccessPage = ({ setPage }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 20px", textAlign: "center" }}>
    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(52,211,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
      <CheckCircle size={50} color="#34d399" />
    </div>
    <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 16 }}>Order Submitted Successfully!</h1>
    <p style={{ fontSize: 16, color: "#9ca3af", maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
      Thank you! Your payment was successful and your order is now confirmed. We are already processing your request and will notify you as soon as there are updates.
    </p>
    <button
      onClick={() => setPage("orders")}
      style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10, alignSelf: "center" }}
    >
      <Package size={18} /> View My Orders
    </button>
  </div>
);

export default function TyesClient() {
  const router = useRouter();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get User
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log("Current Auth User:", authUser?.id, authUser?.email);

      if (!authUser) {
        router.push("/auth");
        return;
      }
      setUser(authUser);

      // 2. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
        setClientInfo({
          name: fullName,
          email: profile.email,
          tier: profile.tier || "starter",
          joined: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          totalOrders: profile.orders_count || 0,
          totalSpent: profile.total_spent || 0,
          imagesDelivered: 0,
          freeTestUsed: true,
        });
        setCompanyName(fullName);
        setCompanyEmail(profile.email);
      } else {
        const fullName = authUser.user_metadata?.first_name
          ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name || ''}`.trim()
          : authUser.email;

        setClientInfo({
          name: fullName,
          email: authUser.email,
          tier: "starter",
          joined: "New Member",
          totalOrders: 0,
          totalSpent: 0,
          imagesDelivered: 0,
          freeTestUsed: false,
        });
        setCompanyName(fullName);
        setCompanyEmail(authUser.email);
      }

      // Load preferences
      const metadataPrefs = authUser.user_metadata?.preferences;
      if (metadataPrefs) {
        setPrefs(prev => ({ ...prev, ...metadataPrefs }));
      } else if (profile && profile.preferences) {
        setPrefs(prev => ({ ...prev, ...profile.preferences }));
      }

      // 3. Fetch Plans
      const { data: plansData } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });
      if (plansData) setPricingPlans(plansData);

      console.log("User ID:", authUser.id);
      console.log("User Email:", authUser.email);
      // 4. Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${authUser.id},customer_email.eq.${authUser.email}`)
        .order('created_at', { ascending: false });

      console.log("Fetched Orders for", ordersData, ordersError);
      if (ordersError) {
        console.error("Orders Fetch Error:", ordersError);
        addToast(`Orders error: ${ordersError.message}`, "error");
      }

      if (ordersData) {
        setOrders(ordersData.map(o => {
          let items = o.items || [];
          if (items.length === 0 && o.attachments && o.attachments.photos) {
            items = o.attachments.photos.map((url, idx) => ({
              name: `Product Photo ${idx + 1}`,
              mainImage: url,
              finishImage: "",
              status: o.status || "pending"
            }));
          }

          let derivedStatus = o.status || "pending";
          if (items.length > 0) {
            const allDelivered = items.every(i => i.status === "delivered" || i.status === "completed");
            const anyRevision = items.some(i => i.status === "revision");
            if (allDelivered) derivedStatus = "delivered";
            else if (anyRevision) derivedStatus = "revision";
            else if (items.some(i => i.status === "in_progress")) derivedStatus = "in_progress";
          }

          return {
            ...o,
            id: o.id,
            title: o.title || `Order ${o.id.slice(0, 8)}`,
            date: new Date(o.created_at).toISOString().split('T')[0],
            images: o.images_count || 0,
            status: derivedStatus,
            progress: o.progress || 0,
            revisions: o.revisions || 0,
            maxRevisions: o.max_revisions || 3,
            items: items
          };
        }));
      }

      // 5. Fetch Invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`*, orders ( title )`)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        // Table might not exist yet, ignore error silently
        console.log("Invoices table might not exist yet:", invoicesError.message);
      } else if (invoicesData) {
        setInvoices(invoicesData.map(i => ({
          id: i.smartbill_number ? `${i.smartbill_series}-${i.smartbill_number}` : `INV-${i.id.slice(0, 8)}`,
          order: i.orders?.title || `ORD-${i.order_id.slice(0, 8)}`,
          amount: i.amount,
          status: i.status,
          date: i.created_at ? new Date(i.created_at).toISOString().split('T')[0] : i.due_date,
          due: i.due_date,
          url: i.invoice_url
        })));
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for Stripe checkout session success or PaymentElement redirect success
    const query = new URLSearchParams(window.location.search);
    if (query.get("session_id") || query.get("redirect_status") === "succeeded") {
      setPage("success");
      // Clear the query string
      router.replace("/dashboard/client");
    }
  }, [supabase, router, addToast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      addToast("Error logging out", "error");
    }
  };
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(null);

  // Client info and orders are now initialized empty and filled by fetchData
  const [clientInfo, setClientInfo] = useState({
    name: "Loading...", email: "", tier: "...", joined: "...", totalOrders: 0, totalSpent: 0, imagesDelivered: 0, freeTestUsed: false,
  });

  // ── Messages State ──
  const [messagesList, setMessagesList] = useState([
    { id: 1, from: "team", name: "Tyes Team", text: "Hi! We've started working on ORD-3011. Two images need a small revision on the label area — could you confirm the font is Futura PT?", time: "2 hrs ago", read: true },
    { id: 2, from: "client", name: "You", text: "Yes, it's Futura PT Bold for the headline and Futura PT Book for body text. File attached in the brief.", time: "1 hr ago", read: true },
    { id: 3, from: "team", name: "Tyes Team", text: "Perfect, thank you! We'll have the revision ready within the hour.", time: "45 min ago", read: false },
  ]);

  // ── Invoices State ──
  const [invoices, setInvoices] = useState([]);

  // ── Notifications ──
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Revision ready for ORD-3011", time: "10 min ago", read: false },
    { id: 2, text: "Invoice INV-0087 generated", time: "2 hrs ago", read: false },
    { id: 3, text: "ORD-2988 delivered", time: "1 day ago", read: true },
  ]);

  // ── Account Prefs State ──
  const [prefs, setPrefs] = useState({ orderNotif: true, msgNotif: true, weeklyReport: false });
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("Glossier Inc.");
  const [companyEmail, setCompanyEmail] = useState("studio@glossier.com");

  const spendingData = [
    { month: "Jan", spent: 10 }, { month: "Feb", spent: 125 },
    { month: "Mar", spent: 170 }, { month: "Apr", spent: 80 },
  ];

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMsgs = messagesList.filter(m => !m.read && m.from === "team").length;

  const markNotifsRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  const downloadAsZip = async (urlsToDownload, zipFilename) => {
    if (!urlsToDownload || urlsToDownload.length === 0) {
      addToast("No images found to download", "warning");
      return;
    }

    addToast("Preparing ZIP file... this may take a moment", "info");

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const fetchPromises = urlsToDownload.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();

          let filename = `image_${index + 1}.png`;
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart) {
              const questionIndex = lastPart.indexOf('?');
              filename = questionIndex !== -1 ? lastPart.substring(0, questionIndex) : lastPart;
            }
          } catch (e) { }
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Failed to load ${url}:`, error);
          zip.file(`error_${index}.txt`, `Failed to download: \${url}\nError: \${error.message}`);
        }
      });

      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      addToast("ZIP download started successfully!", "success");
    } catch (error) {
      console.error("ZIP Generation Error:", error);
      addToast("Failed to create ZIP file", "error");
    }
  };

  // ══════════════════════════════════════
  // OVERVIEW PAGE
  // ══════════════════════════════════════
  const OverviewPage = () => {
    const activeOrder = orders.find(o => o.status !== "delivered");
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Welcome back, {companyName.split(" ")[0]}</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Here's an overview of your account.</p>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={Package} label="Total Orders" value={orders.length} sub={`Since ${clientInfo.joined}`} onClick={() => setPage("orders")} />
          <StatCard icon={Image} label="Images Delivered" value={orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.images, 0)} sub="Across all orders" onClick={() => setPage("orders")} />
          <StatCard icon={CreditCard} label="Total Spent" value={`$${orders.reduce((s, o) => s + o.revenue, 0)}`} accent="#34d399" sub="Lifetime" onClick={() => setPage("invoices")} />
          <StatCard icon={Star} label="Your Tier" value="Pro" sub="5+ orders" />
        </div>

        {activeOrder && (
          <div style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 16, padding: 24, marginBottom: 24, cursor: "pointer" }} onClick={() => { setPage("orders"); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Zap size={14} color="#4ecdc4" />
                  <span style={{ fontSize: 12, color: "#4ecdc4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Order</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{activeOrder.title}</h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{activeOrder.id} · {activeOrder.plan} · {activeOrder.images} images</span>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Progress</span>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{activeOrder.progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${activeOrder.progress}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#4ecdc4,#2ab7a9)", transition: "width 0.5s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {activeOrder.items.slice(0, 6).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusConfig[item.status]?.color || "#6b7280" }} />
                  <span style={{ fontSize: 11, color: "#d1d5db" }}>{item.name}</span>
                </div>
              ))}
              {activeOrder.items.length > 6 && <span style={{ fontSize: 11, color: "#4b5563", alignSelf: "center" }}>+{activeOrder.items.length - 6} more</span>}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 380, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Spending Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4ecdc4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
                <Area type="monotone" dataKey="spent" stroke="#4ecdc4" fill="url(#sg)" strokeWidth={2.5} dot={{ fill: "#4ecdc4", r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 260, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: Plus, label: "New Order", desc: "Start a new project", action: () => setPage("new-order") },
                // { icon: MessageSquare, label: "Messages", desc: `${unreadMsgs} unread message${unreadMsgs !== 1 ? "s" : ""}`, action: () => setPage("messages") },
                {
                  icon: Download, label: "Download All", desc: "All delivered images", action: () => {
                    const links = [];
                    orders.forEach(o => {
                      o.items?.forEach(i => {
                        if ((i.status === "delivered" || i.status === "completed" || o.status === "delivered") && i.finishImage) {
                          links.push(i.finishImage);
                        }
                      });
                    });

                    if (links.length === 0) {
                      addToast("No delivered images found yet", "warning");
                      return;
                    }
                    downloadAsZip(links, `Tyes_All_Delivered_Images.zip`);
                  }
                },
                { icon: FileText, label: "View Invoices", desc: `$${invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0)} pending`, action: () => setPage("invoices") },
              ].map((a, i) => (
                <div key={i} onClick={a.action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(78,205,196,0.2)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"}>
                  <a.icon size={15} color="#4ecdc4" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{a.desc}</div>
                  </div>
                  <ChevronRight size={13} color="#4b5563" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // ORDERS PAGE
  // ══════════════════════════════════════
  const OrdersPage = () => {
    const [expanded, setExpanded] = useState(null);
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const filtered = orders.filter(o => filter === "all" || o.status === filter);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDownloadAll = (order) => {
      const links = order.items.filter(i => i.finishImage).map(i => i.finishImage);
      if (links.length === 0) {
        addToast("No images delivered yet", "info");
        return;
      }
      downloadAsZip(links, `Tyes_Order_${order.id}.zip`);
    };

    const handleDownloadItem = (name, url) => {
      if (!url) {
        addToast("Download link not available", "error");
        return;
      }
      addToast(`Downloading ${name}...`, "info");
      window.open(url, '_blank');
    };

    const handleRequestRevision = (order, itemIndex = null) => {
      setShowRevisionModal({ order, itemIndex });
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>My Orders</h1>
          <button onClick={() => setPage("new-order")} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={13} /> New Order</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ key: "all", label: "All" }, { key: "in_progress", label: "In Progress" }, { key: "revision", label: "Revision" }, { key: "delivered", label: "Delivered" }].map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setCurrentPage(1); }} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: filter === f.key ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)", background: filter === f.key ? "rgba(78,205,196,0.15)" : "transparent", color: filter === f.key ? "#4ecdc4" : "#6b7280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              {f.label} {f.key !== "all" && `(${orders.filter(o => o.status === f.key).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paginatedOrders.map(o => (
            <div key={o.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 16 }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#7dd8d0", fontWeight: 600 }}>{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{o.title}</h3>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{o.plan} · {o.images} images · {o.date}</span>
                </div>
                <div style={{ textAlign: "right", marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: (o.revenue || 0) > 0 ? "#34d399" : "#6b7280" }}>{(o.revenue || 0) > 0 ? `Paid: $${o.revenue}` : "Free"}</div>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>Rev {o.revisions}/{o.maxRevisions}</div>
                </div>
                <div style={{ width: 60 }}>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${o.progress}%`, height: "100%", borderRadius: 3, background: o.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280", textAlign: "center", marginTop: 2 }}>{o.progress}%</div>
                </div>
                <ChevronDown size={16} color="#4b5563" style={{ transform: expanded === o.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </div>
              {expanded === o.id && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px" }}>
                  {o.items && o.items.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                      {o.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s" }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Image size={16} color="#6b7280" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: "#fff", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                            <div style={{ marginTop: 4 }}><StatusBadge status={item.status} /></div>
                          </div>
                          {item.status === "delivered" && item.finishImage && (
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                              <div
                                onClick={() => window.open(item.finishImage, '_blank')}
                                style={{ width: 36, height: 36, borderRadius: 8, background: `url(${item.finishImage}) center/cover`, border: "2px solid rgba(16,185,129,0.3)", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                                title="Preview"
                              />
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={(e) => { e.stopPropagation(); handleDownloadItem(item.name, item.finishImage); }} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(78,205,196,0.1)", border: "none", color: "#4ecdc4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Download"><Download size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleRequestRevision(o, i); }} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(251,191,36,0.1)", border: "none", color: "#fbbf24", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Request Revision"><RefreshCw size={14} /></button>
                              </div>
                            </div>
                          )}
                          {item.status === "revision" && (
                            <button onClick={(e) => { e.stopPropagation(); handleRequestRevision(o, i); }} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                              <RefreshCw size={13} /> Reason
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#4b5563", textAlign: "center", padding: 16 }}>No item details available for this order.</div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowOrderDetailModal(o)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Eye size={12} /> View Details</button>
                    {o.status === "delivered" && (
                      <button onClick={() => handleDownloadAll(o)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={12} /> Download All</button>
                    )}
                    {o.status === "revision" && (
                      <button onClick={() => handleRequestRevision(o)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={12} /> Request Revision</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#4b5563", fontSize: 13 }}>No orders found.</div>}
        </div>

        {filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, padding: "0 4px" }}>
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              Showing <span style={{ color: "#9ca3af" }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: "#9ca3af" }}>{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span style={{ color: "#9ca3af" }}>{filtered.length}</span> orders
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: currentPage === 1 ? "#374151" : "#9ca3af", fontSize: 12, cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                    if (Math.abs(p - currentPage) === 2) return <span key={p} style={{ color: "#374151", padding: "0 4px" }}>...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid", borderColor: currentPage === p ? "rgba(78,205,196,0.3)" : "rgba(255,255,255,0.06)", background: currentPage === p ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.02)", color: currentPage === p ? "#4ecdc4" : "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: currentPage === totalPages ? "#374151" : "#9ca3af", fontSize: 12, cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════
  // MESSAGES PAGE
  // ══════════════════════════════════════
  const MessagesPage = () => {
    const [msg, setMsg] = useState("");

    const handleSend = () => {
      if (!msg.trim()) return;
      setMessagesList(prev => [...prev, { id: Date.now(), from: "client", name: "You", text: msg, time: "Just now", read: true }]);
      setMsg("");
      addToast("Message sent!");
      setTimeout(() => {
        setMessagesList(prev => [...prev, { id: Date.now() + 1, from: "team", name: "Tyes Team", text: "Thanks for your message! We'll get back to you shortly.", time: "Just now", read: false }]);
      }, 2000);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Messages</h1>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>T</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Tyes Team</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>RE: ORD-3011 — Spring Skincare Campaign</div>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {messagesList.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.from === "client" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 14, background: m.from === "client" ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${m.from === "client" ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.5 }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6, textAlign: m.from === "client" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
            <button onClick={() => addToast("Attach a file from your computer", "info")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }}><Paperclip size={16} /></button>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(); }} placeholder="Type a message..." style={{ flex: 1, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
            <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: msg.trim() ? "linear-gradient(135deg,#4ecdc4,#2ab7a9)" : "rgba(255,255,255,0.06)", color: msg.trim() ? "#fff" : "#4b5563", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}><Send size={12} /> Send</button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // INVOICES PAGE
  // ══════════════════════════════════════
  const InvoicesPage = () => {
    const handlePayInvoice = (inv) => {
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "paid" } : i));
      addToast(`Invoice ${inv.id} paid successfully!`);
    };

    const handleDownloadInvoice = (inv) => {
      if (inv.url) {
        window.open(inv.url, '_blank');
      } else {
        addToast(`Downloading ${inv.id}...`, "info");
      }
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Invoices</h1>
          <button onClick={() => { addToast("Exporting all invoices as CSV...", "info"); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={12} /> Export CSV</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Invoice", "Order", "Amount", "Status", "Date", "Due", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#7dd8d0", fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af", cursor: "pointer" }} onClick={() => setPage("orders")}>{inv.order}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#fff", fontWeight: 600 }}>${inv.amount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: inv.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.15)", color: inv.status === "paid" ? "#34d399" : "#fbbf24" }}>
                      {inv.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{inv.date}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{inv.due}</td>
                  <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                    <button onClick={() => handleDownloadInvoice(inv)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4 }}><Download size={13} /></button>
                    {inv.status === "pending" && (
                      <button onClick={() => handlePayInvoice(inv)} style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 6, color: "#4ecdc4", cursor: "pointer", padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // ACCOUNT PAGE
  // ══════════════════════════════════════
  const AccountPage = () => {
    const saveAccount = async () => {
      const parts = companyName.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ first_name: firstName, last_name: lastName })
          .eq('id', user.id);

        if (error) throw error;

        setClientInfo(prev => ({ ...prev, name: companyName }));
        addToast("Account name updated successfully!");
        setEditingCompany(false);
      } catch (err) {
        console.error("Error updating account:", err);
        addToast("Failed to update account", "error");
      }
    };

    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingBottom: 40 }}>
        <div style={{ width: "100%", maxWidth: 1200 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Account Settings</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Company Info</h3>
                <button onClick={() => {
                  if (editingCompany) {
                    saveAccount();
                  } else {
                    setEditingCompany(true);
                  }
                }} style={{ background: "none", border: "none", color: "#4ecdc4", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  {editingCompany ? <><Save size={12} /> Save</> : <><Edit size={12} /> Edit</>}
                </button>
              </div>
              {editingCompany ? (
                <div>
                  <InputField label="Company Name" value={companyName} onChange={setCompanyName} />
                  <div style={{ opacity: 0.6 }}>
                    <InputField label="Email (Read-only)" value={companyEmail} onChange={() => { }} disabled />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Tier</span>
                    <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, textTransform: "capitalize" }}>{clientInfo.tier}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Member Since</span>
                    <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{clientInfo.joined}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Company Name", value: companyName },
                    { label: "Email", value: companyEmail },
                    { label: "Tier", value: clientInfo.tier },
                    { label: "Member Since", value: clientInfo.joined },
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>{f.label}</span>
                      <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, textTransform: f.label === "Tier" ? "capitalize" : "none" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, height: "100%" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Email notifications for order updates", key: "orderNotif" },
                    { label: "Weekly summary report", key: "weeklyReport" },
                  ].map((p, i) => (
                    <div key={i} onClick={async () => {
                      const newVal = !prefs[p.key];
                      const newPrefs = { ...prefs, [p.key]: newVal };
                      setPrefs(newPrefs);
                      addToast(newVal ? `${p.label} enabled` : `${p.label} disabled`);

                      try {
                        // Store preferences in user_metadata since column is missing in profiles table
                        const { error } = await supabase.auth.updateUser({
                          data: { preferences: newPrefs }
                        });
                        if (error) throw error;
                      } catch (err) {
                        console.error("Error saving preference:", err);
                        addToast("Failed to save preference", "error");
                        // Rollback on error
                        setPrefs(prev => ({ ...prev, [p.key]: !newVal }));
                      }
                    }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: "#d1d5db" }}>{p.label}</span>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: prefs[p.key] ? "#4ecdc4" : "rgba(255,255,255,0.1)", padding: 2, transition: "background 0.2s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", transform: prefs[p.key] ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Payment Method</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <CreditCard size={18} color="#6b7280" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#e5e7eb" }}>Visa ending in 4242</div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>Expires 08/2028</div>
                  </div>
                  <button onClick={() => addToast("Payment method update — redirecting to billing portal...", "info")} style={{ fontSize: 12, color: "#4ecdc4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Change</button>
                </div>
              </div>
              <button onClick={() => addToast("Account deletion request sent — our team will contact you", "warning")} style={{ padding: "10px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // ══════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════
  const renderPage = () => {
    switch (page) {
      case "overview": return <OverviewPage />;
      case "orders": return <OrdersPage />;
      case "new-order": return <NewOrderPage supabase={supabase} addToast={addToast} clientInfo={clientInfo} pricingPlans={pricingPlans} setPage={setPage} fetchData={fetchData} />;
      case "messages": return <MessagesPage />;
      case "invoices": return <InvoicesPage />;
      case "account": return <AccountPage />;
      case "success": return <SuccessPage setPage={setPage} />;
      default: return <OverviewPage />;
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#050505", minHeight: "100vh", width: "100%", position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: "#4ecdc4", marginBottom: 16 }} />
          <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Initializing your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", fontFamily: "'Inter',-apple-system,sans-serif", color: "#fff", overflow: "hidden" }}>
      <ToastContainer toasts={toasts} />

      {/* Logout Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Log Out">
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px" }}>Are you sure you want to log out of your account?</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setShowLogoutModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Log Out</button>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal open={!!showOrderDetailModal} onClose={() => setShowOrderDetailModal(null)} title={showOrderDetailModal ? `Order ${showOrderDetailModal.id}` : ""} width={600}>
        {showOrderDetailModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{showOrderDetailModal.title}</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StatusBadge status={showOrderDetailModal.status} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                { label: "Plan", val: showOrderDetailModal.plan },
                { label: "Images", val: showOrderDetailModal.images },
                { label: "Revenue", val: `$${showOrderDetailModal.revenue}` },
                { label: "Date", val: showOrderDetailModal.date },
                { label: "Revisions", val: `${showOrderDetailModal.revisions}/${showOrderDetailModal.maxRevisions}` },
                { label: "Progress", val: `${showOrderDetailModal.progress}%` },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{r.val}</div>
                </div>
              ))}
            </div>

            {showOrderDetailModal.brief_description && (
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Brief Description</div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 10, fontSize: 13, color: "#d1d5db", lineHeight: 1.6, border: "1px solid rgba(255,255,255,0.05)", maxHeight: 150, overflowY: "auto" }}>
                  {showOrderDetailModal.brief_description}
                </div>
              </div>
            )}

            {showOrderDetailModal.selected_styles && showOrderDetailModal.selected_styles.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Selected Styles</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {showOrderDetailModal.selected_styles.map(s => (
                    <span key={s} style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(78,205,196,0.1)", color: "#4ecdc4", fontSize: 11, fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Product Photos</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {showOrderDetailModal.attachments?.photos?.length > 0 ? showOrderDetailModal.attachments.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, color: "#fff", fontSize: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Camera size={14} color="#6b7280" /> <span>Product Image {i + 1}</span>
                  </a>
                )) : <div style={{ fontSize: 12, color: "#4b5563" }}>None</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Reference Images</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {showOrderDetailModal.reference_images?.length > 0 ? showOrderDetailModal.reference_images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, color: "#4ecdc4", fontSize: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Image size={14} /> <span>Reference {i + 1}</span>
                    </a>
                  )) : <div style={{ fontSize: 12, color: "#4b5563" }}>None</div>}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Fonts / Labels</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {showOrderDetailModal.font_label_files?.length > 0 ? showOrderDetailModal.font_label_files.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, color: "#7dd8d0", fontSize: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <FileText size={14} /> <span>File {i + 1}</span>
                    </a>
                  )) : <div style={{ fontSize: 12, color: "#4b5563" }}>None</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Revision Modal */}
      <Modal open={!!showRevisionModal} onClose={() => setShowRevisionModal(null)} title="Request Revision" width={480}>
        {showRevisionModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: 14, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 12, display: "flex", gap: 12 }}>
              <AlertCircle size={20} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 2 }}>Revision Guidelines</div>
                <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: "1.5" }}>
                  Please be specific about what you'd like to change. Describe the desired result clearly to help our designers deliver exactly what you need.
                </div>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Requested For</div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>
                  {showRevisionModal.itemIndex !== null
                    ? `Item: ${showRevisionModal.order.items[showRevisionModal.itemIndex]?.name}`
                    : `Order: ${showRevisionModal.order.id}`}
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Revision Details</div>
              <textarea
                placeholder="E.g. Please make the lighting warmer and increase the contrast on the product labels..."
                id="revision-reason"
                defaultValue={showRevisionModal.itemIndex !== null ? showRevisionModal.order.items[showRevisionModal.itemIndex]?.revisionReason || "" : ""}
                style={{ width: "100%", height: 120, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowRevisionModal(null)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button
                onClick={async () => {
                  const reason = document.getElementById("revision-reason").value;
                  if (!reason) {
                    addToast("Please provide a reason for the revision", "warning");
                    return;
                  }

                  const { order, itemIndex } = showRevisionModal;
                  const newItems = [...order.items];

                  if (itemIndex !== null) {
                    newItems[itemIndex] = {
                      ...newItems[itemIndex],
                      status: "revision",
                      revisionReason: reason,
                      revisionDate: new Date().toISOString()
                    };
                  } else {
                    newItems.forEach((item, idx) => {
                      if (item.status === "delivered") {
                        newItems[idx] = { ...item, status: "revision", revisionReason: reason };
                      }
                    });
                  }

                  try {
                    const { error } = await supabase
                      .from('orders')
                      .update({
                        items: newItems,
                        status: "revision",
                        revisions: (order.revisions || 0) + 1
                      })
                      .eq('id', order.id);

                    if (error) throw error;

                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, items: newItems, status: "revision", revisions: (o.revisions || 0) + 1 } : o));
                    setShowRevisionModal(null);
                    addToast("Revision request submitted successfully!");
                  } catch (err) {
                    console.error("Revision error:", err);
                    addToast("Failed to submit revision request", "error");
                  }
                }}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sidebar */}
      <div style={{ width: collapsed ? 64 : 220, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: collapsed ? "16px 8px" : "16px 12px", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>T</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Tyes</div>
              <div style={{ fontSize: 9, color: "#4ecdc4", fontStyle: "italic" }}>AI tied with a pulse</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Client Portal</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 2, display: collapsed ? "none" : "block" }}>
            <ChevronLeft size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navPages.map(p => (
            <SidebarItem key={p.id} icon={p.icon} label={p.label} active={page === p.id} onClick={() => setPage(p.id)} collapsed={collapsed} badge={p.id === "messages" && unreadMsgs > 0 ? String(unreadMsgs) : p.badge && p.id !== "messages" ? p.badge : null} />
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 8 }}>
          <SidebarItem icon={LogOut} label="Log Out" onClick={() => setShowLogoutModal(true)} collapsed={collapsed} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {collapsed && <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><Menu size={18} /></button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(78,205,196,0.12)", color: "#4ecdc4", fontSize: 11, fontWeight: 600 }}>Pro</span>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowNotifDrop(!showNotifDrop); setShowProfileDrop(false); if (!showNotifDrop) markNotifsRead(); }} style={{ position: "relative", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <Bell size={17} />
                {unreadNotifs > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />}
              </button>
              {showNotifDrop && (
                <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 8, minWidth: 260, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginTop: 8 }}>
                  <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>Notifications</div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, color: n.read ? "#6b7280" : "#e5e7eb", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div>{n.text}</div>
                      <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <div onClick={() => { setShowProfileDrop(!showProfileDrop); setShowNotifDrop(false); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{companyName[0]}</div>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{companyName.split(" ")[0]}</span>
                <ChevronDown size={12} color="#6b7280" />
              </div>
              {showProfileDrop && (
                <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginTop: 8 }}>
                  {[
                    { label: "Account Settings", icon: Settings, action: () => { setPage("account"); setShowProfileDrop(false); } },
                    { label: "My Orders", icon: Package, action: () => { setPage("orders"); setShowProfileDrop(false); } },
                    { label: "Log Out", icon: LogOut, action: () => { setShowProfileDrop(false); setShowLogoutModal(true); }, danger: true },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", borderRadius: 8, background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <item.icon size={13} /> {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setShowNotifDrop(false); setShowProfileDrop(false); }}>
          {renderPage()}
        </div>
      </div>
      <TawkToChat />
    </div>
  );
}
