import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRestaurantOrders, updateOrderStatus } from '../../src/api/orders';
import { Colors } from '../../src/constants/colors';

const NEXT_STATUS: Record<string, { label: string; next: string }> = {
  BEKLEMEDE: { label: 'Onayla →', next: 'HAZIRLANIYOR' },
  HAZIRLANIYOR: { label: 'Yola Çıktı →', next: 'YOLDA' },
};
const STATUS_LABELS: Record<string, string> = {
  BEKLEMEDE: 'Beklemede', HAZIRLANIYOR: 'Hazırlanıyor', YOLDA: 'Yolda',
  TESLIM_EDILDI: 'Teslim Edildi', IPTAL: 'İptal',
};
const STATUS_COLORS: Record<string, string> = {
  BEKLEMEDE: '#FBBF24', HAZIRLANIYOR: '#60A5FA', YOLDA: '#A78BFA',
  TESLIM_EDILDI: '#4ADE80', IPTAL: '#FF4444',
};

export default function RestaurantPanelScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await getRestaurantOrders(); setOrders(res.data); } catch {}
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleUpdate = async (id: string, durum: string) => {
    try {
      await updateOrderStatus(id, durum);
      load();
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gelen Siparişler</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Henüz sipariş yok</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.customerName}>{item.user.ad}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.durum] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.durum] }]}>
                  {STATUS_LABELS[item.durum]}
                </Text>
              </View>
            </View>
            <Text style={styles.items}>
              {item.orderItems.map((i: any) => `${i.menuItem.ad} x${i.adet}`).join(', ')}
            </Text>
            <Text style={styles.adres}>📍 {item.teslimatAdresi}</Text>
            {item.notlar ? <Text style={styles.notlar}>💬 {item.notlar}</Text> : null}
            <View style={styles.cardBottom}>
              <Text style={styles.total}>{item.toplamFiyat} ₺</Text>
              {NEXT_STATUS[item.durum] && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleUpdate(item.id, NEXT_STATUS[item.durum].next)}
                >
                  <Text style={styles.actionText}>{NEXT_STATUS[item.durum].label}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, padding: 24, paddingBottom: 16, letterSpacing: -0.5 },
  list: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  items: { fontSize: 13, color: Colors.textMuted },
  adres: { fontSize: 12, color: Colors.textDim },
  notlar: { fontSize: 12, color: Colors.secondary, fontStyle: 'italic' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
});
