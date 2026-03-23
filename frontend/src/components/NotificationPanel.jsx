import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Calendar, CreditCard, AlertCircle, Info } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Fetch initial notifications
      fetchNotifications();

      // Initialize Socket.io — use env var so production points to the Render backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace('/api', '').replace(/\/$/, '');
      socketRef.current = io(socketUrl, { transports: ['websocket', 'polling'] });
      
      // Join user-specific room
      socketRef.current.emit('join', user._id);

      // Listen for new notifications
      socketRef.current.on('newNotification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show a browser notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newNotif.title, { body: newNotif.message });
        }
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    // Count unread
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    // Close panel when clicking outside
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar size={18} color="#10b981" />;
      case 'payment': return <CreditCard size={18} color="#3b82f6" />;
      case 'cancellation': return <AlertCircle size={18} color="#ef4444" />;
      default: return <Info size={18} color="#6b7280" />;
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', backgroundColor: 'transparent', padding: '0.5rem', borderRadius: '50%' }}
      >
        <Bell size={22} color="var(--text)" />
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '5px', right: '5px', 
            backgroundColor: '#ef4444', color: 'white', 
            fontSize: '10px', height: '16px', width: '16px', 
            borderRadius: '50%', display: 'flex', 
            justifyContent: 'center', alignItems: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="notifications-dropdown"
            style={{ 
              position: 'absolute', top: '100%', right: 0, 
              marginTop: '1rem', width: '350px', 
              maxHeight: '450px', backgroundColor: 'white', 
              borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
              zIndex: 1001, overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Notifications</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={markAllRead} title="Mark all as read" style={{ padding: '0.2rem', color: 'var(--text-light)' }}><Check size={18} /></button>
                <button onClick={() => setIsOpen(false)} style={{ padding: '0.2rem', color: 'var(--text-light)' }}><X size={18} /></button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                  <Bell size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  if (!n) return null;
                  return (
                    <div 
                      key={n._id} 
                      onClick={() => markAsRead(n._id)}
                      style={{ 
                        padding: '1rem', borderRadius: '12px', 
                        marginBottom: '0.5rem', cursor: 'pointer',
                        backgroundColor: n.read ? 'transparent' : '#f0f9ff',
                        display: 'flex', gap: '0.75rem',
                        transition: 'background-color 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = n.read ? '#f9fafb' : '#e0f2fe'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : '#f0f9ff'}
                    >
                      <div style={{ marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: n.read ? '#4b5563' : '#111827' }}>{n.title}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>{n.message}</p>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                          {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => deleteNotification(n._id, e)}
                        style={{ padding: '0.2rem', color: '#d1d5db', alignSelf: 'start' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                      >
                        <Trash2 size={14} />
                      </button>
                      {!n.read && <div style={{ position: 'absolute', right: '10px', bottom: '10px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
              <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>View All Notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 768px) {
          .notifications-dropdown {
            position: fixed !important;
            top: 70px !important;
            left: 10px !important;
            right: 10px !important;
            width: calc(100% - 20px) !important;
            max-height: 80vh !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
