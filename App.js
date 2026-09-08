import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

function AppContent() {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  // Eğer state içinde currentUser varsa giriş yapılmış demektir
  const isAuthenticated = !!state.currentUser;

  if (isAuthenticated) {
    return <AppNavigator />;
  }

  if (currentView === 'login') {
    return (
      <LoginScreen 
        onRegister={() => setCurrentView('register')}
      />
    );
  }

  return (
    <RegisterScreen 
      onBack={() => setCurrentView('login')}
      onRegister={() => setCurrentView('login')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" translucent={true} />
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
