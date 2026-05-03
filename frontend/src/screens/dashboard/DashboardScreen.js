import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';

const SummaryCard = ({ title, value, icon, color }) => (
  <View style={[styles.summaryCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryTitle}>{title}</Text>
  </View>
);

const DashboardScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/dashboard/summary');
      setData(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSummary();
  };

  const formatCurrency = (value) => {
    return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Warehouse overview</Text>
      </View>

      {/* Summary Cards Grid */}
      <View style={styles.cardGrid}>
        <SummaryCard title="Products" value={data?.totalProducts ?? 0} icon="cube-outline" color={colors.primary} />
        <SummaryCard title="Suppliers" value={data?.totalSuppliers ?? 0} icon="storefront-outline" color={colors.primaryLight} />
        <SummaryCard title="Warehouses" value={data?.totalWarehouses ?? 0} icon="business-outline" color={colors.primaryDark} />
        <SummaryCard title="Customers" value={data?.totalCustomers ?? 0} icon="people-outline" color={colors.success} />
        <SummaryCard title="Stock Entries" value={data?.totalStockEntries ?? 0} icon="layers-outline" color={colors.warning} />
        <SummaryCard title="Revenue" value={formatCurrency(data?.totalRevenue)} icon="cash-outline" color={colors.success} />
      </View>

      {/* Low Stock Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
        <Text style={styles.sectionSubtitle}>Products with 10 or fewer units</Text>

        {data?.lowStockProducts?.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
            <Text style={styles.emptySectionText}>All products are well-stocked</Text>
          </View>
        ) : (
          data?.lowStockProducts?.map((product) => (
            <View key={product._id} style={styles.lowStockItem}>
              <View style={styles.lowStockLeft}>
                <Text style={styles.lowStockName}>{product.name}</Text>
                <Text style={styles.lowStockSku}>{product.sku}</Text>
              </View>
              <View style={[styles.lowStockBadge, product.quantity === 0 && styles.outOfStockBadge]}>
                <Text style={styles.lowStockQty}>
                  {product.quantity === 0 ? 'OUT' : product.quantity}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Sales */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        <Text style={styles.sectionSubtitle}>Last 5 transactions</Text>

        {data?.recentSales?.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No sales recorded yet</Text>
          </View>
        ) : (
          data?.recentSales?.map((sale) => (
            <View key={sale._id} style={styles.saleItem}>
              <View style={styles.saleLeft}>
                <Text style={styles.saleName}>{sale.product?.name ?? 'Unknown Product'}</Text>
                <Text style={styles.saleCustomer}>{sale.customer?.name ?? 'Unknown Customer'}</Text>
                <Text style={styles.saleDate}>{formatDate(sale.dateSold)}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleTotal}>{formatCurrency(sale.totalPrice)}</Text>
                <Text style={styles.saleQty}>Qty: {sale.quantitySold}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  summaryCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderColor: colors.border,
    borderWidth: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    margin: 16,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptySectionText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  lowStockLeft: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  lowStockSku: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lowStockBadge: {
    backgroundColor: colors.warning,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: colors.error,
  },
  lowStockQty: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  saleLeft: {
    flex: 1,
  },
  saleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saleCustomer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  saleDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  saleQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
