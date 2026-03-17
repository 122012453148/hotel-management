import React, { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', marginBottom: '2rem', textDecoration: 'none', width: 'fit-content' }}>
          <ArrowLeft size={18} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Forgot Password?</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <CheckCircle size={20} /> {message}
          </motion.div>
        )}

        {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    padding: '1rem 1rem 1rem 3.5rem', 
                    borderRadius: '16px', 
                    border: '1.5px solid #e5e7eb',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '1.125rem', 
                borderRadius: '16px', 
                fontSize: '1.125rem',
                fontWeight: 600,
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
