import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RoomCard = ({ room, onSelect, loading }) => {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="room-card-responsive"
        style={{ 
          backgroundColor: 'white', 
          padding: '2.5rem', 
          borderRadius: '28px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--secondary)' }}>{room.roomType}</h3>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" />
              <span>Capacity: {room.capacity} Persons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Free Cancellation</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {['Free WiFi', 'Air Conditioning', 'King Bed'].map((amenity, i) => (
              <span key={i} style={{ 
                fontSize: '0.8rem', 
                backgroundColor: '#f9fafb', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                color: '#6b7280',
                fontWeight: 500
              }}>
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'left' }} className="room-card-footer">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{room.price}</span>
            <span style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}> / night</span>
          </div>
          <button 
            onClick={() => onSelect(room)}
            disabled={loading}
            className="btn-primary" 
            style={{ 
              padding: '1rem 3rem', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              width: '100%',
              maxWidth: '240px'
            }}
          >
            {loading ? 'Securing Room...' : 'Select Room'}
          </button>
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 768px) {
          .room-card-responsive {
            padding: 1.5rem !important;
          }
          .room-card-responsive h3 {
            font-size: 1.5rem !important;
          }
          .room-card-footer {
            width: 100% !important;
            border-top: 1px solid #f1f5f9;
            padding-top: 1.5rem;
          }
          .room-card-footer span:first-child {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default RoomCard;
