import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Upload, Send, Flag, Eye, ChevronDown, ChevronUp } from 'lucide-react';

const getPaymentStatus = (o) => {
  if (!o) return 'free';
  const rawPs = o.payment_status || o.attachments?.payment_status;
  if (rawPs === 'paid' || rawPs === 'completed' || rawPs === 'succeeded') return 'paid';
  if (rawPs === 'unpaid') return 'unpaid';
  if (rawPs === 'free') return 'free';
  const isCustom = o.plan?.includes('Custom') || o.is_custom || o.plan?.includes('Deep Dive');
  if (isCustom) return 'unpaid';
  const rev = Number(o.revenue || 0);
  if (rev > 0) return 'paid';
  return 'free';
};

const formatSource = (source) => {
  if (!source) return 'Unknown';
  if (source === 'checkout') return 'Client Checkout';
  if (source === 'manual') return 'Internal';
  if (source === 'standalone_25') return 'Standalone ($25)';
  if (source === 'Standalone Request') return 'Standalone ($25)';
  if (source === 'Order Add-on') return 'Order Add-on ($25)';
  if (source === 'custom') return 'Custom';
  
  if (source.includes('_addon_25')) {
    let plan = source.replace('_addon_25', '');
    plan = plan.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `${plan} Add-on`;
  }
  
  return source;
};

export default function AdminStrategyHub({ supabase, addToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [analytics, setAnalytics] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [statusChangingId, setStatusChangingId] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchAnalytics();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/strategy-requests');
    const json = await res.json();
    setRequests(json.data || []);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    const res = await fetch('/api/admin/strategy-analytics');
    const json = await res.json();
    setAnalytics(json.data || null);
  };

  const uploadPdfToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `strategy-requests/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('pdfs').upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      throw new Error(uploadError.message || "Failed to upload PDF to Supabase");
    }

    const { data } = supabase.storage.from('pdfs').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handlePdfUpload = async (id, file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Only PDF files are allowed', 'error');
      return;
    }

    setUploadingId(id);
    try {
      const pdfUrl = await uploadPdfToSupabase(file);
      const res = await fetch(`/api/admin/strategy-requests/${id}/upload-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl })
      });
      if (res.ok) {
        addToast('PDF uploaded successfully', 'success');
        fetchRequests();
      } else {
        addToast('Failed to upload PDF', 'error');
      }
    } catch (e) {
      addToast(e.message, 'error');
    }
    setUploadingId(null);
  };

  const handleSendToClient = async (id) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/admin/strategy-requests/${id}/send`, { method: 'POST' });
      if (res.ok) {
        addToast('PDF sent to client successfully', 'success');
        fetchRequests();
      } else {
        addToast('Failed to send PDF', 'error');
      }
    } catch (e) {
      addToast('Error sending PDF', 'error');
    }
    setSendingId(null);
  };

  const handleFlagDeepDive = async (id) => {
    try {
      const res = await fetch(`/api/admin/strategy-requests/${id}/flag-deep-dive`, { method: 'POST' });
      if (res.ok) {
        addToast('Flagged for Deep Dive (Internal Note)', 'success');
        fetchRequests();
      } else {
        addToast('Failed to flag', 'error');
      }
    } catch (e) {
      addToast('Error flagging', 'error');
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    setStatusChangingId(id);
    try {
      const res = await fetch(`/api/admin/strategy-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addToast(`Status changed to ${newStatus}`, 'success');
        fetchRequests();
      } else {
        addToast('Failed to change status', 'error');
      }
    } catch (e) {
      addToast('Error changing status', 'error');
    }
    setStatusChangingId(null);
  };

  const formatStatus = (status) => {
    switch(status) {
      case 'new': return { label: 'New', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)' };
      case 'in_progress': return { label: 'In Progress', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)' };
      case 'ready_to_send': return { label: 'Ready to Send', color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.1)' };
      case 'sent': return { label: 'Sent', color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
      case 'converted_to_deep_dive': return { label: 'Converted to Deep Dive', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' };
      case 'lost': return { label: 'Lost', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default: return { label: status || 'Unknown', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' };
    }
  };

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'ready_to_send', label: 'Ready to Send' },
    { id: 'sent', label: 'Sent' },
    { id: 'converted_to_deep_dive', label: 'Converted to Deep Dive' },
    { id: 'lost', label: 'Lost' }
  ];

  let filteredRequests = requests;
  if (activeTab !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.status === activeTab);
  }
  if (search) {
    const s = search.toLowerCase();
    filteredRequests = filteredRequests.filter(r => 
      (r.brand_info?.brandName || r.brand_data?.brandName || '').toLowerCase().includes(s) ||
      (r.profiles?.email || r.users?.email || '').toLowerCase().includes(s)
    );
  }
  
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  return (
    <div style={{ padding: '0 24px', fontFamily: '"Montserrat", sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24, fontFamily: '"League Spartan", sans-serif' }}>Strategy Requests</h1>
      
      {/* Analytics Kpis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {['Strategy Requests', 'Avg Delivery', 'Free → Paid', 'Strategy Revenue'].map((title, i) => (
          <div key={i} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: '#2DD4BF' }}>{i === 0 ? '✦' : i === 1 ? '⏱' : i === 2 ? '%' : '$'}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {i === 0 ? analytics?.totalRequests || 0 :
                 i === 1 ? `${analytics?.avgDeliveryDays || 0}d` :
                 i === 2 ? `${analytics?.freeToPaidConversion || 0}%` :
                 `$${analytics?.strategyRevenue || 0}`}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{title}</div>
            {i === 3 && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>$25 add-ons + standalones</div>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24, background: '#141414', borderRadius: 8, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 8, fontFamily: '"League Spartan", sans-serif' }}>Strategy Requests</h2>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>Manage incoming Brand Strategy Snapshots and Deep Dive bookings.</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TABS.map(tab => {
              const count = requests.filter(r => tab.id === 'all' || r.status === tab.id).length;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab(tab.id); }} 
                  style={{ 
                    padding: '6px 12px', 
                    background: isActive ? '#fff' : 'transparent', 
                    color: isActive ? '#000' : '#9ca3af', 
                    borderRadius: 4, 
                    border: 'none', 
                    fontWeight: 600, 
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Search brand or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', fontSize: 12 }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? <p style={{ color: '#888', fontSize: 13 }}>Loading requests...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Brand</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Client</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Tier</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Assigned</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payment</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map(req => {
                const brandInfo = req.brand_info || req.brand_data || {};
                const sFormat = formatStatus(req.status);
                const isExpanded = expandedRow === req.id;
                
                return (
                  <React.Fragment key={req.id}>
                    <tr onClick={() => {
                        if (isExpanded) {
                          setExpandedRow(null);
                        } else {
                          setExpandedRow(req.id);
                        }
                      }} style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '12px 8px', color: '#2DD4BF', fontWeight: 700, fontFamily: '"League Spartan", sans-serif', fontSize: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {brandInfo.brandName || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>
                        <div>{req.profiles?.full_name || req.orders?.customer_name || 'Unknown'}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{req.profiles?.email || req.orders?.customer_email || 'No email'}</div>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>
                        {req.order_id || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>{formatSource(req.source)}</td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>{brandInfo.category || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>{req.tier || 'Standard'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: sFormat.bg, color: sFormat.color }}>
                          {sFormat.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>Raluca (auto)</td>
                      <td style={{ padding: '12px 8px' }}>
                        {(() => {
                          const payStatus = getPaymentStatus(req.orders);
                          const payText = payStatus === 'paid' ? 'Paid' : payStatus === 'unpaid' ? 'Pending' : 'Free';
                          const payColor = payStatus === 'paid' ? '#34d399' : payStatus === 'unpaid' ? '#fbbf24' : '#9ca3af';
                          const payBg = payStatus === 'paid' ? 'rgba(52, 211, 153, 0.1)' : payStatus === 'unpaid' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(156, 163, 175, 0.1)';
                          
                          return (
                            <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: payBg, color: payColor }}>
                              {payText}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#fff' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                    </tr>
                    
                    {/* Detail View */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td colSpan="10" style={{ padding: '0 24px 24px 24px' }}>
                          <div style={{ background: '#0A0A0A', padding: '20px 24px', borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: sFormat.color, letterSpacing: '2pt', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Status · {sFormat.label}</div>
                            <div style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 700, fontFamily: '"League Spartan", sans-serif', marginBottom: 8 }}>{brandInfo.brandName || 'Unknown'} · Strategy Request</div>
                            <div style={{ fontSize: 11, color: '#888', marginBottom: 20 }}>Submitted {new Date(req.created_at).toLocaleDateString()} · From Order {req.order_id || 'N/A'} ({req.tier}) · {req.profiles?.full_name || req.orders?.customer_name || 'Unknown'} ({req.profiles?.email || req.orders?.customer_email || 'No email'})</div>

                            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 16, marginBottom: 16 }}>
                              <div style={{ fontSize: 10, letterSpacing: '2pt', color: '#2DD4BF', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Essential Brand Info</div>
                              <div style={{ fontSize: 12, color: '#C8C8C8', lineHeight: 1.75 }}>
                                <strong style={{color:'#FFFFFF'}}>Brand:</strong> {brandInfo.brandName}<br/>
                                <strong style={{color:'#FFFFFF'}}>Website:</strong> {brandInfo.website}<br/>
                                <strong style={{color:'#FFFFFF'}}>Category:</strong> {brandInfo.category}<br/>
                                <strong style={{color:'#FFFFFF'}}>SKUs:</strong> {brandInfo.skus || brandInfo.skuCount}<br/>
                                <strong style={{color:'#FFFFFF'}}>Annual revenue:</strong> {brandInfo.revenue || brandInfo.annualRevenue}<br/>
                                <strong style={{color:'#FFFFFF'}}>Marketing budget:</strong> {brandInfo.budget || brandInfo.marketingBudget}<br/>
                                <strong style={{color:'#FFFFFF'}}>Countries selling:</strong> {brandInfo.countries || brandInfo.countriesSelling}<br/>
                                <strong style={{color:'#FFFFFF'}}>Retail presence:</strong> {Array.isArray(brandInfo.retailPresence) ? brandInfo.retailPresence.join(' · ') : brandInfo.retailPresence}<br/>
                                <strong style={{color:'#FFFFFF'}}>Distributors:</strong> {brandInfo.distributors}
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 16, marginBottom: 16 }}>
                              <div style={{ fontSize: 10, letterSpacing: '2pt', color: '#FBBF24', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Bonus Info (if provided)</div>
                              <div style={{ fontSize: 12, color: '#C8C8C8', lineHeight: 1.75 }}>
                                <strong style={{color:'#FFFFFF'}}>Brand age:</strong> {brandInfo.brandAge || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>Expand to:</strong> {brandInfo.expandTo || brandInfo.countriesExpand || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>Target customer:</strong> {brandInfo.targetCustomer || brandInfo.targetAudience || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>Competitors:</strong> {brandInfo.competitors || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>Social:</strong> {brandInfo.socials || brandInfo.socialMedia || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>USP:</strong> {brandInfo.usp || 'N/A'}<br/>
                                <strong style={{color:'#FFFFFF'}}>Goals:</strong> {brandInfo.goals?.length ? brandInfo.goals.join(', ') : 'N/A'}
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 16 }}>
                              <div style={{ fontSize: 10, letterSpacing: '2pt', color: '#2DD4BF', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Admin Actions</div>
                              <div style={{ fontSize: 10, color: '#B8B8B8', marginBottom: 12, fontFamily: '"Montserrat", sans-serif' }}>Auto-assigned to <strong style={{ color: '#FFFFFF' }}>Raluca — Brand Growth &amp; AI Strategy Lead</strong>. No &quot;assign strategist&quot; step — she is the only strategist.</div>

                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                
                                <select 
                                  value={req.status} 
                                  onChange={(e) => handleChangeStatus(req.id, e.target.value)}
                                  disabled={statusChangingId === req.id}
                                  style={{ background: 'transparent', border: '1.5px solid #2DD4BF', color: '#2DD4BF', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="new" style={{ color: '#000' }}>Status: New</option>
                                  <option value="in_progress" style={{ color: '#000' }}>Status: In Progress</option>
                                  <option value="ready_to_send" style={{ color: '#000' }}>Status: Ready to Send</option>
                                  <option value="sent" style={{ color: '#000' }}>Status: Sent</option>
                                  <option value="converted_to_deep_dive" style={{ color: '#000' }}>Status: Converted to Deep Dive</option>
                                  <option value="lost" style={{ color: '#000' }}>Status: Lost</option>
                                </select>

                                <label style={{ background: 'transparent', border: '1.5px solid #2DD4BF', color: '#2DD4BF', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  {uploadingId === req.id ? 'Uploading...' : (req.delivered_pdf_url ? 'Update PDF' : 'Upload PDF')}
                                  <input type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={(e) => handlePdfUpload(req.id, e.target.files[0])} />
                                </label>

                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSendToClient(req.id); }} disabled={sendingId === req.id || req.status === 'sent'} style={{ background: req.status === 'sent' ? '#333' : '#2DD4BF', border: 'none', color: req.status === 'sent' ? '#888' : '#0A0A0A', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: req.status === 'sent' ? 'not-allowed' : 'pointer' }}>
                                  {sendingId === req.id ? 'Sending...' : 'Send to client'}
                                </button>

                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFlagDeepDive(req.id); }} disabled={req.status === 'converted_to_deep_dive'} style={{ background: 'transparent', border: '1.5px solid #FBBF24', color: '#FBBF24', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: req.status === 'converted_to_deep_dive' ? 0.5 : 1 }}>
                                  Flag for Deep Dive nudge
                                </button>

                                {req.delivered_pdf_url && (
                                  <a href={req.delivered_pdf_url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                                    View PDF
                                  </a>
                                )}

                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <button 
              type="button"
              disabled={currentPage === 1}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentPage(prev => prev - 1); }}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: currentPage === 1 ? '#4b5563' : '#fff', borderRadius: 8, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', fontSize: 12 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              type="button"
              disabled={currentPage === totalPages}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: currentPage === totalPages ? '#4b5563' : '#fff', borderRadius: 8, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
