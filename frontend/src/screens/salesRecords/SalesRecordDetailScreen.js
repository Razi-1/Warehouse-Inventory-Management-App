// GITHUB: Day 5 - Commit 3 - "feat(frontend): add StockEntry and SalesRecord module screens"

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const DetailRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const SalesRecordDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecord = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/sales-records/${id}`);
      setRecord(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sales record.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  useEffect(() => {
    if (isAdmin && record) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('SalesRecordForm', { item: record })} style={{ marginRight: 16 }}>
            <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, record, isAdmin]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/sales-records/${id}`);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      setModalVisible(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete sales record.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!record) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.productName}>{record.product?.name ?? 'Unknown Product'}</Text>
        <Text style={styles.customerName}>Customer: {record.customer?.name ?? '—'}</Text>

        <View style={styles.priceBlock}>
          <Text style={styles.totalPrice}>${record.totalPrice?.toFixed(2)}</Text>
          <Text style={styles.priceLabel}>total sale</Text>
        </View>

        <View style={styles.divider} />
        <DetailRow label="Quantity Sold" value={`${record.quantitySold} units`} />
        <DetailRow label="Unit Price" value={`$${record.unitPrice?.toFixed(2)}`} />
        <DetailRow label="Date Sold" value={record.dateSold ? new Date(record.dateSold).toLocaleDateString() : '—'} />
        <DetailRow label="Notes" value={record.notes} />
        <DetailRow label="Created" value={new Date(record.createdAt).toLocaleDateString()} />

        {record.invoiceFile ? (
          <TouchableOpacity style={styles.documentLink} onPress={() => Linking.openURL(record.invoiceFile)}>
            <Ionicons name="document-outline" size={18} color={colors.primary} />
            <Text style={styles.documentText}>View Invoice File</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Sales Record</Text>
        </TouchableOpacity>
      )}

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={`sale of ${record.product?.name}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalVisible(false)}
        isDeleting={isDeleting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  productName: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  customerName: { fontSize: 14, color: colors.primary, marginTop: 4 },
  priceBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 },
  totalPrice: { fontSize: 32, fontWeight: 'bold', color: colors.primaryDark },
  priceLabel: { fontSize: 16, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  documentLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 10, backgroundColor: colors.surfaceAlt, borderRadius: 8 },
  documentText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default SalesRecordDetailScreen;
