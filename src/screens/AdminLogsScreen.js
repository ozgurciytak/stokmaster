import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, formatDate } from '../context/AppContext';

export default function AdminLogsScreen() {
  const { state } = useApp();
  const logs = state.systemLogs || [];

  const getLogIcon = (type) => {
    switch (type) {
      case 'subscription': return { name: 'card', color: COLORS.primary };
      case 'status': return { name: 'shield-checkmark', color: COLORS.amber };
      case 'info': return { name: 'information-circle', color: COLORS.emerald };
      default: return { name: 'list', color: COLORS.textMuted };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Sistem Günlüğü</Text>
        <Text style={styles.subtitle}>Abonelik ve şirket hareketleri</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {logs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: COLORS.textMuted }}>Kayıtlı hareket yok.</Text>
          </View>
        ) : (
          logs.map(log => {
            const icon = getLogIcon(log.type);
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={[styles.iconCircle, { backgroundColor: `${icon.color}15` }]}>
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logTitle}>{log.title}</Text>
                    <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                  </View>
                  <Text style={styles.logBody}>{log.body}</Text>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textMain },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  container: { flex: 1, paddingHorizontal: 20 },
  logCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  iconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  logDate: { fontSize: 11, color: COLORS.textMuted },
  logBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 100 },
});
