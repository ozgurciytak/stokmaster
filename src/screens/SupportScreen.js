import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp, formatDate } from '../context/AppContext';

export default function SupportScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const isAdmin = user?.role === 'superadmin';

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ title: '', message: '' });
  const [reply, setReply] = useState('');

  // Filter tickets: Admin sees all, Owner sees only theirs
  const myTickets = isAdmin 
    ? state.supportTickets 
    : state.supportTickets.filter(t => t.companyId === user.companyId);

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.message.trim()) return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
    
    dispatch({
      type: 'CREATE_TICKET',
      payload: {
        companyId: user.companyId,
        ownerName: user.name,
        title: newTicket.title,
        date: new Date().toISOString().split('T')[0],
        messages: [{ id: Date.now(), sender: user.name, text: newTicket.message, date: new Date().toISOString() }]
      }
    });
    setNewTicket({ title: '', message: '' });
    setModalVisible(false);
    Alert.alert('Başarılı', 'Destek talebiniz oluşturuldu.');
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    dispatch({
      type: 'REPLY_TICKET',
      payload: {
        ticketId: selectedTicket.id,
        message: { sender: user.name, text: reply, date: new Date().toISOString() }
      }
    });
    setReply('');
  };

  const handleCloseTicket = (id) => {
    Alert.alert('Çözüldü', 'Bu talebi kapatmak istediğinize emin misiniz?', [
      { text: 'Hayır' },
      { text: 'Evet, Kapat', onPress: () => {
        dispatch({ type: 'CLOSE_TICKET', payload: id });
        setSelectedTicket(null);
      }}
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>{isAdmin ? 'Destek Talepleri' : 'Destek & Yardım'}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!isAdmin && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Yeni Destek Talebi</Text>
          </TouchableOpacity>
        )}

        {myTickets.map(ticket => (
          <TouchableOpacity key={ticket.id} style={styles.ticketCard} onPress={() => setSelectedTicket(ticket)}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>{ticket.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)' }]}>
                <Text style={{ color: ticket.status === 'open' ? COLORS.emerald : COLORS.textMuted, fontSize: 10, fontWeight: '800' }}>
                  {ticket.status === 'open' ? 'AÇIK' : 'KAPANDI'}
                </Text>
              </View>
            </View>
            {isAdmin && <Text style={styles.ticketOwner}>{ticket.ownerName}</Text>}
            <Text style={styles.ticketDate}>{formatDate(ticket.date)}</Text>
          </TouchableOpacity>
        ))}

        {myTickets.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.surfaceLight} />
            <Text style={styles.emptyText}>Henüz bir destek talebi yok.</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sorununuz Nedir?</Text>
              <TextInput style={styles.input} placeholder="Konu Başlığı" placeholderTextColor={COLORS.textMuted} value={newTicket.title} onChangeText={v => setNewTicket({...newTicket, title: v})} />
              <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} placeholder="Mesajınız..." multiline placeholderTextColor={COLORS.textMuted} value={newTicket.message} onChangeText={v => setNewTicket({...newTicket, message: v})} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTicket}>
                <Text style={styles.submitBtnText}>Talebi Gönder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Ticket Detail / Chat Modal */}
      <Modal visible={!!selectedTicket} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '85%', paddingBottom: 0 }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selectedTicket?.title}</Text>
                  <Text style={styles.modalSub}>{selectedTicket?.ownerName}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                  <Ionicons name="close" size={28} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {selectedTicket?.messages.map(msg => (
                  <View key={msg.id} style={[styles.msgWrap, msg.sender === user.name ? styles.msgRight : styles.msgLeft]}>
                    <Text style={styles.msgSender}>{msg.sender}</Text>
                    <View style={[styles.msgBox, msg.sender === user.name ? styles.msgBoxRight : styles.msgBoxLeft]}>
                      <Text style={styles.msgText}>{msg.text}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {selectedTicket?.status === 'open' ? (
                <View style={styles.replyArea}>
                  <TextInput style={styles.replyInput} placeholder="Cevabınızı yazın..." placeholderTextColor={COLORS.textMuted} value={reply} onChangeText={setReply} />
                  <TouchableOpacity style={styles.sendBtn} onPress={handleReply}>
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.closeTicketBtn} onPress={() => handleCloseTicket(selectedTicket.id)}>
                    <Ionicons name="checkmark-done" size={20} color={COLORS.emerald} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.closedInfo}>
                  <Text style={styles.closedText}>Bu talep çözüldüğü için kapatılmıştır.</Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textMain },
  container: { paddingHorizontal: 20 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, padding: 15, borderRadius: 16, marginBottom: 20 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  ticketCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  ticketTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ticketOwner: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  ticketDate: { fontSize: 11, color: COLORS.textMuted },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textMuted, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain },
  modalSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 16, padding: 16, color: COLORS.textMain, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted },
  msgWrap: { marginBottom: 15, maxWidth: '80%' },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  msgSender: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4, marginHorizontal: 5 },
  msgBox: { padding: 12, borderRadius: 18 },
  msgBoxLeft: { backgroundColor: COLORS.surfaceLight, borderTopLeftRadius: 4 },
  msgBoxRight: { backgroundColor: COLORS.primary, borderTopRightRadius: 4 },
  msgText: { color: '#fff', fontSize: 14 },
  replyArea: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  replyInput: { flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 12, paddingHorizontal: 15, height: 45, color: COLORS.textMain },
  sendBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  closeTicketBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center' },
  closedInfo: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(148,163,184,0.05)', borderRadius: 15, marginBottom: 20 },
  closedText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
