import React, { useState, useEffect } from 'react';
import api from '../services/api';
import HotelCard from './HotelCard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const RecommendedHotels = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get('/hotels/recommendations');
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return (
    <div style={{ padding: '4rem 0' }}>
      <div style={{ height: '40px', width: '300px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton"></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '450px', backgroundColor: '#f3f4f6', borderRadius: '24px' }} className="skeleton"></div>
        ))}
      </div>
    </div>
  );

  if (recommendations.length === 0) return null;

  return (
    <section style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: '#fff7ed', padding: '0.75rem', borderRadius: '14px' }}>
          <Sparkles color="#f59e0b" size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Recommended for You</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Handpicked stays based on your preferences</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}
      >
        {recommendations.map((hotel, index) => (
          <motion.div
            key={hotel._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <HotelCard hotel={hotel} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default RecommendedHotels;
