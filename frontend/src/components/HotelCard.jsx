import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const HotelCard = ({ hotel }) => {
  const { user, updateUser } = useAuth();
  const [isWishlisting, setIsWishlisting] = useState(false);

  const isWishlisted = user?.wishlist?.includes(hotel._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setIsWishlisting(true);
    try {
      const { data } = await api.post(`/wishlist/toggle/${hotel._id}`);
      
      // Update global user state with new wishlist
      const updatedUserData = { ...user, wishlist: data.wishlist };
      updateUser(updatedUserData);
      
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="hotel-card-wrapper"
      style={{ 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        height: '100%',
        position: 'relative',
        border: '1px solid #f1f3f0'
      }}
    >
      <div className="hotel-card-image-box" style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'} 
          alt={hotel.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlisting}
          className="wishlist-btn"
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Heart 
            size={20} 
            color={isWishlisted ? "#ef4444" : "#2c332b"} 
            fill={isWishlisted ? "#ef4444" : "transparent"} 
          />
        </button>

        <div className="card-rating-badge" style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '15px', 
          backgroundColor: 'white', 
          padding: '6px 12px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: 800,
          fontSize: '0.85rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          color: 'var(--secondary)'
        }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          {hotel.rating || 'N/A'}
        </div>
      </div>
      <div style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{hotel.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          <MapPin size={16} color="var(--primary)" />
          {hotel.location}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Starting from</p>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--secondary)' }}>₹{hotel.minPrice || 3500}</span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600 }}>/night</span>
          </div>
          <Link to={`/hotels/${hotel._id}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '12px', textTransform: 'none' }}>View Details</Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .hotel-card-image-box { height: 180px !important; }
          .hotel-card-wrapper h3 { font-size: 1.1rem !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default HotelCard;
