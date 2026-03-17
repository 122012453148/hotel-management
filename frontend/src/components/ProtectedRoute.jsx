import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — enforces role-based access per portal.
 *
 * Strategy:
 *  - /manager/* routes → user must be logged in AND have role 'manager'
 *  - /admin/*   routes → user must be logged in AND have role 'admin'
 *  - all other  routes → user must be logged in AND have role 'customer'
 *    (unless allowedRoles explicitly overrides this)
 *
 * Because AuthContext now loads the session from the correct role-specific
 * localStorage key based on the URL path, `user` here already reflects the
 * right portal's session — so role checks are straightforward.
 */
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

    const path = location.pathname;

    // Determine which role this portal expects
    let expectedRole = 'customer';
    if (path.startsWith('/manager')) expectedRole = 'manager';
    if (path.startsWith('/admin'))   expectedRole = 'admin';

    // Use allowedRoles if explicitly passed, otherwise derive from URL
    const requiredRoles = allowedRoles || [expectedRole];

    // Not logged in → redirect to the correct login page for this portal
    if (!user) {
        if (path.startsWith('/admin'))   return <Navigate to="/admin" replace />;
        if (path.startsWith('/manager')) return <Navigate to="/manager-login" replace />;
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but wrong role for this portal → redirect to the correct login page
    // (don't auto-redirect to the other portal's dashboard — that caused cross-session mixing)
    if (!requiredRoles.includes(user.role)) {
        if (path.startsWith('/admin'))   return <Navigate to="/admin" replace />;
        if (path.startsWith('/manager')) return <Navigate to="/manager-login" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
