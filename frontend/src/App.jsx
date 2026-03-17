import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// One-time migration: move old shared 'userInfo' key to role-specific key
// so that returning users don't get stuck in the old single-key system.
(() => {
  try {
    const old = localStorage.getItem('userInfo');
    if (old) {
      const parsed = JSON.parse(old);
      const keyMap = { customer: 'customerInfo', manager: 'managerInfo', admin: 'adminInfo' };
      const newKey = keyMap[parsed?.role];
      if (newKey && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, old);
      }
      localStorage.removeItem('userInfo');
    }
  } catch { localStorage.removeItem('userInfo'); }
})();
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CustomerLogin from './pages/CustomerLogin';
import ManagerLogin from './pages/ManagerLogin';
import Register from './pages/Register';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Dashboard from './pages/Dashboard';
import HotelManagerDashboard from './pages/HotelManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import Wishlist from './pages/Wishlist';

import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/manager') || location.pathname.startsWith('/admin') || location.pathname === '/dashboard';
  
  return (
    <>
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/booking/:hotelId/:roomId" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/payment/:bookingId" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/booking-success/:bookingId" element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        
        {/* Role-Based Dashboards — each renders the correct component directly */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute>
              <HotelManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Toaster position="top-center" reverseOrder={false} />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
