import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { getRestaurants } from '../../src/api/restaurants';
import { Colors } from '../../src/constants/colors';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then((res) => {
      setRestaurants(res.data);
      setFiltered(res.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(restaurants.filter((r) =>
      r.ad.toLowerCase().includes(search.toLowerCase()) ||
      r.kategori.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, restaurants]);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.email.split('@')[0]} 👋</Text>
          <Text style={styles.tagline}>Ne yemek istersin?</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Restoran veya mutfak ara..."
          placeholderTextColor={Colors.textDim}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Restoran bulunamadı</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/restaurant/${item.id}`)}>
            <View style={styles.cardImage}>
              <Text style={styles.cardEmoji}>🍽️</Text>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.ad}</Text>
                <View style={[styles.badge, !item.acikMi && styles.badgeClosed]}>
                  <Text style={styles.badgeText}>{item.acikMi ? 'Açık' : 'Kapalı'}</Text>
                </View>
              </View>
              <Text style={styles.cardKategori}>{item.kategori}</Text>
              <Text style={styles.cardAdres} numberOfLines={1}>📍 {item.adres}</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 14, color: Colors.textMuted },
  tagline: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: 24, borderRadius: 12, paddingHorizontal: 14, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 14 },
  list: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row',
  },
  cardImage: {
    width: 90, backgroundColor: '#2A1500', alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1, padding: 14, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  badge: { backgroundColor: '#0A2A0A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeClosed: { backgroundColor: '#2A0A0A' },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.success },
  cardKategori: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  cardAdres: { fontSize: 12, color: Colors.textMuted },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
