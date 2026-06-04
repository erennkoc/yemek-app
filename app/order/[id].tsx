import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrder } from '../../src/api/orders';
import { Colors } from '../../src/constants/colors';

const STATUS_STEPS = ['BEKLEMEDE', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI'];
const STATUS_LABELS: Record<string, string> = {
  BEKLEMEDE: 'Beklemede', HAZIRLANIYOR: 'Hazırlanıyor', YOLDA: 'Yolda', TESLIM_EDILDI: 'Teslim Edildi', IPTAL: 'İptal',
};
const STATUS_EMOJIS: Record<string, string> = {
  BEKLEMEDE: '⏳', HAZIRLANIYOR: '👨‍🍳', YOLDA: '🛵', TESLIM_EDILDI: '✅', IPTAL: '❌',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then((res) => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!order) return <View style={styles.center}><Text style={styles.err}>Sipariş bulunamadı</Text></View>;

  const stepIndex = STATUS_STEPS.indexOf(order.durum);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJIS[order.durum]}</Text>
          <Text style={styles.statusText}>{STATUS_LABELS[order.durum]}</Text>
          <Text style={styles.restaurantName}>{order.restaurant.ad}</Text>
        </View>

        {order.durum !== 'IPTAL' && (
          <View style={styles.stepsRow}>
            {STATUS_STEPS.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]} />
                {i < STATUS_STEPS.length - 1 && (
                  <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />
                )}
                <Text style={[styles.stepLabel, i <= stepIndex && styles.stepLabelActive]}>
                  {STATUS_EMOJIS[step]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ürünler</Text>
          {order.orderItems.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.menuItem.ad} x{item.adet}</Text>
              <Text style={styles.itemPrice}>{item.birimFiyat * item.adet} ₺</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{order.toplamFiyat} ₺</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
          <Text style={styles.adres}>{order.teslimatAdresi}</Text>
          {order.notlar && <Text style={styles.notlar}>Not: {order.notlar}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  err: { color: Colors.textMuted },
  back: { padding: 20, paddingBottom: 4 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  content: { padding: 24, gap: 16 },
  statusCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  statusEmoji: { fontSize: 48 },
  statusText: { fontSize: 20, fontWeight: '800', color: Colors.text },
  restaurantName: { fontSize: 14, color: Colors.textMuted },
  stepsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary },
  stepLine: { position: 'absolute', top: 6, left: '50%', right: '-50%', height: 2, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 18, marginTop: 6, opacity: 0.3 },
  stepLabelActive: { opacity: 1 },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 13, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 14, color: Colors.text },
  itemPrice: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
  totalLabel: { fontSize: 16, color: Colors.text, fontWeight: '700' },
  totalPrice: { fontSize: 20, color: Colors.primary, fontWeight: '800' },
  adres: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  notlar: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
});
