import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, Linking } from 'react-native';
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

const SupplierDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState(null);

  const fetchSupplier = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/suppliers/${id}`);
      setSupplier(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load supplier.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => { fetchSupplier(); }, [fetchSupplier])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('SupplierForm', { item: supplier })} style={{ marginRight: 16 }}>
          <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, supplier]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const url = cascadeInfo ? `/suppliers/${id}?cascade=true` : `/suppliers/${id}`;
      await axiosInstance.delete(url);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409 && error.response.data.hasReferences) {
        setCascadeInfo(error.response.data);
      } else {
        setModalVisible(false);
        Alert.alert('Error', error.response?.data?.message || 'Failed to delete supplier.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!supplier) return null;

  return (
    <ScrollView style={styles.container}>
      {supplier.logo ? (
        <Image source={{ uri: supplier.logo }} style={styles.logo} />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.supplierName}>{supplier.name}</Text>

        <View style={styles.divider} />
        <DetailRow label="Contact Person" value={supplier.contactPerson} />
        <DetailRow label="Email" value={supplier.email} />
        <DetailRow label="Phone" value={supplier.phone} />
        <DetailRow label="Address" value={supplier.address} />
        <DetailRow label="Added" value={new Date(supplier.createdAt).toLocaleDateString()} />

        {supplier.contractDocument ? (
          <TouchableOpacity style={styles.documentLink} onPress={() => Linking.openURL(supplier.contractDocument)}>
            <Ionicons name="document-outline" size={18} color={colors.primary} />
            <Text style={styles.documentText}>View Contract Document</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => { setCascadeInfo(null); setModalVisible(true); }}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={styles.deleteText}>Delete Supplier</Text>
      </TouchableOpacity>

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={supplier.name}
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
  logo: { width: '100%', height: 180, resizeMode: 'contain', backgroundColor: colors.surfaceAlt },
  card: { backgroundColor: colors.surface, margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  supplierName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  documentLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 10, backgroundColor: colors.surfaceAlt, borderRadius: 8 },
  documentText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default SupplierDetailScreen;
