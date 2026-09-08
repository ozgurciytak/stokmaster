import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, ROLE_LABELS, validatePassword, PASSWORD_HINT } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function PersonnelScreen() {
  const { state, dispatch } = useApp();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [transferModal, setTransferModal] = useState(null);
  const [editModal, setEditModal] = useState(null); // For password/name edit
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'personnel', unitId: null });

  const activePersonnel = state.personnel.filter(p => p.status === 'active');

  const handleAdd = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      return Alert.alert('Hata', 'Tüm alanları doldurun.');
    }
    if (!form.unitId) return Alert.alert('Hata', 'Lütfen bir birim seçin.');
    if (state.personnel.some(p => p.username === form.username)) {
      return Alert.alert('Hata', 'Bu kullanıcı adı zaten alınmış.');
    }

    if (!validatePassword(form.password)) {
      return Alert.alert('Zayıf Şifre', PASSWORD_HINT);
    }

    dispatch({ 
      type: 'ADD_PERSONNEL', 
      payload: { 
        ...form, 
        id: Date.now().toString(), 
        status: 'active',
        companyId: state.currentUser.companyId
      } 
    });
    
    setForm({ name: '', username: '', password: '', role: 'personnel', unitId: null });
    setModalVisible(false);
    Alert.alert('Başarılı', 'Personel kaydedildi.');
  };

  const handlePermanentDelete = (id, name) => {
    Alert.alert('Kalıcı Olarak Sil', `"${name}" isimli personeli tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'SİL', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_PERSONNEL', payload: id }) },
    ]);
  };

  const handleUpdatePassword = () => {
    if (!validatePassword(editModal.password.trim())) {
      return Alert.alert('Zayıf Şifre', PASSWORD_HINT);
    }
    dispatch({ 
      type: 'UPDATE_PERSONNEL', 
      payload: { id: editModal.id, password: editModal.password.trim() } 
    });
    setEditModal(null);
    Alert.alert('Başarılı', 'Şifre güncellendi.');
  };

  const handleTransfer = (personId, newUnitId) => {
    dispatch({ type: 'TRANSFER_PERSONNEL', payload: { personnelId: personId, unitId: newUnitId } });
    setTransferModal(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Personel Yönetimi</Text>
          <Text style={styles.pageSubtitle}>{activePersonnel.length} aktif personel</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activePersonnel.map(person => (
          <View key={person.id} style={styles.personCard}>
            <View style={styles.personTop}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{person.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.roleLabel}>{ROLE_LABELS[person.role]} • {state.units.find(u => u.id === person.unitId)?.name}</Text>
                <Text style={styles.usernameInfo}>Kullanıcı: {person.username}</Text>
              </View>
              <TouchableOpacity onPress={() => handlePermanentDelete(person.id, person.name)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.rose} />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setTransferModal(person)}>
                <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.primary} />
                <Text style={[styles.actionText, { color: COLORS.primary }]}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setEditModal(person)}>
                <Ionicons name="key-outline" size={18} color={COLORS.amber} />
                <Text style={[styles.actionText, { color: COLORS.amber }]}>Şifre Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Yeni Personel</Text>
              <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor={COLORS.textMuted} value={form.name} onChangeText={v => setForm({...form, name: v})} />
              <TextInput style={styles.input} placeholder="E-posta Adresi" placeholderTextColor={COLORS.textMuted} value={form.username} onChangeText={v => setForm({...form, username: v.toLowerCase()})} autoCapitalize="none" keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor={COLORS.textMuted} value={form.password} onChangeText={v => setForm({...form, password: v})} />
              
              <Text style={styles.label}>Atanacak Birim</Text>
              <View style={styles.chipContainer}>
                {state.units.map(u => (
                  <TouchableOpacity key={u.id} style={[styles.chip, form.unitId === u.id && styles.chipActive]} onPress={() => setForm({...form, unitId: u.id})}>
                    <Text style={[styles.chipText, form.unitId === u.id && styles.chipTextActive]}>{u.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <Text style={styles.submitBtnText}>Personeli Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Password Modal */}
      <Modal visible={!!editModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]}>
            <View style={[styles.modalContent, { borderRadius: 24 }]}>
              <Text style={styles.modalTitle}>Şifre Güncelle</Text>
              <Text style={styles.modalSubtitle}>{editModal?.name} için yeni şifre belirleyin:</Text>
              <TextInput style={styles.input} placeholder="Yeni Şifre" placeholderTextColor={COLORS.textMuted} value={editModal?.password} onChangeText={v => setEditModal({...editModal, password: v})} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdatePassword}>
                <Text style={styles.submitBtnText}>Şifreyi Güncelle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(null)}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Transfer Modal */}
      <Modal visible={!!transferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Birim Transferi</Text>
            <Text style={styles.modalSubtitle}>{transferModal?.name} için yeni birim seçin:</Text>
            <View style={styles.chipContainer}>
              {state.units.filter(u => u.id !== transferModal?.unitId).map(u => (
                <TouchableOpacity key={u.id} style={styles.chip} onPress={() => handleTransfer(transferModal.id, u.id)}>
                  <Text style={styles.chipText}>{u.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTransferModal(null)}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, gap: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textMain },
  pageSubtitle: { fontSize: 14, color: COLORS.textMuted },
  personCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  personTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  personName: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  roleLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  usernameInfo: { fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: COLORS.border },
  actionText: { fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 999 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.surfaceLight, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textMain, marginBottom: 16 },
  modalSubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 14, color: COLORS.textMain, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 16, padding: 10 },
  cancelBtnText: { color: COLORS.textMuted },
});
