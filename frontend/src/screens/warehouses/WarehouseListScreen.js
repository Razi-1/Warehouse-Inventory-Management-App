// GITHUB: Day 4 - Commit 4 - "feat(frontend): add Supplier and Warehouse module screens"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosConfig';
import useSearch from '../../hooks/useSearch';
import SearchBar from '../../components/SearchBar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const WarehouseListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFirstLoad = useRef(true);
  const { searchText, setSearchText, queryParams } = useSearch();
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchWarehouses = useCallback(async (page = 1, append = false) => {
    try {
      const response = await axiosInstance.get('/warehouses', { params: { ...queryParams, page, limit: 20 } });
      const { data, pagination: pag } = response.data;
      if (append) setWarehouses((prev) => [...prev, ...data]);
      else setWarehouses(data);
      setPagination(pag);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to load warehouses.');
    } finally {
      setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false);
    }
  }, [queryParams]);

  useEffect(() => {
    if (isFirstLoad.current) { setIsLoading(true); isFirstLoad.current = false; }
    setCurrentPage(1); fetchWarehouses(1, false);
  }, [fetchWarehouses]);
  const handleRefresh = () => { setIsRefreshing(true); fetchWarehouses(1, false); };
  const handleLoadMore = () => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
    setIsLoadingMore(true); fetchWarehouses(currentPage + 1, true);
  };

  const renderWarehouse = ({ item }) => (
    <Card onPress={() => navigation.navigate('WarehouseDetail', { id: item._id })}>
      <Text style={styles.warehouseName}>{item.name}</Text>
      <Text style={styles.warehouseAddress}>{item.address}</Text>
      <Text style={styles.warehouseCapacity}>Capacity: {item.capacity?.toLocaleString()} units</Text>
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
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search warehouses..." />
      <FlatList
        data={warehouses}
        keyExtractor={(item) => item._id}
        renderItem={renderWarehouse}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyState message="No warehouses found" icon="business-outline" onRetry={handleRefresh} retryLabel="Refresh" />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        contentContainerStyle={warehouses.length === 0 && styles.emptyContainer}
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('WarehouseForm', {})}>
          <Ionicons name="add" size={28} color={colors.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  warehouseName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  warehouseAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  warehouseCapacity: { fontSize: 13, color: colors.primary, marginTop: 3, fontWeight: '500' },
  loadMoreButton: { margin: 16, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default WarehouseListScreen;
