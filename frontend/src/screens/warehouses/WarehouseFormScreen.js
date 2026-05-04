// Day 6 - Commit 4 - "fix: finalize form validation and error handling across all screens"

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateInteger } from '../../utils/validators';
import appendFileToFormData from '../../utils/fileUpload';
import colors from '../../theme/colors';

const WarehouseFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [name, setName] = useState(existingItem?.name || '');
  const [address, setAddress] = useState(existingItem?.address || '');
  const [capacity, setCapacity] = useState(existingItem?.capacity?.toString() || '');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      name: validateRequired(name, 'Name'),
      address: validateRequired(address, 'Address'),
      capacity: validateInteger(capacity, 'Capacity', 1),
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
      formData.append('address', address.trim());
      formData.append('capacity', capacity);
      formData.append('description', description.trim());
      await appendFileToFormData(formData, 'warehouseImage', imageFile);

      if (isEditing) {
        await axiosInstance.put(`/warehouses/${existingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Warehouse updated.');
      } else {
        await axiosInstance.post('/warehouses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Warehouse created.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save warehouse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <FormInput label="Warehouse Name *" value={name} onChangeText={setName} placeholder="e.g. Main Warehouse" error={errors.name} />
      <FormInput label="Address *" value={address} onChangeText={setAddress} placeholder="Full street address" error={errors.address} multiline numberOfLines={2} />
      <FormInput label="Capacity (units) *" value={capacity} onChangeText={setCapacity} placeholder="e.g. 5000" keyboardType="numeric" error={errors.capacity} />
      <FormInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" multiline numberOfLines={3} />
      <FileUploadPicker mode="image" label="Warehouse Photo (optional)" onFilePicked={setImageFile} existingUrl={existingItem?.warehouseImage} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Warehouse' : 'Create Warehouse'}</Text>}
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

export default WarehouseFormScreen;
