import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Star, ShieldCheck, Clock, Award, CheckCircle2, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';
import ImageGallery from '../components/ImageGallery';
import RoomCard from '../components/RoomCard';
import AmenitiesList from '../components/AmenitiesList';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/hotels/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBook = async (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${data.hotel._id}/${room._id}`);
  };
  
  const isWishlisted = user?.wishlist?.includes(id);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setIsWishlisting(true);
    try {
      const { data: wishlistData } = await api.post(`/wishlist/toggle/${id}`);
      updateUser({ ...user, wishlist: wishlistData.wishlist });
      toast.success(wishlistData.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsWishlisting(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: '600px', borderRadius: '32px', marginBottom: '3rem' }} />
      <div className="skeleton" style={{ height: '40px', width: '300px', margin: '0 auto 2rem' }} />
    </div>
  );
  
  if (!data) return <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>Hotel not found</div>;

  const { hotel, rooms } = data;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      {/* Header */}
      <div className="details-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '2rem', flexWrap: 'wrap' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
             <Star size={18} fill="#f59e0b" color="#f59e0b" />
             <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{hotel.rating}</span>
             <span style={{ color: 'var(--text-light)', fontSize: '1rem' }}>• {hotel.numReviews || 0} Professional Reviews</span>
          </div>
          <h1 className="hotel-title" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-2px', marginBottom: '0.5rem' }}>{hotel.name}</h1>
        </motion.div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlisting}
            style={{
              backgroundColor: isWishlisted ? '#fef2f2' : 'white',
              border: '2px solid',
              borderColor: isWishlisted ? '#ef4444' : '#e2e8f0',
              borderRadius: '14px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              color: isWishlisted ? '#ef4444' : 'var(--text-light)',
              transition: 'all 0.2s'
            }}
          >
            <Heart size={20} fill={isWishlisted ? '#ef4444' : 'transparent'} />
            {isWishlisted ? 'Saved' : 'Save to Wishlist'}
          </button>
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} /> Safe & Verified
          </div>
        </div>
      </div>

      <ImageGallery images={hotel.images} />
      
      {/* Property Navigation */}
      <div className="property-nav" style={{ 
        display: 'flex', 
        gap: '3rem', 
        padding: '1.25rem 2.5rem', 
        backgroundColor: 'white',
        borderRadius: '100px', // Curved pill shape
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9', 
        marginBottom: '4rem',
        position: 'sticky',
        top: '100px',
        zIndex: 50,
        alignItems: 'center',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {['Deals', 'About Us', 'Reviews', 'Location'].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase().replace(' ', '-')}`} 
            style={{ 
              textDecoration: 'none', 
              color: 'var(--secondary)', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              transition: '0.3s',
              opacity: 0.7,
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.color = 'var(--secondary)';
            }}
          >
            {item}
          </a>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
           .details-layout {
              grid-template-columns: 1fr !important;
              gap: 3rem !important;
           }
           .hotel-title {
              font-size: 3rem !important;
           }
        }
        @media (max-width: 768px) {
           .property-nav {
              padding: 1rem 1.5rem !important;
              gap: 1.5rem !important;
              top: 70px !important;
           }
           .hotel-title {
              font-size: 2.25rem !important;
              letter-spacing: -1px !important;
           }
           .details-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              margin-bottom: 2rem !important;
           }
           .map-container {
              height: 300px !important;
           }
        }
      `}</style>

      <div className="details-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem' }}>
        <main>
          {/* About Section */}
          <section id="about-us" style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--secondary)' }}>About this property</h2>
            <p style={{ fontSize: '1.2rem', color: '#4b5563', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{hotel.description}</p>
          </section>

          {/* Amenities Section */}
          <section style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Exceptional Amenities</h2>
            <AmenitiesList amenities={hotel.amenities} />
          </section>

          {/* Room Selection Section */}
          <section id="deals" style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--secondary)' }}>Choose Your Room</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {rooms.map((room) => (
                <RoomCard 
                  key={room._id} 
                  room={room} 
                  onSelect={handleBook} 
                  loading={bookingLoading} 
                />
              ))}
            </div>
          </section>

          <div id="reviews">
            <ReviewSection hotelId={hotel._id} />
          </div>

          <section id="location" style={{ marginTop: '5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary)' }}>Location</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
               <MapPin size={24} color="var(--primary)" />
               <span>{hotel.address || hotel.name}, {hotel.location}</span>
            </div>
            <div className="map-container" style={{ width: '100%', height: '450px', backgroundColor: '#f8fafc', borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <iframe 
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 scrolling="no" 
                 marginHeight="0" 
                 marginWidth="0" 
                 src={`https://maps.google.com/maps?q=${encodeURIComponent((hotel.address || hotel.name) + " " + hotel.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                 style={{ border: 0 }}
                 title="Hotel Location Map"
               ></iframe>
            </div>
          </section>
        </main>

        <aside className="details-sidebar">
          <div style={{ position: 'sticky', top: '120px' }}>
            <div className="glass-morphism" style={{ padding: '3rem', borderRadius: '40px', border: '1px solid rgba(196, 164, 132, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                  <Award size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>Royal Hotel Preferred</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Exceptional service & price</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                   <div>
                     <p style={{ fontWeight: 700, fontSize: '1rem' }}>Instant Confirmation</p>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Voucher sent to your email immediately</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <Clock size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                   <div>
                     <p style={{ fontWeight: 700, fontSize: '1rem' }}>24/7 Support</p>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Our dedicated team is here for you</p>
                   </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '24px', border: '1px dashed #fb923c' }}>
                <p style={{ color: '#9a3412', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center' }}>
                  Hurry! 4 rooms were booked in this area in the last 2 hours.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HotelDetails;
