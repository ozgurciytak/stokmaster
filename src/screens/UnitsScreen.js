import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../context/AppContext';

export default function UnitsScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const myPersonnel = state.personnel.filter(p => p.companyId === state.currentUser.companyId || true);
  const owner = { id: 'owner', name: 'Firma Sahibi (Ben)', role: 'owner' };
  const reporterOptions = [owner, ...myPersonnel];

  const handleUpdateManager = (unitId, managerId) => {
    dispatch({ type: 'UPDATE_UNIT_MANAGER', payload: { unitId, managerId } });
    setModalVisible(false);
    Alert.alert('Başarılı', 'Birim sorumlusu güncellendi.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>Birim ve Sorumlu Yönetimi</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Her birim için stok bildiriminin kime yapılacağını seçebilirsiniz.</Text>
        
        {state.units.map(unit => {
          const manager = reporterOptions.find(p => p.id === unit.managerId) || owner;
          return (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitInfo}>
                <View style={styles.iconBox}>
                  <Ionicons name="location" size={22} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.unitName}>{unit.name}</Text>
                  <Text style={styles.unitLoc}>{unit.location || 'Konum Belirtilmemiş'}</Text>
                </View>
              </View>
              
              <View style={styles.managerSection}>
                <Text style={styles.managerLabel}>Stok Bildirim Sorumlusu:</Text>
                <TouchableOpacity style={styles.managerSelector} onPress={() => { setSelectedUnit(unit); setModalVisible(true); }}>
                  <Text style={styles.managerName}>{manager.name}</Text>
                  <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Manager Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedUnit?.name} Sorumlusu Seç</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {reporterOptions.map(option => (
                <TouchableOpacity 
                  key={option.id} 
                  style={[styles.optionItem, selectedUnit?.managerId === option.id && styles.optionSelected]} 
                  onPress={() => handleUpdateManager(selectedUnit.id, option.id)}
                >
                  <View>
                    <Text style={[styles.optionName, selectedUnit?.managerId === option.id && { color: '#fff' }]}>{option.name}</Text>
                    <Text style={[styles.optionRole, selectedUnit?.managerId === option.id && { color: 'rgba(255,255,255,0.7)' }]}>
                      {option.role === 'owner' ? 'Şirket Sahibi' : 'Personel'}
                    </Text>
                  </View>
                  {selectedUnit?.managerId === option.id && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textMain },
  container: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20, lineHeight: 20 },
  unitCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  unitInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.1)', justifyContent: 'center', alignItems: 'center' },
  unitName: { fontSize: 17, fontWeight: '700', color: COLORS.textMain },
  unitLoc: { fontSize: 13, color: COLORS.textMuted },
  managerSection: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  managerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  managerSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  managerName: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 15, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: COLORS.border },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  optionRole: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  closeBtn: { padding: 16, alignItems: 'center', marginTop: 10 },
  closeBtnText: { color: COLORS.textMuted, fontWeight: '600' },
});
