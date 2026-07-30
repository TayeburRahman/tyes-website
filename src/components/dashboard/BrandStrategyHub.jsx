import React, { useState, useEffect } from 'react';
import BrandInfoForm from './BrandInfoForm';

export default function BrandStrategyHub({ supabase, clientInfo, setPage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStandaloneForm, setShowStandaloneForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('brand_strategy_requests').select('*').order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  const delivered = requests.filter(r => r.status === 'sent' || r.status === 'delivered').length;
  const inProgress = requests.length - delivered;
  const lastUpdated = requests.length > 0 ? new Date(requests[0].created_at).toLocaleDateString() : '';

  if (loading) {
    return <div style={{ padding: 24, color: '#9ca3af' }}>Loading Strategy Hub...</div>;
  }

  const openCalendly = (e) => {
    e.preventDefault();
    if (window.Calendly) {
      const calendlyUrl = (process.env.NEXT_PUBLIC_CALENDLY_DEEPDIVE_URL || 'https://calendly.com/raluca-tyes/60-minute-tyes-deep-dive-strategy-session') + '?utm_source=strategy_hub';
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    } else {
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        const calendlyUrl = (process.env.NEXT_PUBLIC_CALENDLY_DEEPDIVE_URL || 'https://calendly.com/raluca-tyes/60-minute-tyes-deep-dive-strategy-session') + '?utm_source=strategy_hub';
        window.Calendly.initPopupWidget({ url: calendlyUrl });
      };
      document.head.appendChild(script);
    }
  };

  const handleStandaloneSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Create pending order
      const { data: newOrder, error: orderErr } = await supabase.from('orders').insert([{
        user_id: clientInfo.id,
        customer_email: clientInfo.email,
        customer_name: clientInfo.name,
        title: formData.brandName ? `Brand Strategy: ${formData.brandName}` : 'Brand Strategy',
        plan: 'Brand Strategy',
        images_count: 0,
        status: 'pending',
        revenue: 25,
        revisions: 0,
        max_revisions: 0,
        attachments: { photos: [], has_strategy_addon: false },
        progress: 0,
        created_at: new Date().toISOString()
      }]).select().single();

      if (orderErr) throw orderErr;

      // Create brand strategy request
      await supabase.from("brand_strategy_requests").insert([{
        user_id: clientInfo.id,
        order_id: newOrder.id,
        status: "new",
        brand_data: formData,
        source: 'Standalone Request',
        tier: 'Brand Strategy',
        assigned_to: 'Raluca',
        created_at: new Date().toISOString()
      }]);

      // Checkout
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.id,
          price: 25,
          planName: 'Brand Strategy',
          customerEmail: clientInfo.email,
          customerName: clientInfo.name,
          billingCountry: clientInfo.country || 'US'
        })
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Failed to initialize checkout');
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("Failed to generate checkout link: no url returned");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting request: " + err.message);
      setIsSubmitting(false);
    }
  };

  // Find latest request with valid brand_data or brand_info
  const reqWithData = requests.find(r => (r.brand_data && Object.keys(r.brand_data).length > 0) || (r.brand_info && Object.keys(r.brand_info).length > 0));
  let savedLocal = null;
  try {
    const rawLocal = typeof window !== 'undefined' ? localStorage.getItem('tyes_brand_info') : null;
    if (rawLocal) savedLocal = JSON.parse(rawLocal);
  } catch (e) {}

  const activeBrandData = (reqWithData ? (reqWithData.brand_data || reqWithData.brand_info) : null) || savedLocal || {};

  const userRetailPresence = activeBrandData.retailPresence || activeBrandData.retail_presence || [];
  const brandCategory = activeBrandData.category || '';
  const brandPositioning = activeBrandData.positioning || '';
  const countriesSelling = activeBrandData.countriesSelling || activeBrandData.countriesSellingIn || activeBrandData.countries_selling || '';
  const countriesExpand = activeBrandData.countriesExpand || activeBrandData.countriesToExpand || activeBrandData.countries_expand || '';

  let mappedChannels = [];
  const isBeauty = ['Beauty', 'Personal Care', 'Fragrance'].includes(brandCategory);

  if (brandPositioning === 'Mass market') {
    mappedChannels = ['Mass Market Retail', 'Hyperstores', 'Marketplaces'];
    if (isBeauty) mappedChannels.push('Hyperpharmacies');
  } else if (brandPositioning === 'Masstige') {
    mappedChannels = ['Mass Market Retail', 'Premium Retail', 'Hyperstores', 'Marketplaces'];
    if (isBeauty) mappedChannels.push('Hyperpharmacies');
  } else if (brandPositioning === 'Premium') {
    mappedChannels = ['Premium Retail', 'Marketplaces'];
    if (isBeauty) mappedChannels.push('Hyperpharmacies'); // dermocosmetics
  } else if (brandPositioning === 'High-end') {
    mappedChannels = ['Premium Retail', 'Marketplaces'];
  } else {
    // Default fallback
    mappedChannels = ['Mass Market Retail', 'Premium Retail', 'Hyperstores', 'Marketplaces'];
    if (isBeauty) mappedChannels.push('Hyperpharmacies');
  }

  let coverageArray = [countriesSelling, countriesExpand].filter(Boolean);
  let coverageText = coverageArray.length > 0 ? coverageArray.join(' · ') : 'Not specified';

  const RETAIL_TYPES = [
    { num: '01', name: 'Mass Market Retail', label: 'Mass Market Retail' },
    { num: '02', name: 'Premium Retail', label: 'Premium Retail' },
    { num: '03', name: 'Hyperstores', label: 'Hyperstores' },
    { num: '04', name: 'Hyperpharmacies', label: 'Hyperpharmacies' },
    { num: '05', name: brandPositioning === 'High-end' ? 'Marketplaces (Selective)' : 'Marketplaces', label: 'Marketplaces' }
  ];

  const getStatusBadge = (status) => {
    if (!status) return { label: 'New', bg: 'rgba(251,191,36,0.15)', color: '#FBBF24' };
    const s = status.toLowerCase();
    if (s.includes('converted')) {
      return { label: 'Converted to Deep Dive', bg: 'rgba(167,139,250,0.15)', color: '#A78BFA' };
    }
    if (s === 'sent' || s === 'delivered' || s === 'completed') {
      return { label: 'Delivered', bg: 'rgba(45,212,191,0.15)', color: '#2DD4BF' };
    }
    const formatted = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { label: formatted, bg: 'rgba(251,191,36,0.15)', color: '#FBBF24' };
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, fontFamily: '"League Spartan", sans-serif' }}>Brand Strategy</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Free brand growth audit covering LLM visibility, viral SKU gaps, and retail distribution.</p>
      </div>

      {requests.length === 0 ? (
        <div style={{ background: '#0A0A0A', padding: '32px 24px', borderRadius: 6, margin: '16px 0', textAlign: 'center', border: '1px solid #141414' }}>
          <div style={{ fontSize: 10, letterSpacing: '3pt', color: '#2DD4BF', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Get Your First Snapshot</div>
          <div style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 800, marginBottom: 12, fontFamily: '"League Spartan", sans-serif' }}>You don't have a strategy yet.</div>
          <div style={{ fontSize: 13, color: '#B8B8B8', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.55 }}>
            Get a custom 3-5 page Snapshot in 3 business days. Free with any Campaign order · $25 add-on on Free Image · $25 standalone Brand Strategy tier.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => {
              localStorage.setItem('tyes_preselect_plan_name', 'Campaign 5');
              setPage('new-order');
            }} style={{ background: '#2DD4BF', color: '#0A0A0A', padding: '10px 24px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: '1.5px solid #2DD4BF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Start a Campaign 5 &rarr;
            </button>
            <button onClick={() => {
              localStorage.setItem('tyes_preselect_plan_name', 'Free Image');
              localStorage.setItem('tyes_preselect_strategy_addon', 'true');
              setPage('new-order');
            }} style={{ background: 'transparent', border: '1.5px solid #2DD4BF', color: '#2DD4BF', padding: '10px 24px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Add Strategy to Free Image ($25) &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section A: Status Hero */}
          <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.2)', padding: '20px 24px', borderRadius: 6 }}>
            <div style={{ fontSize: 16, color: '#fff', fontFamily: '"League Spartan", sans-serif' }}>
              You have <strong style={{ color: '#2DD4BF' }}>{delivered} Snapshots delivered</strong> &middot; {inProgress} in progress.
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
              Last updated: {lastUpdated}
              {activeBrandData?.brandName && ` · For ${activeBrandData.brandName}`}
              {activeBrandData?.category && ` · Category: ${activeBrandData.category}`}
            </div>
          </div>

          {/* Section E: Retail Network Access */}
          <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', padding: '24px', borderRadius: 6 }}>
            <div style={{ display: 'inline-block', background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', padding: '4px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: 12 }}>Unlocked with your Strategy</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: '"League Spartan", sans-serif' }}>Your <span style={{ color: '#2DD4BF' }}>Retail Network</span> access</div>
            <div style={{ fontSize: 11, color: '#B8B8B8', marginBottom: 20 }}>Based on your Brand Info, we've mapped which retail categories fit your brand. Deep Dive introductions target these buyers.</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 8 }}>
              {RETAIL_TYPES.map((rt, idx) => {
                const isPresent = userRetailPresence.some(p => typeof p === 'string' && (p.toLowerCase().trim() === rt.label.toLowerCase().trim() || p.toLowerCase().trim() === rt.name.toLowerCase().trim()));
                const isMapped = mappedChannels.includes(rt.label);
                const isActive = isPresent || isMapped;

                return (
                  <div key={idx} style={{ background: '#141414', borderLeft: isPresent ? '2px solid #2DD4BF' : (isMapped ? '2px solid #F97316' : '2px solid #222'), borderTop: '1px solid #222', borderRight: '1px solid #222', borderBottom: '1px solid #222', padding: '12px 16px', borderRadius: 4, color: isActive ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{rt.num} &middot; {rt.name}</span>
                      {isPresent ? (
                        <span style={{ fontSize: 9, background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Already present</span>
                      ) : isMapped ? (
                        <span style={{ fontSize: 9, background: 'rgba(249,115,22,0.15)', color: '#F97316', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Opportunity</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 12, fontWeight: 600 }}>Coverage: {coverageText}</div>
          </div>

          {/* Section C: My Snapshots Archive */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5pt', margin: 0, fontWeight: 700 }}>My Snapshots</h3>
              <button onClick={() => setShowStandaloneForm(!showStandaloneForm)} style={{ background: 'transparent', border: 'none', color: '#2DD4BF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {showStandaloneForm ? '- Close Request Form' : '+ Request another Snapshot ($25)'}
              </button>
            </div>

            {showStandaloneForm && (
              <div style={{ background: '#111', padding: '24px', borderRadius: 6, marginBottom: 16, border: '1px solid #222' }}>
                <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 16 }}>Request a New Snapshot</h3>
                <BrandInfoForm onComplete={handleStandaloneSubmit} hideSubmit={false} submitLabel="Submit Request ($25)" />
                {isSubmitting && <p style={{ color: '#2DD4BF', marginTop: 12 }}>Redirecting to secure checkout...</p>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requests.map(req => {
                const badgeInfo = getStatusBadge(req.status);
                const reqBrandName = req.brand_data?.brandName || req.brand_info?.brandName || 'Brand Strategy';
                return (
                  <div key={req.id} style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 6, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '0 0 6px', fontFamily: '"League Spartan", sans-serif' }}>{reqBrandName}</h4>
                      <div style={{ color: '#9ca3af', fontSize: 11, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{new Date(req.created_at).toLocaleDateString()} &middot; 3-5 pages</span>
                        <span style={{ background: badgeInfo.bg, color: badgeInfo.color, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5pt' }}>
                          {badgeInfo.label}
                        </span>
                      </div>
                    </div>
                    {req.delivered_pdf_url && (
                      <a href={`/api/strategy-pdf/${req.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>
                        Download PDF &darr;
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Deep Dive Upsell */}
          {delivered > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(10, 10, 10, 1))', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: 6, padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ maxWidth: 500 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, fontFamily: '"League Spartan", sans-serif', lineHeight: 1.2 }}>
                  Ready for more? The <span style={{ color: '#2DD4BF' }}>full playbook</span> that puts you in front of the buyer who says yes.
                </h2>
                <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Full LLM audit with implementation roadmap. Viral product concepts developed for your niche. Warm intros to retail buyers we know personally. 1-hour strategy call.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="/contact.html" style={{ padding: '12px 24px', background: '#2DD4BF', color: '#0A0A0A', fontWeight: 700, fontSize: 12, borderRadius: 999, textDecoration: 'none', border: '1.5px solid #2DD4BF', display: 'flex', alignItems: 'center' }}>
                  Contact Us &rarr;
                </a>
                <a href="#" onClick={openCalendly} style={{ padding: '12px 24px', background: 'transparent', border: '1.5px solid #2DD4BF', color: '#2DD4BF', fontWeight: 700, fontSize: 12, borderRadius: 999, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Book a Call &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
