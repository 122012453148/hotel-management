import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Github, Building2, UserCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && (roleParam === 'customer' || roleParam === 'manager')) {
      setFormData(prev => ({ ...prev, role: roleParam }));
      setStep(2);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      // As requested: After signup, the user should go to the login page
      alert('Registration successful! Please login to continue.');
      if (formData.role === 'manager') {
        navigate('/manager-login');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}?role=${formData.role || 'customer'}`;
  };

  const roleCards = [
    { id: 'customer', title: 'I am a Customer', desc: 'I want to book luxury hotels for my stay.', icon: <UserCircle size={40} /> },
    { id: 'manager', title: 'I am a Manager', desc: 'I want to list and manage my hotels.', icon: <Building2 size={40} /> }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary)', letterSpacing: '-1px' }}>
            {step === 1 ? 'Join Royal Hotel' : 'Complete Profile'}
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            {step === 1 ? 'How would you like to use our platform?' : `Setting up your ${formData.role} account`}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {roleCards.map(role => (
                <div 
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{ 
                    padding: '2rem', borderRadius: '24px', border: '2px solid #f3f4f6', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '1.5rem',
                    ':hover': { borderColor: 'var(--primary)', backgroundColor: '#f8fafc' }
                  }}
                  className="role-card"
                >
                  <div style={{ color: 'var(--primary)' }}>{role.icon}</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{role.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{role.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.form 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>FULL NAME</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input type="text" placeholder="John Doe" style={{ paddingLeft: '52px', borderRadius: '16px', height: '56px' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>EMAIL ADDRESS</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input type="email" placeholder="john@example.com" style={{ paddingLeft: '52px', borderRadius: '16px', height: '56px' }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                  <input type="password" placeholder="••••••••" style={{ paddingLeft: '52px', borderRadius: '16px', height: '56px' }} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  <span style={{ color: formData.password.length >= 8 ? '#10b981' : '#ef4444' }}>• Min 8 characters</span>
                  <span style={{ color: /[A-Z]/.test(formData.password) ? '#10b981' : '#ef4444' }}>• One uppercase letter</span>
                  <span style={{ color: /[0-9]/.test(formData.password) ? '#10b981' : '#ef4444' }}>• One number</span>
                  <span style={{ color: /[@$!%*?&]/.test(formData.password) ? '#10b981' : '#ef4444' }}>• One special char</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, backgroundColor: 'transparent', border: '1.5px solid #e5e7eb', color: '#6b7280', fontWeight: 700, borderRadius: '16px' }}>Back</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '16px' }}>
                  {loading ? 'Creating...' : <><UserPlus size={20} /> Sign Up</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

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
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </p>
      </motion.div>
      <style>{`
        .role-card:hover { transform: translateY(-4px); border-color: var(--primary) !important; background-color: #f8fafc; }
      `}</style>
    </div>
  );
};

export default Register;
