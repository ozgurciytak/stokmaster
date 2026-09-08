import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, ROLE_LABELS, formatDate, validatePassword, PASSWORD_HINT } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { state, dispatch, company } = useApp();
  const navigation = useNavigation();
  const user = state.currentUser;
  const userUnit = state.units.find(u => u.id === user?.unitId);

  // States for modals
  const [passModal, setPassModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handlePasswordUpdate = () => {
    if (!validatePassword(newPass)) {
      return Alert.alert('Zayıf Şifre', PASSWORD_HINT);
    }
    dispatch({ 
      type: 'UPDATE_USER_PASSWORD', 
      payload: { 
        role: user.role, 
        id: user.role === 'owner' ? company.id : user.id, 
        newPassword: newPass 
      } 
    });
    setPassModal(false);
    setNewPass('');
    Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
  };

  const menuItems = [
    { icon: 'business-outline', label: 'Şirket Bilgileri', color: COLORS.primary, onPress: () => Alert.alert(company?.name || 'Bilinmeyen', `Vergi Dairesi: ${company?.taxOffice || '-'}\nVergi No: ${company?.taxNumber || '-'}\nPlan: ${company?.plan}`) },
    ...(user?.role === 'owner' ? [
      { icon: 'people-outline', label: 'Personel Yönetimi', color: COLORS.emerald, screen: 'Personnel' },
      { icon: 'location-outline', label: 'Birim ve Sorumlu Yönetimi', color: COLORS.amber, screen: 'Units' }
    ] : []),
    ...(user?.role !== 'owner' ? [{ icon: 'location-outline', label: 'Birim Bilgim', color: COLORS.primary, onPress: () => Alert.alert('Bağlı Olduğunuz Birim', `${userUnit?.name || 'Tanımsız'}\nKonum: ${userUnit?.location || '-'}`) }] : []),
    { icon: 'notifications-outline', label: 'Bildirim Ayarları', color: COLORS.amber, onPress: () => setNotifModal(true) },
    { icon: 'chatbubbles-outline', label: 'Destek & Yardım', color: COLORS.primary, screen: 'Support' },
    { icon: 'shield-checkmark-outline', label: 'Güvenlik', color: COLORS.primary, onPress: () => setPassModal(true) },
  ];

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Hesabım</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
          <Text style={styles.userRole}>{ROLE_LABELS[user?.role] || 'Personel'}</Text>
          <View style={styles.companyBadge}>
            <Ionicons name="business" size={14} color={COLORS.primary} />
            <Text style={styles.companyName}>{company?.name || 'Şirket Tanımsız'}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
              <View style={[styles.menuIconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {user?.role === 'owner' && (
          <>
            <Text style={styles.sectionTitle}>💎 Abonelik Durumu</Text>
            <View style={styles.pricingCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>{company?.plan === 'yearly1' ? 'Pro Yıllık' : 'Standart Plan'}</Text>
                  <Text style={styles.expiryDate}>Bitiş: {formatDate(company?.planExpiry)}</Text>
                  {(() => {
                    const days = Math.ceil((new Date(company?.planExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <Text style={[styles.daysLeft, { color: days < 7 ? COLORS.rose : COLORS.emerald }]}>
                        {days > 0 ? `${days} gün kaldı` : 'Süre doldu!'}
                      </Text>
                    );
                  })()}
                </View>
                <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Payment')}>
                  <Text style={styles.upgradeBtnText}>Yenile</Text>
                </TouchableOpacity>
              </View>
              {state.paymentRequests.some(r => r.companyId === company?.id) && (
                <View style={styles.pendingBadge}>
                  <Ionicons name="time-outline" size={14} color={COLORS.amber} />
                  <Text style={styles.pendingText}>Havale ödemeniz onay bekliyor...</Text>
                </View>
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch({ type: 'LOGOUT' })}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.rose} />
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={passModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şifre Güncelle</Text>
            <Text style={styles.label}>Yeni Şifreniz</Text>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              placeholder="******" 
              placeholderTextColor={COLORS.textMuted} 
              value={newPass}
              onChangeText={setNewPass}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handlePasswordUpdate}>
              <Text style={styles.submitBtnText}>Şifreyi Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPassModal(false)}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Stok Bildirimleri</Text>
                <Text style={styles.settingSub}>Kritik stok uyarılarını al</Text>
              </View>
              <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: COLORS.primary }} />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={() => setNotifModal(false)}>
              <Text style={styles.submitBtnText}>Kaydet</Text>
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
  container: { paddingHorizontal: 20 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
  userRole: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  companyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: COLORS.border },
  companyName: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 8, marginBottom: 25, borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  pricingCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  planTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  expiryDate: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  daysLeft: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  upgradeBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, padding: 10, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: COLORS.amber },
  pendingText: { fontSize: 12, color: COLORS.amber, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 16 },
  logoutText: { color: COLORS.rose, fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 14, color: COLORS.textMain, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted },
  settingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  settingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  settingSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
