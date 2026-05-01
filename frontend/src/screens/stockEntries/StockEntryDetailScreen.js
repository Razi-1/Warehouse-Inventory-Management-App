import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import colors from '../../theme/colors';

const DetailRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const StockEntryDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntry = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/stock-entries/${id}`);
      setEntry(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stock entry.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchEntry(); }, [fetchEntry]);

  useEffect(() => {
    if (entry) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('StockEntryForm', { item: entry })} style={{ marginRight: 16 }}>
            <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, entry]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/stock-entries/${id}`);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      setModalVisible(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete stock entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.productName}>{entry.product?.name ?? 'Unknown Product'}</Text>
        <Text style={styles.sku}>SKU: {entry.product?.sku ?? '—'}</Text>

        <View style={styles.qtyBlock}>
          <Text style={styles.qtyValue}>+{entry.quantityAdded}</Text>
          <Text style={styles.qtyLabel}>units added</Text>
        </View>

        <View style={styles.divider} />
        <DetailRow label="Supplier" value={entry.supplier?.name} />
        <DetailRow label="Warehouse" value={entry.warehouse?.name} />
        <DetailRow label="Date Received" value={entry.dateReceived ? new Date(entry.dateReceived).toLocaleDateString() : '—'} />
        <DetailRow label="Notes" value={entry.notes} />
        <DetailRow label="Created" value={new Date(entry.createdAt).toLocaleDateString()} />
      </View>

      {entry.invoiceImage ? (
        <View style={styles.imageCard}>
          <Text style={styles.imageLabel}>Invoice</Text>
          <Image source={{ uri: entry.invoiceImage }} style={styles.invoiceImage} />
        </View>
      ) : null}

      <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={styles.deleteText}>Delete Stock Entry</Text>
      </TouchableOpacity>

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={`stock entry for ${entry.product?.name}`}
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
  sku: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  qtyBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 },
  qtyValue: { fontSize: 32, fontWeight: 'bold', color: colors.success },
  qtyLabel: { fontSize: 16, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  imageCard: { backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  imageLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  invoiceImage: { width: '100%', height: 200, resizeMode: 'contain', borderRadius: 8 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default StockEntryDetailScreen;
