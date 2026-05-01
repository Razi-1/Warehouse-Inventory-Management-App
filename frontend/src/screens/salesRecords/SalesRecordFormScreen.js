// GITHUB: Day 5 - Commit 3 - "feat(frontend): add StockEntry and SalesRecord module screens"

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateNumber } from '../../utils/validators';
import colors from '../../theme/colors';

const SalesRecordFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [productId, setProductId] = useState(existingItem?.product?._id || existingItem?.product || '');
  const [customerId, setCustomerId] = useState(existingItem?.customer?._id || existingItem?.customer || '');
  const [quantitySold, setQuantitySold] = useState(existingItem?.quantitySold?.toString() || '');
  const [unitPrice, setUnitPrice] = useState(existingItem?.unitPrice?.toString() || '');
  const [dateSold, setDateSold] = useState(existingItem?.dateSold ? new Date(existingItem.dateSold).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [productRes, customerRes] = await Promise.all([
          axiosInstance.get('/products', { params: { limit: 100 } }),
          axiosInstance.get('/customers', { params: { limit: 100 } }),
        ]);
        setProducts(productRes.data.data);
        setCustomers(customerRes.data.data);
        if (!productId && productRes.data.data.length > 0) setProductId(productRes.data.data[0]._id);
        if (!customerId && customerRes.data.data.length > 0) setCustomerId(customerRes.data.data[0]._id);
      } catch (error) {
        Alert.alert('Error', 'Failed to load dropdown data.');
      }
    };
    fetchDropdowns();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!productId) newErrors.product = 'Product is required';
    if (!customerId) newErrors.customer = 'Customer is required';
    newErrors.quantitySold = validateNumber(quantitySold, 'Quantity', 1);
    newErrors.unitPrice = validateNumber(unitPrice, 'Unit price', 0);
    newErrors.dateSold = validateRequired(dateSold, 'Date sold');
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  // Show the calculated total to the user before submitting
  const calculatedTotal = (!isNaN(quantitySold) && !isNaN(unitPrice)) ? (Number(quantitySold) * Number(unitPrice)).toFixed(2) : '0.00';

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product', productId);
      formData.append('customer', customerId);
      formData.append('quantitySold', quantitySold);
      formData.append('unitPrice', unitPrice);
      formData.append('dateSold', dateSold);
      formData.append('notes', notes.trim());
      if (invoiceFile) formData.append('invoiceFile', { uri: invoiceFile.uri, name: invoiceFile.name, type: invoiceFile.type });

      if (isEditing) {
        await axiosInstance.put(`/sales-records/${existingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Sales record updated.');
      } else {
        await axiosInstance.post('/sales-records', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Sales record created. Inventory updated.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save sales record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.pickerLabel}>Product *</Text>
      {errors.product ? <Text style={styles.errorText}>{errors.product}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={productId} onValueChange={setProductId} style={styles.picker}>
          {products.map((p) => <Picker.Item key={p._id} label={`${p.name} (Stock: ${p.quantity})`} value={p._id} />)}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Customer *</Text>
      {errors.customer ? <Text style={styles.errorText}>{errors.customer}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={customerId} onValueChange={setCustomerId} style={styles.picker}>
          {customers.map((c) => <Picker.Item key={c._id} label={c.name} value={c._id} />)}
        </Picker>
      </View>

      <FormInput label="Quantity Sold *" value={quantitySold} onChangeText={setQuantitySold} placeholder="e.g. 5" keyboardType="numeric" error={errors.quantitySold} />
      <FormInput label="Unit Price *" value={unitPrice} onChangeText={setUnitPrice} placeholder="0.00" keyboardType="decimal-pad" error={errors.unitPrice} />

      <View style={styles.totalPreview}>
        <Text style={styles.totalLabel}>Calculated Total</Text>
        <Text style={styles.totalValue}>${calculatedTotal}</Text>
      </View>

      <FormInput label="Date Sold * (YYYY-MM-DD)" value={dateSold} onChangeText={setDateSold} placeholder="2024-01-15" error={errors.dateSold} />
      <FormInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline numberOfLines={3} />
      <FileUploadPicker mode="document" label="Invoice File (optional, PDF/XLSX/DOCX)" onFilePicked={setInvoiceFile} existingUrl={existingItem?.invoiceFile} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Sale' : 'Record Sale'}</Text>}
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
  totalPreview: { backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.primaryDark },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
});

export default SalesRecordFormScreen;
