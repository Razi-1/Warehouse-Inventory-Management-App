import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../api/axiosConfig';
import FormInput from '../../components/FormInput';
import FileUploadPicker from '../../components/FileUploadPicker';
import { validateRequired, validateNumber } from '../../utils/validators';
import colors from '../../theme/colors';

const StockEntryFormScreen = ({ route, navigation }) => {
  const existingItem = route.params?.item || null;
  const isEditing = existingItem !== null;

  const [productId, setProductId] = useState(existingItem?.product?._id || existingItem?.product || '');
  const [warehouseId, setWarehouseId] = useState(existingItem?.warehouse?._id || existingItem?.warehouse || '');
  const [supplierId, setSupplierId] = useState(existingItem?.supplier?._id || existingItem?.supplier || '');
  const [quantityAdded, setQuantityAdded] = useState(existingItem?.quantityAdded?.toString() || '');
  const [dateReceived, setDateReceived] = useState(existingItem?.dateReceived ? new Date(existingItem.dateReceived).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [productRes, warehouseRes, supplierRes] = await Promise.all([
          axiosInstance.get('/products', { params: { limit: 100 } }),
          axiosInstance.get('/warehouses', { params: { limit: 100 } }),
          axiosInstance.get('/suppliers', { params: { limit: 100 } }),
        ]);
        setProducts(productRes.data.data);
        setWarehouses(warehouseRes.data.data);
        setSuppliers(supplierRes.data.data);
        if (!productId && productRes.data.data.length > 0) setProductId(productRes.data.data[0]._id);
        if (!warehouseId && warehouseRes.data.data.length > 0) setWarehouseId(warehouseRes.data.data[0]._id);
        if (!supplierId && supplierRes.data.data.length > 0) setSupplierId(supplierRes.data.data[0]._id);
      } catch (error) {
        Alert.alert('Error', 'Failed to load dropdown data.');
      }
    };
    fetchDropdowns();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!productId) newErrors.product = 'Product is required';
    if (!warehouseId) newErrors.warehouse = 'Warehouse is required';
    if (!supplierId) newErrors.supplier = 'Supplier is required';
    newErrors.quantityAdded = validateNumber(quantityAdded, 'Quantity', 1);
    newErrors.dateReceived = validateRequired(dateReceived, 'Date received');
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product', productId);
      formData.append('warehouse', warehouseId);
      formData.append('supplier', supplierId);
      formData.append('quantityAdded', quantityAdded);
      formData.append('dateReceived', dateReceived);
      formData.append('notes', notes.trim());
      if (invoiceFile) formData.append('invoiceImage', { uri: invoiceFile.uri, name: invoiceFile.name, type: invoiceFile.type });

      if (isEditing) {
        await axiosInstance.put(`/stock-entries/${existingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Stock entry updated.');
      } else {
        await axiosInstance.post('/stock-entries', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Stock entry created. Inventory updated.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save stock entry.');
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
          {products.map((p) => <Picker.Item key={p._id} label={`${p.name} (${p.sku})`} value={p._id} />)}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Warehouse *</Text>
      {errors.warehouse ? <Text style={styles.errorText}>{errors.warehouse}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={warehouseId} onValueChange={setWarehouseId} style={styles.picker}>
          {warehouses.map((w) => <Picker.Item key={w._id} label={w.name} value={w._id} />)}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Supplier *</Text>
      {errors.supplier ? <Text style={styles.errorText}>{errors.supplier}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={supplierId} onValueChange={setSupplierId} style={styles.picker}>
          {suppliers.map((s) => <Picker.Item key={s._id} label={s.name} value={s._id} />)}
        </Picker>
      </View>

      <FormInput label="Quantity Added *" value={quantityAdded} onChangeText={setQuantityAdded} placeholder="e.g. 50" keyboardType="numeric" error={errors.quantityAdded} />
      <FormInput label="Date Received * (YYYY-MM-DD)" value={dateReceived} onChangeText={setDateReceived} placeholder="2024-01-15" error={errors.dateReceived} />
      <FormInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline numberOfLines={3} />
      <FileUploadPicker mode="image" label="Invoice Image (optional)" onFilePicked={setInvoiceFile} existingUrl={existingItem?.invoiceImage} />

      <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Entry' : 'Create Entry'}</Text>}
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

export default StockEntryFormScreen;
