import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function RegisterScreen({ onBack, onRegister }) {
  const [form, setForm] = useState({ companyName: '', taxOffice: '', taxNumber: '', email: '', password: '' });

  const handleRegister = () => {
    if (!form.companyName || !form.email || !form.password) {
      return Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
    }
    // Simulation
    Alert.alert('Başarılı', 'Şirket kaydınız oluşturuldu. Giriş yapabilirsiniz.');
    onRegister();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Şirketinizi Kaydedin</Text>
            <Text style={styles.subtitle}>StockMaster ile profesyonel stok takibine başlayın.</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şirket Adı *</Text>
                <TextInput style={styles.input} placeholder="Örn: Demir Teknoloji Ltd." placeholderTextColor={COLORS.textMuted} value={form.companyName} onChangeText={v => setForm({...form, companyName: v})} />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Vergi Dairesi</Text>
                  <TextInput style={styles.input} placeholder="Ataşehir" placeholderTextColor={COLORS.textMuted} value={form.taxOffice} onChangeText={v => setForm({...form, taxOffice: v})} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Vergi No</Text>
                  <TextInput style={styles.input} placeholder="12345..." placeholderTextColor={COLORS.textMuted} value={form.taxNumber} onChangeText={v => setForm({...form, taxNumber: v})} keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yönetici E-posta *</Text>
                <TextInput style={styles.input} placeholder="ornek@sirket.com" placeholderTextColor={COLORS.textMuted} value={form.email} onChangeText={v => setForm({...form, email: v})} autoCapitalize="none" keyboardType="email-address" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre *</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={COLORS.textMuted} value={form.password} onChangeText={v => setForm({...form, password: v})} secureTextEntry />
              </View>

              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                <Text style={styles.registerBtnText}>Kaydı Tamamla</Text>
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
  backBtn: { padding: 20, paddingTop: 10 },
  content: { paddingHorizontal: 30, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textMain, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 8, marginBottom: 30 },
  form: { gap: 18 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, height: 50, paddingHorizontal: 16, color: COLORS.textMain, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 4 },
  registerBtn: { backgroundColor: COLORS.primary, borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  registerBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
