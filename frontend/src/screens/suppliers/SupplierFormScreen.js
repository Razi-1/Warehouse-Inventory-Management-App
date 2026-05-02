// GITHUB: Day 4 - Commit 4 - "feat(frontend): add Supplier and Warehouse module screens"

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateEmail, validatePhone } from '../../utils/validators';
import colors from '../../theme/colors';

const SupplierFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [name, setName] = useState(existingItem?.name || '');
  const [contactPerson, setContactPerson] = useState(existingItem?.contactPerson || '');
  const [email, setEmail] = useState(existingItem?.email || '');
  const [phone, setPhone] = useState(existingItem?.phone || '');
  const [address, setAddress] = useState(existingItem?.address || '');
  const [logoFile, setLogoFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      name: validateRequired(name, 'Name'),
      contactPerson: validateRequired(contactPerson, 'Contact person'),
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
      formData.append('contactPerson', contactPerson.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      if (logoFile) formData.append('logo', { uri: logoFile.uri, name: logoFile.name, type: logoFile.type });
      if (contractFile) formData.append('contractDocument', { uri: contractFile.uri, name: contractFile.name, type: contractFile.type });

      if (isEditing) {
        await axiosInstance.put(`/suppliers/${existingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Supplier updated.');
      } else {
        await axiosInstance.post('/suppliers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Supplier created.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <FormInput label="Supplier Name *" value={name} onChangeText={setName} placeholder="Company name" error={errors.name} />
      <FormInput label="Contact Person *" value={contactPerson} onChangeText={setContactPerson} placeholder="Full name" error={errors.contactPerson} />
      <FormInput label="Email *" value={email} onChangeText={setEmail} placeholder="contact@company.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <FormInput label="Phone *" value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" keyboardType="phone-pad" error={errors.phone} />
      <FormInput label="Address" value={address} onChangeText={setAddress} placeholder="Street address" multiline numberOfLines={2} />
      <FileUploadPicker mode="image" label="Company Logo (optional)" onFilePicked={setLogoFile} existingUrl={existingItem?.logo} />
      <FileUploadPicker mode="document" label="Contract Document (optional, PDF/XLSX/DOCX)" onFilePicked={setContractFile} existingUrl={existingItem?.contractDocument} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Supplier' : 'Create Supplier'}</Text>}
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

export default SupplierFormScreen;
