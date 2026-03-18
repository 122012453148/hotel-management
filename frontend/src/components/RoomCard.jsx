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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>{room.roomType}</h3>
            {room.roomStatus && (
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: room.roomStatus === 'Available' ? '#ecfdf5' : room.roomStatus === 'Cleaning' ? '#eff6ff' : '#fef2f2',
                color: room.roomStatus === 'Available' ? '#059669' : room.roomStatus === 'Cleaning' ? '#3b82f6' : '#ef4444'
              }}>
                <span style={{
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: room.roomStatus === 'Available' ? '#10b981' : room.roomStatus === 'Cleaning' ? '#3b82f6' : '#ef4444'
                }} />
                {room.roomStatus}
              </span>
            )}
          </div>
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
            disabled={loading || (room.roomStatus && room.roomStatus !== 'Available')}
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
            {room.roomStatus && room.roomStatus !== 'Available' ? 'Unavailable' : loading ? 'Securing Room...' : 'Select Room'}
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
