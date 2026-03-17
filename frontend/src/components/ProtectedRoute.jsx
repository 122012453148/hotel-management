import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
                <style>{`
                    .spin { animation: spin 2s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!user) {
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin" replace />;
        }
        if (location.pathname.startsWith('/manager')) {
            return <Navigate to="/manager-login" replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If allowedRoles is specified, check user's role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Only redirect if they are on a WRONG dashboard
        // Don't redirect if they are already on their OWN dashboard
        const currentPath = location.pathname;
        
        if (user.role === 'manager' && !currentPath.startsWith('/manager')) {
            return <Navigate to="/manager/dashboard" replace />;
        }
        if (user.role === 'admin' && !currentPath.startsWith('/admin/dashboard')) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === 'customer' && currentPath !== '/dashboard') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
