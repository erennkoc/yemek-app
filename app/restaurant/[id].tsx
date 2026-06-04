import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRestaurant } from '../../src/api/restaurants';
import { useCartStore } from '../../src/store/cartStore';
import { Colors } from '../../src/constants/colors';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCartStore();

  useEffect(() => {
    getRestaurant(id).then((res) => setRestaurant(res.data)).finally(() => setLoading(false));
  }, [id]);

  const cartCount = items.reduce((s, i) => s + i.adet, 0);

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!restaurant) return <View style={styles.center}><Text style={styles.err}>Restoran bulunamadı</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={styles.heroName}>{restaurant.ad}</Text>
          <Text style={styles.heroKategori}>{restaurant.kategori}</Text>
          <Text style={styles.heroAdres}>📍 {restaurant.adres}</Text>
          <View style={[styles.openBadge, !restaurant.acikMi && styles.closedBadge]}>
            <Text style={styles.openText}>{restaurant.acikMi ? '✓ Açık' : '✗ Kapalı'}</Text>
          </View>
        </View>

        <Text style={styles.menuTitle}>Menü</Text>
        {restaurant.menuItems?.length === 0 && (
          <Text style={styles.empty}>Henüz menü eklenmemiş</Text>
        )}
        {restaurant.menuItems?.map((item: any) => {
          const inCart = items.find((i) => i.menuItemId === item.id);
          return (
            <View key={item.id} style={styles.menuCard}>
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.ad}</Text>
                {item.aciklama ? <Text style={styles.menuDesc}>{item.aciklama}</Text> : null}
                {item.kategori ? <Text style={styles.menuKategori}>{item.kategori}</Text> : null}
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.menuPrice}>{item.fiyat} ₺</Text>
                <TouchableOpacity
                  style={[styles.addBtn, inCart && styles.addBtnActive]}
                  onPress={() => addItem(id, { menuItemId: item.id, ad: item.ad, fiyat: item.fiyat })}
                  disabled={!restaurant.acikMi}
                >
                  <Text style={styles.addBtnText}>{inCart ? `+${inCart.adet}` : '+'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartBarText}>{cartCount} ürün seçildi</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <Text style={styles.cartBtnText}>Sepete Git →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  err: { color: Colors.textMuted },
  back: { padding: 20, paddingBottom: 0 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  hero: { padding: 24, alignItems: 'center', gap: 6 },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroName: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  heroKategori: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  heroAdres: { fontSize: 13, color: Colors.textMuted },
  openBadge: { backgroundColor: '#0A2A0A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  closedBadge: { backgroundColor: '#2A0A0A' },
  openText: { color: Colors.success, fontWeight: '700', fontSize: 13 },
  menuTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, paddingHorizontal: 24, marginBottom: 12, letterSpacing: -0.3 },
  menuCard: {
    flexDirection: 'row', backgroundColor: Colors.surface, marginHorizontal: 24,
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  menuInfo: { flex: 1, gap: 3 },
  menuName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  menuDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 16 },
  menuKategori: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  menuRight: { alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 12 },
  menuPrice: { fontSize: 16, fontWeight: '800', color: Colors.text },
  addBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnActive: { backgroundColor: Colors.primary },
  addBtnText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: 16, paddingBottom: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cartBarText: { color: Colors.textMuted, fontSize: 14 },
  cartBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { color: Colors.textMuted, textAlign: 'center', padding: 24 },
});
