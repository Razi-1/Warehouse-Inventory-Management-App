// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
