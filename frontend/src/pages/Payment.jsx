import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Loader2, IndianRupee, ShieldCheck, Wallet } from 'lucide-react';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('razorpay');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      // Simulate gateway delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await api.put(`/bookings/${bookingId}/pay`);
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
      <Loader2 className="spin" size={48} color="var(--primary)" />
    </div>
  );

  if (!booking) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>Booking not found</div>;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="payment-title" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-1.5px' }}>PAYMENT</h1>
        <p style={{ color: 'var(--text-light)' }}>Secure your luxury stay</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
        {/* Booking Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism payment-card" 
          style={{ padding: '3rem', borderRadius: '40px' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>Booking Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Hotel Name</span>
              <span style={{ fontWeight: 700 }}>{booking.hotel?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Check-in</span>
              <span style={{ fontWeight: 700 }}>{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Check-out</span>
              <span style={{ fontWeight: 700 }}>{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px dashed #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={28} /> {booking.totalPrice}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-morphism payment-card" 
          style={{ padding: '3rem', borderRadius: '40px' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Payment Method</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <label style={{ 
              display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', 
              borderRadius: '20px', border: method === 'razorpay' ? '2px solid var(--primary)' : '2px solid #f3f4f6',
              backgroundColor: method === 'razorpay' ? '#fffaf5' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input 
                type="radio" 
                name="payment" 
                value="razorpay" 
                checked={method === 'razorpay'} 
                onChange={(e) => setMethod(e.target.value)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <Wallet size={24} color={method === 'razorpay' ? 'var(--primary)' : '#9ca3af'} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Razorpay</span>
              </div>
              <CheckCircle2 size={24} color="var(--primary)" style={{ opacity: method === 'razorpay' ? 1 : 0 }} />
            </label>

            <label style={{ 
              display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', 
              borderRadius: '20px', border: method === 'stripe' ? '2px solid var(--primary)' : '2px solid #f3f4f6',
              backgroundColor: method === 'stripe' ? '#fffaf5' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input 
                type="radio" 
                name="payment" 
                value="stripe" 
                checked={method === 'stripe'} 
                onChange={(e) => setMethod(e.target.value)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <CreditCard size={24} color={method === 'stripe' ? 'var(--primary)' : '#9ca3af'} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Stripe</span>
              </div>
              <CheckCircle2 size={24} color="var(--primary)" style={{ opacity: method === 'stripe' ? 1 : 0 }} />
            </label>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <button 
              onClick={handlePayment}
              disabled={paying}
              className="btn-primary" 
              style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem', fontWeight: 800, borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}
            >
              {paying ? <><Loader2 className="spin" size={24} /> Processing...</> : `Pay Now ₹${booking.totalPrice}`}
            </button>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--success)" /> 256-bit SSL Secure Payment
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .payment-title { font-size: 2rem !important; }
          .payment-card { padding: 1.5rem !important; border-radius: 24px !important; }
          .payment-card h2 { font-size: 1.25rem !important; }
          .payment-card span:last-child { font-size: 1.5rem !important; }
          .payment-card .indian-rupee { width: 20px; height: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Payment;
