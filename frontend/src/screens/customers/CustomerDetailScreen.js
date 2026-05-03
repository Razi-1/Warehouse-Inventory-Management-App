import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

const CustomerDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState(null);

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/customers/${id}`);
      setCustomer(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => { fetchCustomer(); }, [fetchCustomer])
  );

  useEffect(() => {
    if (isAdmin && customer) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('CustomerForm', { item: customer })} style={{ marginRight: 16 }}>
            <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, customer, isAdmin]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const url = cascadeInfo ? `/customers/${id}?cascade=true` : `/customers/${id}`;
      await axiosInstance.delete(url);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409 && error.response.data.hasReferences) {
        setCascadeInfo(error.response.data);
      } else {
        setModalVisible(false);
        Alert.alert('Error', error.response?.data?.message || 'Failed to delete customer.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!customer) return null;

  return (
    <ScrollView style={styles.container}>
      {customer.profileImage ? <Image source={{ uri: customer.profileImage }} style={styles.image} /> : null}

      <View style={styles.card}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <View style={styles.divider} />
        <DetailRow label="Email" value={customer.email} />
        <DetailRow label="Phone" value={customer.phone} />
        <DetailRow label="Address" value={customer.address} />
        <DetailRow label="Added" value={new Date(customer.createdAt).toLocaleDateString()} />
      </View>

      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => { setCascadeInfo(null); setModalVisible(true); }}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Customer</Text>
        </TouchableOpacity>
      )}

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={customer.name}
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
  customerName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default CustomerDetailScreen;
