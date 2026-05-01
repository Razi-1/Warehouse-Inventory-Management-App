// GITHUB: Day 5 - Commit 4 - "feat(frontend): add Customer module screens and role-based tab navigation"

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateEmail, validatePhone } from '../../utils/validators';
import colors from '../../theme/colors';

const CustomerFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [name, setName] = useState(existingItem?.name || '');
  const [email, setEmail] = useState(existingItem?.email || '');
  const [phone, setPhone] = useState(existingItem?.phone || '');
  const [address, setAddress] = useState(existingItem?.address || '');
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      name: validateRequired(name, 'Name'),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      if (imageFile) formData.append('profileImage', { uri: imageFile.uri, name: imageFile.name, type: imageFile.type });

      if (isEditing) {
        await axiosInstance.put(`/customers/${existingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Customer updated.');
      } else {
        await axiosInstance.post('/customers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Customer created.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <FormInput label="Customer Name *" value={name} onChangeText={setName} placeholder="Full name" error={errors.name} />
      <FormInput label="Email *" value={email} onChangeText={setEmail} placeholder="customer@email.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <FormInput label="Phone *" value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" keyboardType="phone-pad" error={errors.phone} />
      <FormInput label="Address" value={address} onChangeText={setAddress} placeholder="Street address" multiline numberOfLines={2} />
      <FileUploadPicker mode="image" label="Profile Photo (optional)" onFilePicked={setImageFile} existingUrl={existingItem?.profileImage} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Customer' : 'Create Customer'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
});

export default CustomerFormScreen;
