import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, formatDate } from '../context/AppContext';

export default function SuperAdminDashboard({ navigation }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('companies'); // companies, payments, settings
  const [selectedCompForPersonnel, setSelectedCompForPersonnel] = useState(null);

  const handleResetOwner = (companyId) => {
    Alert.alert('Emin misiniz?', 'Firma sahibi şifresi "123" olarak sıfırlanacaktır.', [
      { text: 'Vazgeç' },
      { text: 'Sıfırla', onPress: () => dispatch({ type: 'RESET_OWNER_PASSWORD', payload: companyId }) }
    ]);
  };

  const handleResetPersonnel = (personId) => {
    Alert.alert('Emin misiniz?', 'Personel şifresi "123" olarak sıfırlanacaktır.', [
      { text: 'Vazgeç' },
      { text: 'Sıfırla', onPress: () => dispatch({ type: 'RESET_PERSONNEL_PASSWORD', payload: personId }) }
    ]);
  };

  const handleApprove = (reqId) => {
    dispatch({ type: 'APPROVE_PAYMENT', payload: reqId });
    Alert.alert('Başarılı', 'Ödeme onaylandı ve üyelik uzatıldı.');
  };

  const handleToggleStatus = (companyId) => {
    dispatch({ type: 'TOGGLE_COMPANY_STATUS', payload: companyId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>SaaS Yönetimi</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Hoş geldiniz, Admin</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setTab('payments')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textMain} />
            {state.paymentRequests.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{state.paymentRequests.length}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="chatbubbles-outline" size={24} color={COLORS.textMain} />
            {state.supportTickets.filter(t => t.status === 'open').length > 0 && (
              <View style={[styles.badge, { backgroundColor: COLORS.emerald }]}><Text style={styles.badgeText}>{state.supportTickets.filter(t => t.status === 'open').length}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {['companies', 'payments', 'settings'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'companies' ? 'Firmalar' : t === 'payments' ? 'Ödemeler' : 'Ayarlar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {tab === 'companies' && (
          <>
            {state.companies.map(company => (
              <View key={company.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{company.name}</Text>
                  <Text style={styles.cardExpiry}>{formatDate(company.planExpiry)}</Text>
                </View>
                <Text style={styles.cardSub}>{company.ownerEmail}</Text>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleResetOwner(company.id)}>
                    <Ionicons name="key-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.actionText}>Sahip Şifre Sıfırla</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.emerald }]} onPress={() => setSelectedCompForPersonnel(company)}>
                    <Ionicons name="people-outline" size={16} color={COLORS.emerald} />
                    <Text style={[styles.actionText, { color: COLORS.emerald }]}>Personelleri Gör</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statusRow}>
                  <View style={[styles.badge, { backgroundColor: company.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }]}>
                    <Text style={{ color: company.status === 'active' ? COLORS.emerald : COLORS.rose, fontSize: 10, fontWeight: '700' }}>
                      {company.status === 'active' ? 'AKTİF' : 'ASKIDA'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggleStatus(company.id)}>
                    <Text style={styles.toggleText}>{company.status === 'active' ? 'Durdur' : 'Aktif Et'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'payments' && (
          <>
            {state.paymentRequests.map(req => {
              const comp = state.companies.find(c => c.id === req.companyId);
              return (
                <View key={req.id} style={styles.payCard}>
                  <View style={styles.payInfo}>
                    <Text style={styles.payComp}>{comp?.name}</Text>
                    <Text style={styles.payDetail}>{req.plan === 'yearly1' ? 'Pro Yıllık' : 'Standart'}</Text>
                    <Text style={styles.payDate}>{formatDate(req.date)} - Havale Bildirimi</Text>
                  </View>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(req.id)}>
                    <Ionicons name="checkmark-done-circle" size={28} color={COLORS.emerald} />
                  </TouchableOpacity>
                </View>
              );
            })}
            {state.paymentRequests.length === 0 && <Text style={styles.emptyText}>Bekleyen ödeme yok.</Text>}
          </>
        )}

        {tab === 'settings' && (
          <View style={styles.settingsBox}>
             <Text style={styles.setGroup}>🏦 Banka / Havale Bilgileri</Text>
             <TextInput style={styles.input} placeholder="Banka Adı (Örn: Ziraat)" value={state.systemSettings.bankName} onChangeText={v => dispatch({type:'UPDATE_SETTINGS', payload: {...state.systemSettings, bankName:v}})} />
             <TextInput style={styles.input} placeholder="IBAN Ad Soyad" value={state.systemSettings.bankAccountHolder} onChangeText={v => dispatch({type:'UPDATE_SETTINGS', payload: {...state.systemSettings, bankAccountHolder:v}})} />
             <TextInput style={styles.input} placeholder="IBAN" value={state.systemSettings.bankIban} onChangeText={v => dispatch({type:'UPDATE_SETTINGS', payload: {...state.systemSettings, bankIban:v}})} />
             
             <Text style={[styles.setGroup, {marginTop: 20}]}>💳 Sanal POS API (Kredi Kartı)</Text>
             <TextInput style={styles.input} placeholder="API Key" value={state.systemSettings.posApiKey} onChangeText={v => dispatch({type:'UPDATE_SETTINGS', payload: {...state.systemSettings, posApiKey:v}})} />
             <TextInput style={styles.input} placeholder="Secret Key" value={state.systemSettings.posSecretKey} onChangeText={v => dispatch({type:'UPDATE_SETTINGS', payload: {...state.systemSettings, posSecretKey:v}})} />
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Personnel List Modal */}
      <Modal visible={!!selectedCompForPersonnel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCompForPersonnel?.name} Personelleri</Text>
              <TouchableOpacity onPress={() => setSelectedCompForPersonnel(null)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {state.personnel.filter(p => {
                const compId = p.companyId || state.units.find(u => u.id === p.unitId)?.companyId;
                return compId === selectedCompForPersonnel?.id;
              }).map(p => (
                <View key={p.id} style={styles.personItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{p.name}</Text>
                    <Text style={styles.personEmail}>{p.username}</Text>
                  </View>
                  <TouchableOpacity style={styles.resetBtn} onPress={() => handleResetPersonnel(p.id)}>
                    <Ionicons name="key-outline" size={18} color={COLORS.rose} />
                    <Text style={styles.resetBtnText}>Şifre Sıfırla</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {state.personnel.filter(p => p.companyId === selectedCompForPersonnel?.id).length === 0 && (
                <Text style={styles.emptyText}>Bu firmaya ait personel bulunamadı.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 15 },
  iconBtn: { position: 'relative', width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.rose, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: COLORS.bg },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  container: { paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain },
  cardExpiry: { fontSize: 12, color: COLORS.rose, fontWeight: '600' },
  cardSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary },
  actionText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  toggleText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  payCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  payInfo: { flex: 1 },
  payComp: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  payDetail: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  payDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  approveBtn: { padding: 5 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 20 },
  settingsBox: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  setGroup: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 12, color: COLORS.textMain, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
  personItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  personName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  personEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(244,63,94,0.08)' },
  resetBtnText: { color: COLORS.rose, fontSize: 11, fontWeight: '700' },
});
