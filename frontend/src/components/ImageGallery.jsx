import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1.5rem', marginBottom: '3rem' }}>
      <motion.div 
        layoutId="main-img"
        style={{ height: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
      >
        <img 
          src={mainImage} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          alt="Main Hotel" 
        />
      </motion.div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {images?.slice(0, 4).map((img, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => setMainImage(img)}
            style={{ 
              height: '138px', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              cursor: 'pointer',
              border: mainImage === img ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'border 0.2s'
            }}
          >
            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Thumb ${i}`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
