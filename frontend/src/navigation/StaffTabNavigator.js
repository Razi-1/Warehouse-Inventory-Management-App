// GITHUB: Day 5 - Commit 4 - "feat(frontend): add Customer module screens and role-based tab navigation"

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import StockEntryListScreen from '../screens/stockEntries/StockEntryListScreen';
import StockEntryDetailScreen from '../screens/stockEntries/StockEntryDetailScreen';
import StockEntryFormScreen from '../screens/stockEntries/StockEntryFormScreen';
import SupplierListScreen from '../screens/suppliers/SupplierListScreen';
import SupplierDetailScreen from '../screens/suppliers/SupplierDetailScreen';
import SupplierFormScreen from '../screens/suppliers/SupplierFormScreen';
import MoreScreen from '../screens/more/MoreScreen';
// Staff views these as read-only from the More tab
import WarehouseListScreen from '../screens/warehouses/WarehouseListScreen';
import WarehouseDetailScreen from '../screens/warehouses/WarehouseDetailScreen';
import SalesRecordListScreen from '../screens/salesRecords/SalesRecordListScreen';
import SalesRecordDetailScreen from '../screens/salesRecords/SalesRecordDetailScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontWeight: 'bold' },
};

const ProductStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Product' : 'New Product' })} />
  </Stack.Navigator>
);

const StockStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="StockEntryList" component={StockEntryListScreen} options={{ title: 'Stock Entries' }} />
    <Stack.Screen name="StockEntryDetail" component={StockEntryDetailScreen} options={{ title: 'Stock Entry Details' }} />
    <Stack.Screen name="StockEntryForm" component={StockEntryFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Stock Entry' : 'New Stock Entry' })} />
  </Stack.Navigator>
);

const SupplierStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: 'Suppliers' }} />
    <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} options={{ title: 'Supplier Details' }} />
    <Stack.Screen name="SupplierForm" component={SupplierFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Supplier' : 'New Supplier' })} />
  </Stack.Navigator>
);

// Staff More tab — view-only access to Warehouses, Sales Records, Customers
const StaffMoreStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="More" component={MoreScreen} options={{ title: 'More' }} />
    <Stack.Screen name="WarehouseList" component={WarehouseListScreen} options={{ title: 'Warehouses (View Only)' }} />
    <Stack.Screen name="WarehouseDetail" component={WarehouseDetailScreen} options={{ title: 'Warehouse Details' }} />
    <Stack.Screen name="SalesRecordList" component={SalesRecordListScreen} options={{ title: 'Sales Records (View Only)' }} />
    <Stack.Screen name="SalesRecordDetail" component={SalesRecordDetailScreen} options={{ title: 'Sale Details' }} />
    <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers (View Only)' }} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
  </Stack.Navigator>
);

const StaffTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Products') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'Stock') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'Suppliers') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'MoreTab') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.textOnPrimary, headerTitle: 'WarehouseIQ' }} />
      <Tab.Screen name="Products" component={ProductStack} />
      <Tab.Screen name="Stock" component={StockStack} />
      <Tab.Screen name="Suppliers" component={SupplierStack} />
      <Tab.Screen name="MoreTab" component={StaffMoreStack} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
