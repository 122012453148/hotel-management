import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Building2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const ManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    const userParam = params.get('user');
    if (userParam) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userParam));
        // Save to role-specific key so sessions don't overwrite each other
        const keyMap = { customer: 'customerInfo', manager: 'managerInfo', admin: 'adminInfo' };
        const key = keyMap[userInfo.role] || 'managerInfo';
        localStorage.setItem(key, JSON.stringify(userInfo));
        if (userInfo.role === 'manager') window.location.href = '/manager/dashboard';
        else if (userInfo.role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/';
      } catch (err) { console.error(err); setError('OAuth login failed'); }
    }
  }, [user, location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, 'manager');
      navigate('/manager/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}?role=manager`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid #eff6ff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <img src="/logo.png" alt="Royal Hotel Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary)', letterSpacing: '-1px' }}>
            Manager Login
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.75rem' }}>
            Access your manager dashboard
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
              <input type="email" placeholder="manager@example.com" style={{ paddingLeft: '52px', borderRadius: '16px', height: '56px', width: '100%', border: '1.5px solid #e5e7eb', textAlign: 'left' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>PASSWORD</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
              <input type="password" placeholder="••••••••" style={{ paddingLeft: '52px', borderRadius: '16px', height: '56px', width: '100%', border: '1px solid #e5e7eb', textAlign: 'left' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '16px', marginTop: '1rem', fontWeight: 700 }}>
            {loading ? 'Entering...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <div style={{ margin: '2.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
        </div>

        <div className="social-btns-flex">
          <button onClick={() => handleOAuthLogin('google')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '16px', border: '1.5px solid #f3f4f6', backgroundColor: '#fcfcfc', fontWeight: 700, cursor: 'pointer', color: 'var(--secondary)' }}>
            <FcGoogle size={20} /> Google
          </button>
          <button onClick={() => handleOAuthLogin('github')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '16px', border: '1.5px solid #f3f4f6', backgroundColor: '#fcfcfc', fontWeight: 700, cursor: 'pointer', color: 'var(--secondary)' }}>
            <Github size={20} /> GitHub
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-light)', fontWeight: 500 }}>
          New to Royal Hotel? <Link to="/register?role=manager" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ManagerLogin;
