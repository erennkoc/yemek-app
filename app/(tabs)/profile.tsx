import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';

const ROL_LABELS: Record<string, string> = {
  MUSTERI: '🛒 Müşteri', RESTORAN: '🍽️ Restoran', KURYE: '🛵 Kurye',
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.email[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>{user?.rol ? ROL_LABELS[user.rol] : ''}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 24, letterSpacing: -0.5 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  email: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  rolBadge: {
    backgroundColor: Colors.primary + '22', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  rolText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  logoutBtn: {
    marginTop: 'auto', backgroundColor: Colors.error + '22', borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.error + '44',
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },
});
