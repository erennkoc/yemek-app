import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyOrders } from '../../src/api/orders';
import { Colors } from '../../src/constants/colors';

const STATUS_COLORS: Record<string, string> = {
  BEKLEMEDE: '#FBBF24', HAZIRLANIYOR: '#60A5FA', YOLDA: '#A78BFA',
  TESLIM_EDILDI: '#4ADE80', IPTAL: '#FF4444',
};
const STATUS_LABELS: Record<string, string> = {
  BEKLEMEDE: 'Beklemede', HAZIRLANIYOR: 'Hazırlanıyor', YOLDA: 'Yolda',
  TESLIM_EDILDI: 'Teslim Edildi', IPTAL: 'İptal',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await getMyOrders(); setOrders(res.data); } catch {}
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Siparişlerim</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Henüz sipariş vermediniz</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/order/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.restaurantName}>{item.restaurant.ad}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.durum] + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.durum] }]}>
                  {STATUS_LABELS[item.durum]}
                </Text>
              </View>
            </View>
            <Text style={styles.items}>
              {item.orderItems.map((i: any) => `${i.menuItem.ad} x${i.adet}`).join(', ')}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
              <Text style={styles.total}>{item.toplamFiyat} ₺</Text>
            </View>
          </TouchableOpacity>
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
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  restaurantName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  items: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  date: { fontSize: 12, color: Colors.textDim },
  total: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
});
