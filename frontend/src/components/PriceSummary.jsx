import React from 'react';
import { ShieldCheck, Info, Tag } from 'lucide-react';

const PriceSummary = ({ 
  room, nights, totalPrice, originalTotalPrice, discount, 
  onConfirm, loading, selectedExtras = [],
  couponCode, setCouponCode, applyCoupon 
}) => {
  return (
    <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', position: 'sticky', top: '100px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Price Summary</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}>
          <span>{room?.roomType} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
          <span>₹{room?.price * nights}</span>
        </div>
        
        {selectedExtras.map(extra => (
          <div key={extra.name} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}>
            <span>{extra.name}</span>
            <span>₹{extra.price}</span>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.25rem' }}>
          <span>Service Fee (10%)</span>
          <span>₹{Math.round((room?.price * nights + selectedExtras.reduce((a,b) => a + b.price, 0)) * 0.1)}</span>
        </div>

        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tag size={16} /> Offer Applied ({discount}%)</span>
            <span>- ₹{originalTotalPrice - totalPrice}</span>
          </div>
        )}

        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>Total Price</span>
          <div style={{ textAlign: 'right' }}>
            {discount > 0 && <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: '0.5rem' }}>₹{originalTotalPrice}</span>}
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalPrice}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 0 1.5rem 0', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Have a Coupon Code?</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter Code" 
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
          <button onClick={applyCoupon} className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px' }}>Apply</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <ShieldCheck size={20} color="var(--success)" />
        <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Best Price Guaranteed</span>
      </div>

      <button 
        onClick={onConfirm}
        disabled={loading}
        className="btn-primary" 
        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 700, borderRadius: '16px' }}
      >
        {loading ? 'Confirming...' : 'Confirm Booking'}
      </button>

      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <Info size={14} /> You won't be charged yet
      </p>
    </div>
  );
};

export default PriceSummary;
