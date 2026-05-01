// GITHUB: Day 5 - Commit 4 - "feat(frontend): add Customer module screens and role-based tab navigation"

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const MoreItem = ({ icon, label, badge, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.itemLabel}>{label}</Text>
        {badge ? <Text style={styles.itemBadge}>{badge}</Text> : null}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
  </TouchableOpacity>
);

const MoreScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Modules</Text>

      {isAdmin ? (
        <>
          <MoreItem
            icon="cube-outline"
            label="Products"
            onPress={() => navigation.navigate('ProductList')}
          />
          <MoreItem
            icon="storefront-outline"
            label="Suppliers"
            onPress={() => navigation.navigate('SupplierList')}
          />
          <MoreItem
            icon="layers-outline"
            label="Stock Entries"
            onPress={() => navigation.navigate('StockEntryList')}
          />
        </>
      ) : (
        <>
          <MoreItem
            icon="business-outline"
            label="Warehouses"
            badge="View Only"
            onPress={() => navigation.navigate('WarehouseList')}
          />
          <MoreItem
            icon="receipt-outline"
            label="Sales Records"
            badge="View Only"
            onPress={() => navigation.navigate('SalesRecordList')}
          />
          <MoreItem
            icon="people-outline"
            label="Customers"
            badge="View Only"
            onPress={() => navigation.navigate('CustomerList')}
          />
        </>
      )}

      <Text style={styles.sectionHeader}>Account</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  itemBadge: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 3,
    marginBottom: 32,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontSize: 15,
    color: colors.error,
    fontWeight: '600',
  },
});

export default MoreScreen;
