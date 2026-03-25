import React from 'react';
import { Calendar, Users } from 'lucide-react';

const BookingForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Only parse as int for adults and children fields, keep as string for dates
    const finalValue = (name === 'adults' || name === 'children') ? (parseInt(value) || 0) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  return (
    <div className="booking-form-box glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <h2 className="booking-form-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Booking Details</h2>
      
      <div className="booking-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Check-in Date
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1, pointerEvents: 'none' }} />
            <input 
              type="date" 
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px', width: '100%', display: 'block', boxSizing: 'border-box' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Check-out Date
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1, pointerEvents: 'none' }} />
            <input 
              type="date" 
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px', width: '100%', display: 'block', boxSizing: 'border-box' }}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="booking-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Number of Adults
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Users size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1, pointerEvents: 'none' }} />
            <select 
              name="adults" 
              value={formData.adults} 
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px', width: '100%', display: 'block', boxSizing: 'border-box' }}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
            Number of Children
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Users size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1, pointerEvents: 'none' }} />
            <select 
              name="children" 
              value={formData.children} 
              onChange={handleChange}
              style={{ paddingLeft: '45px', height: '52px', width: '100%', display: 'block', boxSizing: 'border-box' }}
            >
              {[0, 1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .booking-form-box { padding: 1.5rem !important; border-radius: 24px !important; margin: 0 auto; width: 100%; box-sizing: border-box; }
          .booking-form-title { font-size: 1.5rem !important; margin-bottom: 1.5rem !important; text-align: left; }
          .booking-form-grid { 
            grid-template-columns: 1fr !important; 
            gap: 1.5rem !important; 
            margin-bottom: 1.5rem !important; 
            width: 100% !important;
          }
          .booking-form-box input, .booking-form-box select { 
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 16px 0 45px !important;
            height: 52px !important;
            font-size: 14px !important; 
            box-sizing: border-box !important;
            background-color: white;
          }
          .booking-form-box select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          .booking-form-box input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingForm;
