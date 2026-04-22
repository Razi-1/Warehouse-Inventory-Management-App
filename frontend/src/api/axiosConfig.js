// GITHUB: Day 2 - Commit 3 - "feat(frontend): add Expo project setup, navigation structure, and theme"

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig.extra.apiUrl;

// The key used to store the auth token in AsyncStorage
export const TOKEN_KEY = 'warehouseiq_token';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach the stored JWT token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// logoutCallback is set by AuthContext so the interceptor can trigger logout
// when a 401 is received (expired or invalid token)
let logoutCallback = null;

export const setLogoutCallback = (fn) => {
  logoutCallback = fn;
};

// Response interceptor — handle 401 globally by auto-logging out
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
