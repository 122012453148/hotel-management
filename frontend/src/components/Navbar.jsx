import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Hotel, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      padding: '1.2rem 0', 
      backgroundColor: 'var(--primary)', 
      boxShadow: '0 4px 20px rgba(161, 188, 152, 0.2)',
      textTransform: 'uppercase',
      fontSize: '12px',
      letterSpacing: '1px'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/logo.png" alt="Royal Hotel Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }} />
          <span className="logo-text" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px', color: 'white' }}>Royal Hotel Bookings</span>
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', color: 'white' }} className="desktop-menu">
          <Link to="/" style={{ fontWeight: 600, color: 'white' }}>Home</Link>
          <Link to="/hotels" style={{ fontWeight: 600, color: 'white' }}>Accommodation</Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Logged-in user greeting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'white', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '13px', flexShrink: 0
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>
                  Hi, {user.name?.split(' ')[0]}
                </span>
              </div>

              <NotificationPanel />

              <Link to="/dashboard" style={{ fontWeight: 600, color: 'white' }}>Dashboard</Link>
              <Link to="/wishlist" style={{ fontWeight: 600, color: 'white' }}>Wishlist</Link>

              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'uppercase'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/login" style={{ fontWeight: 600, color: 'white' }}>Customer Login</Link>
              <Link to="/register" style={{ padding: '10px 25px', backgroundColor: 'white', color: 'var(--primary)', fontWeight: 800, borderRadius: '12px' }}>Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle" style={{ display: 'none' }}>
           <button onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: 'transparent', color: 'white', border: 'none', padding: '5px' }}>
             {isOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              display: 'none', 
              backgroundColor: 'white', 
              width: '100%', 
              flexDirection: 'column',
              padding: '1.5rem 0',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              borderBottom: '4px solid var(--primary)'
            }}
            className="mobile-menu-content"
          >
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/" onClick={() => setIsOpen(false)} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', color: 'var(--secondary)', fontWeight: 600 }}>Home</Link>
              <Link to="/hotels" onClick={() => setIsOpen(false)} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', color: 'var(--secondary)', fontWeight: 600 }}>Accommodation</Link>
              {user ? (
                <>
                  <div style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '14px' }}>Hi, {user.name?.split(' ')[0]}</span>
                    </div>
                    <NotificationPanel />
                  </div>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', color: 'var(--secondary)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutDashboard size={18} /> Dashboard</Link>
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', color: 'var(--secondary)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}><Hotel size={18} /> Wishlist</Link>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    style={{ padding: '20px 0', textAlign: 'left', color: '#ef4444', fontWeight: 800, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', color: 'var(--secondary)', fontWeight: 600 }}>Customer Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} style={{ padding: '20px 0', color: 'var(--primary)', fontWeight: 800 }}>Register Account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 992px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
          .mobile-menu-content { display: flex !important; }
          .logo-text { font-size: 16px !important; }
        }
        @media (max-width: 480px) {
           .logo-text { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
