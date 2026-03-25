import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OffersSection = ({ hotelId = null }) => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const url = hotelId ? `/promotions/hotel/${hotelId}` : '/promotions';
        const { data } = await api.get(url);
        setOffers(data.promotions);
      } catch (err) {
        console.error('Failed to fetch promotions', err);
      }
    };
    fetchOffers();
  }, [hotelId]);

  if (offers.length === 0) {
    if (hotelId) return null; // Hide completely on Hotel Details page if no specific offers
    return (
      <section style={{ padding: '4rem 0', backgroundColor: '#f0fdf4' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem' }}>
            Exclusive Offers & Deals
          </h2>
          <div style={{ padding: '3rem', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
             <Tag size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
             <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>No Active Offers</h3>
             <p style={{ color: 'var(--text-light)' }}>There are currently no active promotions. Check back later for exclusive deals!</p>
          </div>
        </div>
      </section>
    );
  }

  const handleOfferClick = (offer) => {
    if (offer.applicableHotels && offer.applicableHotels.length > 0) {
      const targetHotel = offer.applicableHotels[0];
      const targetId = typeof targetHotel === 'object' ? targetHotel._id : targetHotel;
      navigate(`/hotels/${targetId}`);
    } else {
      navigate('/hotels');
    }
  };

  return (
    <section className="offers-section-outer" style={{ padding: '6rem 1.25rem', backgroundColor: '#f0fdf4' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--secondary)', marginBottom: '1rem' }}>
            Exclusive Offers & Deals
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.1rem', fontWeight: 500 }}>
            Unlock premium experiences at unbeatable prices.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {offers.map((offer) => (
            <motion.div 
              key={offer._id}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              onClick={() => handleOfferClick(offer)}
              style={{ 
                backgroundColor: 'white', 
                padding: '2.5rem', 
                borderRadius: '32px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderBottomLeftRadius: '20px', fontWeight: 900, fontSize: '1.1rem' }}>
                {offer.discountPercentage}% OFF
              </div>
              
              <div style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(174, 183, 132, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={32} color="var(--primary)" />
              </div>

              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--secondary)' }}>{offer.title}</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6', flexGrow: 1 }}>{offer.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
                  <Clock size={18} />
                  Valid till {new Date(offer.validTo).toLocaleDateString()}
                </div>
                <div style={{ color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Book Now <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
