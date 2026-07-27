import React, { useState, useEffect } from 'react';

const CATEGORIES = ["Beauty", "Personal Care", "Fragrance", "Fashion"];
const RETAIL_NETWORKS = ["Mass Market Retail", "Premium Retail", "Hyperstores", "Hyperpharmacies", "Marketplaces", "None yet"];
const SKU_OPTIONS = ["<10", "10-50", "50-200", "200+"];
const REVENUE_OPTIONS = ["<$50k", "$50-250k", "$250k-1M", "$1-5M", "$5M+"];
const BUDGET_OPTIONS = ["<$1k", "$1-5k", "$5-25k", "$25k+"];
const GOAL_OPTIONS = ["Grow D2C", "Expand retail", "New products", "New countries", "LLM presence", "Raise funding", "Other"];

export default function BrandInfoForm({ onComplete }) {
  const [formData, setFormData] = useState({
    brandName: '',
    website: '',
    category: '',
    skuCount: '',
    annualRevenue: '',
    marketingBudget: '',
    retailPresence: [],
    countriesSelling: '',
    distributors: '',
    // Bonus fields
    brandAge: '',
    countriesExpand: '',
    targetAudience: '',
    competitors: '',
    socialMedia: '',
    usp: '',
    goals: []
  });

  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tyes_brand_info');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    localStorage.setItem('tyes_brand_info', JSON.stringify(newData));
  };

  const toggleArrayItem = (field, item) => {
    const current = formData[field] || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    handleChange(field, updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brandName || !formData.website || !formData.category || !formData.skuCount || !formData.annualRevenue || !formData.marketingBudget || formData.retailPresence.length === 0 || !formData.countriesSelling) {
      alert("Please fill all required essential fields.");
      return;
    }
    onComplete(formData);
  };

  const labelStyle = { display: 'block', fontSize: 10, letterSpacing: '1pt', color: '#2DD4BF', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 };
  const inputStyle = { width: '100%', padding: '8px 12px', background: '#141414', border: '1px solid #333', borderRadius: 4, color: '#FFFFFF', fontSize: 11, boxSizing: 'border-box' };

  return (
    <div style={{ background: '#0A0A0A', padding: '20px 24px', borderRadius: 5 }}>
      <div style={{ color: '#2DD4BF', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>✦ Tell us about your brand</div>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 20 }}>So we can deliver your strategy snapshot in 3 business days.</div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Brand Name <span style={{ color: '#2DD4BF' }}>*</span></label>
          <input type="text" value={formData.brandName} onChange={(e) => handleChange('brandName', e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Website URL <span style={{ color: '#2DD4BF' }}>*</span></label>
          <input type="url" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} required placeholder="https://" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Category <span style={{ color: '#2DD4BF' }}>*</span></label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {CATEGORIES.map(c => (
              <span key={c} onClick={() => handleChange('category', c)} style={{ background: formData.category === c ? 'rgba(45,212,191,0.15)' : '#141414', border: `1px solid ${formData.category === c ? '#2DD4BF' : '#333'}`, color: formData.category === c ? '#2DD4BF' : '#B8B8B8', fontSize: 10, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontWeight: formData.category === c ? 700 : 400 }}>{c}</span>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Number of SKUs <span style={{ color: '#2DD4BF' }}>*</span></label>
          <select value={formData.skuCount} onChange={(e) => handleChange('skuCount', e.target.value)} required style={inputStyle}>
            <option value="" disabled>Select range ▼</option>
            {SKU_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Annual Revenue <span style={{ color: '#2DD4BF' }}>*</span></label>
          <select value={formData.annualRevenue} onChange={(e) => handleChange('annualRevenue', e.target.value)} required style={inputStyle}>
            <option value="" disabled>Select range ▼</option>
            {REVENUE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Marketing Budget / month <span style={{ color: '#2DD4BF' }}>*</span></label>
          <select value={formData.marketingBudget} onChange={(e) => handleChange('marketingBudget', e.target.value)} required style={inputStyle}>
            <option value="" disabled>Select range ▼</option>
            {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Current Retail Presence (multi-select) <span style={{ color: '#2DD4BF' }}>*</span></label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {RETAIL_NETWORKS.map(r => (
              <span key={r} onClick={() => toggleArrayItem('retailPresence', r)} style={{ background: formData.retailPresence.includes(r) ? 'rgba(45,212,191,0.15)' : '#141414', border: `1px solid ${formData.retailPresence.includes(r) ? '#2DD4BF' : '#333'}`, color: formData.retailPresence.includes(r) ? '#2DD4BF' : '#B8B8B8', fontSize: 10, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontWeight: formData.retailPresence.includes(r) ? 700 : 400 }}>{r}</span>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Countries You Sell In <span style={{ color: '#2DD4BF' }}>*</span></label>
          <input type="text" value={formData.countriesSelling} onChange={(e) => handleChange('countriesSelling', e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Existing Distributors</label>
          <input type="text" value={formData.distributors} onChange={(e) => handleChange('distributors', e.target.value)} style={inputStyle} />
        </div>

        {/* Collapsible Bonus Section */}
        <div style={{ marginTop: 12, border: "1px solid #F97316", borderRadius: 4, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setShowBonus(!showBonus)}
            style={{ width: "100%", padding: "12px 16px", background: "rgba(249, 115, 22, 0.05)", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "#F97316", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1pt' }}
          >
            <span>Optional: Sharpen the Snapshot</span>
            <span style={{ fontSize: 16 }}>{showBonus ? "−" : "+"}</span>
          </button>

          {showBonus && (
            <div style={{ padding: '16px', background: "rgba(249, 115, 22, 0.02)", display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>Brand Age (years)</label>
                <input type="number" value={formData.brandAge} onChange={(e) => handleChange('brandAge', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>Countries to expand to</label>
                <input type="text" value={formData.countriesExpand} onChange={(e) => handleChange('countriesExpand', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>Target customer</label>
                <textarea value={formData.targetAudience} onChange={(e) => handleChange('targetAudience', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>Top competitors</label>
                <textarea value={formData.competitors} onChange={(e) => handleChange('competitors', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>Social Media (IG/TT/YT)</label>
                <input type="text" value={formData.socialMedia} onChange={(e) => handleChange('socialMedia', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>USP / Brand Story</label>
                <textarea value={formData.usp} onChange={(e) => handleChange('usp', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#F97316' }}>6-12 month goals</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {GOAL_OPTIONS.map(g => (
                    <span key={g} onClick={() => toggleArrayItem('goals', g)} style={{ background: formData.goals?.includes(g) ? 'rgba(249,115,22,0.15)' : '#141414', border: `1px solid ${formData.goals?.includes(g) ? '#F97316' : '#333'}`, color: formData.goals?.includes(g) ? '#F97316' : '#B8B8B8', fontSize: 10, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontWeight: formData.goals?.includes(g) ? 700 : 400 }}>{g}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" style={{ padding: '12px', background: '#2DD4BF', color: '#0A0A0A', fontWeight: 700, border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 12, fontSize: 12, letterSpacing: '0.5pt' }}>
          Save Brand Info
        </button>
      </form>
    </div>
  );
}
