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
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { login, sendOtp, verifyOtp } from '../../src/api/auth';

// TODO: npx expo install expo-auth-session expo-web-browser expo-crypto
// Yüklendikten sonra aşağıdaki satırları aç:
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { googleAuth } from '../../src/api/auth';
// WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID     = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID     = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';

const { width } = Dimensions.get('window');
const ORANGE = '#FF6B35';
const BG     = '#080808';
const OTP_LENGTH = 6;

type Tab      = 'email' | 'phone';
type PhoneStep = 'input' | 'otp';

export default function LoginScreen() {
  /* ── Genel ── */
  const [tab, setTab]         = useState<Tab>('email');
  const [loading, setLoading] = useState(false);
  const [gLoading]            = useState(false);
  const [error, setError]     = useState('');
  const { setToken } = useAuthStore();

  // TODO: Google Auth — paketler yüklendikten sonra aç
  // const [, googleResponse, googlePrompt] = Google.useAuthRequest({ ... });
  const googlePrompt = () => {};

  /* ── E-posta ── */
  const [email, setEmail]           = useState('');
  const [sifre, setSifre]           = useState('');
  const [showPassword, setShowPass] = useState(false);
  const [emailFocused, setEF]       = useState(false);
  const [sifreFocused, setSF]       = useState(false);

  /* ── Telefon / OTP ── */
  const [phone, setPhone]         = useState('');
  const [phoneFocused, setPF]     = useState(false);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  /* ── Animasyonlar ── */
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const tabAnim   = useRef(new Animated.Value(0)).current;
  const stepAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  /* Countdown her saniye 1 azalır */
  useEffect(() => {
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Tab geçişi ── */
  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setPhoneStep('input');
    Animated.spring(tabAnim, { toValue: t === 'email' ? 0 : 1, tension: 70, friction: 10, useNativeDriver: false }).start();
  };

  const tabLeft = tabAnim.interpolate({ inputRange: [0, 1], outputRange: ['2%', '51%'] });

  /* ── OTP kutuları ── */
  const handleOtpChange = (val: string, idx: number) => {
    /* Yapıştırma: tüm haneleri dağıt */
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => { next[i] = d; });
      setOtpDigits(next);
      otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    const d = val.replace(/\D/g, '');
    const next = [...otpDigits];
    next[idx] = d;
    setOtpDigits(next);
    if (d && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (key: string, idx: number) => {
    if (key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      const next = [...otpDigits];
      next[idx - 1] = '';
      setOtpDigits(next);
      otpRefs.current[idx - 1]?.focus();
    }
  };

  /* ── OTP adım geçişi ── */
  const goToOtpStep = () => {
    Animated.spring(stepAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
    setPhoneStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 400);
  };

  const backToPhoneInput = () => {
    Animated.spring(stepAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }).start();
    setPhoneStep('input');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setError('');
  };

  /* ── Kod gönder ── */
  const handleSendOtp = async () => {
    if (phone.length < 10) { setError('Geçerli bir telefon numarası gir'); return; }
    setLoading(true);
    setError('');
    try {
      await sendOtp('+90' + phone);
      setCountdown(60);
      goToOtpStep();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP doğrula ── */
  const handleVerifyOtp = async () => {
    const kod = otpDigits.join('');
    if (kod.length < OTP_LENGTH) { setError('6 haneli kodu gir'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp('+90' + phone, kod);
      await setToken(res.data.access_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kod hatalı');
    } finally {
      setLoading(false);
    }
  };

  /* ── E-posta girişi ── */
  const handleEmailLogin = async () => {
    if (!email || !sifre) { setError('Tüm alanları doldurun'); return; }
    setLoading(true);
    setError('');
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

  /* ── OTP adım slide animasyonu ── */
  const stepSlide = stepAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Glow orbs */}
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
              {tab === 'phone' && phoneStep === 'otp' ? (
                <>
                  <TouchableOpacity onPress={backToPhoneInput} style={s.backRow}>
                    <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.4)" />
                    <Text style={s.backText}>  Geri</Text>
                  </TouchableOpacity>
                  <Text style={s.headline}>Kodu{'\n'}doğrula</Text>
                  <Text style={s.sub}>
                    +90 {phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')} numarasına{'\n'}gönderilen 6 haneli kodu gir
                  </Text>
                </>
              ) : (
                <>
                  <Text style={s.headline}>Hesabına{'\n'}giriş yap</Text>
                  <Text style={s.sub}>Siparişlerini takip etmeye devam et</Text>
                </>
              )}
            </View>

            {/* ── Tab seçici — sadece OTP adımı değilken göster ── */}
            {!(tab === 'phone' && phoneStep === 'otp') && (
              <View style={s.tabContainer}>
                <Animated.View style={[s.tabIndicator, { left: tabLeft }]} />
                <TouchableOpacity style={s.tabBtn} onPress={() => switchTab('email')} activeOpacity={0.7}>
                  <Text style={[s.tabText, tab === 'email' && s.tabTextActive]}>E-posta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.tabBtn} onPress={() => switchTab('phone')} activeOpacity={0.7}>
                  <Text style={[s.tabText, tab === 'phone' && s.tabTextActive]}>Telefon</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Form kartı ── */}
            <View style={s.card}>
              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠️  {error}</Text>
                </View>
              ) : null}

              {/* ── E-POSTA akışı ── */}
              {tab === 'email' && (
                <>
                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>E-POSTA</Text>
                    <View style={[s.inputWrap, emailFocused && s.inputFocused]}>
                      {emailFocused && <View style={s.accent} />}
                      <TextInput
                        style={[s.input, { flex: 1 }]}
                        value={email}
                        onChangeText={(t) => { setEmail(t); setError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setEF(true)}
                        onBlur={() => setEF(false)}
                      />
                    </View>
                  </View>

                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>ŞİFRE</Text>
                    <View style={[s.inputWrap, sifreFocused && s.inputFocused]}>
                      {sifreFocused && <View style={s.accent} />}
                      <TextInput
                        style={[s.input, { flex: 1 }]}
                        value={sifre}
                        onChangeText={(t) => { setSifre(t); setError(''); }}
                        secureTextEntry={!showPassword}
                        onFocus={() => setSF(true)}
                        onBlur={() => setSF(false)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPass(!showPassword)}
                        style={s.eyeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(255,255,255,0.38)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={s.forgotRow} onPress={() => router.push('/auth/forgot-password')}>
                    <Text style={s.forgotText}>Şifreni mi unuttun?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleEmailLogin} disabled={loading} activeOpacity={0.82}>
                    <LinearGradient
                      colors={loading ? ['#3A3A3A', '#2A2A2A'] : [ORANGE, '#E55A25', '#CC4A15']}
                      style={s.primaryBtn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <><Text style={s.primaryBtnText}>Giriş Yap</Text><Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" /></>
                      }
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* ── TELEFON — Numara girişi ── */}
              {tab === 'phone' && phoneStep === 'input' && (
                <>
                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>TELEFON NUMARASI</Text>
                    <View style={[s.inputWrap, phoneFocused && s.inputFocused]}>
                      {phoneFocused && <View style={s.accent} />}
                      <View style={s.phonePrefix}>
                        <Text style={s.phonePrefixText}>🇹🇷 +90</Text>
                      </View>
                      <View style={s.phoneDivider} />
                      <TextInput
                        style={[s.input, { flex: 1 }]}
                        value={phone}
                        onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
                        placeholder="5XX XXX XX XX"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="phone-pad"
                        maxLength={10}
                        onFocus={() => setPF(true)}
                        onBlur={() => setPF(false)}
                      />
                    </View>
                    <Text style={s.phoneHint}>SMS ile doğrulama kodu gönderilecek</Text>
                  </View>

                  <TouchableOpacity onPress={handleSendOtp} disabled={loading} activeOpacity={0.82}>
                    <LinearGradient
                      colors={loading ? ['#3A3A3A', '#2A2A2A'] : [ORANGE, '#E55A25', '#CC4A15']}
                      style={s.primaryBtn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <><Text style={s.primaryBtnText}>Kod Gönder</Text><Ionicons name="send" size={16} color="rgba(255,255,255,0.7)" /></>
                      }
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* ── TELEFON — OTP doğrulama ── */}
              {tab === 'phone' && phoneStep === 'otp' && (
                <>
                  {/* 6 haneli OTP kutuları */}
                  <View style={s.otpRow}>
                    {otpDigits.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(r) => { otpRefs.current[idx] = r; }}
                        style={[s.otpBox, digit && s.otpBoxFilled]}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(v, idx)}
                        onKeyPress={({ nativeEvent }) => handleOtpKey(nativeEvent.key, idx)}
                        keyboardType="number-pad"
                        maxLength={OTP_LENGTH}
                        selectTextOnFocus
                        textAlign="center"
                        caretHidden
                      />
                    ))}
                  </View>

                  {/* Giriş yap */}
                  <TouchableOpacity onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.82}>
                    <LinearGradient
                      colors={loading ? ['#3A3A3A', '#2A2A2A'] : [ORANGE, '#E55A25', '#CC4A15']}
                      style={s.primaryBtn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <><Text style={s.primaryBtnText}>Giriş Yap</Text><Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" /></>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Yeniden gönder */}
                  <View style={s.resendRow}>
                    {countdown > 0 ? (
                      <Text style={s.resendCountdown}>
                        Tekrar gönder — <Text style={{ color: ORANGE }}>{countdown}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                        <Text style={s.resendBtn}>Kodu tekrar gönder</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>

            {/* ── Ayırıcı ── */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>veya devam et</Text>
              <View style={s.divLine} />
            </View>

            {/* ── Google butonu ── */}
            <TouchableOpacity
              style={s.googleBtn}
              onPress={() => googlePrompt()}
              disabled={gLoading}
              activeOpacity={0.82}
            >
              {gLoading ? (
                <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
              ) : (
                <>
                  <AntDesign name="google" size={18} color="#fff" />
                  <Text style={s.googleBtnText}>Google ile devam et</Text>
                </>
              )}
            </TouchableOpacity>

            {/* ── Kayıt ol ── */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>Hesabın yok mu?</Text>
              <Link href="/auth/register">
                <Text style={s.registerLink}>  Kayıt Ol →</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 40 },

  /* ── Orbs ── */
  orb: { position: 'absolute', borderRadius: 9999 },
  o1a: { width: 420, height: 420, backgroundColor: 'rgba(255,107,53,0.07)', top: -140, right: -110 },
  o1b: { width: 260, height: 260, backgroundColor: 'rgba(255,107,53,0.11)', top:  -65, right:  -40 },
  o1c: { width: 140, height: 140, backgroundColor: 'rgba(255,107,53,0.15)', top:  -10, right:   20 },
  o2a: { width: 380, height: 380, backgroundColor: 'rgba(255,179,71,0.06)', bottom:  -80, left: -150 },
  o2b: { width: 200, height: 200, backgroundColor: 'rgba(255,179,71,0.10)', bottom:   20, left:  -60 },
  horizLine: { position: 'absolute', width, height: 1, backgroundColor: 'rgba(255,107,53,0.05)', top: '48%' },

  /* ── Başlık ── */
  headlineArea: { marginBottom: 36 },
  backRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.38)', fontSize: 14, fontWeight: '500' },
  headline: { fontSize: 46, fontWeight: '800', color: '#fff', letterSpacing: -1.5, lineHeight: 54 },
  sub:      { fontSize: 15, color: 'rgba(255,255,255,0.42)', marginTop: 10, lineHeight: 24 },

  /* ── Tab ── */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4, bottom: 4,
    width: '48%',
    backgroundColor: 'rgba(255,107,53,0.20)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
  },
  tabBtn:       { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText:      { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  tabTextActive:{ color: '#fff' },

  /* ── Kart ── */
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 16,
    marginBottom: 24,
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

  /* ── Telefon ── */
  phonePrefix:     { paddingLeft: 16, paddingRight: 10 },
  phonePrefixText: { color: 'rgba(255,255,255,0.60)', fontSize: 15, fontWeight: '500' },
  phoneDivider:    { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.10)' },
  phoneHint:       { fontSize: 12, color: 'rgba(255,255,255,0.22)', marginTop: 4 },

  /* ── OTP kutuları ── */
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  otpBox: {
    width: (width - 48 - 20 - 50) / OTP_LENGTH,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  otpBoxFilled: {
    borderColor: ORANGE,
    backgroundColor: 'rgba(255,107,53,0.10)',
  },

  /* ── Tekrar gönder ── */
  resendRow:       { alignItems: 'center' },
  resendCountdown: { color: 'rgba(255,255,255,0.38)', fontSize: 14 },
  resendBtn:       { color: ORANGE, fontSize: 14, fontWeight: '600' },

  /* ── Şifremi unuttum ── */
  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: ORANGE, fontSize: 13, fontWeight: '600' },

  /* ── Buton ── */
  primaryBtn: {
    borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  /* ── Google ── */
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, paddingVertical: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 20,
  },
  googleBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  /* ── Ayırıcı ── */
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  divText: { color: 'rgba(255,255,255,0.22)', fontSize: 12, fontWeight: '500' },

  /* ── Kayıt ── */
  registerRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  registerText: { color: 'rgba(255,255,255,0.38)', fontSize: 15 },
  registerLink: { color: ORANGE, fontSize: 15, fontWeight: '700' },

  footer: { color: 'rgba(255,255,255,0.16)', fontSize: 11, textAlign: 'center', lineHeight: 17 },
});
