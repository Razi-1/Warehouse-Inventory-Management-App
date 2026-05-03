import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image,
} from 'react-native';
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

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
    }, [fetchProduct])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('ProductForm', { item: product })} style={{ marginRight: 16 }}>
          <Ionicons name="create-outline" size={22} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, product]);

  const handleDeletePress = () => {
    setCascadeInfo(null);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const url = cascadeInfo ? `/products/${id}?cascade=true` : `/products/${id}`;
      await axiosInstance.delete(url);
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409 && error.response.data.hasReferences) {
        setCascadeInfo(error.response.data);
        // Modal stays open, now shows cascade mode
      } else {
        setModalVisible(false);
        Alert.alert('Error', error.response?.data?.message || 'Failed to delete product.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) return null;

  return (
    <ScrollView style={styles.container}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.productImage} />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.sku}>SKU: {product.sku}</Text>

        <View style={[styles.qtyBadge, product.quantity <= 10 && styles.qtyLow]}>
          <Text style={styles.qtyText}>Stock: {product.quantity} units</Text>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Category" value={product.category} />
        <DetailRow label="Price" value={`$${product.price?.toFixed(2)}`} />
        <DetailRow label="Supplier" value={product.supplier?.name} />
        <DetailRow label="Warehouse" value={product.warehouse?.name} />
        <DetailRow label="Description" value={product.description} />
        <DetailRow label="Added" value={new Date(product.createdAt).toLocaleDateString()} />
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={styles.deleteText}>Delete Product</Text>
      </TouchableOpacity>

      <DeleteConfirmModal
        visible={modalVisible}
        itemName={product.name}
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
  productImage: { width: '100%', height: 220, resizeMode: 'cover' },
  card: { backgroundColor: colors.surface, margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  productName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  sku: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  qtyBadge: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 10 },
  qtyLow: { backgroundColor: colors.warning },
  qtyText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 0, borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 14 },
  deleteText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});

export default ProductDetailScreen;
