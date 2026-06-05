import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { register } from '../../src/api/auth';

const { width } = Dimensions.get('window');
const ORANGE = '#FF6B35';
const BG     = '#080808';

export default function RegisterScreen() {
  const [ad, setAd]             = useState('');
  const [email, setEmail]       = useState('');
  const [sifre, setSifre]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPassword, setShow] = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const { setToken } = useAuthStore();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!ad || !email || !sifre) { setError('Tüm alanları doldurun'); return; }
    if (sifre.length < 6)        { setError('Şifre en az 6 karakter olmalı'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await register({ ad, email, sifre });
      await setToken(res.data.access_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'ad',
      label: 'AD SOYAD',
      value: ad,
      setter: setAd,
      keyboard: 'default' as const,
      capitalize: 'words' as const,
      secure: false,
    },
    {
      key: 'email',
      label: 'E-POSTA',
      value: email,
      setter: setEmail,
      keyboard: 'email-address' as const,
      capitalize: 'none' as const,
      secure: false,
    },
    {
      key: 'sifre',
      label: 'ŞİFRE',
      value: sifre,
      setter: setSifre,
      keyboard: 'default' as const,
      capitalize: 'none' as const,
      secure: true,
    },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Orbs — sol üstten geliyor */}
      <View style={[s.orb, s.o1a]} /><View style={[s.orb, s.o1b]} /><View style={[s.orb, s.o1c]} />
      <View style={[s.orb, s.o2a]} /><View style={[s.orb, s.o2b]} />
      <View style={s.horizLine} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Başlık ── */}
            <View style={s.headlineArea}>
              <TouchableOpacity onPress={() => router.back()} style={s.backRow}>
                <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.4)" />
                <Text style={s.backText}>  Geri</Text>
              </TouchableOpacity>
              <Text style={s.headline}>Hesap{'\n'}oluştur</Text>
              <Text style={s.sub}>Ücretsiz kayıt ol, ilk siparişini ver</Text>
            </View>

            {/* ── Form kartı ── */}
            <View style={s.card}>
              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠️  {error}</Text>
                </View>
              ) : null}

              {fields.map((f) => (
                <View key={f.key} style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <View style={[s.inputWrap, focused === f.key && s.inputFocused]}>
                    {focused === f.key && <View style={s.accent} />}
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      value={f.value}
                      onChangeText={(t) => { f.setter(t); setError(''); }}
                      keyboardType={f.keyboard}
                      autoCapitalize={f.capitalize}
                      autoCorrect={false}
                      secureTextEntry={f.secure && !showPassword}
                      onFocus={() => setFocused(f.key)}
                      onBlur={() => setFocused(null)}
                    />
                    {f.secure && (
                      <TouchableOpacity
                        onPress={() => setShow(!showPassword)}
                        style={s.eyeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(255,255,255,0.38)"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Kayıt ol butonu */}
              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.82}>
                <LinearGradient
                  colors={loading ? ['#3A3A3A', '#2A2A2A'] : [ORANGE, '#E55A25', '#CC4A15']}
                  style={s.submitBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <><Text style={s.submitBtnText}>Kayıt Ol</Text><Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" /></>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* ── Zaten hesabın var ── */}
            <View style={s.loginRow}>
              <Text style={s.loginText}>Zaten hesabın var mı?</Text>
              <Link href="/auth/login">
                <Text style={s.loginLink}>  Giriş Yap →</Text>
              </Link>
            </View>

            <Text style={s.footer}>
              Devam ederek Kullanım Koşullarını{'\n'}kabul etmiş olursun
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  /* ── Orbs ── */
  orb: { position: 'absolute', borderRadius: 9999 },
  o1a: { width: 380, height: 380, backgroundColor: 'rgba(255,107,53,0.07)', top: -100, left: -120 },
  o1b: { width: 220, height: 220, backgroundColor: 'rgba(255,107,53,0.11)', top:  -40, left:  -50 },
  o1c: { width: 120, height: 120, backgroundColor: 'rgba(255,107,53,0.15)', top:    0, left:  -10 },
  o2a: { width: 340, height: 340, backgroundColor: 'rgba(255,179,71,0.06)', bottom:  -60, right: -130 },
  o2b: { width: 180, height: 180, backgroundColor: 'rgba(255,179,71,0.09)', bottom:   20, right:  -50 },
  horizLine: { position: 'absolute', width, height: 1, backgroundColor: 'rgba(255,107,53,0.05)', top: '50%' },

  /* ── Başlık ── */
  headlineArea: { marginBottom: 28 },
  backRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.38)', fontSize: 14, fontWeight: '500' },
  headline: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.5, lineHeight: 52 },
  sub:      { fontSize: 15, color: 'rgba(255,255,255,0.42)', marginTop: 8, lineHeight: 22 },

  /* ── Kart ── */
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    gap: 16, marginBottom: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(255,68,68,0.10)',
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,68,68,0.20)',
  },
  errorText: { color: '#FF6666', fontSize: 13, fontWeight: '500' },

  /* ── Alanlar ── */
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.30)', letterSpacing: 1.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  inputFocused: { borderColor: 'rgba(255,107,53,0.40)', backgroundColor: 'rgba(255,107,53,0.05)' },
  accent:       { width: 3, alignSelf: 'stretch', backgroundColor: ORANGE },
  input:        { color: '#fff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 16 },
  eyeBtn:       { paddingHorizontal: 16 },

  /* ── Buton ── */
  submitBtn: {
    borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  /* ── Giriş yap ── */
  loginRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  loginText: { color: 'rgba(255,255,255,0.38)', fontSize: 15 },
  loginLink: { color: ORANGE, fontSize: 15, fontWeight: '700' },

  footer: { color: 'rgba(255,255,255,0.16)', fontSize: 11, textAlign: 'center', lineHeight: 17 },
});
