import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import HotelCard from '../components/HotelCard';
import RecommendedHotels from '../components/RecommendedHotels';
import Footer from '../components/Footer';
import LocationInput from '../components/LocationInput';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [popularHotels, setPopularHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const { data } = await api.get('/hotels');
        const hotelsArray = Array.isArray(data) ? data : (data.hotels || []);
        setPopularHotels(hotelsArray.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>

      {/* ===== HERO SECTION (Desktop) ===== */}
      <section
        className="hero-section"
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("/landing-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBottom: '200px',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
          <motion.h4
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'white', letterSpacing: '3px', fontWeight: 500, marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '14px' }}
          >
            Away from monotonous life
          </motion.h4>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)', marginBottom: '1.5rem', color: 'white', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1.05' }}
          >
            Relax Your Mind
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hero-subtitle"
            style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 2.5rem auto', lineHeight: '1.8' }}
          >
            If you are looking for a break from the everyday hustle, discover our handpicked luxury stays tailored for your ultimate comfort and tranquility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button className="btn-primary" onClick={() => navigate('/hotels')} style={{ padding: '1rem 2.5rem', fontSize: '1rem', letterSpacing: '2px' }}>
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Floating Search Bar — Desktop only (hidden on mobile via CSS) */}
        <div
          className="hero-search-desktop"
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: '1140px',
            zIndex: 10,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#222222',
              padding: '2.5rem 3rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr',
              gap: '1.5rem',
              alignItems: 'end',
            }}
          >
            <div>
              <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Book Your Room</label>
              <LocationInput
                value={location}
                onChange={setLocation}
                placeholder="Enter city or hotel name"
                inputStyle={{ backgroundColor: '#333', color: 'white', borderRadius: '0', border: 'none', height: '48px', fontSize: '13px', padding: '0 15px 0 3.5rem' }}
              />
            </div>
            <div>
              <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>CHECK IN</label>
              <input type="date" style={{ borderRadius: 0, border: 'none', padding: '0 15px', fontSize: '13px', backgroundColor: '#333', color: 'white', height: '48px', width: '100%' }} />
            </div>
            <div>
              <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>CHECK OUT</label>
              <input type="date" style={{ borderRadius: 0, border: 'none', padding: '0 15px', fontSize: '13px', backgroundColor: '#333', color: 'white', height: '48px', width: '100%' }} />
            </div>
            <button
              className="btn-primary"
              style={{ height: '48px', width: '100%', borderRadius: '0' }}
              onClick={() => navigate(`/hotels?location=${location}`)}
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Mobile Search Bar — shown BELOW hero on mobile */}
      <div className="hero-search-mobile" style={{ display: 'none', backgroundColor: '#1a1a1a', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Book Your Room</label>
            <LocationInput
              value={location}
              onChange={setLocation}
              placeholder="Enter city or hotel name"
              inputStyle={{ backgroundColor: '#333', color: 'white', borderRadius: '6px', border: 'none', height: '48px', fontSize: '13px', padding: '0 15px 0 3.5rem' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Check In</label>
              <input type="date" style={{ borderRadius: '6px', border: 'none', padding: '0 10px', fontSize: '12px', backgroundColor: '#333', color: 'white', height: '48px', width: '100%' }} />
            </div>
            <div>
              <label style={{ color: 'white', fontSize: '10px', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Check Out</label>
              <input type="date" style={{ borderRadius: '6px', border: 'none', padding: '0 10px', fontSize: '12px', backgroundColor: '#333', color: 'white', height: '48px', width: '100%' }} />
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ height: '50px', width: '100%', borderRadius: '6px' }}
            onClick={() => navigate(`/hotels?location=${location}`)}
          >
            Search Hotels
          </button>
        </div>
      </div>

      {/* ===== ACCOMMODATIONS SECTION ===== */}
      <section className="home-section" style={{ padding: '6rem 0 7rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '1.5rem' }}>Hotel Accommodation</h2>
            <p className="section-desc" style={{ color: '#777', maxWidth: '560px', margin: '0 auto', fontSize: '14px' }}>
              We all live in an age that belongs to the young at heart. Life that is becoming extremely fast, and we must find time for peace.
            </p>
          </div>
          <div className="home-hotel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '2rem' }}>
            {loading
              ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '20px' }} />)
              : popularHotels.map(h => <HotelCard key={h._id} hotel={h} />)
            }
          </div>
        </div>
      </section>

      {/* ===== FACILITIES SECTION ===== */}
      <section className="home-section facilities-section" style={{ padding: '7rem 0', backgroundColor: '#e4e9cd' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '1.5rem' }}>Royal Facilities</h2>
            <p className="section-desc" style={{ color: '#777', fontSize: '14px' }}>Who are in extremely love with eco friendly system and premium service.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Restaurant', icon: '🍽️' },
              { title: 'Sports Club', icon: '🏋️' },
              { title: 'Swimming Pool', icon: '🏊' },
              { title: 'Rent a Car', icon: '🚗' },
              { title: 'Gymnasium', icon: '💪' },
              { title: 'Bar', icon: '🍹' },
            ].map((fac, i) => (
              <div key={i} className="facility-card" style={{ backgroundColor: 'white', padding: '40px 24px', textAlign: 'center', border: '1px solid #A1BC98', borderRadius: '20px', transition: 'all 0.3s ease' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{fac.icon}</div>
                <h4 style={{ marginBottom: '0.75rem', color: '#2c332b', fontWeight: 600 }}>{fac.title}</h4>
                <p style={{ fontSize: '13px', color: '#4a5448', lineHeight: '22px' }}>Usage of the Internet is becoming more common due to rapid advancement of technology.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="home-section" style={{ padding: '7rem 0' }}>
        <div className="container about-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '2rem', lineHeight: '1.3' }}>
              About Us <br />Our History <br />Mission &amp; Vision
            </h2>
            <p className="section-desc" style={{ color: '#777', fontSize: '14px', lineHeight: '28px', marginBottom: '2rem' }}>
              As conscious traveling paupers we must always be concerned about our dear Mother Earth. If you think about it, you travel across her face, and She is the one that gives you the memories.
              <br /><br />
              That's why it's crucial that, as travelers, our behavior is beyond reproach. Inappropriate behavior is often laughed off, but we believe in respecting every destination.
            </p>
            <button className="btn-primary">Learn More</button>
          </div>
          <div className="about-image-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} alt="Hotel 1" />
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} alt="Hotel 2" />
            <img src="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '24px', gridColumn: 'span 2', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} alt="Hotel 3" />
          </div>
        </div>
      </section>

      {/* ===== RECOMMENDED SECTION ===== */}
      {user && (
        <section className="home-section" style={{ padding: '5rem 0', borderTop: '1px solid #eee' }}>
          <div className="container">
            <RecommendedHotels />
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        /* ── Tablet (992px) ── */
        @media (max-width: 992px) {
          .hero-section {
            padding-bottom: 140px !important;
          }
        }

        /* ── Mobile (768px) ── */
        @media (max-width: 768px) {
          /* Hero: compact, no large bottom padding */
          .hero-section {
            min-height: 70vh !important;
            padding-bottom: 3.5rem !important;
            align-items: flex-end !important;
            padding-top: 6rem;
          }

          /* Hide desktop floating search, show mobile one */
          .hero-search-desktop { display: none !important; }
          .hero-search-mobile  { display: block !important; }

          .hero-title {
            font-size: clamp(2.2rem, 10vw, 3.2rem) !important;
            line-height: 1.1 !important;
          }
          .hero-subtitle {
            font-size: 0.875rem !important;
            line-height: 1.7 !important;
            padding: 0 0.5rem;
          }

          /* Sections spacing */
          .home-section {
            padding: 3.5rem 0 !important;
          }
          .facilities-section {
            padding: 3.5rem 0 !important;
          }

          .section-title {
            font-size: 22px !important;
            margin-bottom: 1rem !important;
            line-height: 1.3;
          }
          .section-desc {
            font-size: 13px !important;
          }
          .facility-card {
            padding: 28px 20px !important;
          }
          .about-container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            text-align: center;
          }
          .about-image-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .about-image-grid img {
            height: 200px !important;
            grid-column: span 1 !important;
            border-radius: 20px !important;
          }
          .home-hotel-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }

        /* ── Small Mobile (480px) ── */
        @media (max-width: 480px) {
          .hero-title {
            font-size: clamp(1.9rem, 9vw, 2.4rem) !important;
          }
          .hero-section {
            min-height: 65vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
