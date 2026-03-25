import React from 'react';
import { Wifi, Car, Waves, Utensils, Coffee, Tv } from 'lucide-react';

const AmenitiesList = ({ amenities }) => {
  const allPossible = [
    { name: 'Wifi', icon: <Wifi size={20} /> },
    { name: 'Parking', icon: <Car size={20} /> },
    { name: 'Swimming Pool', icon: <Waves size={20} /> },
    { name: 'Restaurant', icon: <Utensils size={20} /> },
    { name: 'Breakfast', icon: <Coffee size={20} /> },
    { name: 'TV', icon: <Tv size={20} /> },
  ];

  // Filter based on hotel amenities or show defaults if none provided
  const toShow = amenities?.length > 0 
    ? allPossible.filter(p => amenities.some(a => a.toLowerCase().includes(p.name.toLowerCase())))
    : allPossible.slice(0, 4);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
      {toShow.map((item, i) => (
        <div 
          key={i} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem', 
            backgroundColor: '#e4e9cd', 
            borderRadius: '16px',
            color: '#4a5448',
            fontWeight: 600,
            border: '1px solid rgba(161, 188, 152, 0.2)'
          }}
        >
          <div style={{ color: '#A1BC98' }}>{item.icon}</div>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default AmenitiesList;
