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
      {/* Hero Section */}
      <section className="hero-section hero-responsive" style={{ 
        minHeight: '100vh', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("/landing-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '220px',
        textAlign: 'center'
      }}>
        <div className="container" style={{ textAlign: 'center', zIndex: 1 }}>
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
            style={{ fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', marginBottom: '1.5rem', color: 'white', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1' }}
          >
            Relax Your Mind
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hero-subtitle"
            style={{ color: 'white', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: '1.8', opacity: 0.9 }}
          >
            If you are looking for a break from the everyday hustle, discover our handpicked luxury stays tailored for your ultimate comfort and tranquility.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '2.5rem' }}
          >
            <button className="btn-primary" onClick={() => navigate('/hotels')} style={{ padding: '1rem 2.5rem', fontSize: '1rem', letterSpacing: '2px' }}>
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div className="search-bar-container" style={{ 
          position: 'absolute', 
          bottom: '10%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: '1140px',
          zIndex: 10
        }}>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="search-grid"
            style={{ 
              backgroundColor: '#222222', 
              padding: '2.5rem 3rem', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr',
              gap: '1.5rem',
              alignItems: 'end'
            }}
          >
            <div className="search-col-full">
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
              className="btn-primary search-btn" 
              style={{ height: '48px', width: '100%', borderRadius: '0' }}
              onClick={() => navigate(`/hotels?location=${location}`)}
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section style={{ padding: '6rem 0 7rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '1.5rem' }}>Hotel Accommodation</h2>
            <p className="section-desc" style={{ color: '#777', maxWidth: '600px', margin: '0 auto', fontSize: '14px' }}>
              We all live in an age that belongs to the young at heart. Life that is becoming extremely fast, and we must find time for peace.
            </p>
          </div>

          <div className="card-grid">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '400px' }}></div>)
            ) : (
              popularHotels.map((h) => (
                <HotelCard key={h._id} hotel={h} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section style={{ padding: '7rem 0', backgroundColor: '#e4e9cd' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '1.5rem' }}>Royal Facilities</h2>
            <p className="section-desc" style={{ color: '#777', fontSize: '14px' }}>Who are in extremely love with eco friendly system and premium service.</p>
          </div>
          
          <div className="facilities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Restaurant', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' },
              { title: 'Sports Club', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' },
              { title: 'Swimming Pool', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' },
              { title: 'Rent a Car', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' },
              { title: 'Gymnasium', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' },
              { title: 'Bar', desc: 'Usage of the Internet is becoming more common due to rapid advancement of technology.' }
            ].map((fac, i) => (
              <div key={i} className="facility-card" style={{ backgroundColor: 'white', padding: '50px 30px', textAlign: 'center', border: '1px solid #A1BC98', borderRadius: '24px', transition: 'all 0.3s ease' }}>
                <h4 style={{ marginBottom: '1.2rem', color: '#2c332b', fontWeight: 600 }}>{fac.title}</h4>
                <p style={{ fontSize: '13px', color: '#4a5448', lineHeight: '24px' }}>{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section (New) */}
      <section style={{ padding: '7rem 0' }}>
        <div className="container about-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: 600, color: '#222', marginBottom: '2rem', lineHeight: '1.3' }}>About Us <br/>Our History <br/>Mission & Vision</h2>
            <p className="section-desc" style={{ color: '#777', fontSize: '14px', lineHeight: '28px', marginBottom: '2rem' }}>
              As conscious traveling paupers we must always be concerned about our dear Mother Earth. If you think about it, you travel across her face, and She is the one that gives you the memories. 
              <br/><br/>
              That’s why it’s crucial that, as travelers, our behavior is beyond reproach. Inappropriate behavior is often laughed off, but we believe in respecting every destination.
            </p>
            <button className="btn-primary">Learn More</button>
          </div>
          <div className="about-image-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt="Hotel 1" />
             <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt="Hotel 2" />
             <img src="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '250px', objectFit: 'cover', gridColumn: 'span 2' }} alt="Hotel 3" />
          </div>
        </div>
      </section>

      {/* Recommended for YOU Section */}
      {user && (
        <section style={{ padding: '5rem 0', borderTop: '1px solid #eee' }}>
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
        .theme_btn {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        section {
            overflow: hidden;
        }

        @media (max-width: 992px) {
          .search-grid {
            grid-template-columns: 1fr 1fr !important;
            padding: 2rem !important;
          }
          .search-col-full {
             grid-column: span 2 !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            height: auto !important;
            padding: 10rem 0 !important;
          }
          .search-bar-container {
             position: relative !important;
             bottom: auto !important;
             left: auto !important;
             transform: none !important;
             width: 100% !important;
             margin-top: -50px;
          }
          .search-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            padding: 1.5rem !important;
          }
          .search-col-full {
             grid-column: span 1 !important;
          }
          .hero-title {
             font-size: 2.5rem !important;
          }
          .hero-subtitle {
             font-size: 0.95rem !important;
             margin-bottom: 2rem !important;
             padding: 0 1rem;
          }
          .section-title {
             font-size: 24px !important;
             margin-bottom: 1rem !important;
          }
          .section-desc {
             font-size: 13px !important;
          }
          .hero-responsive {
            padding-bottom: 50px !important;
            min-height: 80vh !important;
          }
          .facility-card {
            padding: 30px 20px !important;
          }
          .about-container {
             grid-template-columns: 1fr !important;
             gap: 2rem !important;
             text-align: center;
          }
          .about-image-grid {
             height: auto !important;
          }
          .about-image-grid img {
             height: 150px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
