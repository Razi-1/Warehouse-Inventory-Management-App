// GITHUB: Day 6 - Commit 3 - "feat(frontend): intergrate search and filter across all module list screens"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosConfig';
import useSearch from '../../hooks/useSearch';
import SearchBar from '../../components/SearchBar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import colors from '../../theme/colors';

const StockEntryListScreen = ({ navigation }) => {
  const isFirstLoad = useRef(true);
  const { searchText, setSearchText, queryParams } = useSearch();
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEntries = useCallback(async (page = 1, append = false) => {
    try {
      const response = await axiosInstance.get('/stock-entries', { params: { ...queryParams, page, limit: 20 } });
      const { data, pagination: pag } = response.data;
      if (append) setEntries((prev) => [...prev, ...data]);
      else setEntries(data);
      setPagination(pag);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stock entries.');
    } finally {
      setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false);
    }
  }, [queryParams]);

  useEffect(() => {
    if (isFirstLoad.current) { setIsLoading(true); isFirstLoad.current = false; }
    setCurrentPage(1); fetchEntries(1, false);
  }, [fetchEntries]);
  const handleRefresh = () => { setIsRefreshing(true); fetchEntries(1, false); };
  const handleLoadMore = () => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
    setIsLoadingMore(true); fetchEntries(currentPage + 1, true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';

  const renderEntry = ({ item }) => (
    <Card onPress={() => navigation.navigate('StockEntryDetail', { id: item._id })}>
      <Text style={styles.productName}>{item.product?.name ?? 'Unknown Product'}</Text>
      <Text style={styles.qtyText}>+{item.quantityAdded} units added</Text>
      <Text style={styles.infoText}>Supplier: {item.supplier?.name ?? '—'}</Text>
      <Text style={styles.infoText}>Received: {formatDate(item.dateReceived)}</Text>
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
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search stock entries..." />
      <FlatList
        data={entries}
        keyExtractor={(item) => item._id}
        renderItem={renderEntry}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyState message="No stock entries found" icon="layers-outline" onRetry={handleRefresh} retryLabel="Refresh" />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        contentContainerStyle={entries.length === 0 && styles.emptyContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('StockEntryForm', {})}>
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  qtyText: { fontSize: 14, color: colors.success, fontWeight: '600', marginTop: 3 },
  infoText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  loadMoreButton: { margin: 16, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default StockEntryListScreen;
