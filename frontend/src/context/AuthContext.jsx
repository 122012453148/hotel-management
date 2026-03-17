import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Each role gets its own isolated localStorage key.
// This prevents the customer session from bleeding into the manager portal and vice versa.
const STORAGE_KEY = {
  customer: 'customerInfo',
  manager:  'managerInfo',
  admin:    'adminInfo',
};

// Helper: load a stored session for a specific role
const getStoredUser = (role) => {
  try {
    const key = STORAGE_KEY[role];
    const raw = key ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Helper: figure out which portal we are currently in based on URL path
// Called once synchronously before first render
const detectRoleFromPath = () => {
  const path = window.location.pathname;
  if (path.startsWith('/manager')) return 'manager';
  if (path.startsWith('/admin'))   return 'admin';
  return 'customer';
};

// On initial load, restore the session that belongs to the current portal
const initUser = () => {
  const role = detectRoleFromPath();
  return getStoredUser(role);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initUser);
  const [loading] = useState(false);

  // Save user to the correct role-specific key
  const persistUser = (data) => {
    if (!data?.role) return;
    const key = STORAGE_KEY[data.role];
    if (key) localStorage.setItem(key, JSON.stringify(data));
  };

  const login = async (email, password, role) => {
    const { data } = await api.post('/auth/login', { email, password, role });
    persistUser(data);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    return data;
  };

  const logout = (role) => {
    // Clear only the relevant role's session
    const targetRole = role || user?.role;
    if (targetRole && STORAGE_KEY[targetRole]) {
      localStorage.removeItem(STORAGE_KEY[targetRole]);
    }
    setUser(null);
  };

  const updateUser = (data) => {
    persistUser(data);
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
