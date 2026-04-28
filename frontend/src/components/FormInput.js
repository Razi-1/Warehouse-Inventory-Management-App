// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// A labeled text input with optional error message display
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 50,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
});

export default FormInput;
