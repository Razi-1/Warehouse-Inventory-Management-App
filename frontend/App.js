// GITHUB: Day 2 - Commit 3 - "feat(frontend): add Expo project setup, navigation structure, and theme"

// NOTE: react-native-gesture-handler and react-native-url-polyfill are
// imported in index.js (the entry point) before this file loads.

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.primaryDark} />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
