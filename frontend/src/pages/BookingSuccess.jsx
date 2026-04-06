import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Check, Download, Calendar, Hotel, ArrowRight, Home as HomeIcon } from 'lucide-react';
import QRCode from 'react-qr-code';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');

        // If redirected from Stripe success, finalize payment in DB
        if (sessionId) {
          try {
            await api.put(`/bookings/${bookingId}/pay`);
          } catch (paymentErr) {
            console.error('Finalizing payment failed:', paymentErr);
          }
        }

        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
    window.scrollTo(0, 0);
  }, [bookingId]);

  const handleDownloadInvoice = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('customerInfo') || localStorage.getItem('managerInfo') || '{}');
      const token = userInfo.token;
      
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const cleanBackendUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl.replace(/\/$/, '')}/api`;
      
      const downloadUrl = `${cleanBackendUrl}/bookings/${bookingId}/invoice?token=${token}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice_${bookingId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download invoice');
    }
  };

  if (loading) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}><div className="skeleton" style={{ height: '500px', borderRadius: '40px' }} /></div>;
  if (!booking) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>Booking not found</div>;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-morphism success-card"
        style={{ padding: '4rem', borderRadius: '48px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}
      >
        <div style={{ 
          width: '100px', height: '100px', backgroundColor: 'var(--success)', 
          borderRadius: '50%', display: 'flex', justifyContent: 'center', 
          alignItems: 'center', margin: '0 auto 2.5rem', 
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' 
        }}>
          <Check size={50} color="white" strokeWidth={3} />
        </div>

        <h1 className="success-title" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem', letterSpacing: '-2px' }}>
          {booking.status === 'Pending' ? 'PAYMENT SUCCESSFUL' : 'BOOKING SUCCESSFUL'}
        </h1>
        <p className="success-subtitle" style={{ color: 'var(--text-light)', fontSize: '1.25rem', marginBottom: '4rem' }}>
          {booking.status === 'Pending' 
            ? "Your payment is complete! Your booking is currently pending final approval from the hotel manager." 
            : "Your luxury escape is all set. We've sent the confirmation to your email."}
        </p>

        <div style={{ 
          backgroundColor: '#f9fafb', padding: '3rem', borderRadius: '32px', 
          textAlign: 'left', marginBottom: '4rem', border: '1px solid #f3f4f6' 
        }} className="success-details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Booking ID</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>#{booking._id.slice(-6).toUpperCase()}</p>
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hotel</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>{booking.hotel?.name}</p>
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Check-in</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Calendar size={18} color="var(--primary)" />
                {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
              </div>
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Check-out</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Calendar size={18} color="var(--primary)" />
                {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </div>

        {booking.status === 'Confirmed' && (
          <div style={{ backgroundColor: '#f1f5f9', padding: '2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>Your Check-in QR Code</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '300px' }}>Show this to the hotel manager upon your arrival to instantly securely check-in.</p>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               <QRCode value={booking.qrCode || `BOOKING-${booking._id}`} size={160} />
            </div>
            <p style={{ marginTop: '1rem', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)' }}>{booking.qrCode || booking._id.substring(0,10).toUpperCase()}</p>
          </div>
        )}

        {booking.status === 'Pending' && (
          <div style={{ backgroundColor: '#fef3c7', padding: '1.5rem', borderRadius: '20px', color: '#b45309', fontWeight: '600', marginBottom: '4rem', fontSize: '0.95rem' }}>
             Your QR Code will be generated right after the hotel manager confirms your booking. You can check it anytime in your Bookings Dashboard.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <button 
            onClick={handleDownloadInvoice}
            className="btn-primary" 
            style={{ 
              padding: '1.5rem', fontSize: '1.25rem', fontWeight: 800, 
              borderRadius: '24px', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', gap: '1rem', border: 'none', cursor: 'pointer'
            }}
          >
            <Download size={22} /> Download Invoice
          </button>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link 
              to="/dashboard" 
              style={{ 
                flex: 1, padding: '1.25rem', borderRadius: '20px', 
                backgroundColor: 'white', border: '2px solid #e5e7eb', 
                color: 'var(--secondary)', fontWeight: 700, display: 'flex', 
                justifyContent: 'center', alignItems: 'center', gap: '0.75rem' 
              }}
            >
              View My Bookings <ArrowRight size={18} />
            </Link>
            <Link 
              to="/" 
              style={{ 
                flex: 1, padding: '1.25rem', borderRadius: '20px', 
                backgroundColor: 'white', border: '2px solid #e5e7eb', 
                color: 'var(--secondary)', fontWeight: 700, display: 'flex', 
                justifyContent: 'center', alignItems: 'center', gap: '0.75rem' 
              }}
            >
              <HomeIcon size={18} /> Go Home
            </Link>
          </div>
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 768px) {
          .success-card { padding: 2rem 1.5rem !important; border-radius: 32px !important; }
          .success-title { font-size: 2rem !important; letter-spacing: -1px !important; }
          .success-subtitle { font-size: 1rem !important; margin-bottom: 2.5rem !important; }
          .success-details { padding: 1.5rem !important; border-radius: 24px !important; }
          .success-details p:last-child { font-size: 1rem !important; }
          .success-details div[style*="display: grid"] { gap: 1.5rem !important; }
          .success-card .btn-primary { font-size: 1.1rem !important; padding: 1.25rem !important; }
          .success-card div[style*="display: flex"] { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccess;
