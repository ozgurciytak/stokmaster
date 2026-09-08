import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../context/AppContext';

export default function DashboardScreen() {
  const { state, dispatch, company } = useApp();
  const [notifModal, setNotifModal] = useState(false);
  const [teminModal, setTeminModal] = useState(null); // Selected product for quick provision
  const [teminQty, setTeminQty] = useState('');

  const user = state.currentUser;
  const isOwner = user?.role === 'owner';
  
  // My managed units: If owner, show only UNASSIGNED units. If personnel, show only MY units.
  const managedUnits = isOwner 
    ? state.units.filter(u => !u.managerId) // Owner only sees what's NOT delegated
    : state.units.filter(u => u.managerId === user?.id);
    
  const managedUnitIds = managedUnits.map(u => u.id);

  // Filter products based on managed units
  const myProducts = state.products.filter(p => managedUnitIds.includes(p.unitId));

  const lowStockProducts = myProducts.filter(p => p.stock <= p.minStock);
  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const unreadNotifs = state.notifications.filter(n => !n.read && (n.userId === user?.id || isOwner));

  const handleQuickTemin = () => {
    const qty = parseInt(teminQty);
    if (!qty || qty <= 0) return Alert.alert('Hata', 'Geçerli bir miktar girin.');

    dispatch({ 
      type: 'ADJUST_STOCK', 
      payload: { 
        productId: teminModal.id, 
        quantity: qty, 
        type: 'in', 
        personnelId: user.id,
        note: 'Hızlı Temin (Bildirim Üzerinden)'
      } 
    });

    setTeminModal(null);
    setTeminQty('');
    Alert.alert('Başarılı', `${teminModal.name} stoğu güncellendi.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {(user?.name || 'Kullanıcı').split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>{company?.name || 'StockMaster'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setNotifModal(true)}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textMain} />
          {unreadNotifs.length > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadNotifs.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statLabel}>Toplam Stok</Text>
            <Text style={styles.statValue}>{totalStock}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.rose }]}>
            <Text style={styles.statLabel}>Kritik Ürün</Text>
            <Text style={styles.statValue}>{lowStockProducts.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {isOwner ? 'Kritik Stok Uyarıları' : 'Sorumlu Olduğum Kritik Stoklar'}
        </Text>
        
        {lowStockProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={40} color={COLORS.emerald} />
            <Text style={styles.emptyText}>Tüm stoklar yeterli seviyede.</Text>
          </View>
        ) : (
          lowStockProducts.map(product => (
            <View key={product.id} style={styles.criticalCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.criticalName}>{product.name}</Text>
                <Text style={styles.criticalStock}>Mevcut: {product.stock} / Min: {product.minStock}</Text>
              </View>
              <TouchableOpacity style={styles.teminBtn} onPress={() => setTeminModal(product)}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.teminBtnText}>Temin Et</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quick Provision Modal */}
      <Modal visible={!!teminModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ürün Temin Et</Text>
            <Text style={styles.modalSub}>{teminModal?.name} stoğuna eklenecek miktar:</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Eklenecek Adet"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={teminQty}
              onChangeText={setTeminQty}
              autoFocus
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleQuickTemin}>
              <Text style={styles.submitBtnText}>Stoklara Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTeminModal(null)}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Bildirimler</Text>
              <TouchableOpacity onPress={() => setNotifModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {unreadNotifs.length === 0 ? (
                <Text style={styles.emptyText}>Henüz bildirim yok.</Text>
              ) : (
                unreadNotifs.map(n => (
                  <View key={n.id} style={styles.notifItem}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.rose} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      <Text style={styles.notifItemBody}>{n.body}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  notifBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  notifBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.rose, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  container: { paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statCard: { flex: 1, padding: 18, borderRadius: 20, elevation: 2 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 15 },
  emptyCard: { alignItems: 'center', padding: 40, backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textMuted, marginTop: 10, fontSize: 14 },
  criticalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  criticalName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  criticalStock: { fontSize: 12, color: COLORS.rose, marginTop: 2, fontWeight: '600' },
  teminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.emerald, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  teminBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 10 },
  modalSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 14, color: COLORS.textMain, fontSize: 18, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted },
  notifContent: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, width: '100%' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  notifTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
  notifItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  notifItemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  notifItemBody: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
