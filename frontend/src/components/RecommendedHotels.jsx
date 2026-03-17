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
      <div className="recommendations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '400px', backgroundColor: '#f3f4f6', borderRadius: '24px' }} className="skeleton"></div>
        ))}
      </div>
    </div>
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="recommendations-section" style={{ padding: '4rem 0' }}>
      <div className="recommendations-header" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
        <div className="rec-icon-box" style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '18px', flexShrink: 0, boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)' }}>
          <Sparkles color="#f59e0b" size={32} />
        </div>
        <div>
          <h2 className="rec-title" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', color: 'var(--secondary)', lineHeight: 1.1, marginBottom: '0.5rem' }}>Recommended for You</h2>
          <p className="rec-subtitle" style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: 500 }}>Handpicked stays based on your preferences</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="recommendations-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '2rem' }}
      >
        {recommendations.map((hotel, index) => (
          <motion.div
            key={hotel._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <HotelCard hotel={hotel} />
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .recommendations-section { padding: 3rem 0 !important; }
          .recommendations-header { 
            flex-direction: column !important; 
            text-align: center;
            gap: 1rem !important;
            margin-bottom: 2.5rem !important;
          }
          .rec-title { font-size: 1.75rem !important; }
          .rec-subtitle { font-size: 0.95rem !important; }
          .recommendations-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default RecommendedHotels;
