import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import io from 'socket.io-client';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initial sync of user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    // 2. Manage socket based on presence of user ID
    let newSocket = null;
    if (user?._id) {
      newSocket = io('http://localhost:5000');
      newSocket.on('connect', () => {
        newSocket.emit('join', user._id);
        console.log(`[Socket] Authorized and joined as ${user._id}`);
      });
      setSocket(newSocket);
    }

    // 3. Storage event listener for cross-tab sync
    const handleStorageUpdate = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch (_) { }
      }
    };
    window.addEventListener('storage', handleStorageUpdate);

    // 4. Cleanup: disconnect socket and remove listeners
    return () => {
      if (newSocket) newSocket.disconnect();
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [user?._id]);

  const login = async (email, password, role) => {
    try {
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/login';
      const { data } = await axios.post(endpoint, { email, password });

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      if (data.role === 'admin') navigate('/admin/dashboard');
      else if (data.role === 'worker') navigate('/worker/dashboard');
      else navigate('/user/dashboard');

      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      if (error.response?.data?.notVerified) {
        navigate(`/verify-otp?email=${error.response.data.email}`);
        throw 'Please verify your email address.';
      }
      throw message;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await axios.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      if (data.role === 'worker' && data.status === 'pending') {
        navigate('/login?message=awaiting_approval');
      } else {
        navigate(data.role === 'worker' ? '/worker/dashboard' : '/user/dashboard');
      }
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Verification failed';
    }
  };

  const resendOTP = async (email) => {
    try {
      await axios.post('/auth/resend-otp', { email });
    } catch (error) {
      throw error.response?.data?.message || 'Failed to resend OTP';
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      navigate(`/verify-otp?email=${userData.email}`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw message;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, verifyOTP, resendOTP, logout, updateUser, loading, socket }}>
      {children}
    </AuthContext.Provider>
  );
};