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
      whileHover={{ y: -5 }}
      style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: 'var(--shadow)',
        height: '100%',
        position: 'relative'
      }}
    >
      <div style={{ position: 'relative', height: '200px' }}>
        <img 
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'} 
          alt={hotel.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlisting}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'}
        >
          <Heart 
            size={20} 
            color={isWishlisted ? "#ef4444" : "#64748b"} 
            fill={isWishlisted ? "#ef4444" : "transparent"} 
          />
        </button>

        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          backgroundColor: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          {hotel.rating || 'N/A'}
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>{hotel.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <MapPin size={14} />
          {hotel.location}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Starting ₹{hotel.minPrice || 3500}/night</span>
          <Link to={`/hotels/${hotel._id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>View Details</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelCard;
