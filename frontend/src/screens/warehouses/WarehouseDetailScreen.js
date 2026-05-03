import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
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

const WarehouseDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState(null);

  const fetchWarehouse = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/warehouses/${id}`);
      setWarehouse(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load warehouse.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchWarehouse(); }, [fetchWarehouse]);

  useEffect(() => {
    if (isAdmin && warehouse) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('WarehouseForm', { item: warehouse })} style={{ marginRight: 16 }}>
            <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, warehouse, isAdmin]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const url = cascadeInfo ? `/warehouses/${id}?cascade=true` : `/warehouses/${id}`;
      await axiosInstance.delete(url);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409 && error.response.data.hasReferences) {
        setCascadeInfo(error.response.data);
      } else {
        setModalVisible(false);
        Alert.alert('Error', error.response?.data?.message || 'Failed to delete warehouse.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!warehouse) return null;

  return (
    <ScrollView style={styles.container}>
      {warehouse.warehouseImage ? <Image source={{ uri: warehouse.warehouseImage }} style={styles.image} /> : null}

      <View style={styles.card}>
        <Text style={styles.warehouseName}>{warehouse.name}</Text>
        <View style={styles.divider} />
        <DetailRow label="Address" value={warehouse.address} />
        <DetailRow label="Capacity" value={`${warehouse.capacity?.toLocaleString()} units`} />
        <DetailRow label="Description" value={warehouse.description} />
        <DetailRow label="Added" value={new Date(warehouse.createdAt).toLocaleDateString()} />
      </View>

      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => { setCascadeInfo(null); setModalVisible(true); }}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Warehouse</Text>
        </TouchableOpacity>
      )}

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={warehouse.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setModalVisible(false); setCascadeInfo(null); }}
        isDeleting={isDeleting}
        cascadeInfo={cascadeInfo}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  card: { backgroundColor: colors.surface, margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  warehouseName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default WarehouseDetailScreen;
