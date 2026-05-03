import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosConfig';
import useSearch from '../../hooks/useSearch';
import SearchBar from '../../components/SearchBar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import colors from '../../theme/colors';

const SupplierListScreen = ({ navigation }) => {
  const isFirstLoad = useRef(true);
  const { searchText, setSearchText, queryParams } = useSearch();
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSuppliers = useCallback(async (page = 1, append = false) => {
    try {
      const response = await axiosInstance.get('/suppliers', { params: { ...queryParams, page, limit: 20 } });
      const { data, pagination: pag } = response.data;
      if (append) setSuppliers((prev) => [...prev, ...data]);
      else setSuppliers(data);
      setPagination(pag);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to load suppliers.');
    } finally {
      setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false);
    }
  }, [queryParams]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) { setIsLoading(true); isFirstLoad.current = false; }
      setCurrentPage(1); fetchSuppliers(1, false);
    }, [fetchSuppliers])
  );
  const handleRefresh = () => { setIsRefreshing(true); fetchSuppliers(1, false); };
  const handleLoadMore = () => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
    setIsLoadingMore(true); fetchSuppliers(currentPage + 1, true);
  };

  const renderSupplier = ({ item }) => (
    <Card onPress={() => navigation.navigate('SupplierDetail', { id: item._id })}>
      <Text style={styles.supplierName}>{item.name}</Text>
      <Text style={styles.supplierContact}>{item.contactPerson}</Text>
      <Text style={styles.supplierInfo}>{item.email}</Text>
      <Text style={styles.supplierInfo}>{item.phone}</Text>
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
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search suppliers..." />
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item._id}
        renderItem={renderSupplier}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyState message="No suppliers found" icon="storefront-outline" onRetry={handleRefresh} retryLabel="Refresh" />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        contentContainerStyle={suppliers.length === 0 && styles.emptyContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SupplierForm', {})}>
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  supplierName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  supplierContact: { fontSize: 14, color: colors.primary, marginTop: 2 },
  supplierInfo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  loadMoreButton: { margin: 16, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default SupplierListScreen;
