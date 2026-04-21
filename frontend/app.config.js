// GITHUB: Day 1 - Commit 1 - "chore: initialize project structure with frontend and backend folders"

module.exports = {
  expo: {
    name: 'WarehouseIQ',
    slug: 'warehouseiq',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#F5F0E8',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.warehouseiq.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#F5F0E8',
      },
      package: 'com.warehouseiq.app',
    },
    extra: {
      // For local development: change to your machine's local IP, e.g. http://192.168.1.5:5000/api
      // For production: keep the Render URL below
      //apiUrl: 'https://warehouseiq-api.onrender.com/api',
      apiUrl: 'http://10.11.17.209:5000/api',
    },
  },
};
