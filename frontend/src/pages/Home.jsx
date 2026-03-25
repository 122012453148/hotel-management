import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import HotelCard from '../components/HotelCard';
import RecommendedHotels from '../components/RecommendedHotels';
import Footer from '../components/Footer';
import LocationInput from '../components/LocationInput';
import OffersSection from '../components/OffersSection';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1920"
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [popularHotels, setPopularHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [currentHero, setCurrentHero] = useState(0);

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

    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    let url = `/hotels?location=${location}`;
    if (checkIn) url += `&checkIn=${checkIn}`;
    if (checkOut) url += `&checkOut=${checkOut}`;
    url += `&adults=${adults}&children=${children}`;
    navigate(url);
  };

  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>

      <section
        className="hero-section"
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          overflow: 'hidden',
          paddingBottom: '200px',
          textAlign: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("${HERO_IMAGES[currentHero]}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0
            }}
          />
        </AnimatePresence>

        <div className="container" style={{ textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
          <motion.h4
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#A1BC98', letterSpacing: '4px', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '13px' }}
          >
            Curated Luxury Experiences
          </motion.h4>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="hero-title"
            style={{ 
              fontSize: 'clamp(2.5rem, 8vw, 6.5rem)', 
              marginBottom: '1.5rem', 
              color: 'white', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              lineHeight: '1.05', 
              textShadow: '0 10px 30px rgba(0,0,0,0.5)' 
            }}
          >
            Relax Your <br/> Mind & Body
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hero-subtitle"
            style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 2.5rem auto', lineHeight: '1.9', fontWeight: 500 }}
          >
            Indulge in our handpicked sanctuary collection — where breathtaking architecture meets unparalleled hospitality for your ultimate tranquility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: '4rem' }}
          >
            <button className="btn-primary" onClick={() => navigate('/hotels')} style={{ padding: '0.85rem 2.2rem', fontSize: '0.9rem', letterSpacing: '2px', borderRadius: '40px', boxShadow: '0 15px 30px rgba(161, 188, 152, 0.4)' }}>
              Explore Property
            </button>
          </motion.div>
        </div>

        <div
          className="hero-search-desktop"
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '94%',
            maxWidth: '1280px',
            zIndex: 10,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              padding: '2rem 2.25rem',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 1.8fr) minmax(130px, 0.9fr) minmax(130px, 0.9fr) minmax(210px, 1.8fr) 0.7fr',
              gap: '1rem',
              alignItems: 'end',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 800, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>Destination</label>
              <LocationInput
                value={location}
                onChange={setLocation}
                placeholder="Where to?"
                inputStyle={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', height: '54px', fontSize: '14px', padding: '0 15px 0 3.5rem' }}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 800, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>CHECK IN</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 15px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', height: '54px', width: '100%' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 800, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>CHECK OUT</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 15px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', height: '54px', width: '100%' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', fontWeight: 800, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>ADULTS</label>
                  <select value={adults} onChange={(e) => setAdults(e.target.value)} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 10px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', height: '54px', width: '100%', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} style={{color: 'black'}}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', fontWeight: 800, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>CHILD.</label>
                  <select value={children} onChange={(e) => setChildren(e.target.value)} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 10px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', height: '54px', width: '100%', cursor: 'pointer' }}>
                    {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} style={{color: 'black'}}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ height: '54px', width: '100%', borderRadius: '14px', fontWeight: 800 }}
              onClick={handleSearch}
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      <div className="hero-search-mobile" style={{ display: 'none', backgroundColor: '#FBFAF0', padding: '1.5rem 1.5rem 2.5rem', borderTop: '2px solid #A1BC98' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ color: 'var(--secondary)', fontSize: '11px', fontWeight: 900, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Destination</label>
            <LocationInput
              value={location}
              onChange={setLocation}
              placeholder="Enter city or hotel name"
              inputStyle={{ backgroundColor: 'white', color: 'var(--secondary)', borderRadius: '14px', border: '2px solid #E5EAD7', height: '52px', fontSize: '14px', padding: '0 15px 0 3.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
               <label style={{ color: 'var(--secondary)', fontSize: '11px', fontWeight: 900, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px' }}>CHECK IN</label>
               <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ height: '52px', width: '100%', borderRadius: '14px', backgroundColor: 'white', border: '2px solid #E5EAD7', color: 'var(--secondary)', fontSize: '13px', fontWeight: 800, padding: '0 12px', boxSizing: 'border-box' }} />
            </div>
            <div>
               <label style={{ color: 'var(--secondary)', fontSize: '11px', fontWeight: 900, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px' }}>CHECK OUT</label>
               <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ height: '52px', width: '100%', borderRadius: '14px', backgroundColor: 'white', border: '2px solid #E5EAD7', color: 'var(--secondary)', fontSize: '13px', fontWeight: 800, padding: '0 12px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                   <label style={{ color: 'var(--secondary)', fontSize: '10px', fontWeight: 900, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>ADULTS</label>
                   <select value={adults} onChange={(e) => setAdults(e.target.value)} style={{ height: '52px', width: '100%', borderRadius: '14px', backgroundColor: 'white', border: '2px solid #E5EAD7', color: 'var(--secondary)', fontSize: '13px', fontWeight: 800, padding: '0 8px', boxSizing: 'border-box' }}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Ad.</option>)}
                   </select>
                </div>
                <div>
                   <label style={{ color: 'var(--secondary)', fontSize: '10px', fontWeight: 900, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>CHILD.</label>
                   <select value={children} onChange={(e) => setChildren(e.target.value)} style={{ height: '52px', width: '100%', borderRadius: '14px', backgroundColor: 'white', border: '2px solid #E5EAD7', color: 'var(--secondary)', fontSize: '13px', fontWeight: 800, padding: '0 8px', boxSizing: 'border-box' }}>
                      {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Ch.</option>)}
                   </select>
                </div>
          </div>
          <button
            className="btn-primary"
            style={{ height: '56px', width: '100%', borderRadius: '16px', fontWeight: 800, fontSize: '15px' }}
            onClick={handleSearch}
          >
            Find My Stay
          </button>
        </motion.div>
      </div>

      <OffersSection />

      <section className="home-section" style={{ padding: '7rem 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 className="section-title" style={{ fontSize: '40px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Curated Selections</h2>
            <p className="section-desc" style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '15px', lineHeight: '1.8' }}>
              Exceptional properties handpicked for their unique character, superior service, and attention to every detail of your stay.
            </p>
          </motion.div>
          
          <motion.div 
             className="home-hotel-grid" 
             style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={{
               hidden: { opacity: 0 },
               visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
             }}
          >
            {loading
              ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '420px', borderRadius: '24px' }} />)
              : popularHotels.map(h => (
                <motion.div key={h._id} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                  <HotelCard hotel={h} />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      </section>

      <section className="home-section facilities-section" style={{ padding: '8rem 0', backgroundColor: '#F4F7E6', position: 'relative' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ textAlign: 'center', marginBottom: '5rem' }}
          >
            <h2 className="section-title" style={{ fontSize: '40px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Signature Amenities</h2>
            <p className="section-desc" style={{ color: '#7a8677', fontSize: '15px', fontWeight: 500 }}>Refined comfort designed to elevate every moment of your vacation.</p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Haute Cuisine', icon: '🍽️', desc: 'World-class gastronomy by Michelin-trained chefs.' },
              { title: 'Wellness Spa', icon: '💆', desc: 'Ancient rituals meeting modern holistic luxury.' },
              { title: 'Private Infinity', icon: '🏊', desc: 'Secluded pools overlooking breathtaking vistas.' },
              { title: 'Chauffeur Service', icon: '🚘', desc: 'Arrive in style with our premium fleet.' },
              { title: 'Elite Gym', icon: '💪', desc: 'State-of-the-art equipment with personal coaching.' },
              { title: 'Sky Lounge', icon: '🍸', desc: 'Expert mixology under the starlight.' },
            ].map((fac, i) => (
              <motion.div 
                key={i} 
                className="facility-card-new" 
                whileHover={{ y: -12, scale: 1.02 }}
                style={{ 
                   backgroundColor: 'white', 
                   padding: '50px 30px', 
                   textAlign: 'center', 
                   borderRadius: '30px', 
                   boxShadow: '0 10px 30px rgba(161, 188, 152, 0.1)',
                   border: '1px solid rgba(161, 188, 152, 0.2)',
                   cursor: 'default'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{fac.icon}</div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)', fontWeight: 800, fontSize: '1.25rem' }}>{fac.title}</h4>
                <p style={{ fontSize: '14px', color: '#667064', lineHeight: '24px' }}>{fac.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" style={{ padding: '6rem 0' }}>
        <div className="container about-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 className="section-title" style={{ fontSize: '46px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '2.5rem', lineHeight: '1.15', letterSpacing: '-1.5px' }}>
              Defining Luxury <br /> Since the Early Golden Era.
            </h2>
            <p className="section-desc" style={{ color: '#666', fontSize: '16px', lineHeight: '1.9', maxWidth: '800px', margin: '0 auto 2.5rem auto' }}>
              At Royal Hotel, we believe travel is more than a destination; it's a renewal of the soul. Our mission is to provide spaces that inspire, comfort, and leave lasting imprints on your journey.
            </p>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '40px' }}>Discover Our History</button>
          </motion.div>
          
          <motion.div 
            className="about-image-layout" 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }} 
              alt="Luxury 1" 
            />
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }} 
              alt="Luxury 2" 
            />
          </motion.div>
        </div>
      </section>

      {user && (
        <section className="home-section" style={{ padding: '6rem 0', borderTop: '1px solid #ebece6', backgroundColor: '#FBFAF0' }}>
          <div className="container">
            <RecommendedHotels />
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        .hero-search-desktop input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        .mobile-date-input::-webkit-calendar-picker-indicator {
          filter: none !important;
          cursor: pointer;
        }

        .facility-card-new:hover {
          box-shadow: 0 40px 80px rgba(161, 188, 152, 0.2) !important;
          border-color: #A1BC98 !important;
        }

        @media (max-width: 992px) {
          .hero-section { padding-bottom: 80px !important; }
          .about-image-layout { grid-template-columns: 1fr !important; }
          .section-title { font-size: 32px !important; }
        }

        @media (max-width: 768px) {
          .hero-section { min-height: 80vh !important; padding-bottom: 2rem !important; }
          .hero-search-desktop { display: none !important; }
          .hero-search-mobile { display: block !important; }
          .hero-title { font-size: clamp(2.2rem, 12vw, 3.8rem) !important; line-height: 1.1 !important; margin-bottom: 1.5rem !important; }
          .about-image-layout img { height: 250px !important; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: clamp(1.9rem, 11vw, 2.8rem) !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
