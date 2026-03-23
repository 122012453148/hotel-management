import React from 'react';
import { Calendar, Users } from 'lucide-react';

const BookingForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="booking-form-box glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <h2 className="booking-form-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Booking Details</h2>
      
      <div className="booking-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Check-in Date
          </label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
              type="date" 
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Check-out Date
          </label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
              type="date" 
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px' }}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
          Number of Guests
        </label>
        <div style={{ position: 'relative' }}>
          <Users size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <select 
            name="guests" 
            value={formData.guests} 
            onChange={handleChange}
            style={{ paddingLeft: '45px', height: '52px' }}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .booking-form-box { padding: 1.5rem !important; border-radius: 20px !important; }
          .booking-form-title { font-size: 1.4rem !important; margin-bottom: 1.5rem !important; }
          .booking-form-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .booking-form-box input, .booking-form-box select { padding-left: 40px !important; font-size: 13px !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingForm;
