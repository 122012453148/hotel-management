import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Coffee, Utensils, Waves, Heart, Dumbbell, Car, Tv, Bath } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const HotelListItem = ({ hotel }) => {
  const { user, updateUser } = useAuth();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const isWishlisted = user?.wishlist?.includes(hotel._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    setIsWishlisting(true);
    try {
      const { data } = await api.post(`/wishlist/toggle/${hotel._id}`);
      updateUser({ ...user, wishlist: data.wishlist });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating wishlist');
    } finally { setIsWishlisting(false); }
  };

  const getAmenityIcon = (name) => {
    switch(name.toLowerCase()) {
      case 'wifi': return <Wifi size={14} />;
      case 'breakfast': return <Coffee size={14} />;
      case 'restaurant': return <Utensils size={14} />;
      case 'pool': case 'swimming pool': return <Waves size={14} />;
      case 'gym': return <Dumbbell size={14} />;
      case 'parking': return <Car size={14} />;
      case 'ac': return <div style={{ fontSize: '10px', fontWeight: 800 }}>AC</div>;
      case 'spa': return <Bath size={14} />;
      case 'tv': return <Tv size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: '0 12px 35px rgba(0,0,0,0.08)' }}
      className="hotel-list-item-card"
      style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        marginBottom: '1.5rem',
        border: '1px solid #f3f4f6',
        display: 'flex',
        flexDirection: 'row',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Image Section */}
      <div className="hotel-list-item-image" style={{
        width: '320px',
        minHeight: '240px',
        position: 'relative',
        flexShrink: 0,
      }}>
        <img 
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'} 
          alt={hotel.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlisting}
          style={{
            position: 'absolute', top: '15px', right: '15px', 
            backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', 
            borderRadius: '50%', width: '36px', height: '36px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Heart size={18} color={isWishlisted ? "#ef4444" : "#64748b"} fill={isWishlisted ? "#ef4444" : "transparent"} />
        </button>
        <div style={{ 
          position: 'absolute', top: '15px', left: '15px', 
          backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 12px', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', 
          gap: '5px', fontWeight: 700, fontSize: '0.85rem' 
        }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          {hotel.rating || 'N/A'}
        </div>
      </div>

      {/* Details Section */}
      <div className="hotel-list-item-details" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary)' }}>{hotel.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.95rem' }}>
              <MapPin size={16} color="var(--primary)" />
              {hotel.location}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{hotel.minPrice || 3500}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>per night</div>
          </div>
        </div>

        <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {hotel.description || 'Experience ultimate luxury and comfort in the heart of the city with world-class amenities.'}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {hotel.amenities?.slice(0, 4).map((a, i) => (
              <div key={i} title={a} style={{ backgroundColor: '#f9fafb', padding: '8px', borderRadius: '10px', color: '#4b5563' }}>
                {getAmenityIcon(a) || <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{a[0]}</span>}
              </div>
            ))}
          </div>

          <Link to={`/hotels/${hotel._id}`} className="btn-primary" style={{ 
            padding: '12px 28px', borderRadius: '14px', 
            fontWeight: 700, boxShadow: '0 4px 12px rgba(196, 164, 132, 0.3)',
            width: 'fit-content'
          }}>
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelListItem;

// Inject responsive styles for this component
const styleTag = typeof document !== 'undefined' && (() => {
  if (document.getElementById('hotel-list-item-styles')) return;
  const s = document.createElement('style');
  s.id = 'hotel-list-item-styles';
  s.textContent = `
    @media (max-width: 768px) {
      .hotel-list-item-card {
        flex-direction: column !important;
      }
      .hotel-list-item-image {
        width: 100% !important;
        min-height: 220px !important;
        max-height: 240px;
      }
      .hotel-list-item-details {
        padding: 1.25rem !important;
      }
      .hotel-list-item-details h3 {
        font-size: 1.2rem !important;
      }
    }
  `;
  document.head.appendChild(s);
})();
