import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Star, 
  LogOut,
  ChevronRight,
  Home,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings', label: 'My Bookings', icon: <Briefcase size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
  ];

  return (
    <div className="dashboard-sidebar" style={{ 
      width: '280px', 
      height: 'fit-content',
      borderRadius: '32px', 
      padding: '2.5rem 1.5rem',
      position: 'sticky',
      top: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: '#F1F3E0',
      border: '2px solid #A1BC98',
      boxShadow: '0 15px 35px rgba(161, 188, 152, 0.15)'
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
            onClick={() => setActiveTab(item.id)}
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
            cursor: 'pointer'
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
};

export default DashboardSidebar;
