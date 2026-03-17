import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Star, DollarSign, Wifi, Coffee, Utensils, Waves, Dumbbell, Car } from 'lucide-react';

const SearchFilterSidebar = ({ filters, setFilters, onClear }) => {
  const [amenitiesList] = useState([
    { name: 'WiFi', icon: <Wifi size={16} /> },
    { name: 'Breakfast', icon: <Coffee size={16} /> },
    { name: 'Restaurant', icon: <Utensils size={16} /> },
    { name: 'Pool', icon: <Waves size={16} /> },
    { name: 'Gym', icon: <Dumbbell size={16} /> },
    { name: 'Parking', icon: <Car size={16} /> },
    { name: 'AC', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h20"/><path d="M2 10h20"/><path d="M2 14h20"/><path d="M2 18h20"/><path d="M6 3v3"/><path d="M10 3v3"/><path d="M14 3v3"/><path d="M18 3v3"/></svg> },
    { name: 'Spa', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg> },
    { name: 'Pet-friendly', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.823 2.65 7.441 2.65c-1.38 0-2.5 1.12-2.5 2.5 0 .193.022.38.063.56L3.922 8.35a2.53 2.53 0 0 0-.131.547l-.234 1.57a2.5 2.5 0 0 0 3.193 2.766l2.13-.64c.266-.08.536-.12.808-.12.27 0 .541.04.808.12l2.13.64a2.5 2.5 0 0 0 3.193-2.766l-.234-1.57a2.532 2.532 0 0 0-.131-.547l-1.082-2.639c.041-.18.063-.367.063-.56 0-1.38-1.12-2.5-2.5-2.5-1.382 0-2.559 1.132-2.559 2.522v.001z"/><path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg> },
    { name: 'TV', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="13" rx="2" ry="2"/><path d="m17 2-5 5-5-5"/></svg> }
  ]);

  const handleAmenityChange = (amenity) => {
    const current = filters.amenities || [];
    if (current.includes(amenity)) {
      setFilters({ ...filters, amenities: current.filter(a => a !== amenity) });
    } else {
      setFilters({ ...filters, amenities: [...current, amenity] });
    }
  };

  return (
    <aside className="glass-morphism" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content', position: 'sticky', top: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px' }}>
          <SlidersHorizontal size={20} color="var(--primary)" />
        </div>
        <h3 style={{ margin: 0, fontWeight: 700 }}>Filters</h3>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={18} /> Price Range
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="Min" 
            style={{ padding: '0.75rem' }} 
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <span style={{ color: '#d1d5db' }}>-</span>
          <input 
            type="number" 
            placeholder="Max" 
            style={{ padding: '0.75rem' }} 
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={18} /> Minimum Rating
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[4, 3, 2, 1].map((r) => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'color 0.2s' }}>
              <input 
                type="radio" 
                name="rating" 
                value={r} 
                checked={Number(filters.rating) === r}
                style={{ width: 'auto', accentColor: 'var(--primary)' }}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              />
              <span style={{ fontSize: '0.95rem' }}>{r}+ Stars</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(r)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Amenities</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {amenitiesList.map((a) => (
            <label key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={(filters.amenities || []).includes(a.name)}
                style={{ width: 'auto', accentColor: 'var(--primary)' }}
                onChange={() => handleAmenityChange(a.name)}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                {a.icon} {a.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={onClear} 
        style={{ 
          width: '100%', padding: '12px', 
          backgroundColor: 'transparent', 
          border: '1.5px solid var(--primary)', 
          color: 'var(--primary)', borderRadius: '12px', 
          fontWeight: 700, transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = 'white'; }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary)'; }}
      >
        Reset All Filters
      </button>
    </aside>
  );
};

export default SearchFilterSidebar;
