import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../context/AppContext';

export default function PaymentScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // monthly, yearly1
  const [method, setMethod] = useState('cc'); // cc, bank
  const [loading, setLoading] = useState(false);

  const plans = [
    { id: 'monthly', name: 'Standart Paket', price: '₺299 / Ay', desc: '10 Personel, Sınırsız Stok' },
    { id: 'yearly1', name: 'Pro Yıllık', price: '₺2.499 / Yıl', desc: 'Sınırsız Personel, PDF Raporlama, %30 İndirim' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const company = state.companies.find(c => c.id === state.currentUser?.companyId);
  const isLocked = company && company.planExpiry < today;

  const handlePayment = () => {
    setLoading(true);
    const companyId = state.companies.find(c => c.ownerEmail === state.currentUser.ownerEmail || c.id === 'comp1')?.id;

    if (method === 'cc') {
      // Simulating Credit Card API call
      setTimeout(() => {
        dispatch({ type: 'DIRECT_PAYMENT_SUCCESS', payload: { companyId, plan: selectedPlan } });
        setLoading(false);
        Alert.alert('Başarılı', 'Ödemeniz alındı ve aboneliğiniz anında yenilendi!', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
      }, 1500);
    } else {
      // Havale Bildirimi
      dispatch({ type: 'CREATE_PAYMENT_REQUEST', payload: { companyId, plan: selectedPlan, method: 'bank' } });
      setLoading(false);
      Alert.alert('Bildirim Alındı', 'Havale bildiriminiz yöneticiye iletildi. Kontrol edildikten sonra onaylanacaktır.', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        {!isLocked ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => dispatch({ type: 'LOGOUT' })}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.rose} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{isLocked ? 'Abonelik Süresi Doldu' : 'Abonelik Yenileme'}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Paket Seçimi</Text>
        {plans.map(p => (
          <TouchableOpacity key={p.id} style={[styles.planCard, selectedPlan === p.id && styles.planCardActive]} onPress={() => setSelectedPlan(p.id)}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, selectedPlan === p.id && { color: '#fff' }]}>{p.name}</Text>
              <Text style={[styles.planDesc, selectedPlan === p.id && { color: 'rgba(255,255,255,0.7)' }]}>{p.desc}</Text>
            </View>
            <Text style={[styles.planPrice, selectedPlan === p.id && { color: '#fff' }]}>{p.price}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity style={[styles.methodBtn, method === 'cc' && styles.methodBtnActive]} onPress={() => setMethod('cc')}>
            <Ionicons name="card-outline" size={20} color={method === 'cc' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.methodText, method === 'cc' && { color: '#fff' }]}>Kredi Kartı</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.methodBtn, method === 'bank' && styles.methodBtnActive]} onPress={() => setMethod('bank')}>
            <Ionicons name="business-outline" size={20} color={method === 'bank' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.methodText, method === 'bank' && { color: '#fff' }]}>Havale/EFT</Text>
          </TouchableOpacity>
        </View>

        {method === 'cc' ? (
          <View style={styles.ccForm}>
            <TextInput style={styles.input} placeholder="Kart Üzerindeki İsim" placeholderTextColor={COLORS.textMuted} />
            <TextInput style={styles.input} placeholder="Kart Numarası" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="AA/YY" placeholderTextColor={COLORS.textMuted} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>
        ) : (
          <View style={styles.bankInfo}>
            <Text style={styles.bankTitle}>Banka Hesap Bilgileri</Text>
            <Text style={styles.bankLabel}>Banka: <Text style={styles.bankVal}>{state.systemSettings.bankName}</Text></Text>
            <Text style={styles.bankLabel}>Alıcı: <Text style={styles.bankVal}>{state.systemSettings.bankAccountHolder}</Text></Text>
            <Text style={styles.bankLabel}>IBAN: <Text style={styles.bankVal}>{state.systemSettings.bankIban}</Text></Text>
            <Text style={styles.bankNote}>* Lütfen açıklama kısmına şirket adınızı yazınız. Ödeme sonrası bildirim butonuna basınız.</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handlePayment} disabled={loading}>
          <Text style={styles.payBtnText}>
            {loading ? 'İşleniyor...' : method === 'cc' ? 'Şimdi Öde' : 'Havale Bildirimi Yap'}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textMain },
  container: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginTop: 20, marginBottom: 15 },
  planCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 20, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  planCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  planName: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  planDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  planPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  methodBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  methodText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  ccForm: { gap: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.textMain, borderWidth: 1, borderColor: COLORS.border },
  bankInfo: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: COLORS.primary },
  bankTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  bankLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  bankVal: { color: COLORS.textMain, fontWeight: '600' },
  bankNote: { fontSize: 12, color: COLORS.amber, marginTop: 15, fontStyle: 'italic' },
  payBtn: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 30, elevation: 4 },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
