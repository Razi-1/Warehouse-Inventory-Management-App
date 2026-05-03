import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import WarehouseListScreen from '../screens/warehouses/WarehouseListScreen';
import WarehouseDetailScreen from '../screens/warehouses/WarehouseDetailScreen';
import WarehouseFormScreen from '../screens/warehouses/WarehouseFormScreen';
import SalesRecordListScreen from '../screens/salesRecords/SalesRecordListScreen';
import SalesRecordDetailScreen from '../screens/salesRecords/SalesRecordDetailScreen';
import SalesRecordFormScreen from '../screens/salesRecords/SalesRecordFormScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import MoreScreen from '../screens/more/MoreScreen';
// These are navigated to from the More screen — included in the same navigator
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import SupplierListScreen from '../screens/suppliers/SupplierListScreen';
import SupplierDetailScreen from '../screens/suppliers/SupplierDetailScreen';
import SupplierFormScreen from '../screens/suppliers/SupplierFormScreen';
import StockEntryListScreen from '../screens/stockEntries/StockEntryListScreen';
import StockEntryDetailScreen from '../screens/stockEntries/StockEntryDetailScreen';
import StockEntryFormScreen from '../screens/stockEntries/StockEntryFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontWeight: 'bold' },
};

const WarehouseStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="WarehouseList" component={WarehouseListScreen} options={{ title: 'Warehouses' }} />
    <Stack.Screen name="WarehouseDetail" component={WarehouseDetailScreen} options={{ title: 'Warehouse Details' }} />
    <Stack.Screen name="WarehouseForm" component={WarehouseFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Warehouse' : 'New Warehouse' })} />
  </Stack.Navigator>
);

const SalesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="SalesRecordList" component={SalesRecordListScreen} options={{ title: 'Sales Records' }} />
    <Stack.Screen name="SalesRecordDetail" component={SalesRecordDetailScreen} options={{ title: 'Sale Details' }} />
    <Stack.Screen name="SalesRecordForm" component={SalesRecordFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Sale' : 'New Sale' })} />
  </Stack.Navigator>
);

const CustomerStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
    <Stack.Screen name="CustomerForm" component={CustomerFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Customer' : 'New Customer' })} />
  </Stack.Navigator>
);

// The More tab — contains Products, Suppliers, StockEntries stacks for Admin
const MoreStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="More" component={MoreScreen} options={{ title: 'More' }} />
    <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Product' : 'New Product' })} />
    <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: 'Suppliers' }} />
    <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} options={{ title: 'Supplier Details' }} />
    <Stack.Screen name="SupplierForm" component={SupplierFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Supplier' : 'New Supplier' })} />
    <Stack.Screen name="StockEntryList" component={StockEntryListScreen} options={{ title: 'Stock Entries' }} />
    <Stack.Screen name="StockEntryDetail" component={StockEntryDetailScreen} options={{ title: 'Stock Entry Details' }} />
    <Stack.Screen name="StockEntryForm" component={StockEntryFormScreen} options={({ route }) => ({ title: route.params?.item ? 'Edit Stock Entry' : 'New Stock Entry' })} />
  </Stack.Navigator>
);

const AdminTabNavigator = () => {
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
          else if (route.name === 'Warehouses') iconName = focused ? 'business' : 'business-outline';
          else if (route.name === 'Sales') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Customers') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'MoreTab') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.textOnPrimary, headerTitle: 'WarehouseIQ' }} />
      <Tab.Screen name="Warehouses" component={WarehouseStack} />
      <Tab.Screen name="Sales" component={SalesStack} />
      <Tab.Screen name="Customers" component={CustomerStack} />
      <Tab.Screen name="MoreTab" component={MoreStack} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
