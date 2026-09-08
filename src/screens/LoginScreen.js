import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ onRegister }) {
  const { state, dispatch } = useApp();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const cleanUser = emailOrUser.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Super Admins
    const foundAdmin = state.superAdmins.find(a => a.username === cleanUser && a.password === cleanPass);
    if (foundAdmin) {
      return dispatch({ type: 'LOGIN', payload: { ...foundAdmin, role: 'superadmin' } });
    }

    // 2. Check Owners
    const foundCompany = state.companies.find(c => c.ownerEmail === cleanUser && c.ownerPassword === cleanPass);
    if (foundCompany) {
      return dispatch({ 
        type: 'LOGIN', 
        payload: { name: foundCompany.name, role: 'owner', id: foundCompany.id, companyId: foundCompany.id } 
      });
    }

    // 3. Check Personnel
    const p = state.personnel.find(p => p.username === cleanUser && p.password === cleanPass);
    if (p) {
      // Abonelik Kontrolü
      const comp = state.companies.find(c => c.id === p.companyId);
      const today = new Date().toISOString().split('T')[0];
      if (comp && comp.planExpiry < today) {
        return Alert.alert('Erişim Engellendi', 'Şirketinizin abonelik süresi dolmuştur. Lütfen yöneticinizle iletişime geçin.');
      }

      dispatch({ type: 'LOGIN', payload: { ...p, role: 'personnel' } });
      Alert.alert('Hoş Geldiniz', `Sayın ${p.name}, sisteme yönlendiriliyorsunuz.`);
      return;
    }

    Alert.alert('Hata', 'Giriş bilgileri hatalı veya kullanıcı bulunamadı.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cube" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>StockMaster</Text>
            <Text style={styles.subtitle}>Profesyonel Stok Yönetimi</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="E-posta Adresi" 
            placeholderTextColor={COLORS.textMuted} 
            value={emailOrUser}
            onChangeText={setEmailOrUser}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerLink} onPress={onRegister}>
              <Text style={styles.registerText}>Hesabınız yok mu? <Text style={styles.registerTextBold}>Şirket Kaydı Oluştur</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textMain, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginTop: 4 },
  form: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: COLORS.textMain, fontSize: 16 },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerText: { color: COLORS.textMuted, fontSize: 14 },
  registerTextBold: { color: COLORS.primary, fontWeight: '700' },
});
