"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Search, Bell, ChevronDown, ChevronRight, Download, MoreVertical, Plus, Edit, Trash2, Eye, Check, X, Clock, RefreshCw, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Image, Settings, LogOut, Home, Package, CreditCard, BarChart2, UserCheck, Star, AlertCircle, ArrowUpRight, ArrowDownRight, Menu, ChevronLeft, Save, Mail, Globe, Zap, Shield, Key, Webhook, User, Upload, Target } from "lucide-react";
import AdminStrategyHub from "@/components/dashboard/AdminStrategyHub";

// TOAST NOTIFICATION 
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
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

// MODAL SYSTEM
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

// DROPDOWN MENU
const Dropdown = ({ items, onClose, up }) => (
  <div style={{ position: "absolute", right: 0, [up ? "bottom" : "top"]: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginBottom: up ? 8 : 0, marginTop: up ? 0 : 8 }}>
    {items.map((item, i) => item.divider ? (
      <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
    ) : (
      <button key={i} onClick={() => { item.action(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", borderRadius: 6, textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        {item.icon && <item.icon size={13} />}
        {item.label}
      </button>
    ))}
  </div>
);

// MOCK DATA
const initPlans = [
  { id: 0, name: "Free Test", images: 1, price: 0, active: true },
  { id: 1, name: "Single", images: 1, price: 10, active: true },
  { id: 2, name: "Starter", images: 5, price: 45, active: true },
  { id: 3, name: "Growth", images: 10, price: 80, active: true },
  { id: 4, name: "Social Media Pack", images: 7, price: 55, active: true },
  { id: 5, name: "Custom / Enterprise", images: 0, price: 0, active: true },
];
// HELPERS
const statusConfig = {
  pending: { label: "Pending", bg: "rgba(107,114,128,0.15)", color: "#9ca3af", icon: Clock },
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", icon: Clock },
  revision: { label: "Revision", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", icon: RefreshCw },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  delivered: { label: "Delivered", bg: "rgba(78,205,196,0.15)", color: "#4ecdc4", icon: Package },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  cancelled: { label: "Cancelled", bg: "rgba(239,68,68,0.15)", color: "#ef4444", icon: X },
};
const tierColors = { free: "#6b7280", starter: "#60a5fa", pro: "#4ecdc4", enterprise: "#f472b6" };
const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

const getPaymentStatus = (o) => {
  if (!o) return 'free';
  const rawPs = o.payment_status || o.attachments?.payment_status;
  if (rawPs === 'paid' || rawPs === 'completed' || rawPs === 'succeeded') return 'paid';
  if (rawPs === 'unpaid') return 'unpaid';
  if (rawPs === 'free') return 'free';

  const isCustom = o.plan?.includes('Custom') || o.is_custom || o.plan?.includes('Deep Dive');
  if (isCustom) {
    return 'unpaid';
  }

  const rev = Number(o.revenue || 0);
  if (rev <= 0) return 'free';

  // Regular paid plans (Single, Starter, Pro, Campaign 5, Campaign 10, etc.) are paid at checkout
  return 'paid';
};

// SHARED COMPONENTS
const StatusBadge = ({ status }) => {
  const c = statusConfig[status] || statusConfig.pending;
  const I = c.icon || Clock;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>
      <I size={11} /> {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, change, positive, sub, onClick }) => (
  <div 
    onClick={onClick}
    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 200, cursor: onClick ? "pointer" : "default", transition: "all 0.2s" }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color="#fff" /></div>
      {change && <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, color: positive ? "#34d399" : "#f87171" }}>{positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {change}</span>}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{sub}</div>}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#6b7280", background: active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent", transition: "all 0.2s", justifyContent: collapsed ? "center" : "flex-start" }} onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)" }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
    <Icon size={17} style={{ flexShrink: 0 }} />{!collapsed && label}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>{label}</label>
    <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
  </div>
);

// PAGES

const DashboardPage = ({ toast, goTo, orders, users, strategyRequests }) => {
  // 1. Core Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.revenue || 0), 0);
  const totalImages = orders.reduce((sum, o) => sum + (o.images || 0), 0);
  const activeClients = users.length;

  // 2. Revenue Trend (Monthly)
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = orders.reduce((acc, o) => {
    const d = new Date(o.created_at);
    const m = d.toLocaleString('default', { month: 'short' });
    if (!acc[m]) acc[m] = { month: m, revenue: 0, orders: 0, sortKey: d.getMonth() };
    acc[m].revenue += (o.revenue || 0);
    acc[m].orders += 1;
    return acc;
  }, {});
  const dynRevenueData = Object.values(monthlyMap).sort((a, b) => a.sortKey - b.sortKey);

  // 3. Orders by Category
  const categoryStats = orders.reduce((acc, o) => {
    const cat = o.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const dynCategoryData = Object.entries(categoryStats).map(([name, count], i) => ({
    name,
    value: Math.round((count / orders.length) * 100) || 0,
    color: ["#4ecdc4", "#ec4899", "#fbbf24", "#60a5fa", "#c084fc", "#34d399"][i % 6]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // 4. Weekly Activity (Last 7 Days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { name: dayNames[d.getDay()], dateStr: d.toISOString().split('T')[0], orders: 0 };
  });

  orders.forEach(o => {
    const oDate = o.created_at.split('T')[0];
    const dayMatch = last7Days.find(d => d.dateStr === oDate);
    if (dayMatch) dayMatch.orders += 1;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Dashboard</h1><p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Welcome back. Here's what's happening today.</p></div>

      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(totalRevenue)} sub="Direct from database" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={orders.length} sub={`${orders.filter(o => o.status === 'completed' || o.status === 'delivered').length} completed`} />
        <StatCard icon={Users} label="Total Clients" value={activeClients} sub="Registered users" />
        <StatCard icon={Image} label="Images Delivered" value={totalImages} sub="Across all orders" />
        <StatCard 
          icon={Target} 
          label="Strategy Requests" 
          value={strategyRequests?.length || 0} 
          sub={`${strategyRequests?.filter(r => r.status === 'new' || r.status === 'pending').length || 0} pending`} 
          onClick={() => goTo('brand-strategy')} 
        />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Revenue Trend</h3>
            <span style={{ fontSize: 11, color: "#6b7280" }}>Historical Growth</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dynRevenueData.length ? dynRevenueData : [{ month: "No data", revenue: 0 }]}>
              <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.3} /><stop offset="100%" stopColor="#4ecdc4" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="revenue" stroke="#4ecdc4" fill="url(#gr)" strokeWidth={2.5} dot={{ fill: "#4ecdc4", r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 260, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Orders by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={dynCategoryData.length ? dynCategoryData : [{ name: "No Data", value: 1, color: "rgba(255,255,255,0.05)" }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                {dynCategoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {dynCategoryData.length ? dynCategoryData.map((d, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9ca3af" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                {d.name} ({d.value}%)
              </span>
            )) : <span style={{ fontSize: 11, color: "#6b7280" }}>No categories found</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
              <Bar dataKey="orders" fill="#4ecdc4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 260, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.slice(0, 5).map((o, i) => {
              const conf = statusConfig[o.status] || statusConfig.pending;
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: conf.color }} />
                  <div><div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>{conf.label}: {o.id}</div><div style={{ fontSize: 11, color: "#6b7280" }}>From {o.customer}</div><div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{o.date}</div></div>
                </div>
              );
            })}
            {orders.length === 0 && <p style={{ fontSize: 12, color: "#4b5563" }}>No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = ({ orders, setOrders, toast, goTo, supabase, targetOrder, setTargetOrder }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (targetOrder) {
      setViewOrder(targetOrder);
      if (setTargetOrder) setTargetOrder(null);
    }
  }, [targetOrder, setTargetOrder]);

  useEffect(() => {
    if (viewOrder) {
      setPriceInput(viewOrder.revenue !== undefined ? String(viewOrder.revenue) : "0");
    }
  }, [viewOrder]);

  const updateOrderPrice = async (orderId, newPrice) => {
    try {
      const numericPrice = parseFloat(newPrice) || 0;
      const targetOrderObj = orders.find(o => o.id === orderId) || viewOrder;
      const newPayStatus = numericPrice > 0 ? 'unpaid' : 'free';
      const newStatus = targetOrderObj?.status;
      const updatedAttachments = { ...(targetOrderObj?.attachments || {}), payment_status: newPayStatus };

      const { error } = await supabase
        .from('orders')
        .update({
          revenue: numericPrice,
          status: newStatus,
          attachments: updatedAttachments
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, revenue: numericPrice, payment_status: newPayStatus, attachments: updatedAttachments, status: newStatus } : o));
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, revenue: numericPrice, payment_status: newPayStatus, attachments: updatedAttachments, status: newStatus });
      }
      toast(`Order price updated to $${numericPrice}`);
    } catch (err) {
      console.error("Price update error:", err);
      toast(err.message || "Failed to update price", "error");
    }
  };

  const togglePaymentStatus = async (orderId, newStatus) => {
    try {
      const targetOrderObj = orders.find(o => o.id === orderId) || viewOrder;
      const updatedAttachments = { ...(targetOrderObj?.attachments || {}), payment_status: newStatus };

      const { error } = await supabase
        .from('orders')
        .update({ attachments: updatedAttachments })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus, attachments: updatedAttachments } : o));
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, payment_status: newStatus, attachments: updatedAttachments });
      }
      toast(`Payment status marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Payment status error:", err);
      toast(err.message || "Failed to update payment status", "error");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, status: 'cancelled' });
      }
      toast("Order cancelled", "warning");
    } catch (err) {
      console.error("Cancel order error:", err);
      toast("Failed to cancel order", "error");
    }
  };

  const filtered = orders
    .filter(o => {
      if (filter !== "all" && o.status !== filter) return false;
      const searchLow = search.toLowerCase();
      const customerMatch = o.customer && o.customer.toLowerCase().includes(searchLow);
      const idMatch = o.id && o.id.toString().toLowerCase().includes(searchLow);
      if (search && !customerMatch && !idMatch) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    revision: orders.filter(o => o.status === "revision").length,
    completed: orders.filter(o => o.status === "completed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    approved: orders.filter(o => o.status === "approved").length
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          progress: newStatus === "delivered" || newStatus === "completed" ? 100 : undefined
        })
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, progress: newStatus === "delivered" ? 100 : newStatus === "completed" ? 100 : o.progress } : o));
      toast(`${id} marked as ${statusConfig[newStatus].label}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      toast("Failed to update status", "error");
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== id));
      toast(`${id} deleted`, "warning");
    } catch (err) {
      console.error("Error deleting order:", err);
      toast("Failed to delete order", "error");
    }
  };

  const uploadFinishImage = async (orderId, itemIndex, file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast("Cloudinary not configured", "error");
      return;
    }

    toast("Uploading delivery...", "info");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      const url = data.secure_url;

      if (!url) throw new Error("Upload failed");

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const newItems = [...(order.items || [])];
      newItems[itemIndex] = { ...newItems[itemIndex], finishImage: url, status: "delivered", revisionReason: null, revisionDate: null };

      const allDelivered = newItems.every(i => i.status === "delivered" || i.status === "completed");
      const newOrderStatus = allDelivered ? "delivered" : "in_progress";
      const newProgress = allDelivered ? 100 : Math.round((newItems.filter(i => i.status === "delivered" || i.status === "completed").length / newItems.length) * 100);

      const { error } = await supabase
        .from('orders')
        .update({
          items: newItems,
          status: newOrderStatus,
          progress: newProgress
        })
        .eq('id', orderId);

      if (error) throw error;

      const updateFunc = (prev) => prev.map(o => o.id === orderId ? { ...o, items: newItems, status: newOrderStatus, progress: newProgress } : o);
      setOrders(updateFunc);
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, items: newItems, status: newOrderStatus, progress: newProgress });
      }

      toast("Item delivered!");
    } catch (err) {
      console.error("Delivery error:", err);
      toast("Failed to deliver image", "error");
    }
  };

  return (
    <div>
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.id}`} width={520}>
        {viewOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Client", viewOrder.customer],
              ["Email", viewOrder.email],
              ["Plan", viewOrder.plan],
              ["Category", viewOrder.category],
              ["Images", viewOrder.images],
              ["Revisions", viewOrder.revisions],
              ["Revenue", viewOrder.revenue > 0 ? `$${viewOrder.revenue}` : (viewOrder.plan?.includes('Custom') || viewOrder.is_custom || viewOrder.plan?.includes('Deep Dive')) ? "Quote Pending" : "Free"],
              ["Payment Status", getPaymentStatus(viewOrder).toUpperCase()],
              ["Date", viewOrder.date]
            ].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 13, color: k === "Payment Status" ? (v === "PAID" ? "#34d399" : v === "UNPAID" ? "#fbbf24" : "#9ca3af") : "#e5e7eb", fontWeight: k === "Payment Status" ? 700 : 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Status</span>
              <StatusBadge status={viewOrder.status} />
            </div>
            <div style={{ marginTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Progress</span><span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{viewOrder.progress}%</span></div><div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}><div style={{ width: `${viewOrder.progress}%`, height: "100%", borderRadius: 4, background: viewOrder.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} /></div></div>

            {(viewOrder.brief_description || viewOrder.mood_description) && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Brief / Description</span>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, fontSize: 13, color: "#d1d5db", lineHeight: "1.6" }}>
                  {viewOrder.brief_description || viewOrder.mood_description}
                </div>
              </div>
            )}

            {viewOrder.selected_styles && viewOrder.selected_styles.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Selected Styles</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {viewOrder.selected_styles.map((s, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(78,205,196,0.1)", color: "#4ecdc4", fontSize: 10, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Images */}
            {((viewOrder.reference_images && viewOrder.reference_images.length > 0) || (viewOrder.attachments?.reference_images && viewOrder.attachments.reference_images.length > 0)) && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Reference Images</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(viewOrder.reference_images || viewOrder.attachments?.reference_images || []).map((url, i) => (
                    <div key={i} onClick={() => window.open(url, '_blank')} style={{ width: 80, height: 80, borderRadius: 10, background: `url(${url}) center/cover`, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            )}

            {/* Fonts / Labels */}
            {((viewOrder.font_label_files && viewOrder.font_label_files.length > 0) || (viewOrder.attachments?.fonts_labels && viewOrder.attachments.fonts_labels.length > 0)) && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Fonts / Labels</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(viewOrder.font_label_files || viewOrder.attachments?.fonts_labels || []).map((url, i) => (
                    <div key={i} onClick={() => window.open(url, '_blank')} style={{ width: 80, height: 80, borderRadius: 10, background: `url(${url}) center/cover`, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {!url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && <span style={{ fontSize: 10, color: "#6b7280" }}>File {i + 1}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Photos */}
            {viewOrder.attachments?.photos && viewOrder.attachments.photos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Original Product Photos</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {viewOrder.attachments.photos.map((url, i) => (
                    <div key={i} onClick={() => window.open(url, '_blank')} style={{ width: 80, height: 80, borderRadius: 10, background: `url(${url}) center/cover`, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN PRICING & PAYMENT CONTROLS (ONLY FOR CUSTOM ORDERS) */}
            {(viewOrder.plan?.includes('Custom') || viewOrder.is_custom || viewOrder.plan?.includes('Deep Dive')) && (
              <div style={{ marginTop: 16, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Order Pricing & Controls</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Set Custom Quote / Price ($)</label>
                    <input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, outline: "none" }}
                      placeholder="e.g. 350"
                    />
                  </div>
                  <button
                    onClick={() => updateOrderPrice(viewOrder.id, priceInput)}
                    style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Save Price
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Payment: </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: viewOrder.payment_status === 'paid' ? "#34d399" : "#fbbf24" }}>
                      {(viewOrder.payment_status || (viewOrder.revenue > 0 ? 'unpaid' : 'free')).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => togglePaymentStatus(viewOrder.id, viewOrder.payment_status === 'paid' ? 'unpaid' : 'paid')}
                      style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      {viewOrder.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>

                    {viewOrder.status !== 'cancelled' ? (
                      <button
                        onClick={() => cancelOrder(viewOrder.id)}
                        style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Quick Status:</span>
              {Object.keys(statusConfig).map(s => <button key={s} onClick={() => { updateStatus(viewOrder.id, s); setViewOrder({ ...viewOrder, status: s }); }} style={{ padding: "4px 10px", borderRadius: 16, border: `1px solid ${statusConfig[s].color}33`, background: viewOrder.status === s ? statusConfig[s].bg : "transparent", color: statusConfig[s].color, fontSize: 11, cursor: "pointer" }}>{statusConfig[s].label}</button>)}
            </div>

            {viewOrder.items && viewOrder.items.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Order Items</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {viewOrder.items.map((item, i) => (
                    <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                      <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                        <span>{item.name}</span>
                        {item.finishImage && <Check size={14} color="#34d399" />}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <div onClick={() => window.open(item.mainImage, '_blank')} style={{ flex: 1, height: 60, borderRadius: 8, background: `url(${item.mainImage}) center/cover`, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", position: "relative" }} title="Original Image">
                          <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 8, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "1px 4px", borderRadius: 4 }}>ORIGINAL</span>
                        </div>
                        <div style={{ flex: 1, height: 60, borderRadius: 8, background: `url(${item.finishImage || ''}) center/cover`, border: item.finishImage ? "1px solid rgba(52,211,153,0.3)" : "1px dashed rgba(255,255,255,0.1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} title={item.finishImage ? "Replace Delivery" : "Upload Delivery"}>
                          {!item.finishImage && <Upload size={14} color="#6b7280" />}
                          {item.finishImage && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                              <RefreshCw size={14} color="#fff" />
                              <div style={{ position: "absolute", bottom: 2, left: 4, fontSize: 8, color: "#fff", background: "#34d399", padding: "1px 4px", borderRadius: 4 }}>REPLACE</div>
                            </div>
                          )}
                          {!item.finishImage && (
                            <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 8, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "1px 4px", borderRadius: 4 }}>
                              DELIVER
                            </span>
                          )}
                          <input
                            type="file"
                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                            onChange={(e) => e.target.files[0] && uploadFinishImage(viewOrder.id, i, e.target.files[0])}
                            accept="image/*"
                            title={item.finishImage ? "Replace Delivered Image" : "Upload Finished Image"}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StatusBadge status={item.status} />
                        {!item.finishImage && <span style={{ fontSize: 10, color: "#6b7280" }}>Click + to deliver</span>}
                      </div>

                      {item.status === "revision" && item.revisionReason && (
                        <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <AlertCircle size={10} color="#fbbf24" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>Revision Requested</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#d1d5db", lineHeight: "1.4", fontStyle: "italic" }}>
                            "{item.revisionReason}"
                          </div>
                          {item.revisionDate && <div style={{ fontSize: 9, color: "#4b5563", marginTop: 4 }}>Requested on {new Date(item.revisionDate).toLocaleDateString()}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>


      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "pending", "in_progress", "revision", "completed", "delivered"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: filter === s ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)",
              background: filter === s ? "rgba(78,205,196,0.15)" : "transparent",
              color: filter === s ? "#4ecdc4" : "#6b7280",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {s === "all" ? "All" : statusConfig[s]?.label} ({counts[s] || 0})
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16, position: "relative" }}><Search size={14} style={{ position: "absolute", left: 12, top: 10, color: "#4b5563" }} /><input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search orders or clients..." style={{ width: "100%", maxWidth: 360, padding: "8px 12px 8px 34px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none" }} /></div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "visible" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{["Order", "Client", "Plan", "Imgs", "Status", "Progress", "Revenue", "Payment", "Date", ""].map((h, i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{paginatedOrders.map((o, idx) => (
            <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#7dd8d0", fontWeight: 600, cursor: "pointer" }} onClick={() => setViewOrder(o)}>{o.id}</td>
              <td style={{ padding: "12px 16px" }}><div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{o.customer}</div><div style={{ fontSize: 11, color: "#4b5563" }}>{o.category}</div></td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>
                {o.plan}
                {(o.plan?.includes('Custom') || o.is_custom) && (
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontWeight: 700, marginLeft: 6 }}>Custom Order</span>
                )}
              </td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{o.images}</td>
              <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
              <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ width: `${o.progress}%`, height: "100%", borderRadius: 2, background: o.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} /></div><span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{o.progress}%</span></div></td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: o.revenue > 0 ? "#34d399" : (o.plan?.includes('Custom') || o.is_custom || o.plan?.includes('Deep Dive')) ? "#fbbf24" : "#4b5563", fontWeight: 600 }}>{o.revenue > 0 ? `$${o.revenue}` : (o.plan?.includes('Custom') || o.is_custom || o.plan?.includes('Deep Dive')) ? "Quote Pending" : "Free"}</td>
              <td style={{ padding: "12px 16px" }}>
                {(() => {
                  const pStatus = getPaymentStatus(o);
                  const isPaid = pStatus === 'paid';
                  const isUnpaid = pStatus === 'unpaid';
                  return (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: isPaid ? "rgba(16,185,129,0.15)" : isUnpaid ? "rgba(251,191,36,0.15)" : "rgba(107,114,128,0.15)",
                      color: isPaid ? "#34d399" : isUnpaid ? "#fbbf24" : "#9ca3af"
                    }}>
                      {pStatus.toUpperCase()}
                    </span>
                  );
                })()}
              </td>
              <td style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280" }}>{o.date}</td>
              <td style={{ padding: "12px 16px", position: "relative" }}>
                <button onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4 }}><MoreVertical size={14} /></button>
                {menuOpen === o.id && <Dropdown onClose={() => setMenuOpen(null)} up={idx > 4} items={[
                  { icon: Eye, label: "View Details", action: () => setViewOrder(o) },
                  // { icon: Mail, label: "Email Client", action: () => toast(`Email draft opened for ${o.customer}`, "info") },
                  { divider: true },
                  { icon: Clock, label: "Mark In Progress", action: () => updateStatus(o.id, "in_progress") },
                  { icon: RefreshCw, label: "Mark Revision", action: () => updateStatus(o.id, "revision") },
                  { icon: Check, label: "Mark Completed", action: () => updateStatus(o.id, "completed") },
                  { icon: Package, label: "Mark Delivered", action: () => updateStatus(o.id, "delivered") },
                  { divider: true },
                  { icon: Trash2, label: "Delete Order", action: () => deleteOrder(o.id), danger: true },
                ]} />}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {paginatedOrders.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#4b5563", fontSize: 13 }}>No orders found.</div>}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: "#4b5563" }}>
            Showing <span style={{ color: "#9ca3af" }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: "#9ca3af" }}>{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span style={{ color: "#9ca3af" }}>{filtered.length}</span> orders
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: currentPage === 1 ? "#374151" : "#9ca3af", fontSize: 12, cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <ChevronLeft size={14} /> Previous
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
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersPage = ({ users, setUsers, toast, supabase }) => {
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  // Only show users with the 'client' role on this page
  const clients = users.filter(u => u.role === "client");
  const filtered = clients.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedClients = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      toast(`${user.name} marked as ${newStatus}`);
    } catch (err) {
      console.error("Error toggling user status:", err);
      toast("Failed to update user", "error");
    }
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      toast("No data to export", "warning");
      return;
    }
    const headers = ["Name", "Email", "Tier", "Orders", "Spent", "Joined", "Status"];
    const rows = users.map(u => [
      `"${u.name}"`,
      `"${u.email}"`,
      u.tier,
      u.orders,
      u.spent,
      u.joined,
      u.status
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tyes_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Client data exported successfully");
  };

  const counts = {
    total: clients.length,
    active: clients.filter(u => u.status === "active").length,
    enterprise: clients.filter(u => u.tier === "enterprise" || u.tier === "pro").length,
    revenue: clients.reduce((a, u) => a + (u.spent || 0), 0)
  };

  return (
    <div>
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser?.name} width={460}>
        {viewUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["Email", viewUser.email], ["Tier", viewUser.tier], ["Orders", viewUser.orders], ["Total Spent", viewUser.spent > 0 ? `$${viewUser.spent.toLocaleString()}` : "$0"], ["Joined", viewUser.joined], ["Status", viewUser.status]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, textTransform: k === "Tier" || k === "Status" ? "capitalize" : "none" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => { toggleStatus(viewUser.id); setViewUser(prev => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" })); }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: viewUser.status === "active" ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: viewUser.status === "active" ? "#f87171" : "#34d399", fontSize: 12, cursor: "pointer", flex: 1 }}
              >
                {viewUser.status === "active" ? "Block Client" : "Unblock Client"}
              </button>
              <button onClick={() => { toast(`Email draft opened for ${viewUser.name}`, "info"); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", flex: 1 }}>Send Email</button>
            </div>
          </div>
        )}
      </Modal>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Clients</h1>
        <button onClick={exportToCSV} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={13} /> Export CSV</button>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard icon={Users} label="Total Clients" value={counts.total} />
        <StatCard icon={UserCheck} label="Active" value={counts.active} />
        <StatCard icon={Star} label="Enterprise" value={counts.enterprise} />
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(counts.revenue)} />
      </div>
      <div style={{ marginBottom: 16, position: "relative" }}><Search size={14} style={{ position: "absolute", left: 12, top: 10, color: "#4b5563" }} /><input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search clients..." style={{ width: "100%", maxWidth: 360, padding: "8px 12px 8px 34px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none" }} /></div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{["Client", "Email", "Tier", "Orders", "Spent", "Joined", "Status", ""].map((h, i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{paginatedClients.map((u, idx) => (
            <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${tierColors[u.tier]},${tierColors[u.tier]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{u.name.charAt(0)}</div><span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, cursor: "pointer" }} onClick={() => setViewUser(u)}>{u.name}</span></div></td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{u.email}</td>
              <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 10px", borderRadius: 20, background: `${tierColors[u.tier]}22`, color: tierColors[u.tier], fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{u.tier}</span></td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{u.orders}</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#34d399", fontWeight: 600 }}>{u.spent > 0 ? `$${u.spent.toLocaleString()}` : ""}</td>
              <td style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280" }}>{u.joined}</td>
              <td style={{ padding: "12px 16px" }}><span onClick={() => toggleStatus(u.id)} style={{ cursor: "pointer" }}><span style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: u.status === "active" ? "#34d399" : "#4b5563", marginRight: 6 }} /><span style={{ fontSize: 11, color: u.status === "active" ? "#34d399" : "#6b7280" }}>{u.status}</span></span></td>
              <td style={{ padding: "12px 16px", position: "relative" }}>
                <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4 }}><MoreVertical size={14} /></button>
                {menuOpen === u.id && <Dropdown onClose={() => setMenuOpen(null)} up={idx > 4} items={[
                  { icon: Eye, label: "View Profile", action: () => setViewUser(u) },
                  { icon: Mail, label: "Send Email", action: () => toast(`Email draft opened for ${u.name}`, "info") },
                  { divider: true },
                  { icon: u.status === "active" ? X : Check, label: u.status === "active" ? "Block Client" : "Unblock Client", action: () => toggleStatus(u.id), danger: u.status === "active" },
                ]} />}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {paginatedClients.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#4b5563", fontSize: 13 }}>No clients found.</div>}
      </div>

      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: "#4b5563" }}>
            Showing <span style={{ color: "#9ca3af" }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: "#9ca3af" }}>{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span style={{ color: "#9ca3af" }}>{filtered.length}</span> clients
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: currentPage === 1 ? "#374151" : "#9ca3af", fontSize: 12, cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <ChevronLeft size={14} /> Previous
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
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PricingPage = ({ plans, setPlans, toast, supabase, orders, goTo, setTargetOrder }) => {
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: "", images: 10, price: 99, features: [], description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [strategyConfigActive, setStrategyConfigActive] = useState(true);

  // Group revenue dynamically instead of hardcoded demo data
  const revenueByPlan = plans.map(p => {
    const rev = (orders || []).filter(o => o.plan === p.name && (o.status === 'completed' || o.status === 'delivered' || getPaymentStatus(o) === 'paid')).reduce((sum, o) => sum + (Number(o.revenue) || 0), 0);
    return { plan: p.name, revenue: rev };
  });

  const transactions = (orders || [])
    .filter(o => (o.revenue || 0) > 0)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEdit = (p) => {
    setForm({
      name: p.name || "",
      images: String(p.images ?? 0),
      price: String(p.price ?? 0),
      badge: p.badge || "",
      max_revisions: String(p.max_revisions ?? 0),
      strategy_included: !!p.strategy_included,
      strategy_addon_allowed: !!p.strategy_addon_allowed,
      strategy_addon_price: String(p.strategy_addon_price ?? 0),
      features: p.features || [],
      description: p.description || ""
    });
    setEditPlan(p.id);
  };

  const savePlan = async () => {
    const planData = {
      name: form.name,
      images: Number(form.images || 0),
      price: Number(form.price || 0),
      badge: form.badge || "",
      max_revisions: Number(form.max_revisions || 0),
      strategy_included: !!form.strategy_included,
      strategy_addon_allowed: !!form.strategy_addon_allowed,
      strategy_addon_price: Number(form.strategy_addon_price || 0),
      features: form.features || [],
      description: form.description || ""
    };

    try {
      if (editPlan === "new") {
        // Handle CREATE
        const { data, error } = await supabase
          .from('pricing_plans')
          .insert([{ ...planData, active: true }])
          .select();

        if (error) throw error;
        setPlans(prev => [...prev, data[0]]);
        toast(`"${form.name}" plan created successfully`);
      } else {
        // Handle UPDATE
        const { data, error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', editPlan)
          .select();

        if (error) throw error;
        setPlans(prev => prev.map(p => p.id === editPlan ? data[0] : p));
        toast(`"${form.name}" plan updated`);
      }
      setEditPlan(null);
    } catch (err) {
      console.error("Error saving plan:", err.message || err);
      toast(err.message || "Failed to save plan", "error");
    }
  };

  const togglePlan = async (id) => {
    const p = plans.find(p => p.id === id);
    const newActive = !p.active;

    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ active: newActive })
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.map(p => p.id === id ? { ...p, active: newActive } : p));
      toast(`"${p.name}" ${newActive ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error("Error toggling plan:", err.message || err);
      toast(err.message || "Failed to update status", "error");
    }
  };

  const addPlan = () => {
    setForm({
      name: "",
      images: "1",
      price: "0",
      badge: "",
      max_revisions: "3",
      strategy_included: false,
      strategy_addon_allowed: true,
      strategy_addon_price: "25",
      features: [],
      description: ""
    });
    setEditPlan("new");
  };

  const deletePlan = async (id) => {
    const p = plans.find(p => p.id === id);

    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.filter(p => p.id !== id));
      toast(`"${p.name}" plan deleted`, "warning");
    } catch (err) {
      console.error("Error deleting plan:", err.message || err);
      toast(err.message || "Failed to delete plan", "error");
    }
  };

  return (
    <div>
      <Modal open={editPlan !== null} onClose={() => setEditPlan(null)} title={editPlan === "new" ? "Add New Plan" : "Edit Plan"}>
        <InputField label="Plan Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Starter" />
        <InputField label="Description" value={form.description || ""} onChange={v => setForm({ ...form, description: v })} placeholder="e.g. One stunning image" />
        <InputField label="Badge Tag (e.g. Popular, Go Big)" value={form.badge || ""} onChange={v => setForm({ ...form, badge: v })} placeholder="e.g. Popular" />
        <InputField label="Number of Images" value={form.images} onChange={v => setForm({ ...form, images: v })} type="number" />
        <InputField label="Price ($)" value={form.price} onChange={v => setForm({ ...form, price: v })} type="number" />
        <InputField label="Max Revisions per Image" value={form.max_revisions || "0"} onChange={v => setForm({ ...form, max_revisions: v })} type="number" />

        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#fff", cursor: "pointer" }}>
            <input type="checkbox" checked={!!form.strategy_included} onChange={e => setForm({ ...form, strategy_included: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#2DD4BF" }} />
            Includes Brand Strategy Positioning by Default
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#fff", cursor: "pointer" }}>
            <input type="checkbox" checked={!!form.strategy_addon_allowed} onChange={e => setForm({ ...form, strategy_addon_allowed: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#2DD4BF" }} />
            Allow Adding Brand Strategy Add-on (+ $25)
          </label>
        </div>

        {form.strategy_addon_allowed && (
          <InputField label="Strategy Add-on Price ($)" value={form.strategy_addon_price || "25"} onChange={v => setForm({ ...form, strategy_addon_price: v })} type="number" />
        )}

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Plan Features (Bullet Points)</label>
          {form.features?.map((feat, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select
                value={feat.icon || "check"}
                onChange={e => {
                  const nf = [...(form.features || [])];
                  nf[i].icon = e.target.value;
                  setForm({ ...form, features: nf });
                }}
                style={{ padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none" }}
              >
                <option value="check">Checkmark</option>
                <option value="clock">Clock</option>
              </select>
              <input
                type="text"
                value={feat.text || ""}
                onChange={e => {
                  const nf = [...(form.features || [])];
                  nf[i].text = e.target.value;
                  setForm({ ...form, features: nf });
                }}
                placeholder="e.g. 3 revisions / image"
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none" }}
              />
              <button
                onClick={() => {
                  const nf = [...(form.features || [])];
                  nf.splice(i, 1);
                  setForm({ ...form, features: nf });
                }}
                style={{ padding: 6, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.15)", color: "#ef4444", cursor: "pointer" }}
              ><Trash2 size={14} /></button>
            </div>
          ))}
          <button
            onClick={() => setForm({ ...form, features: [...(form.features || []), { text: "", icon: "check" }] })}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Plus size={12} /> Add Feature
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => setEditPlan(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={savePlan} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Save size={12} /> Save</button>
        </div>
      </Modal>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Pricing Plans</h1>
        <button onClick={addPlan} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Plan</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {plans.map(p => (
          <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p.active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"}`, borderRadius: 16, padding: 24, opacity: p.active ? 1 : 0.5, transition: "all 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{p.name}</h3>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(p)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#6b7280" }} title="Edit plan"><Edit size={12} /></button>
                <button onClick={() => deletePlan(p.id)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#6b7280" }} title="Delete plan"><Trash2 size={12} /></button>
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{p.price === 0 ? "Free" : `$${p.price}`}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{p.images === 0 ? (p.price > 0 ? "Strategy access" : "Custom pricing") : `${p.images} image${p.images > 1 ? "s" : ""}`}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span onClick={() => togglePlan(p.id)} style={{ fontSize: 11, color: p.active ? "#34d399" : "#f87171", cursor: "pointer" }}><span style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: p.active ? "#34d399" : "#f87171", marginRight: 6 }} />{p.active ? "Active" : "Inactive"}</span>
              {p.images > 0 && p.price > 0 && <span style={{ fontSize: 11, color: "#4b5563" }}>${(p.price / p.images).toFixed(0)}/image</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Strategy Pricing Config</h3>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Global $25 fee shared by Free Image add-on and Standalone tier.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>$25</div>
          <button onClick={() => setStrategyConfigActive(!strategyConfigActive)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: strategyConfigActive ? "#34d399" : "#f87171", color: strategyConfigActive ? "#000" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{strategyConfigActive ? "ON" : "OFF"}</button>
        </div>
      </div>
      <div style={{ marginTop: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Revenue by Plan (YTD)</h3>
        <ResponsiveContainer width="100%" height={220}><BarChart data={revenueByPlan} barSize={36}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="plan" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} /><Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} /><Bar dataKey="revenue" fill="#2ab7a9" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Recent Transactions</h3>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Transaction ID", "Customer", "Plan", "Amount", "Date", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length > 0 ? paginatedTransactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#7dd8d0", fontWeight: 600, fontFamily: "monospace" }}>{t.id}</td>
                  <td style={{ padding: "12px 16px" }}><div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{t.customer}</div><div style={{ fontSize: 11, color: "#4b5563" }}>{t.email}</div></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{t.plan}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#34d399", fontWeight: 700 }}>${t.revenue}</td>
                  <td style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280" }}>{t.date}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => { if (setTargetOrder) setTargetOrder(t); if (goTo) goTo("orders"); }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#4ecdc4", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(78,205,196,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      Order <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: "40px 16px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>No successful transactions found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "0 4px" }}>
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              Showing <span style={{ color: "#9ca3af" }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: "#9ca3af" }}>{Math.min(currentPage * itemsPerPage, transactions.length)}</span> of <span style={{ color: "#9ca3af" }}>{transactions.length}</span> transactions
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: currentPage === 1 ? "#374151" : "#9ca3af", fontSize: 12, cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <ChevronLeft size={14} /> Previous
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
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsPage = ({ users, orders }) => {
  const monthlyData = orders.reduce((acc, o) => {
    const d = new Date(o.created_at);
    const m = d.toLocaleString('default', { month: 'short' });
    if (!acc[m]) acc[m] = { month: m, revenue: 0, orders: 0, sortKey: d.getMonth() };
    acc[m].revenue += (o.revenue || 0);
    acc[m].orders += 1;
    return acc;
  }, {});
  const dynAnalyticsData = Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);

  // REALTIME PERFORMANCE METRICS CALCULATIONS
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const imagesThisMonth = orders
    .filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, o) => acc + (o.images_count || 0), 0);

  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
  const onTimeDelivery = orders.length ? (deliveredOrders.length / orders.length) * 100 : 0;

  const revisionOrders = orders.filter(o => o.status === 'revision');
  const firstTimeApproval = orders.length ? ((orders.length - revisionOrders.length) / orders.length) * 100 : 0;

  const clientsWithMultipleOrders = users.filter(u => u.orders > 1).length;
  const clientRetention = users.length ? (clientsWithMultipleOrders / users.length) * 100 : 0;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.revenue || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress' || o.status === 'revision').length;
  const capacityUsed = Math.min(100, (pendingOrders / 20) * 100); // Assuming capacity of 20 active orders

  const revisionRate = orders.length ? (revisionOrders.length / orders.length) * 100 : 0;

  let avgDeliveryHrs = 0;
  if (deliveredOrders.length > 0) {
    const totalDeliveryMs = deliveredOrders.reduce((sum, o) => {
      const created = new Date(o.created_at).getTime();
      const updated = new Date(o.updated_at).getTime();
      return sum + Math.max(0, updated - created);
    }, 0);
    avgDeliveryHrs = totalDeliveryMs / deliveredOrders.length / (1000 * 60 * 60);
  }

  const totalRevisions = orders.reduce((acc, o) => acc + (o.revisions || 0), 0);
  const totalImagesWithRevs = orders.reduce((acc, o) => acc + (o.images_count || 0), 0);
  const avgRevisionsPerImg = totalImagesWithRevs ? (totalRevisions / totalImagesWithRevs) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Analytics</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={Clock} label="Avg Delivery Time" value={`${avgDeliveryHrs.toFixed(1)} hrs`} change={avgDeliveryHrs > 24 ? "+12%" : "-5%"} positive={avgDeliveryHrs < 24} sub="Target: 24 hrs" />
        <StatCard icon={RefreshCw} label="Avg Revisions/Img" value={avgRevisionsPerImg.toFixed(2)} change={avgRevisionsPerImg > 0.5 ? "+0.1" : "-0.1"} positive={avgRevisionsPerImg < 0.5} sub="Target: <0.5" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Orders vs Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dynAnalyticsData.length ? dynAnalyticsData : [{ month: "N/A", orders: 0, revenue: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2ab7a9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 300, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Top Clients by Revenue</h3>
          {[...users].sort((a, b) => (b.spent || 0) - (a.spent || 0)).slice(0, 6).map((u, i) => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.03)" : "none" }}><span style={{ fontSize: 11, color: "#4b5563", minWidth: 18 }}>#{i + 1}</span><div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${tierColors[u.tier || 'standard']},${tierColors[u.tier || 'standard']}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{(u.name || "?").charAt(0)}</div><div style={{ flex: 1 }}><div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 10, color: "#4b5563" }}>{u.orders} orders</div></div><span style={{ fontSize: 13, color: "#34d399", fontWeight: 700 }}>${(u.spent || 0).toLocaleString()}</span></div>)}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Performance Metrics (Realtime)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { label: "Images This Month", value: imagesThisMonth.toString(), bar: Math.min(100, (imagesThisMonth / 1000) * 100) },
            { label: "On-Time Delivery", value: `${onTimeDelivery.toFixed(1)}%`, bar: onTimeDelivery },
            { label: "First-Time Approval", value: `${firstTimeApproval.toFixed(1)}%`, bar: firstTimeApproval },
            { label: "Client Retention", value: `${clientRetention.toFixed(1)}%`, bar: clientRetention },
            { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, bar: Math.min(100, (avgOrderValue / 150) * 100) },
            { label: "Capacity Used", value: `${capacityUsed.toFixed(0)}%`, bar: capacityUsed }
          ].map((m, i) => <div key={i}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: "#9ca3af" }}>{m.label}</span><span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{m.value}</span></div><div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ width: `${m.bar}%`, height: "100%", borderRadius: 3, background: m.bar > 90 ? "#34d399" : m.bar > 70 ? "linear-gradient(90deg,#4ecdc4,#2ab7a9)" : "#60a5fa" }} /></div></div>)}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ toast, studioInfo, setStudioInfo, supabase, users, setUsers, adminUser, setAdminUser }) => {
  const [openSection, setOpenSection] = useState("profile");
  const [form, setForm] = useState({
    firstName: adminUser?.user_metadata?.first_name || "",
    lastName: adminUser?.user_metadata?.last_name || "",
    email: adminUser?.email || "",
    description: studioInfo?.description || ""
  });

  useEffect(() => {
    if (adminUser) {
      setForm({
        firstName: adminUser.user_metadata?.first_name || "",
        lastName: adminUser.user_metadata?.last_name || "",
        email: adminUser.email || "",
        description: form.description
      });
    }
  }, [adminUser]);

  const [saving, setSaving] = useState(false);

  const saveAdminProfile = async () => {
    if (!adminUser) return;
    setSaving(true);
    try {
      // 1. Update Database Profile Table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
        })
        .eq('id', adminUser.id);

      if (dbError) throw dbError;

      // 2. Update Auth Metadata (so sidebar and other UI update immediately)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: form.firstName,
          last_name: form.lastName
        }
      });

      if (authError) throw authError;

      // 3. Update parent state immediately for real-time sidebar update
      if (setAdminUser) {
        setAdminUser(prev => ({
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            first_name: form.firstName,
            last_name: form.lastName
          }
        }));
      }

      toast("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team?`)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      if (setUsers) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
      toast(`${name} removed from team`);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast("Failed to remove user", "error");
    }
  };

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "", role: "admin" });

  const handleAddAdmin = async () => {
    if (!addForm.email) {
      toast("Email Address is required", "warning");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: addForm.role })
        .eq('email', addForm.email)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast("User not found. They must register as a client first before you can promote them to the team.", "info", 5000);
        return;
      }

      if (setUsers) {
        const updatedUser = {
          ...data[0],
          name: `${data[0].first_name || ''} ${data[0].last_name || ''}`.trim() || data[0].email
        };
        setUsers(prev => {
          const exists = prev.find(u => u.id === updatedUser.id);
          if (exists) return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
          return [updatedUser, ...prev];
        });
      }

      setShowAdd(false);
      setAddForm({ firstName: "", lastName: "", email: "", role: "admin" });
      toast(`User ${addForm.email} promoted to ${addForm.role}!`);
    } catch (err) {
      console.error("Error promoting admin:", err);
      toast(err.message || "Database error: Could not update user role.", "error");
    }
  };


  const sections = [
    {
      id: "profile", title: "My Profile", desc: "Your personal information and account details", icon: User, content: (
        <div style={{ padding: "16px 0" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <InputField label="First Name" value={form.firstName} onChange={v => setForm({ ...form, firstName: v })} />
            <InputField label="Last Name" value={form.lastName} onChange={v => setForm({ ...form, lastName: v })} />
          </div>
          <div style={{ opacity: 0.7 }}>
            <InputField label="Account Email (Read-only)" value={form.email} onChange={() => { }} disabled />
          </div>
          <button onClick={saveAdminProfile} disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: saving ? "#4b5563" : "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )
    },
    {
      id: "team", title: "Team Members", desc: "Administrators and staff", icon: Users, content: (
        <div style={{ padding: "16px 0" }}>
          <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Promote to Team" width={400}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px", lineHeight: "1.5" }}>
                To add a team member, they must first join the website as a client. Enter their email below to grant them staff access.
              </p>
              <InputField label="Staff Email" value={addForm.email} onChange={v => setAddForm({ ...addForm, email: v })} placeholder="e.g. staff@example.com" />
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Assign Role</div>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }}
                >
                  <option value="admin">Administrator</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>
              <button onClick={handleAddAdmin} style={{ padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Change User Role</button>
            </div>
          </Modal>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {users.filter(u => ["admin", "superAdmin"].includes(u.role)).map((m, i) => (
              <div key={m.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{m.name?.charAt(0) || m.first_name?.charAt(0) || "A"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{m.name || `${m.first_name || ''} ${m.last_name || ''}`}</div>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>{m.email}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.02em", color: m.role === 'superAdmin' ? "#f472b6" : "#4ecdc4", background: m.role === 'superAdmin' ? "rgba(244,114,182,0.1)" : "rgba(78,205,196,0.1)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>{m.role}</span>
                {m.email !== adminUser.email && (
                  <button onClick={() => deleteUser(m.id, m.name || m.email)} style={{ background: "rgba(239,68,68,0.05)", border: "none", borderRadius: 6, padding: 6, color: "#ef4444", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s" }} title="Remove from team" onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Plus size={14} /> Add New Team Member
          </button>
        </div>
      )
    },
  ].filter(s => s.id !== "team" || adminUser?.user_metadata?.role === "superAdmin");

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Settings</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
        {sections.map(s => (
          <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div onClick={() => setOpenSection(openSection === s.id ? null : s.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(78,205,196,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={18} color="#7dd8d0" /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 600 }}>{s.title}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{s.desc}</div></div>
              <ChevronDown size={16} color="#4b5563" style={{ transform: openSection === s.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </div>
            {openSection === s.id && <div style={{ padding: "0 22px 18px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>{s.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// MAIN APP
const navPages = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "brand-strategy", label: "Strategy Requests", icon: Star },
  { id: "clients", label: "Clients", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "pricing", label: "Config", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function TyesAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [strategyRequests, setStrategyRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studioInfo, setStudioInfo] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [adminTargetOrder, setAdminTargetOrder] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 0. Fetch Admin User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminUser(user);

      // 0.5. Fetch Studio Info
      const { data: sData } = await supabase
        .from('studio_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (sData) setStudioInfo(sData);

      // 1. Fetch Pricing Plans
      const { data: plansData } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('created_at', { ascending: true });
      if (plansData) setPlans(plansData);

      // 2. Fetch Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { descending: true });
      if (ordersData) {
        const mappedOrders = ordersData.map(o => {
          let items = o.items || [];
          if (items.length === 0 && o.attachments && o.attachments.photos) {
            items = o.attachments.photos.map((url, idx) => ({
              name: `Product Photo ${idx + 1}`,
              mainImage: url,
              status: o.status || "pending"
            }));
          }
          return {
            ...o,
            customer: o.customer_name || o.customer_email,
            email: o.customer_email,
            images: o.images_count,
            date: new Date(o.created_at).toISOString().split('T')[0],
            items: items
          };
        });
        setOrders(mappedOrders);
      }

      // 3. Fetch Clients (Profiles)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { descending: true });

      if (profilesData) {
        const mappedUsers = profilesData.map(u => ({
          ...u,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          spent: u.total_spent || 0,
          orders: u.orders_count || 0,
          joined: new Date(u.created_at).toISOString().split('T')[0]
        }));
        setUsers(mappedUsers);
      } else {
        setUsers([]);
      }
      // 4. Fetch Strategy Requests
      const { data: stratData } = await supabase
        .from('brand_strategy_requests')
        .select('*');
      if (stratData) setStrategyRequests(stratData);

    } catch (err) {
      console.error("Fetch error:", err);
      addToast(`Database error: ${err.message || 'Check your tables'}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // REAL-TIME SYNC: Listen for profile changes (Team members & Clients)
    const profileChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { event: '*', table: 'profiles' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        setUsers(currentUsers => {
          if (eventType === 'INSERT') {
            const newUser = {
              ...newRow,
              name: `${newRow.first_name || ''} ${newRow.last_name || ''}`.trim() || newRow.email,
              spent: newRow.total_spent || 0,
              orders: newRow.orders_count || 0,
              joined: new Date(newRow.created_at).toISOString().split('T')[0]
            };
            return [newUser, ...currentUsers];
          }

          if (eventType === 'UPDATE') {
            return currentUsers.map(u => u.id === newRow.id ? {
              ...u,
              ...newRow,
              name: `${newRow.first_name || ''} ${newRow.last_name || ''}`.trim() || newRow.email
            } : u);
          }

          if (eventType === 'DELETE') {
            return currentUsers.filter(u => u.id !== oldRow.id);
          }

          return currentUsers;
        });
      })
      .subscribe();

    // REAL-TIME SYNC: Listen for order changes
    const orderChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', table: 'orders' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        setOrders(currentOrders => {
          if (eventType === 'INSERT') {
            const isCustom = newRow.plan === 'Custom' || newRow.plan === 'Custom (Strategy)' || newRow.plan?.includes('Custom');
            const alertMsg = isCustom
              ? `🔔 NEW CUSTOM ORDER received from ${newRow.customer_name || newRow.customer_email}!`
              : `🔔 New Order (${newRow.plan}) received from ${newRow.customer_name || newRow.customer_email}!`;

            addToast(alertMsg, isCustom ? "warning" : "success", 8000);

            const newOrder = {
              ...newRow,
              customer: newRow.customer_name || newRow.customer_email,
              email: newRow.customer_email,
              images: newRow.images_count,
              date: new Date(newRow.created_at).toISOString().split('T')[0]
            };
            return [newOrder, ...currentOrders];
          }

          if (eventType === 'UPDATE') {
            return currentOrders.map(o => o.id === newRow.id ? {
              ...o,
              ...newRow,
              customer: newRow.customer_name || newRow.customer_email,
              email: newRow.customer_email,
              images: newRow.images_count,
              date: new Date(newRow.created_at).toISOString().split('T')[0]
            } : o);
          }

          if (eventType === 'DELETE') {
            return currentOrders.filter(o => o.id !== oldRow.id);
          }

          return currentOrders;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(orderChannel);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      addToast("Error logging out", "error");
    }
  };

  const renderPage = () => {
    if (loading) return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <RefreshCw className="animate-spin" size={40} color="#4ecdc4" />
        <div style={{ color: "#4ecdc4", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", animation: "pulse 2s infinite" }}>FETCHING LIVE DATA...</div>
      </div>
    );

    switch (page) {
      case "dashboard": return <DashboardPage toast={addToast} goTo={setPage} orders={orders} users={users} strategyRequests={strategyRequests} />;
      case "orders": return <OrdersPage orders={orders} setOrders={setOrders} toast={addToast} goTo={setPage} supabase={supabase} targetOrder={adminTargetOrder} setTargetOrder={setAdminTargetOrder} />;
      case "clients": return <UsersPage users={users} setUsers={setUsers} toast={addToast} supabase={supabase} />;
      case "analytics": return <AnalyticsPage users={users} orders={orders} />;
      case "brand-strategy": return <AdminStrategyHub supabase={supabase} addToast={addToast} />;
      case "pricing": return <PricingPage plans={plans} setPlans={setPlans} toast={addToast} supabase={supabase} orders={orders} goTo={setPage} setTargetOrder={setAdminTargetOrder} />;
      case "settings": return <SettingsPage toast={addToast} studioInfo={studioInfo} setStudioInfo={setStudioInfo} supabase={supabase} users={users} adminUser={adminUser} setAdminUser={setAdminUser} />;
      default: return <DashboardPage toast={addToast} goTo={setPage} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", fontFamily: "'Inter',-apple-system,sans-serif", color: "#fff", overflow: "hidden" }}>
      <ToastContainer toasts={toasts} />
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: collapsed ? 64 : 220, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: collapsed ? "16px 8px" : "16px 12px", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
            {(adminUser?.user_metadata?.first_name?.charAt(0) || adminUser?.email?.charAt(0) || "A").toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {`${adminUser?.user_metadata?.first_name || ''} ${adminUser?.user_metadata?.last_name || ''}`.trim() || adminUser?.email?.split('@')[0] || "Admin"}
              </div>
              <div style={{ fontSize: 9, color: "#4ecdc4", fontStyle: "italic", marginTop: 2 }}>{adminUser?.user_metadata?.role === 'superAdmin' ? 'Super Admin' : 'Administrator'}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 2, display: collapsed ? "none" : "block" }}><ChevronLeft size={14} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navPages.map(p => <SidebarItem key={p.id} icon={p.icon} label={p.label} active={page === p.id} onClick={() => setPage(p.id)} collapsed={collapsed} />)}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 8 }}>
          <SidebarItem icon={LogOut} label="Log Out" onClick={handleLogout} collapsed={collapsed} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {collapsed && <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><Menu size={18} /></button>}
            <div style={{ position: "relative" }}><Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "#4b5563" }} /><input placeholder="Search anything..." style={{ padding: "7px 12px 7px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none", width: 260 }} /></div>
            <button onClick={fetchDashboardData} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Refresh data"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{ position: "relative", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <Bell size={17} /><span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 300, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 8, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Recent Notifications</div>
                  {orders.length ? orders.slice(0, 5).map((o, i) => {
                    const isCustom = o.plan?.includes('Custom');
                    return (
                      <div key={i} onClick={() => { setPage("orders"); setNotifOpen(false); setAdminTargetOrder(o); }} style={{ display: "flex", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 8, background: isCustom ? "rgba(251,191,36,0.05)" : "transparent" }} onMouseEnter={e => e.currentTarget.style.background = isCustom ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = isCustom ? "rgba(251,191,36,0.05)" : "transparent"}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, background: isCustom ? "#fbbf24" : (statusConfig[o.status || 'pending']?.color || '#34d399') }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{statusConfig[o.status || 'pending']?.label || 'Pending'}: {o.id}</span>
                            {isCustom && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(251, 191, 36, 0.2)", color: "#fbbf24", fontWeight: 700 }}>Custom</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{o.customer} · {o.plan}</div>
                          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{o.date} {o.created_at ? `at ${new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</div>
                        </div>
                      </div>
                    );
                  }) : <div style={{ padding: 20, textAlign: "center", color: "#4b5563", fontSize: 12 }}>No notifications.</div>}
                  <button onClick={() => { setNotifOpen(false); setPage("orders"); }} style={{ width: "100%", padding: "8px", border: "none", background: "transparent", color: "#4ecdc4", fontSize: 11, cursor: "pointer", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4 }}>View all orders</button>
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>
                  {(adminUser?.user_metadata?.first_name?.charAt(0) || adminUser?.email?.charAt(0) || "A").toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>
                  {adminUser?.user_metadata?.first_name || adminUser?.email?.split('@')[0] || "Admin"}
                </span>
                <ChevronDown size={12} color="#6b7280" />
              </div>
              {profileOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 180, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  {[{ icon: User, label: "Profile", action: () => { setPage("settings"); setProfileOpen(false); } }, { icon: Settings, label: "Settings", action: () => { setPage("settings"); setProfileOpen(false); } }, { divider: true }, { icon: LogOut, label: "Log Out", action: () => { handleLogout(); setProfileOpen(false); }, danger: true }].map((item, i) => item.divider ? <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} /> : (
                    <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><item.icon size={13} />{item.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setNotifOpen(false); setProfileOpen(false); }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
