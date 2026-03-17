import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Hotel } from 'lucide-react';
import api from '../services/api';
import HotelCard from '../components/HotelCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchWishlist();
  }, [user?.wishlist]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (error) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart fill="#ef4444" color="#ef4444" size={32} />
          My Wishlist
        </h1>
        <p style={{ color: 'var(--text-light)' }}>
          {wishlist.length} {wishlist.length === 1 ? 'hotel' : 'hotels'} saved for your next trip
        </p>
      </header>

      {wishlist.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {wishlist.map(hotel => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            backgroundColor: 'white', 
            borderRadius: '24px',
            boxShadow: 'var(--shadow)'
          }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Hotel size={40} color="#94a3b8" />
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
            Explore hotels and tap the heart icon to save them here.
          </p>
          <a href="/hotels" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
            Explore Hotels
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
