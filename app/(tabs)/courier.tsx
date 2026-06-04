import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAvailableDeliveries, acceptDelivery, completeDelivery, getMyDeliveries } from '../../src/api/deliveries';
import { Colors } from '../../src/constants/colors';

export default function CourierScreen() {
  const [available, setAvailable] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'my'>('available');

  const load = async () => {
    setLoading(true);
    try {
      const [av, my] = await Promise.all([getAvailableDeliveries(), getMyDeliveries()]);
      setAvailable(av.data);
      setMyDeliveries(my.data);
    } catch {}
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleAccept = async (id: string) => {
    try { await acceptDelivery(id); load(); }
    catch (e: any) { Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız'); }
  };

  const handleComplete = async (id: string) => {
    try { await completeDelivery(id); load(); }
    catch (e: any) { Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız'); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  const data = tab === 'available' ? available : myDeliveries;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Teslimatlar</Text>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'available' && styles.tabActive]} onPress={() => setTab('available')}>
          <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>
            Bekleyenler {available.length > 0 ? `(${available.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'my' && styles.tabActive]} onPress={() => setTab('my')}>
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>Geçmişim</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{tab === 'available' ? 'Bekleyen teslimat yok' : 'Henüz teslimat yok'}</Text>
        }
        renderItem={({ item }) => {
          const order = item.order;
          const isActive = item.durum === 'ATANDI';
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.restaurantName}>{order.restaurant.ad}</Text>
                {item.durum && (
                  <Text style={[styles.durumText, isActive && { color: Colors.secondary }]}>
                    {item.durum === 'ATANMADI' ? '⏳ Bekliyor' : item.durum === 'ATANDI' ? '🛵 Aktif' : '✅ Tamamlandı'}
                  </Text>
                )}
              </View>
              <Text style={styles.adres}>📍 {order.teslimatAdresi}</Text>
              <Text style={styles.restAdres}>🏠 {order.restaurant.adres}</Text>
              {order.user && <Text style={styles.customer}>👤 {order.user.ad} {order.user.telefon ? `• ${order.user.telefon}` : ''}</Text>}
              <View style={styles.cardBottom}>
                <Text style={styles.total}>{order.toplamFiyat} ₺</Text>
                {tab === 'available' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleAccept(item.id)}>
                    <Text style={styles.actionText}>Teslim Al →</Text>
                  </TouchableOpacity>
                )}
                {tab === 'my' && isActive && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleComplete(item.id)}>
                    <Text style={styles.actionText}>Teslim Ettim ✓</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, padding: 24, paddingBottom: 12, letterSpacing: -0.5 },
  tabs: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 16, backgroundColor: Colors.surface, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  durumText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  adres: { fontSize: 13, color: Colors.text },
  restAdres: { fontSize: 12, color: Colors.textMuted },
  customer: { fontSize: 12, color: Colors.textDim },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  total: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
});
