// GITHUB: Day 2 - Commit 3 - "feat(frontend): add Expo project setup, navigation structure, and theme"

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import StaffTabNavigator from './StaffTabNavigator';
import colors from '../theme/colors';

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show a loading screen while we check AsyncStorage for a stored token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user && <AuthNavigator />}
      {user && user.role === 'admin' && <AdminTabNavigator />}
      {user && user.role === 'staff' && <StaffTabNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;
