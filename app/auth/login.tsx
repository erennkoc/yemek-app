import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { login } from '../../src/api/auth';
import { Colors } from '../../src/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !sifre) { setError('Tüm alanları doldurun'); return; }
    setLoading(true); setError('');
    try {
      const res = await login({ email, sifre });
      await setToken(res.data.access_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1A0A00', Colors.background]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.logo}>🍔</Text>
        <Text style={styles.title}>Tekrar hoş geldin</Text>
        <Text style={styles.subtitle}>Siparişlerini takip etmeye devam et</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            placeholderTextColor={Colors.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={sifre}
            onChangeText={setSifre}
            placeholder="••••••"
            placeholderTextColor={Colors.textDim}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <Link href="/auth/register" style={styles.link}>
          <Text style={styles.linkText}>Hesabın yok mu? <Text style={{ color: Colors.primary }}>Kayıt ol</Text></Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.textMuted, marginTop: 8 },
  form: { padding: 24, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: Colors.error, fontSize: 14, textAlign: 'center' },
  link: { alignSelf: 'center', marginTop: 8 },
  linkText: { color: Colors.textMuted, fontSize: 15 },
});
