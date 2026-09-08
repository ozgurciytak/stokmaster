import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../theme';
import { useApp, formatDate } from '../context/AppContext';

export default function ReportsScreen() {
  const { state, company } = useApp();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [searchProduct, setSearchProduct] = useState('');

  const filteredMovements = useMemo(() => {
    const myProductIds = state.products.filter(p => p.companyId === user?.companyId).map(p => p.id);
    let list = state.stockMovements.filter(m => myProductIds.includes(m.productId));
    
    // Product Filter
    if (selectedProduct) {
      list = list.filter(m => m.productId === selectedProduct);
    }

    // Date Filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (dateRange === 'today') {
      list = list.filter(m => m.date === todayStr);
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      list = list.filter(m => new Date(m.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      list = list.filter(m => new Date(m.date) >= monthAgo);
    }

    return list.sort((a, b) => b.id - a.id);
  }, [state.stockMovements, selectedProduct, dateRange]);

  const exportPDF = async () => {
    if (filteredMovements.length === 0) return Alert.alert('Hata', 'Dışa aktarılacak veri bulunamadı.');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; color: #333; }
            h1 { color: #6366f1; text-align: center; }
            .info { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
            td { border: 1px solid #e2e8f0; padding: 10px; font-size: 11px; }
            .type-in { color: #10b981; font-weight: bold; }
            .type-out { color: #f59e0b; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <h1>StockMaster Hareket Raporu</h1>
          <div class="info">
            <p><strong>Firma:</strong> ${company?.name || 'StockMaster'}</p>
            <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            <p><strong>Kayıt Sayısı:</strong> ${filteredMovements.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ürün</th>
                <th>İşlem</th>
                <th>Miktar</th>
                <th>Personel</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMovements.map(m => {
                const p = state.products.find(prod => prod.id === m.productId);
                const pers = state.personnel.find(per => per.id === m.personnelId) || { name: 'Yönetici' };
                return `
                  <tr>
                    <td>${formatDate(m.date)}</td>
                    <td>${p?.name || m.note || '-'}</td>
                    <td class="type-${m.type}">${m.type === 'in' ? 'Ekleme' : m.type === 'out' ? 'Çıkarma' : 'Tanımlama'}</td>
                    <td>${m.quantity || 0} Adet</td>
                    <td>${pers.name}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">Bu rapor StockMaster Mobil Uygulaması tarafından otomatik olarak oluşturulmuştur.</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulurken bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Gelişmiş Raporlar</Text>
          <TouchableOpacity style={styles.pdfBtn} onPress={exportPDF}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.pdfBtnText}>PDF Al</Text>
          </TouchableOpacity>
        </View>

        {/* Date Filters */}
        <View style={styles.filterRow}>
          {['all', 'today', 'week', 'month'].map(r => (
            <TouchableOpacity 
              key={r} 
              style={[styles.rangeBtn, dateRange === r && styles.rangeBtnActive]}
              onPress={() => setDateRange(r)}
            >
              <Text style={[styles.rangeText, dateRange === r && styles.rangeTextActive]}>
                {r === 'all' ? 'Tümü' : r === 'today' ? 'Bugün' : r === 'week' ? 'Haftalık' : 'Aylık'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Filter */}
        <View style={styles.searchBox}>
          <Ionicons name="filter" size={18} color={COLORS.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Ürün seçin veya tümü..."
            placeholderTextColor={COLORS.textMuted}
            value={searchProduct}
            onChangeText={setSearchProduct}
          />
          {selectedProduct && (
            <TouchableOpacity onPress={() => {setSelectedProduct(null); setSearchProduct('');}}>
              <Ionicons name="close-circle" size={18} color={COLORS.rose} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {searchProduct && !selectedProduct && (
          <View style={styles.suggestionBox}>
            {state.products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())).map(p => (
              <TouchableOpacity key={p.id} style={styles.suggestionItem} onPress={() => {setSelectedProduct(p.id); setSearchProduct(p.name);}}>
                <Text style={styles.suggestionText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredMovements.map(move => {
          const product = state.products.find(p => p.id === move.productId);
          const person = state.personnel.find(p => p.id === move.personnelId) || { name: 'Yönetici' };
          
          return (
            <View key={move.id} style={styles.moveCard}>
              <View style={[styles.typeIndicator, { backgroundColor: move.type === 'in' ? COLORS.emerald : move.type === 'out' ? COLORS.amber : COLORS.primary }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardProductName}>{product?.name || move.note}</Text>
                  <Text style={styles.cardDate}>{formatDate(move.date)}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPerson}><Ionicons name="person" size={10} /> {person.name}</Text>
                  <Text style={[styles.cardQty, { color: move.type === 'in' ? COLORS.emerald : move.type === 'out' ? COLORS.amber : COLORS.primary }]}>
                    {move.type === 'in' ? '+' : move.type === 'out' ? '-' : ''}{move.quantity} Adet
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        {filteredMovements.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={COLORS.surfaceLight} />
            <Text style={{ color: COLORS.textMuted, marginTop: 10 }}>Kayıt bulunamadı.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: COLORS.bg, gap: 15 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 6 },
  pdfBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  rangeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rangeText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  rangeTextActive: { color: '#fff' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 8, color: COLORS.textMain, fontSize: 14 },
  container: { flex: 1, paddingHorizontal: 20 },
  moveCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  typeIndicator: { width: 4, height: '100%', borderRadius: 2, marginRight: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardProductName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  cardDate: { fontSize: 11, color: COLORS.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPerson: { fontSize: 12, color: COLORS.textMuted },
  cardQty: { fontSize: 14, fontWeight: '800' },
  suggestionBox: { backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 15, padding: 8, borderWidth: 1, borderColor: COLORS.primary },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionText: { color: COLORS.textMain, fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60 },
});
