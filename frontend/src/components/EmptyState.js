// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const EmptyState = ({
  message = 'No items found',
  icon = 'cube-outline',
  onRetry,
  retryLabel = 'Retry',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.border} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmptyState;
