import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const ChatWindow = ({ booking, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // Extract receiver ID based on role
  const getReceiverId = () => {
    if (user.role === 'customer') {
      // For customer, receiver is the hotel manager
      const manager = booking.hotel?.manager;
      return manager ? (typeof manager === 'object' ? manager._id : manager) : null;
    } else {
      // For manager/admin, receiver is the guest
      const guest = booking.user;
      return guest ? (typeof guest === 'object' ? guest._id : guest) : null;
    }
  };

  const receiverId = getReceiverId();

  useEffect(() => {
    if (!user?._id) return;

    // Initialize socket
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', user._id);
    });

    newSocket.on('newMessage', (message) => {
      if (message.booking === booking._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${booking._id}`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();

    return () => newSocket.disconnect();
  }, [booking._id, user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;

    try {
      const { data } = await api.post('/messages', {
        bookingId: booking._id,
        receiverId,
        content: newMessage
      });

      setMessages((prev) => [...prev, { ...data, sender: { _id: user._id, name: user.name } }]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      border: '1px solid #f1f5f9'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--primary)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '35px', height: '35px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
              {user.role === 'customer' 
                ? (booking.hotel?.name || 'Hotel Manager') 
                : ('Guest: ' + (booking.user?.name || 'Customer'))}
            </p>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: 0 }}>
              Booking #{booking._id?.substring(0,6).toUpperCase()}
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {messages.map((msg, index) => {
          const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <div key={index} style={{
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              backgroundColor: isOwn ? 'var(--primary)' : 'white',
              color: isOwn ? 'white' : 'var(--text)',
              padding: '0.75rem 1rem',
              borderRadius: isOwn ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
              maxWidth: '80%',
              fontSize: '0.9rem',
              boxShadow: isOwn ? 'none' : '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              {msg.content}
              <p style={{ fontSize: '0.65rem', margin: '4px 0 0', opacity: 0.7, textAlign: 'right' }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{
        padding: '1rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 15px',
            borderRadius: '25px',
            border: '1px solid #e2e8f0',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button type="submit" style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
