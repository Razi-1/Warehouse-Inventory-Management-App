// GITHUB: Day 2 - Commit 4 - "feat(frontend): add login and registration screens with validation"

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '../../utils/validators';
import colors from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nameErr = validateRequired(name, 'Name');
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validatePasswordMatch(password, confirmPassword);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    return !nameErr && !emailErr && !passwordErr && !confirmPasswordErr;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      // Navigation happens automatically via AppNavigator when user state changes
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join WarehouseIQ to manage your inventory</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="Enter your email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="Min 8 chars, uppercase, number, special char"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          placeholder="Re-enter your password"
          placeholderTextColor={colors.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(value) => setRole(value)}
            style={styles.picker}
            dropdownIconColor={colors.textSecondary}
          >
            <Picker.Item label="Staff" value="staff" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  fieldContainer: {
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
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    height: 50,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
