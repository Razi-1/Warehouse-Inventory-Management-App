// Each function returns an error message string if invalid, or empty string if valid.

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

export const validateNumber = (value, fieldName, min = 0) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  if (isNaN(value) || Number(value) < min) {
    return `${fieldName} must be a number greater than or equal to ${min}`;
  }
  return '';
};

export const validateInteger = (value, fieldName, min = 1) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < min) {
    return `${fieldName} must be a whole number greater than or equal to ${min}`;
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  // Remove spaces and dashes for digit count validation
  const stripped = phone.replace(/[\s-]/g, '');
  // Must be +94 followed by exactly 9 digits (11 digits total including country code)
  if (!/^\+94\d{9}$/.test(stripped)) {
    return 'Must be a valid Sri Lankan number (e.g. +94 77 123 4567)';
  }
  return '';
};
