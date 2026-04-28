// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const LoadingSpinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default LoadingSpinner;
