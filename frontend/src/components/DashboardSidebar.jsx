import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Star, 
  LogOut,
  ChevronRight,
  Home,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings', label: 'My Bookings', icon: <Briefcase size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="dashboard-sidebar" style={{ 
      width: '100%', 
      height: 'fit-content',
      borderRadius: '32px', 
      padding: '2.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: '#F1F3E0',
      border: '2px solid #A1BC98',
      boxShadow: '0 15px 35px rgba(161, 188, 152, 0.15)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ padding: '0.5rem 1rem 2.5rem 1rem', borderBottom: '1px solid rgba(161, 188, 152, 0.3)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4a5448', letterSpacing: '-0.5px' }}>Dashboard</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.1rem 1.25rem',
            borderRadius: '16px',
            color: '#4a5448',
            fontWeight: 600,
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(161, 188, 152, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Home size={22} color="#A1BC98" />
          <span style={{ fontSize: '0.95rem' }}>Go to Home</span>
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.1rem 1.25rem',
            borderRadius: '16px',
            color: '#4a5448',
            fontWeight: 600,
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(161, 188, 152, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={22} color="#A1BC98" />
          <span style={{ fontSize: '0.95rem' }}>Back</span>
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.5rem',
              borderRadius: '20px',
              backgroundColor: activeTab === item.id ? '#A1BC98' : 'transparent',
              color: activeTab === item.id ? 'white' : '#4a5448',
              fontWeight: activeTab === item.id ? 700 : 600,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeTab === item.id ? '0 8px 20px rgba(161, 188, 152, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => { if (activeTab !== item.id) e.currentTarget.style.backgroundColor = 'rgba(161, 188, 152, 0.15)'; }}
            onMouseLeave={(e) => { if (activeTab !== item.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {React.cloneElement(item.icon, { 
                size: 22,
                color: activeTab === item.id ? 'white' : '#A1BC98' 
              })}
              <span style={{ fontSize: '1rem' }}>{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={18} />}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2.5rem', borderTop: '1px solid rgba(161, 188, 152, 0.3)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.1rem 1.5rem',
            borderRadius: '20px',
            color: '#ef4444',
            fontWeight: 700,
            width: '100%',
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={22} />
          <span style={{ fontSize: '1rem' }}>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="mobile-sidebar-toggle" style={{ 
        display: 'none', 
        position: 'fixed', 
        bottom: '30px', 
        right: '30px', 
        zIndex: 2000 
      }}>
        <button 
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#A1BC98', 
            color: 'white', 
            boxShadow: '0 10px 30px rgba(161, 188, 152, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop View */}
      <div className="dashboard-sidebar-desktop" style={{ width: '280px', position: 'sticky', top: '120px' }}>
        {sidebarContent}
      </div>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)',
                zIndex: 1999
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                bottom: '20px',
                width: 'calc(100% - 40px)',
                maxWidth: '320px',
                zIndex: 2000,
                overflowY: 'auto'
              }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 992px) {
          .dashboard-sidebar-desktop { display: none !important; }
          .mobile-sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default DashboardSidebar;
