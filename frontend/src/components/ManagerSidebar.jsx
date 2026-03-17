import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  BedDouble, 
  TicketCheck, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Home,
  ArrowLeft,
  ClipboardList,
  TrendingUp
 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'hotels', label: 'My Hotels', icon: <Building2 size={20} /> },
    { id: 'addHotel', label: 'Add Hotel', icon: <PlusCircle size={20} /> },
    { id: 'manageRooms', label: 'Manage Rooms', icon: <BedDouble size={20} /> },
    { id: 'housekeeping', label: 'Housekeeping', icon: <ClipboardList size={20} /> },
    { id: 'bookings', label: 'Bookings', icon: <TicketCheck size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="manager-sidebar" style={{ 
      width: '280px', 
      height: 'fit-content',
      borderRadius: '32px', 
      padding: '2.5rem 1.5rem',
      position: 'sticky',
      top: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: '#FBF6F6',
      border: '2px solid #AEB784',
      boxShadow: '0 15px 35px rgba(174, 183, 132, 0.15)',
      overflow: 'hidden'
    }}>
      {/* Decorative Green Circles */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(174, 183, 132, 0.2)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(174, 183, 132, 0.1)' }}></div>

      <div style={{ padding: '0 1rem 2rem 1rem', borderBottom: '1px solid rgba(174, 183, 132, 0.3)', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#AEB784' }}>Manager Panel</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
            color: '#717D44',
            fontWeight: 600,
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(174, 183, 132, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Home size={20} />
          <span>Go to Home</span>
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
            color: '#717D44',
            fontWeight: 600,
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(174, 183, 132, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: activeTab === item.id ? '#AEB784' : 'transparent',
              color: activeTab === item.id ? 'white' : '#717D44',
              fontWeight: activeTab === item.id ? 700 : 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { if(activeTab !== item.id) e.currentTarget.style.backgroundColor = 'rgba(174, 183, 132, 0.1)'; }}
            onMouseLeave={(e) => { if(activeTab !== item.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(174, 183, 132, 0.3)', position: 'relative', zIndex: 1 }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
            color: 'var(--error)',
            fontWeight: 700,
            width: '100%',
            backgroundColor: 'transparent'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ManagerSidebar;
