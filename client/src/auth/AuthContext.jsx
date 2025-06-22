import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const timeoutRef = useRef(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Fetch permissions if not already in user object
        if (!parsedUser.permissions && parsedUser.userID) {
          try {
            const res = await axios.get(`${baseUrl}/permissions/users/${parsedUser.userID}/permissions`);
            const userWithPermissions = {
              ...parsedUser,
              permissions: res.data.data
            };
            setUser(userWithPermissions);
            localStorage.setItem('user', JSON.stringify(userWithPermissions));
          } catch (error) {
            console.error('Error fetching permissions:', error);
            setUser(parsedUser);
          }
        } else {
          setUser(parsedUser);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [baseUrl]);

  useEffect(() => {
    if (user) {
      startInactivityTimer();
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
    }

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      clearTimeout(timeoutRef.current);
    };
  }, [user]);

  const startInactivityTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      logout(true); // auto logout
    }, 10 * 60 * 1000);
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${baseUrl}/auth/login`, { username, password });
      if (res.data.status === 'success') {
        // Fetch permissions after login
        const permissionsRes = await axios.get(`${baseUrl}/permissions/users/${res.data.user.userID}/permissions`);
        
        const userWithPermissions = {
          ...res.data.user,
          permissions: permissionsRes.data.data
        };
        
        setUser(userWithPermissions);
        localStorage.setItem('user', JSON.stringify(userWithPermissions));
        return { success: true, role: res.data.user.role };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = (auto = false) => {
    setUser(null);
    localStorage.removeItem('user');
    clearTimeout(timeoutRef.current);
    if (auto) {
      alert('You have been logged out due to inactivity.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);