// Day 6 - Commit 4 - "fix: finalize form validation and error handling across all screens"

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateNumber } from '../../utils/validators';
import colors from '../../theme/colors';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverages', 'Raw Materials', 'Other'];

const ProductFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [name, setName] = useState(existingItem?.name || '');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [sku, setSku] = useState(existingItem?.sku || '');
  const [category, setCategory] = useState(existingItem?.category || CATEGORIES[0]);
  const [price, setPrice] = useState(existingItem?.price?.toString() || '');
  const [supplierId, setSupplierId] = useState(existingItem?.supplier?._id || existingItem?.supplier || '');
  const [warehouseId, setWarehouseId] = useState(existingItem?.warehouse?._id || existingItem?.warehouse || '');
  const [imageFile, setImageFile] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [supplierRes, warehouseRes] = await Promise.all([
          axiosInstance.get('/suppliers', { params: { limit: 100 } }),
          axiosInstance.get('/warehouses', { params: { limit: 100 } }),
        ]);
        setSuppliers(supplierRes.data.data);
        setWarehouses(warehouseRes.data.data);
        if (!supplierId && supplierRes.data.data.length > 0) setSupplierId(supplierRes.data.data[0]._id);
        if (!warehouseId && warehouseRes.data.data.length > 0) setWarehouseId(warehouseRes.data.data[0]._id);
      } catch (error) {
        Alert.alert('Error', 'Failed to load suppliers and warehouses.');
      }
    };
    fetchDropdowns();
  }, []);

  const validate = () => {
    const newErrors = {};
    newErrors.name = validateRequired(name, 'Product name');
    newErrors.sku = validateRequired(sku, 'SKU');
    newErrors.price = validateNumber(price, 'Price', 0);
    if (!supplierId) newErrors.supplier = 'Supplier is required';
    if (!warehouseId) newErrors.warehouse = 'Warehouse is required';

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('sku', sku.trim().toUpperCase());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('supplier', supplierId);
      formData.append('warehouse', warehouseId);

      if (imageFile) {
        formData.append('image', {
          uri: imageFile.uri,
          name: imageFile.name,
          type: imageFile.type,
        });
      }

      if (isEditing) {
        await axiosInstance.put(`/products/${existingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Product updated.');
      } else {
        await axiosInstance.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Product created.');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <FormInput label="Product Name *" value={name} onChangeText={setName} placeholder="Enter product name" error={errors.name} />
      <FormInput label="SKU *" value={sku} onChangeText={setSku} placeholder="e.g. PROD-001" error={errors.sku} autoCapitalize="characters" />
      <FormInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" multiline numberOfLines={3} />
      <FormInput label="Price *" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" error={errors.price} />

      <Text style={styles.pickerLabel}>Category *</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          {CATEGORIES.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Supplier *</Text>
      {errors.supplier ? <Text style={styles.errorText}>{errors.supplier}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={supplierId} onValueChange={setSupplierId} style={styles.picker}>
          {suppliers.map((s) => (
            <Picker.Item key={s._id} label={s.name} value={s._id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Warehouse *</Text>
      {errors.warehouse ? <Text style={styles.errorText}>{errors.warehouse}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={warehouseId} onValueChange={setWarehouseId} style={styles.picker}>
          {warehouses.map((w) => (
            <Picker.Item key={w._id} label={w.name} value={w._id} />
          ))}
        </Picker>
      </View>

      <FileUploadPicker mode="image" label="Product Image (optional)" onFilePicked={setImageFile} existingUrl={existingItem?.image} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Product' : 'Create Product'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  pickerContainer: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  picker: { color: colors.textPrimary, height: 50 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 4 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
});

export default ProductFormScreen;
