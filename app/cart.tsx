import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../src/store/cartStore';
import { createOrder } from '../src/api/orders';
import { Colors } from '../src/constants/colors';

export default function CartScreen() {
  const { items, restaurantId, updateAdet, removeItem, clearCart, total } = useCartStore();
  const [adres, setAdres] = useState('');
  const [notlar, setNotlar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!adres.trim()) { Alert.alert('Hata', 'Teslimat adresi giriniz'); return; }
    if (!restaurantId || items.length === 0) return;
    setLoading(true);
    try {
      await createOrder({
        restaurantId,
        teslimatAdresi: adres,
        notlar: notlar || undefined,
        items: items.map((i) => ({ menuItemId: i.menuItemId, adet: i.adet })),
      });
      clearCart();
      Alert.alert('Sipariş Verildi! 🎉', 'Siparişiniz alındı.', [
        { text: 'Siparişleri Gör', onPress: () => router.replace('/(tabs)/orders') },
      ]);
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message || 'Sipariş verilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyText}>Sepetiniz boş</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Sepetim</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.menuItemId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teslimat Adresi *</Text>
              <TextInput
                style={styles.input}
                value={adres}
                onChangeText={setAdres}
                placeholder="Cadde, no, daire..."
                placeholderTextColor={Colors.textDim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notlar (opsiyonel)</Text>
              <TextInput
                style={styles.input}
                value={notlar}
                onChangeText={setNotlar}
                placeholder="Acısız olsun, zil çalmasın..."
                placeholderTextColor={Colors.textDim}
              />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalPrice}>{total()} ₺</Text>
            </View>
            <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>Sipariş Ver</Text>}
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.ad}</Text>
              <Text style={styles.itemPrice}>{item.fiyat} ₺</Text>
            </View>
            <View style={styles.itemControls}>
              <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateAdet(item.menuItemId, item.adet - 1)}>
                <Text style={styles.ctrlText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.adet}>{item.adet}</Text>
              <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateAdet(item.menuItemId, item.adet + 1)}>
                <Text style={styles.ctrlText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  back: { padding: 20, paddingBottom: 4 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, paddingHorizontal: 24, marginBottom: 16, letterSpacing: -0.5 },
  list: { paddingHorizontal: 24, gap: 10, paddingBottom: 40 },
  cartItem: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  itemPrice: { fontSize: 14, color: Colors.primary, fontWeight: '700', marginTop: 2 },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctrlBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  adet: { color: Colors.text, fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  footer: { gap: 14, marginTop: 8 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  totalLabel: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  totalPrice: { fontSize: 24, fontWeight: '800', color: Colors.text },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 18, color: Colors.textMuted },
});
