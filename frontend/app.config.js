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
      apiUrl: process.env.API_URL || 'http://10.11.17.209:5000/api',
    },
  },
};
