// GITHUB: Day 2 - Commit 3 - "feat(frontend): add Expo project setup, navigation structure, and theme"

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, setLogoutCallback } from '../api/axiosConfig';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // { id, name, email, role }
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking AsyncStorage on startup

  // On app start, load the stored token and user from AsyncStorage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem('warehouseiq_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Failed to load auth data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Register the logout function with the axios interceptor so 401s auto-logout
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;

    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem('warehouseiq_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const register = async (name, email, password, role) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password, role });
    const { token: newToken, user: newUser } = response.data.data;

    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem('warehouseiq_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('warehouseiq_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
