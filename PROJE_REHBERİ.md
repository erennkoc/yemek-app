# Yemek Uygulaması — Proje Rehberi

> Projenin mevcut durumu, alınan kararlar ve yapılacaklar. Her oturumda önce bu dosyayı oku.

---

## Proje Kimliği

| Alan | Detay |
|------|-------|
| **Uygulama Adı** | Lezzet (geçici) |
| **Tür** | Yemek teslimat uygulaması |
| **Platform** | iOS + Android (React Native + Expo) |
| **Backend** | NestJS + PostgreSQL + Redis |
| **API URL** | `https://yemek-app-api.onrender.com` |
| **Klasör** | `C:\Users\EXCALIBUR\Desktop\Claude\yemek-app` |

---

## Klasör Yapısı

```
yemek-app/
├── app/                          ← Expo Router sayfaları
│   ├── _layout.tsx               ← Kök layout (token kontrolü, Stack navigator)
│   ├── index.tsx                 ← Giriş noktası (token varsa → tabs, yoksa → login)
│   ├── auth/
│   │   ├── _layout.tsx           ← Auth stack layout
│   │   ├── login.tsx             ← ✅ Tamamlandı
│   │   ├── register.tsx          ← ✅ Tamamlandı
│   │   └── forgot-password.tsx   ← ✅ Tamamlandı
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← Role göre tab bar (müşteri/restoran/kurye)
│   │   ├── index.tsx             ← Ana sayfa (restoran listesi) — müşteri
│   │   ├── orders.tsx            ← Siparişlerim — müşteri
│   │   ├── profile.tsx           ← Profil — tüm roller
│   │   ├── restaurant-panel.tsx  ← Sipariş yönetimi — restoran
│   │   └── courier.tsx           ← Teslimat listesi — kurye
│   ├── restaurant/[id].tsx       ← Restoran detay + menü
│   ├── cart.tsx                  ← Sepet (modal)
│   └── order/[id].tsx            ← Sipariş takip
│
├── src/
│   ├── api/
│   │   ├── client.ts             ← Axios instance + JWT interceptor
│   │   ├── auth.ts               ← Auth API fonksiyonları
│   │   ├── restaurants.ts        ← Restoran API'leri
│   │   ├── orders.ts             ← Sipariş API'leri
│   │   └── deliveries.ts         ← Teslimat API'leri
│   ├── store/
│   │   ├── authStore.ts          ← Zustand — kullanıcı & token
│   │   └── cartStore.ts          ← Zustand — sepet
│   └── constants/
│       └── colors.ts             ← Renk paleti
│
├── babel.config.js               ← ✅ Oluşturuldu (worklets + reanimated)
├── package.json
└── PROJE_REHBERİ.md              ← Bu dosya
```

---

## Renk Paleti

```ts
// src/constants/colors.ts
background:  '#0F0F0F'   // Ana arka plan
surface:     '#1A1A1A'   // Kart/yüzey
surfaceHigh: '#242424'   // Yükseltilmiş yüzey
primary:     '#FF6B35'   // Turuncu — ana renk
primaryDark: '#E55A25'   // Koyu turuncu
secondary:   '#FFB347'   // Amber
text:        '#FFFFFF'
textMuted:   '#888888'
textDim:     '#555555'
border:      '#2A2A2A'
success:     '#4ADE80'
error:       '#FF4444'
warning:     '#FBBF24'

// Auth ekranlarında ek renkler
BG (auth bg): '#080808'  // Daha koyu siyah
```

---

## Yüklü Paketler

```json
{
  "@react-native-async-storage/async-storage": "2.2.0",
  "axios": "^1.17.0",
  "expo": "^54.0.35",
  "expo-auth-session": "yüklendi",
  "expo-constants": "~18.0.13",
  "expo-linear-gradient": "~15.0.8",
  "expo-linking": "~8.0.12",
  "expo-router": "~6.0.24",
  "expo-status-bar": "~3.0.9",
  "expo-web-browser": "yüklendi",
  "expo-crypto": "yüklendi",
  "jwt-decode": "^4.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~3.16.7",
  "react-native-worklets-core": "yüklendi",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "zustand": "^5.0.14"
}
```

> **Önemli:** `babel.config.js` içinde plugin sırası kritik:
> 1. `react-native-worklets-core/plugin`
> 2. `react-native-reanimated/plugin`

---

## Auth Ekranları — Tamamlanan İşler

### Tasarım Dili
- Çok koyu arka plan (`#080808`)
- Katmanlı turuncu glow orb efektleri (radial ışık simülasyonu)
- Glassmorphism form kartı (`rgba` + ince border)
- Input odaklandığında sol turuncu accent çizgisi
- Fade + spring açılış animasyonu (`react-native-reanimated`)
- Gradient CTA butonları (`expo-linear-gradient`)
- `Ionicons` vektör ikonları (`@expo/vector-icons`)

---

### `login.tsx` — Özellikler

| Özellik | Durum |
|---------|-------|
| E-posta + şifre girişi | ✅ |
| Telefon + OTP girişi | ✅ UI hazır, backend bekliyor |
| Google ile giriş | ✅ UI + auth hook hazır, Client ID girilmeli |
| Şifremi unuttum → yönlendirme | ✅ |
| E-posta / Telefon tab geçişi | ✅ Animasyonlu |
| OTP — 6 kutucuk | ✅ Auto-advance, backspace, yapıştır |
| OTP — 60s geri sayım | ✅ |
| Şifre göster/gizle (`eye-outline`) | ✅ |
| Placeholder kaldırıldı | ✅ |
| E-posta input kasma düzeltmesi | ✅ (`flex: 1` eklendi) |

**Google Auth — Yapılacak (backend hazır olduğunda):**
```
login.tsx içindeki 3 sabiti doldur:
GOOGLE_WEB_CLIENT_ID     = 'xxx.apps.googleusercontent.com'
GOOGLE_ANDROID_CLIENT_ID = 'xxx.apps.googleusercontent.com'
GOOGLE_IOS_CLIENT_ID     = 'xxx.apps.googleusercontent.com'
```
→ Google Cloud Console → OAuth 2.0 Client ID

---

### `register.tsx` — Özellikler

| Özellik | Durum |
|---------|-------|
| Sadece müşteri kaydı | ✅ (rol seçimi kaldırıldı) |
| Ad, e-posta, şifre | ✅ |
| Backend'e her zaman `rol: 'MUSTERI'` gönderir | ✅ |
| Şifre min 6 karakter validasyonu | ✅ |
| Şifre göster/gizle | ✅ |

**Mimari Karar — Restoran / Kurye Kaydı:**
- Herkese açık kayıt formunda **rol seçimi yok** (güvenlik)
- Restoran ve kurye hesapları → admin panelinden oluşturulur, mail/şifre gönderilir
- Bu sayede yetkisiz panel erişimi önlenir

---

### `forgot-password.tsx` — Özellikler

| Adım | İçerik | Durum |
|------|--------|-------|
| 1 | E-posta gir → Kod Gönder | ✅ |
| 2 | 6 haneli OTP + yeni şifre + tekrar | ✅ |
| 3 | Başarı ekranı → Giriş Yap | ✅ |

- OTP kutucukları login ile aynı — auto-advance, backspace, yapıştır
- 60s geri sayım + "Kodu tekrar gönder"
- Şifre eşleşme kontrolü client-side

---

## API Katmanı — `src/api/auth.ts`

```ts
register(data)          → POST /auth/register       (rol: MUSTERI hardcoded)
login(data)             → POST /auth/login
sendOtp(telefon)        → POST /auth/otp/send
verifyOtp(telefon, kod) → POST /auth/otp/verify
googleAuth(accessToken) → POST /auth/google
forgotPassword(email)   → POST /auth/forgot-password
resetPassword(data)     → POST /auth/reset-password
```

---

## State Yönetimi

### `authStore` (Zustand + AsyncStorage)
```ts
token: string | null    // JWT token
user: { id, email, rol } // JWT'den decode edilir
setToken(token)         // kaydet + decode
logout()                // sil
loadToken()             // uygulama açılışında yükle
```

### `cartStore` (Zustand — sadece memory)
```ts
items: CartItem[]        // { menuItemId, ad, fiyat, adet }
restaurantId: string     // Farklı restoran seçilince sepet sıfırlanır
addItem(restaurantId, item)
removeItem(menuItemId)
updateAdet(menuItemId, adet)
clearCart()
total()                  // Toplam tutar hesapla
```

---

## Rol Bazlı Navigasyon

```
token yok       → /auth/login
token var
  └── rol: MUSTERI  → tabs: Yemek | Arama | Sepetler | Hesabım
  └── rol: RESTORAN → tabs: Siparişler | Hesabım
  └── rol: KURYE    → tabs: Teslimatlar | Hesabım
```

### Tab Bar Detayı — Müşteri (soldan sağa)

| # | Ekran | İkon | Dosya | Davranış |
|---|-------|------|-------|----------|
| 1 | Yemek | `restaurant` | `index.tsx` | Restoran listesi (ana sayfa) |
| 2 | Arama | `search` | `arama.tsx` | Arama ekranı (yapım aşamasında) |
| 3 | Sepetler | `cart` + rozet | `orders` → intercept | Sepet varsa turuncu rozet, tıklanınca `/cart` modal |
| 4 | Hesabım | `person` | `profile.tsx` | Profil |

- Tab bar arka planı: `#111111`, yükseklik: 68px
- Aktif ikon: dolu (solid), pasif: outline
- Sepet rozeti: turuncu, max `9+`

---

## Backend — Yapılacaklar

Bu uç noktalar backend'de henüz yok, frontend hazır bekliyor:

| Endpoint | Açıklama |
|----------|----------|
| `POST /auth/otp/send` | Telefon al, SMS gönder |
| `POST /auth/otp/verify` | Kodu doğrula, JWT dön |
| `POST /auth/google` | Google access token → JWT |
| `POST /auth/forgot-password` | E-posta → reset kodu gönder |
| `POST /auth/reset-password` | Kodu + yeni şifre → güncelle |

**SMS Servisi Önerisi:** Netgsm (Türkiye, ucuz, Türkçe destek)

---

## Bilinen Sorunlar & Çözümler

| Sorun | Çözüm |
|-------|-------|
| `Cannot find module 'react-native-worklets/plugin'` | `npx expo install react-native-worklets-core` + `babel.config.js` oluştur |
| Metro cache hatası | `npx expo start --clear` |
| E-posta input kasması | Input'a `flex: 1` ekle (flex row içinde genişlik thrashing oluyor) |

---

## Sıradaki Adımlar

### Frontend
- [ ] Ana sayfa (`index.tsx`) — restoran listeleme UI
- [ ] Arama ekranı (`arama.tsx`) — restoran/yemek arama
- [ ] Restoran detay (`restaurant/[id].tsx`) — menü UI
- [ ] Sepet ekranı (`cart.tsx`) — UI
- [ ] Sipariş takip (`order/[id].tsx`) — canlı durum
- [ ] Profil / Hesabım ekranı (`profile.tsx`)

### Backend
- [ ] OTP / SMS entegrasyonu (Netgsm)
- [ ] Google OAuth endpoint
- [ ] Şifre sıfırlama endpoint'leri

### Altyapı
- [ ] Google Cloud Console → OAuth 2.0 Client ID'leri oluştur
- [ ] `login.tsx` içindeki `YOUR_*_CLIENT_ID` sabitlerini doldur

---

## Geliştirme Komutları

```bash
# Uygulamayı başlat
npx expo start

# Cache temizleyerek başlat (sorun varsa)
npx expo start --clear

# Paket yükle (her zaman npx expo install kullan, npm install değil)
npx expo install <paket-adı>
```
