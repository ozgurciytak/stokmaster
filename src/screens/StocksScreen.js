import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../context/AppContext';

export default function StocksScreen() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filterUnit, setFilterUnit] = useState(null);
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', stock: '', minStock: '', unitId: null });

  const isOwner = state.currentUser.role === 'owner';
  const userUnitId = state.currentUser.unitId;

  const filteredProducts = useMemo(() => {
    let list = state.products.filter(p => p.companyId === state.currentUser.companyId);
    // Role based visibility
    if (!isOwner) {
      list = list.filter(p => p.unitId === userUnitId);
    } else if (filterUnit) {
      list = list.filter(p => p.unitId === filterUnit);
    }
    
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [state.products, search, filterUnit, isOwner, userUnitId]);

  const handleAdjust = () => {
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty <= 0) return Alert.alert('Hata', 'Geçerli bir miktar girin.');
    
    dispatch({
      type: 'ADJUST_STOCK',
      payload: {
        productId: adjustModal.id,
        quantity: qty,
        type: adjustModal.forceIn ? 'in' : 'out',
        personnelId: state.currentUser.id,
        note: 'Hızlı stok düzenleme'
      }
    });
    setAdjustModal(null);
    setAdjustQty('');
  };

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.unitId) return Alert.alert('Hata', 'Lütfen ürün adı ve birim seçin.');
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        ...newProduct,
        stock: parseInt(newProduct.stock) || 0,
        minStock: parseInt(newProduct.minStock) || 0,
        personnelId: state.currentUser.id,
        companyId: state.currentUser.companyId
      }
    });
    setAddModal(false);
    setNewProduct({ name: '', category: '', stock: '', minStock: '', unitId: null });
  };

  const handleDelete = (id, name) => {
    Alert.alert('Ürünü Sil', `"${name}" isimli ürünü silmek istediğinize emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'SİL', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_PRODUCT', payload: { id, personnelId: state.currentUser.id } }) }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Stok Listesi</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Ürün veya kategori ara..." 
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {isOwner && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          <TouchableOpacity 
            style={[styles.filterBtn, !filterUnit && styles.filterBtnActive]}
            onPress={() => setFilterUnit(null)}
          >
            <Text style={[styles.filterText, !filterUnit && styles.filterTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {state.units.map(u => (
            <TouchableOpacity 
              key={u.id}
              style={[styles.filterBtn, filterUnit === u.id && styles.filterBtnActive]}
              onPress={() => setFilterUnit(u.id)}
            >
              <Text style={[styles.filterText, filterUnit === u.id && styles.filterTextActive]}>{u.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredProducts.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category} • {state.units.find(u => u.id === product.unitId)?.name}</Text>
              </View>
              <View style={styles.stockBadge}>
                <Text style={[styles.stockValue, product.stock <= product.minStock && { color: COLORS.rose }]}>{product.stock}</Text>
                <Text style={styles.stockLabel}>Adet</Text>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setAdjustModal({...product, forceIn: true})}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.emerald} />
                <Text style={[styles.actionText, {color: COLORS.emerald}]}>Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setAdjustModal({...product, forceIn: false})}>
                <Ionicons name="remove-circle-outline" size={20} color={COLORS.amber} />
                <Text style={[styles.actionText, {color: COLORS.amber}]}>Çıkar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: 'rgba(244,63,94,0.2)' }]} onPress={() => handleDelete(product.id, product.name)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.rose} />
                <Text style={[styles.actionText, {color: COLORS.rose}]}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => {
        setNewProduct({ ...newProduct, unitId: isOwner ? (state.units[0]?.id || null) : userUnitId });
        setAddModal(true);
      }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Adjust Modal */}
      <Modal visible={!!adjustModal} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{adjustModal?.forceIn ? '📦 Stok Ekle' : '📤 Stok Eksilt'}</Text>
              <Text style={{ color: COLORS.textMuted, marginBottom: 16 }}>{adjustModal?.name}</Text>
              <TextInput style={styles.input} value={adjustQty} onChangeText={setAdjustQty} keyboardType="numeric" placeholder="Miktar" placeholderTextColor={COLORS.textMuted} autoFocus />
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdjust}>
                <Text style={styles.submitBtnText}>Onayla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdjustModal(null)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={!!addModal} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={{ justifyContent: 'flex-end', flex: 1 }} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Yeni Ürün Tanımla</Text>
                <TextInput style={styles.input} value={newProduct.name} onChangeText={v => setNewProduct({ ...newProduct, name: v })} placeholder="Ürün adı" placeholderTextColor={COLORS.textMuted} />
                
                <Text style={styles.inputLabel}>Birim Seçin</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {state.units
                    .filter(u => isOwner || u.id === userUnitId)
                    .map(u => (
                      <TouchableOpacity key={u.id} style={[styles.filterChip, newProduct.unitId === u.id && styles.filterChipActive]} onPress={() => setNewProduct({ ...newProduct, unitId: u.id })}>
                        <Text style={[styles.filterChipText, newProduct.unitId === u.id && styles.filterChipTextActive]}>{u.name}</Text>
                      </TouchableOpacity>
                  ))}
                </View>

                <TextInput style={styles.input} value={newProduct.category} onChangeText={v => setNewProduct({ ...newProduct, category: v })} placeholder="Kategori (örn: Elektronik)" placeholderTextColor={COLORS.textMuted} />
                <View style={{flexDirection: 'row', gap: 12}}>
                  <TextInput style={[styles.input, {flex: 1}]} value={newProduct.stock} onChangeText={v => setNewProduct({ ...newProduct, stock: v })} keyboardType="numeric" placeholder="Mevcut Stok" placeholderTextColor={COLORS.textMuted} />
                  <TextInput style={[styles.input, {flex: 1}]} value={newProduct.minStock} onChangeText={v => setNewProduct({ ...newProduct, minStock: v })} keyboardType="numeric" placeholder="Kritik Limit" placeholderTextColor={COLORS.textMuted} />
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                  <Text style={styles.submitBtnText}>Ürünü Kaydet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: COLORS.bg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textMain, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.textMain, fontSize: 15 },
  filterBar: { paddingHorizontal: 20, marginBottom: 15, maxHeight: 40 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  container: { paddingHorizontal: 20 },
  productCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  productInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 17, fontWeight: '700', color: COLORS.textMain },
  productCategory: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  stockBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  stockValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  stockLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: COLORS.border },
  actionText: { fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 14, color: COLORS.textMain, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
