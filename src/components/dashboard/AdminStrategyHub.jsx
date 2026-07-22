import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Upload, Send, Flag, Eye } from 'lucide-react';

export default function AdminStrategyHub({ supabase, addToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');
  const [analytics, setAnalytics] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchAnalytics();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/strategy-requests');
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    const res = await fetch('/api/admin/strategy-analytics');
    const data = await res.json();
    setAnalytics(data);
  };

  const uploadPdfToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tyes_preset");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handlePdfUpload = async (id, file) => {
    setUploadingId(id);
    try {
      const pdfUrl = await uploadPdfToCloudinary(file);
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

  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div style={{ padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Brand Strategy Operations</h1>
      
      {/* Analytics Kpis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {['Total Requests', 'Pending Delivery', 'Upsell Value', 'Deep Dive %'].map((title, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
              {i === 0 ? analytics?.totalRequests || 0 :
               i === 1 ? analytics?.pendingDelivery || 0 :
               i === 2 ? `$${analytics?.totalUpsellRevenue || 0}` :
               `${analytics?.deepDiveConversionRate || 0}%`}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
        {['new', 'in_progress', 'sent'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: activeTab === tab ? '#2DD4BF' : 'transparent', color: activeTab === tab ? '#000' : '#9ca3af', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? <p>Loading requests...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>Date</th>
              <th style={{ padding: '12px 8px' }}>Brand / Client</th>
              <th style={{ padding: '12px 8px' }}>Tier</th>
              <th style={{ padding: '12px 8px' }}>Source</th>
              <th style={{ padding: '12px 8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', color: '#fff' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 8px', color: '#fff' }}>
                  <strong>{req.brand_data?.brandName || 'Unknown'}</strong><br />
                  <span style={{ color: '#9ca3af', fontSize: 11 }}>{req.users?.email}</span>
                </td>
                <td style={{ padding: '12px 8px', color: '#fff' }}>{req.tier}</td>
                <td style={{ padding: '12px 8px', color: '#fff' }}>{req.source}</td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    
                    {!req.delivered_pdf_url && (
                      <label style={{ cursor: 'pointer', color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Upload size={14} />
                        {uploadingId === req.id ? 'Uploading...' : 'Upload PDF'}
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handlePdfUpload(req.id, e.target.files[0])} />
                      </label>
                    )}

                    {req.delivered_pdf_url && req.status !== 'sent' && (
                      <button onClick={() => handleSendToClient(req.id)} disabled={sendingId === req.id} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Send size={14} /> {sendingId === req.id ? 'Sending...' : 'Send to Client'}
                      </button>
                    )}

                    {req.status === 'sent' && !req.is_deep_dive_flag && (
                      <button onClick={() => handleFlagDeepDive(req.id)} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Flag size={14} /> Flag for Deep Dive
                      </button>
                    )}

                    <button style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No requests in this status.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
