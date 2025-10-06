import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { readSession, saveSession, clearSession } from '../utils/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const normalizeRole = (raw) => {
    if (!raw) return null;
    let r = String(raw).toLowerCase().trim();
    if (r === 'students') r = 'student';
    return r;
  };

  const ensureRole = (s) => {
    if (!s) return s;
    const inferred = (
      s?.user?.role ||
      s?.role ||
      s?.user?.usertype ||
      s?.usertype ||
      null
    );
    const role = normalizeRole(inferred) || 'student';
    const user = { ...(s.user || {}), role };
    return { ...s, user, role };
  };

  const [session, setSession] = useState(() => ensureRole(readSession()));

  useEffect(() => {
    // Keep state in sync with sessionStorage changes (multi-tab)
    const handler = () => setSession(ensureRole(readSession()));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = (payload) => {
    console.log('🔍 AuthContext login - Raw payload:', payload);
    
    const normalized = {
      ...payload,
      user: payload?.user || {},
    };
    
    console.log('🔍 AuthContext login - Normalized payload:', normalized);
    
    // Derive role from role/usertype fields
    const inferred = (
      normalized?.user?.role ||
      normalized?.role ||
      normalized?.user?.usertype ||
      normalized?.usertype ||
      null
    );
    
    console.log('🔍 AuthContext login - Inferred role:', inferred);
    
    const ensuredRole = normalizeRole(inferred) || 'student';
    normalized.user.role = ensuredRole;
    normalized.role = ensuredRole;
    
    console.log('🔍 AuthContext login - Final session data:', normalized);
    
    saveSession(normalized);
    setSession(normalized);
  };

  const logout = async () => {
    const token = (session?.token || session?.accessToken || null);
    const url = import.meta?.env?.VITE_API_LOGOUT_URL || 'http://localhost/api/logout.php';
    if (token) {
      try {
        await axios.post(
          url,
          { token },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } catch (e) {
        // Non-fatal: we still clear local session
        if (import.meta?.env?.MODE !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('Logout API call failed:', e?.response?.data || e?.message || e);
        }
      }
    }
    clearSession();
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    role: session?.user?.role || session?.role || null,
    token: session?.token || session?.accessToken || null,
    isAuthenticated: !!session,
    login,
    logout,
  }), [session]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
