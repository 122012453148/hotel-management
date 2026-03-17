import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import ChatWindow from '../components/ChatWindow';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { QrCode, X } from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [showQR, setShowQR] = useState(null);

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
    window.scrollTo(0, 0);
  }, []);

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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return { color: 'var(--success)', bg: '#f0fdf4', icon: <CheckCircle2 size={16} /> };
      case 'Pending': return { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={16} /> };
      case 'Cancelled': return { color: 'var(--error)', bg: '#fef2f2', icon: <XCircle size={16} /> };
      case 'Completed': return { color: 'var(--primary)', bg: '#f9fafb', icon: <CheckCircle2 size={16} /> };
      default: return { color: 'var(--text-light)', bg: '#f9fafb', icon: <Clock size={16} /> };
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div className="flex-responsive" style={{ gap: '4rem', alignItems: 'start' }}>
        
        <DashboardSidebar activeTab="bookings" setActiveTab={(tab) => window.location.href = tab === 'dashboard' ? '/dashboard' : `/${tab}`} />

        <main>
          <div className="my-bookings-header" style={{ marginBottom: '3rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '2rem' }}>
            <h1 className="responsive-title" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '-1px' }}>
              My Bookings
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Review and manage your past and upcoming luxury stays.</p>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '200px', borderRadius: '32px' }} />
          ) : bookings.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '40px', border: '2px dashed #e5e7eb' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>No Bookings Yet</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2.5rem' }}>Your future adventures will appear here once booked.</p>
              <Link to="/hotels" className="btn-primary" style={{ padding: '1rem 2.5rem' }}>Find Your Next Stay</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {bookings.map((booking) => {
                const style = getStatusStyle(booking.status);
                return (
                  <motion.div 
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism booking-card-responsive"
                    style={{ padding: '3rem', borderRadius: '40px', border: '1px solid #f3f4f6' }}
                  >
                    <div className="booking-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2.5rem', gap: '2rem', flexWrap: 'wrap' }}>
                      <div className="booking-info-flex" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="booking-hotel-img" style={{ width: '150px', height: '120px', borderRadius: '24px', overflow: 'hidden', flexShrink: 0 }}>
                          <img 
                            src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt="Hotel"
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                             Hotel :
                          </div>
                          <h2 className="hotel-name-responsive" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem' }}>{booking.hotel?.name}</h2>
                          
                          <div className="booking-dates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem' }}>
                            <div>
                               <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.4rem' }}>Check-in :</p>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                 <Calendar size={18} color="var(--primary)" />
                                 {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                               </div>
                            </div>
                            <div>
                               <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.4rem' }}>Check-out :</p>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                 <Calendar size={18} color="var(--primary)" />
                                 {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="status-actions-responsive" style={{ textAlign: 'right' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '8px', 
                          padding: '10px 20px', borderRadius: '14px', 
                          backgroundColor: style.bg, color: style.color, 
                          fontWeight: 800, fontSize: '0.85rem', marginBottom: '1rem'
                        }}>
                          {style.icon} {booking.status}
                        </div>
                        <p className="price-responsive" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{booking.totalPrice}</p>
                      </div>
                    </div>

                    <div className="booking-actions-responsive" style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '2rem', flexWrap: 'wrap' }}>
                      <Link 
                        to={`/hotels/${booking.hotel?._id}`} 
                        className="btn-primary"
                        style={{ flex: 1, padding: '1rem', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 700, minWidth: '150px' }}
                      >
                        View Details <ChevronRight size={16} />
                      </Link>
                      
                      {booking.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleCancel(booking._id)}
                          style={{ 
                            flex: 1, padding: '1rem', borderRadius: '14px', 
                            backgroundColor: 'white', border: '2px solid var(--error)', 
                            color: 'var(--error)', fontWeight: 700, minWidth: '150px'
                          }}
                        >
                          Cancel
                        </button>
                      )}

                      <button 
                        onClick={() => setActiveChat(booking)}
                        className="btn-chat-responsive"
                        style={{ 
                          flex: 1, minWidth: '150px', padding: '1rem', borderRadius: '14px', 
                          backgroundColor: '#f1f5f9', display: 'flex', 
                          justifyContent: 'center', alignItems: 'center', color: 'var(--primary)',
                          cursor: 'pointer', border: 'none', gap: '8px', fontWeight: 700, fontSize: '0.9rem'
                        }}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                         Chat
                      </button>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => handleDownloadInvoice(booking._id)}
                          title="Download Invoice"
                          style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            backgroundColor: booking.paymentStatus === 'Paid' ? 'var(--primary)' : '#f9fafb', 
                            display: 'flex', 
                            justifyContent: 'center', alignItems: 'center', 
                            color: booking.paymentStatus === 'Paid' ? 'white' : '#9ca3af',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'all 0.3s'
                          }}
                        >
                          <Download size={20} />
                        </button>

                        <button 
                          onClick={() => setShowQR(booking)}
                          title="Show QR Code for Check-in"
                          style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            backgroundColor: '#717D44', 
                            display: 'flex', 
                            justifyContent: 'center', alignItems: 'center', 
                            color: 'white',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'all 0.3s'
                          }}
                        >
                          <QrCode size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      
      {/* QR Code Modal */}
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
      <style>{`
        @media (max-width: 992px) {
          .responsive-title { font-size: 2rem !important; }
        }
        @media (max-width: 768px) {
          .booking-card-responsive {
            padding: 1.5rem !important;
            border-radius: 24px !important;
          }
          .booking-hotel-img {
            width: 100% !important;
            height: 180px !important;
          }
          .hotel-name-responsive {
            font-size: 1.5rem !important;
          }
          .status-actions-responsive {
            text-align: left !important;
            width: 100%;
            border-top: 1px dashed #f1f5f9;
            padding-top: 1rem;
          }
          .price-responsive {
            font-size: 1.5rem !important;
          }
          .booking-actions-responsive {
            padding-top: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
