import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200');

  return (
    <div className="image-gallery-container" style={{ marginBottom: '3rem' }}>
      <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1.5rem' }}>
        <motion.div 
          layoutId="main-img"
          className="main-image-wrapper"
          style={{ height: '550px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        >
          <img 
            src={mainImage} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            alt="Main Hotel" 
          />
        </motion.div>
        
        <div className="thumbnail-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {images?.slice(0, 4).map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMainImage(img)}
              className="thumb-wrapper"
              style={{ 
                height: '128px', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                cursor: 'pointer',
                border: mainImage === img ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: mainImage === img ? '0 8px 20px rgba(174, 183, 132, 0.3)' : 'none'
              }}
            >
              <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Thumb ${i}`} />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .main-image-wrapper {
            height: 400px !important;
            border-radius: 24px !important;
          }
          .thumbnail-list {
            flex-direction: row !important;
            overflow-x: auto;
            padding-bottom: 10px;
            scrollbar-width: none;
          }
          .thumbnail-list::-webkit-scrollbar { display: none; }
          .thumb-wrapper {
            height: 100px !important;
            width: 140px !important;
            flex-shrink: 0;
            border-radius: 16px !important;
          }
        }
        @media (max-width: 480px) {
           .main-image-wrapper { height: 300px !important; }
           .thumb-wrapper { width: 100px !important; height: 80px !important; }
        }
      `}</style>
    </div>
  );
};

export default ImageGallery;
