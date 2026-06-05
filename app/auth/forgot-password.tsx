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
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword, resetPassword } from '../../src/api/auth';

const { width } = Dimensions.get('window');
const ORANGE    = '#FF6B35';
const BG        = '#080808';
const OTP_LENGTH = 6;

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordScreen() {
  const [step, setStep]           = useState<Step>('email');
  const [email, setEmail]         = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [yeniSifre, setYeniSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailFocused, setEF]     = useState(false);
  const [passFocused, setPF]      = useState(false);
  const [pass2Focused, setP2F]    = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const stepAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── OTP kutuları ── */
  const handleOtpChange = (val: string, idx: number) => {
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

  /* ── Adım 1: Kod gönder ── */
  const handleSendCode = async () => {
    if (!email) { setError('E-posta adresini gir'); return; }
    setLoading(true); setError('');
    try {
      await forgotPassword(email);
      setCountdown(60);
      Animated.spring(stepAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
      setStep('reset');
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  /* ── Adım 2: Şifre sıfırla ── */
  const handleReset = async () => {
    const kod = otpDigits.join('');
    if (kod.length < OTP_LENGTH) { setError('6 haneli kodu gir'); return; }
    if (!yeniSifre)               { setError('Yeni şifreyi gir'); return; }
    if (yeniSifre.length < 6)     { setError('Şifre en az 6 karakter olmalı'); return; }
    if (yeniSifre !== sifreTekrar){ setError('Şifreler eşleşmiyor'); return; }
    setLoading(true); setError('');
    try {
      await resetPassword({ email, kod, yeniSifre });
      setStep('success');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Şifre sıfırlama başarısız');
    } finally {
      setLoading(false);
    }
  };

  /* ── Başlık içeriği adıma göre ── */
  const headlines: Record<Step, { title: string; sub: string }> = {
    email: {
      title: 'Şifreni\nsıfırla',
      sub: 'E-posta adresine doğrulama kodu gönderelim',
    },
    reset: {
      title: 'Yeni\nşifreni belirle',
      sub: `${email} adresine gönderilen kodu gir`,
    },
    success: {
      title: 'Başarılı! 🎉',
      sub: 'Şifren güncellendi, giriş yapabilirsin',
    },
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Orbs */}
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
              <TouchableOpacity
                onPress={() => step === 'reset' ? setStep('email') : router.back()}
                style={s.backRow}
              >
                <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.4)" />
                <Text style={s.backText}>  Geri</Text>
              </TouchableOpacity>
              <Text style={s.headline}>{headlines[step].title}</Text>
              <Text style={s.sub}>{headlines[step].sub}</Text>
            </View>

            {/* ── ADIM 1: E-posta ── */}
            {step === 'email' && (
              <View style={s.card}>
                {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️  {error}</Text></View> : null}

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

                <TouchableOpacity onPress={handleSendCode} disabled={loading} activeOpacity={0.82}>
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
              </View>
            )}

            {/* ── ADIM 2: OTP + Yeni Şifre ── */}
            {step === 'reset' && (
              <View style={s.card}>
                {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️  {error}</Text></View> : null}

                {/* OTP kutuları */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>DOĞRULAMA KODU</Text>
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
                </View>

                {/* Yeni şifre */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>YENİ ŞİFRE</Text>
                  <View style={[s.inputWrap, passFocused && s.inputFocused]}>
                    {passFocused && <View style={s.accent} />}
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      value={yeniSifre}
                      onChangeText={(t) => { setYeniSifre(t); setError(''); }}
                      secureTextEntry={!showPass}
                      onFocus={() => setPF(true)}
                      onBlur={() => setPF(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPass(!showPass)}
                      style={s.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPass ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="rgba(255,255,255,0.38)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Şifre tekrar */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>ŞİFRE TEKRAR</Text>
                  <View style={[s.inputWrap, pass2Focused && s.inputFocused]}>
                    {pass2Focused && <View style={s.accent} />}
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      value={sifreTekrar}
                      onChangeText={(t) => { setSifreTekrar(t); setError(''); }}
                      secureTextEntry={!showPass}
                      onFocus={() => setP2F(true)}
                      onBlur={() => setP2F(false)}
                    />
                  </View>
                </View>

                <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.82}>
                  <LinearGradient
                    colors={loading ? ['#3A3A3A', '#2A2A2A'] : [ORANGE, '#E55A25', '#CC4A15']}
                    style={s.primaryBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Text style={s.primaryBtnText}>Şifremi Güncelle</Text><Ionicons name="checkmark" size={18} color="rgba(255,255,255,0.7)" /></>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                {/* Tekrar gönder */}
                <View style={s.resendRow}>
                  {countdown > 0 ? (
                    <Text style={s.resendCountdown}>
                      Tekrar gönder — <Text style={{ color: ORANGE }}>{countdown}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendCode} disabled={loading}>
                      <Text style={s.resendBtn}>Kodu tekrar gönder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* ── ADIM 3: Başarı ── */}
            {step === 'success' && (
              <View style={s.card}>
                <View style={s.successIcon}>
                  <LinearGradient
                    colors={[ORANGE, '#CC4A15']}
                    style={s.successIconBg}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="checkmark" size={36} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={s.successText}>
                  Şifren başarıyla güncellendi.{'\n'}Artık yeni şifrenle giriş yapabilirsin.
                </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.82}>
                  <LinearGradient
                    colors={[ORANGE, '#E55A25', '#CC4A15']}
                    style={s.primaryBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <Text style={s.primaryBtnText}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 40 },

  orb: { position: 'absolute', borderRadius: 9999 },
  o1a: { width: 420, height: 420, backgroundColor: 'rgba(255,107,53,0.07)', top: -140, right: -110 },
  o1b: { width: 260, height: 260, backgroundColor: 'rgba(255,107,53,0.11)', top:  -65, right:  -40 },
  o1c: { width: 140, height: 140, backgroundColor: 'rgba(255,107,53,0.15)', top:  -10, right:   20 },
  o2a: { width: 380, height: 380, backgroundColor: 'rgba(255,179,71,0.06)', bottom:  -80, left: -150 },
  o2b: { width: 200, height: 200, backgroundColor: 'rgba(255,179,71,0.10)', bottom:   20, left:  -60 },
  horizLine: { position: 'absolute', width, height: 1, backgroundColor: 'rgba(255,107,53,0.05)', top: '48%' },

  headlineArea: { marginBottom: 32 },
  backRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.38)', fontSize: 14, fontWeight: '500' },
  headline: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.5, lineHeight: 52 },
  sub:      { fontSize: 15, color: 'rgba(255,255,255,0.42)', marginTop: 8, lineHeight: 22 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    gap: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(255,68,68,0.10)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,68,68,0.20)',
  },
  errorText: { color: '#FF6666', fontSize: 13, fontWeight: '500' },

  fieldGroup:  { gap: 8 },
  fieldLabel:  { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.30)', letterSpacing: 1.5 },
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

  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  otpBox: {
    width: (width - 48 - 20 - 40) / OTP_LENGTH,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 22, fontWeight: '700',
  },
  otpBoxFilled: { borderColor: ORANGE, backgroundColor: 'rgba(255,107,53,0.10)' },

  primaryBtn: {
    borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  resendRow:       { alignItems: 'center' },
  resendCountdown: { color: 'rgba(255,255,255,0.38)', fontSize: 14 },
  resendBtn:       { color: ORANGE, fontSize: 14, fontWeight: '600' },

  successIcon:   { alignItems: 'center', paddingVertical: 8 },
  successIconBg: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  successText:   { color: 'rgba(255,255,255,0.55)', fontSize: 15, textAlign: 'center', lineHeight: 24 },
});
