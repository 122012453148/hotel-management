import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Hotel, ArrowLeft, Star } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import PriceSummary from '../components/PriceSummary';

const Booking = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
    selectedExtras: []
  });

  const [promotions, setPromotions] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [hotelRes, promoRes] = await Promise.all([
          api.get(`/hotels/${hotelId}`),
          api.get(`/promotions/hotel/${hotelId}`)
        ]);
        setData(hotelRes.data);
        
        const activePromos = promoRes.data.promotions || [];
        setPromotions(activePromos);
        
        // Auto apply best offer
        if (activePromos.length > 0) {
           const bestOffer = [...activePromos].sort((a,b) => b.discountPercentage - a.discountPercentage)[0];
           setDiscount(bestOffer.discountPercentage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId, user, navigate]);

  if (loading) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}><div className="skeleton" style={{ height: '400px', borderRadius: '32px' }} /></div>;
  if (!data) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>Data not found</div>;

  const hotel = data.hotel;
  const room = data.rooms.find(r => r._id === roomId);

  const calculateRoomTotal = () => {
    if (!room) return 0;
    let total = 0;
    let start = new Date(formData.checkIn);
    let end = new Date(formData.checkOut);
    let nightsCount = Math.ceil((end - start) / (86400000)) || 1;
    
    for (let i = 0; i < nightsCount; i++) {
      let current = new Date(start);
      current.setDate(start.getDate() + i);
      const day = current.getDay();
      const isWeekend = (day === 5 || day === 6); // Friday & Saturday
      total += isWeekend ? (room.price * (room.weekendMultiplier || 1.2)) : room.price;
    }
    return Math.round(total);
  };

  const nights = Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)) || 1;
  const extrasTotal = formData.selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
  const roomBaseTotal = calculateRoomTotal();
  const serviceFee = Math.round(roomBaseTotal * 0.1);
  const originalTotalPrice = roomBaseTotal + extrasTotal + serviceFee;
  const totalPrice = discount > 0 ? Math.round(originalTotalPrice * (1 - discount/100)) : originalTotalPrice;

  const toggleExtra = (extra) => {
    const isSelected = formData.selectedExtras.find(s => s.name === extra.name);
    if (isSelected) {
      setFormData({
        ...formData,
        selectedExtras: formData.selectedExtras.filter(s => s.name !== extra.name)
      });
    } else {
      setFormData({
        ...formData,
        selectedExtras: [...formData.selectedExtras, { name: extra.name, price: extra.price }]
      });
    }
  };

  const handleConfirm = async () => {
    try {
      setBookingLoading(true);
      const bookingData = {
        hotel: hotelId,
        room: roomId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalPrice,
        guests: formData.guests,
        selectedExtras: formData.selectedExtras
      };
      const { data: newBooking } = await api.post('/bookings', bookingData);
      navigate(`/payment/${newBooking._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const applyCoupon = () => {
    if (!couponCode) return;
    const couponPromo = promotions.find(p => p.couponCode?.toLowerCase() === couponCode.toLowerCase());
    if (couponPromo) {
      setDiscount(couponPromo.discountPercentage);
      alert(`Coupon applied! ${couponPromo.discountPercentage}% OFF`);
    } else {
      alert('Invalid or expired coupon code');
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: 'var(--text-light)', marginBottom: '3rem', fontWeight: 600 }}
      >
        <ArrowLeft size={18} /> Back to Selection
      </button>

      <div className="booking-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '4rem' }}>
        <main>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', alignItems: 'center', flexWrap: 'wrap' }} className="hotel-brief-header">
              <div className="hotel-brief-image" style={{ width: '280px', height: '180px', borderRadius: '24px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                <img src={hotel.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={hotel.name} />
              </div>
              <div className="hotel-brief-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                   <Star size={16} fill="var(--primary)" />
                   <span style={{ fontWeight: 800 }}>{hotel.rating}</span>
                </div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   Selected Hotel :
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.6rem', lineHeight: 1.2 }}>{hotel.name}</h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Selected Room: <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{room?.roomType}</span></p>
              </div>
            </div>

            <BookingForm formData={formData} setFormData={setFormData} />

            {hotel.extraServices && hotel.extraServices.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                 <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Enhance Your Stay</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                   {hotel.extraServices.map(extra => (
                     <div 
                       key={extra.name} 
                       onClick={() => toggleExtra(extra)}
                       className="glass-morphism"
                       style={{ 
                         padding: '1.5rem', borderRadius: '24px', 
                         cursor: 'pointer', border: formData.selectedExtras.find(s => s.name === extra.name) ? '2.5px solid var(--primary)' : '1px solid #f1f5f9',
                         transition: 'all 0.2s'
                       }}
                     >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '2rem' }}>{extra.icon || '✨'}</span>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: formData.selectedExtras.find(s => s.name === extra.name) ? 'var(--primary)' : 'transparent' }}>
                            {formData.selectedExtras.find(s => s.name === extra.name) && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                          </div>
                        </div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{extra.name}</h4>
                        <p style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{extra.price}</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </motion.div>
        </main>

        <aside>
          <PriceSummary 
            room={room} 
            nights={nights} 
            totalPrice={totalPrice} 
            originalTotalPrice={originalTotalPrice}
            discount={discount}
            selectedExtras={formData.selectedExtras}
            onConfirm={handleConfirm} 
            loading={bookingLoading} 
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
          />
        </aside>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .booking-layout {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
        @media (max-width: 768px) {
          .hotel-brief-header {
            flex-direction: column !important;
            gap: 1.5rem !important;
            margin-bottom: 2.5rem !important;
            text-align: center;
          }
          .hotel-brief-image { 
            width: 100% !important; 
            height: 200px !important; 
            border-radius: 20px !important;
          }
          .hotel-brief-info { width: 100% !important; }
          .hotel-brief-info h1 { font-size: 1.75rem !important; margin-bottom: 0.5rem !important; }
          .hotel-brief-info p { font-size: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Booking;
