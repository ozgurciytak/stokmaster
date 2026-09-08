import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

import DashboardScreen from '../screens/DashboardScreen';
import UnitsScreen from '../screens/UnitsScreen';
import StocksScreen from '../screens/StocksScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PersonnelScreen from '../screens/PersonnelScreen';
import SuperAdminDashboard from '../screens/SuperAdminDashboard';
import AdminLogsScreen from '../screens/AdminLogsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import SupportScreen from '../screens/SupportScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Personnel" component={PersonnelScreen} />
      <ProfileStack.Screen name="Payment" component={PaymentScreen} />
      <ProfileStack.Screen name="Units" component={UnitsScreen} />
      <ProfileStack.Screen name="Support" component={SupportScreen} />
    </ProfileStack.Navigator>
  );
}

function SuperAdminStack() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminMain" component={SuperAdminDashboard} />
      <AdminStack.Screen name="AdminProfile" component={ProfileScreen} />
      <AdminStack.Screen name="Support" component={SupportScreen} />
    </AdminStack.Navigator>
  );
}

export default function AppNavigator() {
  const { state, company } = useApp();
  const user = state.currentUser;

  const today = new Date().toISOString().split('T')[0];
  const isExpired = company && company.planExpiry < today;
  const isOwner = user?.role === 'owner';
  
  // ABONELİK DOLMUŞ VE SAHİP GİRİŞİ -> Sadece Ödeme Ekranı
  if (user && isExpired && isOwner) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="PaymentLock" component={PaymentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  if (user?.role === 'superadmin') {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#6366f1',
            tabBarStyle: { backgroundColor: '#1e293b', height: 85, paddingBottom: 20 },
          }}
        >
          <Tab.Screen 
            name="AdminHome" 
            component={SuperAdminStack} 
            options={{ tabBarLabel: 'Yönetim', tabBarIcon: ({ color }) => <Ionicons name="shield-half-outline" size={24} color={color} /> }} 
          />
          <Tab.Screen 
            name="AdminReports" 
            component={AdminLogsScreen} 
            options={{ tabBarLabel: 'Sistem Günlüğü', tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} /> }} 
          />
          <Tab.Screen 
            name="AdminProfile" 
            component={AdminProfileScreen} 
            options={{ tabBarLabel: 'Hesap', tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} /> }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#1e293b',
            borderTopColor: 'rgba(255,255,255,0.1)',
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 20,
            paddingTop: 8,
          },
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ tabBarLabel: 'Panel', tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} /> }} 
        />
        
        {isOwner && (
          <Tab.Screen 
            name="Units" 
            component={UnitsScreen} 
            options={{ tabBarLabel: 'Birimler', tabBarIcon: ({ color }) => <Ionicons name="business-outline" size={24} color={color} /> }} 
          />
        )}

        <Tab.Screen 
          name="Stocks" 
          component={StocksScreen} 
          options={{ tabBarLabel: 'Stoklar', tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} /> }} 
        />

        {isOwner && (
          <Tab.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ tabBarLabel: 'Raporlar', tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} /> }} 
          />
        )}

        <Tab.Screen 
          name="Profile" 
          component={ProfileStackScreen} 
          options={{ tabBarLabel: 'Hesap', tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} /> }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
