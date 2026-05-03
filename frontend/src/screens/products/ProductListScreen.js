import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosConfig';
import useSearch from '../../hooks/useSearch';
import SearchBar from '../../components/SearchBar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const ProductListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFirstLoad = useRef(true);
  const { searchText, setSearchText, queryParams } = useSearch();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      const response = await axiosInstance.get('/products', {
        params: { ...queryParams, page, limit: 20 },
      });
      const { data, pagination: pag } = response.data;
      if (append) {
        setProducts((prev) => [...prev, ...data]);
      } else {
        setProducts(data);
      }
      setPagination(pag);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [queryParams]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) { setIsLoading(true); isFirstLoad.current = false; }
      setCurrentPage(1);
      fetchProducts(1, false);
    }, [fetchProducts])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
    setIsLoadingMore(true);
    fetchProducts(currentPage + 1, true);
  };

  const renderProduct = ({ item }) => (
    <Card onPress={() => navigation.navigate('ProductDetail', { id: item._id })}>
      <View style={styles.cardRow}>
        <View style={styles.cardMain}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
          <View style={[styles.qtyBadge, item.quantity <= 10 && styles.qtyLow]}>
            <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderFooter = () => {
    if (!pagination || currentPage >= pagination.totalPages) return null;
    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isLoadingMore}>
        <Text style={styles.loadMoreText}>{isLoadingMore ? 'Loading...' : 'Load More'}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search products..." />

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState message="No products found" icon="cube-outline" onRetry={handleRefresh} retryLabel="Refresh" />
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={products.length === 0 && styles.emptyContainer}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProductForm', {})}>
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardMain: { flex: 1, marginRight: 8 },
  productName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  productSku: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  productCategory: { fontSize: 12, color: colors.primaryLight, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  qtyBadge: { backgroundColor: colors.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  qtyLow: { backgroundColor: colors.warning },
  qtyText: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },
  loadMoreButton: { margin: 16, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default ProductListScreen;
