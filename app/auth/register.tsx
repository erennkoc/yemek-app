import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { register } from '../../src/api/auth';
import { Colors } from '../../src/constants/colors';

const ROLES = [
  { value: 'MUSTERI', label: '🛒 Müşteri', desc: 'Sipariş ver, takip et' },
  { value: 'RESTORAN', label: '🍽️ Restoran', desc: 'Siparişleri yönet' },
  { value: 'KURYE', label: '🛵 Kurye', desc: 'Teslimat yap' },
];

export default function RegisterScreen() {
  const [ad, setAd] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState('MUSTERI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken } = useAuthStore();

  const handleRegister = async () => {
    if (!ad || !email || !sifre) { setError('Tüm alanları doldurun'); return; }
    setLoading(true); setError('');
    try {
      const res = await register({ ad, email, sifre, rol });
      await setToken(res.data.access_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1A0A00', Colors.background]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>🍔</Text>
          <Text style={styles.title}>Hesap oluştur</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.sectionLabel}>Kim olduğunu seç</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, rol === r.value && styles.roleCardActive]}
                onPress={() => setRol(r.value)}
              >
                <Text style={styles.roleEmoji}>{r.label.split(' ')[0]}</Text>
                <Text style={[styles.roleLabel, rol === r.value && { color: Colors.primary }]}>
                  {r.label.split(' ')[1]}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {[
            { label: 'Ad Soyad', value: ad, setter: setAd, placeholder: 'Ahmet Yılmaz' },
            { label: 'E-posta', value: email, setter: setEmail, placeholder: 'ornek@mail.com', keyboard: 'email-address' as const },
            { label: 'Şifre', value: sifre, setter: setSifre, placeholder: '••••••', secure: true },
          ].map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textDim}
                keyboardType={field.keyboard || 'default'}
                autoCapitalize="none"
                secureTextEntry={field.secure}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
          </TouchableOpacity>

          <Link href="/auth/login" style={styles.link}>
            <Text style={styles.linkText}>Hesabın var mı? <Text style={{ color: Colors.primary }}>Giriş yap</Text></Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  form: { padding: 24, gap: 14 },
  sectionLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, gap: 4,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: '#1F0D00' },
  roleEmoji: { fontSize: 24 },
  roleLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  roleDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
    color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border,
  },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: Colors.error, fontSize: 14, textAlign: 'center' },
  link: { alignSelf: 'center' },
  linkText: { color: Colors.textMuted, fontSize: 15 },
});
