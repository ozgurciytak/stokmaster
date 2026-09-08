import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, validatePassword, PASSWORD_HINT } from '../context/AppContext';

export default function AdminProfileScreen() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const superAdmins = state.superAdmins || [];
  const [modalMode, setModalMode] = useState(null); // 'self', 'newAdmin'
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  const handleUpdateSelf = () => {
    if (!validatePassword(form.password)) return Alert.alert('Zayıf Şifre', PASSWORD_HINT);
    dispatch({ type: 'UPDATE_SUPER_ADMIN', payload: { id: user.id, password: form.password } });
    setModalMode(null);
    Alert.alert('Başarılı', 'Şifreniz güncellendi.');
  };

  const handleAddNewAdmin = () => {
    if (!form.username) return Alert.alert('Hata', 'Kullanıcı adı zorunludur.');
    if (!validatePassword(form.password)) return Alert.alert('Zayıf Şifre', PASSWORD_HINT);
    dispatch({ type: 'ADD_SUPER_ADMIN', payload: form });
    setModalMode(null);
    setForm({ name: '', username: '', password: '' });
    Alert.alert('Başarılı', 'Yeni sistem yöneticisi eklendi.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Hesabı</Text>
        <Text style={styles.subtitle}>Sistem yetkilerini buradan yönetin</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || user?.username || 'A').charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || user?.username || 'Yönetici'}</Text>
          <Text style={styles.userRole}>Süper Yönetici</Text>
        </View>

        <Text style={styles.sectionTitle}>Güvenlik ve Yetki</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => { setForm({ password: '' }); setModalMode('self'); }}>
          <View style={[styles.menuIcon, { backgroundColor: `${COLORS.primary}15` }]}>
            <Ionicons name="key" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Kendi Şifremi Değiştir</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { setForm({ name: '', username: '', password: '' }); setModalMode('newAdmin'); }}>
          <View style={[styles.menuIcon, { backgroundColor: `${COLORS.emerald}15` }]}>
            <Ionicons name="person-add" size={20} color={COLORS.emerald} />
          </View>
          <Text style={styles.menuText}>Yeni Admin Tanımla</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Sistem Yöneticileri</Text>
        {superAdmins.map(admin => (
          <View key={admin.id} style={styles.adminRow}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminName}>{admin.name || admin.username}</Text>
              <Text style={styles.adminUser}>ID: {admin.username}</Text>
            </View>
            {admin.id === user.id && <Text style={styles.selfLabel}>SİZ</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch({ type: 'LOGOUT' })}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.rose} />
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modals */}
      <Modal visible={!!modalMode} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalMode === 'self' ? 'Şifre Güncelle' : 'Yeni Admin Ekle'}</Text>
            
            {modalMode === 'newAdmin' && (
              <>
                <Text style={styles.label}>Admin Adı</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({...form, name: v})} placeholder="Örn: Mehmet Can" placeholderTextColor={COLORS.textMuted} />
                <Text style={styles.label}>Admin E-posta Adresi</Text>
                <TextInput 
                  style={styles.input} 
                  value={form.username} 
                  onChangeText={v => setForm({...form, username: v.toLowerCase()})} 
                  placeholder="admin@mail.com" 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={COLORS.textMuted} 
                />
              </>
            )}
            
            <Text style={styles.label}>Şifre</Text>
            <TextInput style={styles.input} value={form.password} onChangeText={v => setForm({...form, password: v})} secureTextEntry placeholder="******" placeholderTextColor={COLORS.textMuted} />

            <TouchableOpacity style={styles.submitBtn} onPress={modalMode === 'self' ? handleUpdateSelf : handleAddNewAdmin}>
              <Text style={styles.submitBtnText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMode(null)}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textMain },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  container: { paddingHorizontal: 20 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
  userRole: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1, marginTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  adminRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  adminName: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  adminUser: { fontSize: 12, color: COLORS.textMuted },
  selfLabel: { fontSize: 10, fontWeight: '800', color: COLORS.primary, backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 16, marginTop: 30 },
  logoutText: { color: COLORS.rose, fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 14, color: COLORS.textMain, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted },
});
