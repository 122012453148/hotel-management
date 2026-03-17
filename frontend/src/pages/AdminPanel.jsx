import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Building2, 
  TicketCheck, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ShieldAlert,
  Loader2,
  Clock,
  IndianRupee,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import NotificationPanel from '../components/NotificationPanel';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState({ commissionRate: 10 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
        const bookingsRes = await api.get('/admin/bookings');
        setBookings(bookingsRes.data.slice(0, 5));
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } else if (activeTab === 'hotels') {
        const { data } = await api.get('/admin/pending-hotels');
        setPendingHotels(data);
      } else if (activeTab === 'bookings') {
        const { data } = await api.get('/admin/bookings');
        setBookings(data);
      } else if (activeTab === 'analytics') {
        const { data } = await api.get('/admin/analytics');
        setAnalytics(data);
      } else if (activeTab === 'settings') {
        const { data } = await api.get('/admin/settings');
        setSettings(data);
      } else if (activeTab === 'audit') {
        const { data } = await api.get('/admin/audit-logs');
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/block`);
      setUsers(users.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleHotelApproval = async (id, status) => {
    try {
      await api.put(`/admin/approve-hotel/${id}`, { status });
      setPendingHotels(pendingHotels.filter(h => h._id !== id));
      alert(`Hotel ${status === 'approve' ? 'approved' : 'rejected'}`);
    } catch (err) {
      alert('Failed to update hotel status');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/admin/settings', settings);
      alert('Platform settings updated successfully');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const renderStats = () => (
    <div className="admin-stats-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '24px', 
      marginBottom: '40px' 
    }}>
      {[
        { label: 'Total Users', value: stats?.totalUsers, color: '#6366f1', icon: <Users /> },
        { label: 'Total Hotels', value: stats?.totalHotels, color: '#10b981', icon: <Building2 /> },
        { label: 'Total Bookings', value: stats?.totalBookings, color: '#f59e0b', icon: <TicketCheck /> },
        { label: 'Revenue', value: `₹${stats?.revenue?.toLocaleString()}`, color: '#ec4899', icon: <IndianRupee /> }
      ].map((s, i) => (
        <motion.div 
          key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="glass-morphism" 
          style={{ padding: '24px', borderRadius: '24px', borderLeft: `6px solid ${s.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div style={{ color: s.color, marginBottom: '16px', display: 'flex' }}>{React.cloneElement(s.icon, { size: 24 })}</div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</p>
            <h4 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--secondary)', lineHeight: 1.1 }}>{s.value}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#FBF6F6', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Design Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(174, 183, 132, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(174, 183, 132, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(#AEB784 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }}></div>

      <div className="container" style={{ padding: '40px 0', position: 'relative', zIndex: 1 }}>
        <div className="admin-panel-grid">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ textAlign: 'left', minWidth: 0 }}>
          <div className="admin-header-flex glass-morphism" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px',
            backgroundColor: 'white',
            padding: '1.5rem 2rem',
            borderRadius: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            border: '1px solid #f1f5f9',
            gap: '1.5rem'
          }}>
            <div style={{ minWidth: '200px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.5px', marginBottom: '4px', lineHeight: 1.1 }}>
                {activeTab === 'dashboard' ? 'Admin Pulse' : 
                 activeTab === 'users' ? 'Community Management' : 
                 activeTab === 'hotels' ? 'Property Approvals' : 
                 activeTab === 'bookings' ? 'Global Reservations' : 
                 activeTab === 'analytics' ? 'Financial Insights' :
                 activeTab === 'settings' ? 'Platform Settings' : 'Audit Logs'}
              </h1>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 500 }}>Oversee and scale the Royal Hotel ecosystem.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '2rem', borderRight: '1px solid #e2e8f0' }} className="hide-mobile">
                <NotificationPanel />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '14px' }}>System Admin</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>Master Access</p>
                </div>
                <div style={{ width: '45px', height: '45px', borderRadius: '15px', backgroundColor: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 900 }}>
                  A
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
              </motion.div>
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {activeTab === 'dashboard' && (
                  <>
                    {renderStats()}
                    <div className="glass-morphism" style={{ padding: '32px', borderRadius: '32px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: 'var(--secondary)' }}>Recent Activity</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {bookings.map(b => (
                          <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 800, color: 'var(--secondary)', marginBottom: '4px' }}>{b.user?.name} booked {b.hotel?.name}</p>
                              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{new Date(b.createdAt).toLocaleString()}</p>
                            </div>
                            <p style={{ fontWeight: 900, color: '#10b981', fontSize: '18px' }}>₹{b.totalPrice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'users' && (
                  <div className="glass-morphism table-container" style={{ borderRadius: '32px' }}>
                    <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>USER</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>ROLE</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>STATUS</th>
                          <th style={{ padding: '1.5rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1.5rem' }}>
                              <p style={{ fontWeight: 700 }}>{u.name}</p>
                              <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{u.email}</p>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'manager' ? '#e1f5fe' : '#f3f4f6', color: u.role === 'admin' ? '#ef4444' : u.role === 'manager' ? '#0288d1' : '#6b7280' }}>
                                 {u.role.toUpperCase()}
                               </span>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                               {u.isBlocked ? <span style={{ color: '#ef4444', fontWeight: 700 }}>Blocked</span> : <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span>}
                            </td>
                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                               <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button onClick={() => handleToggleBlock(u._id)} style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: u.isBlocked ? '#ecfdf5' : '#fff7ed', color: u.isBlocked ? '#10b981' : '#f59e0b' }}>
                                     {u.isBlocked ? <UserCheck size={18} /> : <ShieldAlert size={18} />}
                                  </button>
                                  <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444' }}>
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'hotels' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {pendingHotels.length === 0 ? (
                      <div className="glass-morphism" style={{ padding: '5rem', textAlign: 'center' }}>
                        <ShieldCheck size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem' }}>All Caught Up!</h3>
                        <p style={{ color: 'var(--text-light)' }}>No pending hotel approval requests.</p>
                      </div>
                    ) : (
                      pendingHotels.map(h => (
                        <motion.div
                          key={h._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-morphism"
                          style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' }}
                        >
                          {/* Image Strip */}
                          <div style={{ display: 'flex', gap: '4px', height: '220px' }}>
                            {(h.images?.length > 0 ? h.images.slice(0, 3) : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600']).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`Hotel ${i + 1}`}
                                style={{
                                  flex: i === 0 ? 2 : 1,
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            ))}
                          </div>

                          {/* Details Body */}
                          <div style={{ padding: '2.5rem' }}>
                            {/* Header Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                              <div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.4rem' }}>{h.name}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                  {h.city && <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>🏙️ {h.city}</span>}
                                  {h.location && <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {h.location}</span>}
                                  {h.address && <span style={{ fontSize: '0.9rem', color: '#64748b' }}>🏠 {h.address}</span>}
                                  {h.zipCode && <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>📮 {h.zipCode}</span>}
                                </div>
                              </div>
                              <span style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#d97706', fontWeight: 700, fontSize: '0.85rem', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                                ⏳ Awaiting Approval
                              </span>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                              {/* Description */}
                              <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', borderRadius: '20px', padding: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</p>
                                <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '0.95rem' }}>{h.description || 'No description provided.'}</p>
                              </div>

                              {/* Manager */}
                              <div style={{ backgroundColor: '#f0f9ff', borderRadius: '20px', padding: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Manager</p>
                                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.25rem' }}>{h.manager?.name}</p>
                                <p style={{ fontSize: '0.9rem', color: '#475569' }}>📧 {h.manager?.email}</p>
                              </div>

                              {/* Amenities */}
                              <div style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Amenities</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  {h.amenities?.length > 0
                                    ? h.amenities.map(a => (
                                        <span key={a} style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: 600 }}>{a}</span>
                                      ))
                                    : <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No amenities listed</span>
                                  }
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                              <button
                                onClick={() => handleHotelApproval(h._id, 'approve')}
                                className="btn-primary"
                                style={{ flex: 1, padding: '1rem', borderRadius: '18px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <CheckCircle size={20} /> Approve Property
                              </button>
                              <button
                                onClick={() => handleHotelApproval(h._id, 'reject')}
                                style={{ flex: 1, padding: '1rem', borderRadius: '18px', backgroundColor: '#fef2f2', color: '#ef4444', border: '2px solid #fecaca', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
                              >
                                <XCircle size={20} /> Reject
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="glass-morphism table-container" style={{ borderRadius: '32px' }}>
                    <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>ID</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>HOTEL / GUEST</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>TOTAL</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1.5rem', fontFamily: 'monospace' }}>#{b._id.slice(-6).toUpperCase()}</td>
                            <td style={{ padding: '1.5rem' }}>
                               <p style={{ fontWeight: 700 }}>{b.hotel?.name}</p>
                               <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>By {b.user?.name}</p>
                            </td>
                            <td style={{ padding: '1.5rem', fontWeight: 800 }}>₹{b.totalPrice}</td>
                            <td style={{ padding: '1.5rem' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backgroundColor: b.status === 'Confirmed' ? '#ecfdf5' : '#f3f4f6', color: b.status === 'Confirmed' ? '#10b981' : '#6b7280' }}>
                                 {b.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'analytics' && analytics && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                     <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                        <h3 style={{ marginBottom: '2rem' }}>Monthly Revenue Growth</h3>
                        {analytics.monthlyRevenue.map((m, i) => (
                           <div key={i} style={{ marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                 <span>Month {m._id.month}</span>
                                 <strong>₹{m.total.toLocaleString()}</strong>
                              </div>
                              <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${(m.total / stats.revenue) * 100}%` }} style={{ height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                        <h3 style={{ marginBottom: '2rem' }}>Hotels Onboarded</h3>
                        {analytics.hotelsPerMonth.map((h, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                              <span>Month {h._id.month}</span>
                              <span style={{ fontWeight: 800 }}>+{h.count} Hotels</span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <motion.div className="glass-morphism" style={{ padding: '3rem', borderRadius: '32px', maxWidth: '600px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>Global Configuration</h2>
                      <p style={{ color: 'var(--text-light)' }}>Manage platform-wide rules and fees.</p>
                    </div>

                    <form onSubmit={handleUpdateSettings}>
                      <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: '#4b5563' }}>PLATFORM COMMISSION (%)</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            min="0" max="100" step="0.1"
                            value={settings?.commissionRate || ''} 
                            onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})}
                            style={{ borderRadius: '16px', padding: '1rem 1rem 1rem 3rem', fontSize: '1.25rem', fontWeight: 800, width: '100%', borderColor: '#cbd5e1' }} 
                            required 
                          />
                          <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#94a3b8', fontSize: '1.25rem' }}>%</span>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>This percentage is automatically deducted from all completed bookings.</p>
                      </div>

                      <button type="submit" disabled={savingSettings} className="btn-primary" style={{ padding: '1.25rem 3rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', width: '100%' }}>
                        {savingSettings ? 'Applying Changes...' : 'Save Configuration'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'audit' && (
                  <div className="glass-morphism table-container" style={{ borderRadius: '32px' }}>
                    <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>TIMESTAMP</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>ADMIN</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>ACTION</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>DETAILS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                              <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>{log.admin?.name || 'Unknown'}</p>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#e2e8f0', color: '#475569' }}>
                                 {log.action}
                               </span>
                            </td>
                            <td style={{ padding: '1.5rem', color: '#334155' }}>
                               {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {auditLogs.length === 0 && (
                       <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                          No audit logs found.
                       </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        table th { letter-spacing: 1px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; padding: 20px 24px !important; }
        table td { padding: 20px 24px !important; vertical-align: middle; }
        
        .admin-panel-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 1200px) {
          .admin-panel-grid { grid-template-columns: 1fr !important; }
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        @media (max-width: 768px) {
          .container { padding: 20px !important; }
          .admin-header-flex { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            padding: 1.5rem !important;
            gap: 1rem !important;
          }
          .admin-header-flex > div:last-child {
            width: 100%;
            justify-content: flex-start;
          }
          .admin-stats-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .glass-morphism { padding: 1.5rem !important; }
          h1 { font-size: 24px !important; }
          
          .admin-header-flex .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default AdminPanel;
