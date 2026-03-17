import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CreditCard, Clock, CheckCircle, IndianRupee, MapPin, Star, Trash2, Download, MessageSquare, QrCode, X } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import ChatWindow from '../components/ChatWindow';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChat, setActiveChat] = useState(null);
  const [showQR, setShowQR] = useState(null);

  console.log('Dashboard Render - Active Tab:', activeTab);
  console.log('Bookings Count:', bookings.length);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    gender: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfileData({
        ...profileData,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        gender: data.gender || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { data } = await api.put('/auth/profile', profileData);
      updateUser(data); // Sync globally
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/mybookings');
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'var(--success)';
      case 'Pending': return '#f59e0b';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--text-light)';
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        setBookings(bookings.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
        toast.success('Booking cancelled successfully');
      } catch (err) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download invoice');
    }
  };

  const renderBookingCard = (booking) => {
    const statusColor = getStatusColor(booking.status);
    
    return (
      <motion.div 
        key={booking._id} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fade-in booking-card-responsive"
        style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '28px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '90px', borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
            <img 
              src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Hotel"
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary)' }}>{booking.hotel?.name}</h3>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-light)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> {new Date(booking.checkIn).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {booking.hotel?.location}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }} className="booking-card-footer">
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.3rem' }}>₹{booking.totalPrice}</p>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: statusColor,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: statusColor + '10',
              padding: '4px 12px',
              borderRadius: '8px'
            }}>
              ● {booking.status}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveChat(booking)}
              style={{ 
                padding: '0.75rem 1.25rem', borderRadius: '15px', 
                backgroundColor: '#f1f5f9', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', color: 'var(--primary)',
                cursor: 'pointer', border: 'none', gap: '10px', fontWeight: 700, fontSize: '0.85rem'
              }}
            >
               <MessageSquare size={18} /> <span className="hide-mobile">Chat</span>
            </button>
            
            <button 
              onClick={() => handleDownloadInvoice(booking._id)}
              disabled={booking.paymentStatus !== 'Paid'}
              style={{ 
                padding: '0.75rem 1.25rem', borderRadius: '15px', 
                backgroundColor: booking.paymentStatus === 'Paid' ? 'var(--primary)' : '#f8fafc', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                color: booking.paymentStatus === 'Paid' ? 'white' : '#cbd5e1',
                cursor: booking.paymentStatus === 'Paid' ? 'pointer' : 'not-allowed', 
                border: 'none', gap: '10px', fontWeight: 700, fontSize: '0.85rem'
              }}
            >
              <Download size={18} /> <span className="hide-mobile">Invoice</span>
            </button>
 
            {booking.status === 'Confirmed' && (
              <button 
                onClick={() => setShowQR(booking)}
                title="Show QR Code for Check-in"
                style={{ 
                  padding: '0.75rem 1.25rem', borderRadius: '15px', 
                  backgroundColor: '#10b981', display: 'flex', 
                  justifyContent: 'center', alignItems: 'center', color: 'white',
                  cursor: 'pointer', border: 'none', gap: '10px', fontWeight: 700, fontSize: '0.85rem'
                }}
              >
                 <QrCode size={18} /> <span className="hide-mobile">QR</span>
              </button>
            )}
 
            {booking.status === 'Confirmed' && (
              <button 
                onClick={() => handleCancel(booking._id)}
                style={{ 
                  color: '#ef4444', 
                  backgroundColor: '#fef2f2', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex', 
                  alignItems: 'center' 
                }}
                title="Cancel Stay"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="dashboard-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '260px 1fr', 
        gap: '2.5rem', 
        alignItems: 'start' 
      }}>
        
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.5px', marginBottom: '0.8rem' }}>
              {activeTab === 'dashboard' ? 'Welcome Back,' : 
               activeTab === 'bookings' ? 'Your Stays' : 
               activeTab === 'profile' ? 'Profile Settings' : 'Your Reviews'} {user?.name.split(' ')[0]}
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '16px', fontWeight: 500 }}>
              {activeTab === 'dashboard' ? 'Here is what is happening with your stays.' : 'Manage and view your activity.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dash" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Stats Grid */}
                <div className="stats-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1.5rem', 
                  marginBottom: '4rem' 
                }}>
                  <div style={{ padding: '2rem', borderRadius: '28px', textAlign: 'left', backgroundColor: '#e4e9cd', border: '1px solid #A1BC98' }}>
                    <p style={{ color: '#7a8678', fontWeight: 600, marginBottom: '1rem' }}>Total Stays</p>
                    <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2c332b' }}>{bookings.length}</h4>
                  </div>
                  <div style={{ padding: '2rem', borderRadius: '28px', textAlign: 'left', backgroundColor: '#e4e9cd', border: '1px solid #A1BC98' }}>
                    <p style={{ color: '#7a8678', fontWeight: 600, marginBottom: '1rem' }}>Confirmed</p>
                    <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>
                      {bookings.filter(b => b.status === 'Confirmed').length}
                    </h4>
                  </div>
                  <div style={{ padding: '2rem', borderRadius: '28px', textAlign: 'left', backgroundColor: '#e4e9cd', border: '1px solid #A1BC98' }}>
                    <p style={{ color: '#7a8678', fontWeight: 600, marginBottom: '1rem' }}>Completed</p>
                    <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#A1BC98' }}>0</h4>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Recent Bookings</h2>
                {loading ? (
                  <div className="skeleton" style={{ height: '100px', borderRadius: '24px' }} />
                ) : bookings.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'left', background: '#e4e9cd', borderRadius: '32px' }}>
                     <p style={{ color: '#4a5448' }}>No recent activity to show.</p>
                  </div>
                ) : (
                  <div>{bookings.slice(0, 3).map(renderBookingCard)}</div>
                )}
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div 
                key="bookings" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>All History</h2>
                {bookings.length === 0 ? (
                  <p>You haven't made any bookings yet.</p>
                ) : (
                  <div>{bookings.map(renderBookingCard)}</div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="glass-morphism profile-container"
                style={{ padding: '3rem', borderRadius: '32px' }}
              >
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>Personal Details</h2>
                  <p style={{ color: 'var(--text-light)' }}>Update your information for a personalized experience.</p>
                </div>
 
                <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    {saveSuccess && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
                        ✓ Profile updated successfully!
                      </motion.div>
                    )}
                  </div>
 
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>FULL NAME</label>
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', width: '100%' }} 
                      required 
                    />
                  </div>
 
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>EMAIL (READ-ONLY)</label>
                    <input 
                      type="email" 
                      value={profileData.email} 
                      disabled 
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', width: '100%', backgroundColor: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }} 
                    />
                  </div>
 
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>CONTACT NUMBER</label>
                    <input 
                      type="text" 
                      value={profileData.phone} 
                      placeholder="+91 98765 43210"
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', width: '100%' }} 
                    />
                  </div>
 
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>GENDER</label>
                    <select 
                      value={profileData.gender} 
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', width: '100%', backgroundColor: 'white' }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
 
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>STREET ADDRESS</label>
                    <textarea 
                      value={profileData.address} 
                      placeholder="Enter your full address"
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', height: '100px', width: '100%', resize: 'none' }} 
                    />
                  </div>
 
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={profileData.password} 
                      onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                      style={{ borderRadius: '14px', padding: '0.75rem 1rem', width: '100%' }} 
                    />
                  </div>
 
                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '16px' }}>
                      {saving ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                className="glass-morphism"
                style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e4e9cd', borderRadius: '32px', border: '2px dashed #A1BC98' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Clock size={48} color="#A1BC98" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: '#4a5448', fontWeight: 600 }}>Coming Soon</p>
                  <p style={{ fontSize: '0.85rem', color: '#7a8678' }}>This feature is currently under active development.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <style>{`
        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* QR Code Modal for Customer Dashboard */}
      {showQR && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ padding: '3rem', backgroundColor: 'white', borderRadius: '40px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => setShowQR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Check-in QR Code</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '2rem' }}>Show this code to the manager upon arrival at {showQR.hotel?.name}</p>
              
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', display: 'inline-block', marginBottom: '2rem' }}>
                <QRCode value={showQR.qrCode || `BOOKING-${showQR._id}`} size={200} />
              </div>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '20px' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Booking ID</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>{showQR.qrCode || showQR._id.substring(0,10).toUpperCase()}</p>
              </div>
           </motion.div>
        </div>
      )}

      {activeChat && <ChatWindow booking={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  );
};

export default Dashboard;
