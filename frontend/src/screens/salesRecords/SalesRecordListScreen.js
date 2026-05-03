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
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const SalesRecordListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFirstLoad = useRef(true);
  const { searchText, setSearchText, queryParams } = useSearch();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRecords = useCallback(async (page = 1, append = false) => {
    try {
      const response = await axiosInstance.get('/sales-records', { params: { ...queryParams, page, limit: 20 } });
      const { data, pagination: pag } = response.data;
      if (append) setRecords((prev) => [...prev, ...data]);
      else setRecords(data);
      setPagination(pag);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sales records.');
    } finally {
      setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false);
    }
  }, [queryParams]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) { setIsLoading(true); isFirstLoad.current = false; }
      setCurrentPage(1); fetchRecords(1, false);
    }, [fetchRecords])
  );
  const handleRefresh = () => { setIsRefreshing(true); fetchRecords(1, false); };
  const handleLoadMore = () => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
    setIsLoadingMore(true); fetchRecords(currentPage + 1, true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';

  const renderRecord = ({ item }) => (
    <Card onPress={() => navigation.navigate('SalesRecordDetail', { id: item._id })}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <Text style={styles.productName}>{item.product?.name ?? 'Unknown Product'}</Text>
          <Text style={styles.customerName}>{item.customer?.name ?? 'Unknown Customer'}</Text>
          <Text style={styles.infoText}>{formatDate(item.dateSold)} · Qty: {item.quantitySold}</Text>
        </View>
        <Text style={styles.totalPrice}>${item.totalPrice?.toFixed(2)}</Text>
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
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search sales records..." />
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderRecord}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyState message="No sales records found" icon="receipt-outline" onRetry={handleRefresh} retryLabel="Refresh" />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        contentContainerStyle={records.length === 0 && styles.emptyContainer}
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SalesRecordForm', {})}>
          <Ionicons name="add" size={28} color={colors.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1, marginRight: 8 },
  productName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  customerName: { fontSize: 13, color: colors.primary, marginTop: 2 },
  infoText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  totalPrice: { fontSize: 17, fontWeight: 'bold', color: colors.primaryDark },
  loadMoreButton: { margin: 16, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
});

export default SalesRecordListScreen;
