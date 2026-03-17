import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const { data } = await api.get(`/auth/verify/${token}`);
                setStatus('success');
                setMessage(data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            }
        };
        verifyToken();
    }, [token]);

    return (
        <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card"
                style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}
            >
                {status === 'verifying' && (
                    <>
                        <Loader2 size={64} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 2rem' }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Verifying...</h2>
                        <p style={{ color: 'var(--text-light)' }}>Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <CheckCircle size={48} color="#059669" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>Success!</h2>
                        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '2.5rem' }}>{message}</p>
                        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', width: '100%', padding: '1rem', borderRadius: '16px', fontWeight: 600, textDecoration: 'none' }}>
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <XCircle size={48} color="#dc2626" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Oops!</h2>
                        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '2.5rem' }}>{message}</p>
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Try logging in
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
