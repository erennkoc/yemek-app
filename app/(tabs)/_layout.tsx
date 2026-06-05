import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { Colors } from '../../src/constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  activeName,
  color,
  focused,
  badge,
}: {
  name: IoniconName;
  activeName: IoniconName;
  color: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View>
      <Ionicons name={focused ? activeName : name} size={24} color={color} />
      {badge != null && badge > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((st) => st.items.reduce((sum, i) => sum + i.adet, 0));

  if (!user) return null;

  const isMusteri  = user.rol === 'MUSTERI';
  const isRestoran = user.rol === 'RESTORAN';
  const isKurye    = user.rol === 'KURYE';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: s.tabLabel,
      }}
    >
      {/* 1 — Yemek (ana sayfa) */}
      <Tabs.Screen
        name="index"
        options={{
          href: isMusteri ? undefined : null,
          title: 'Yemek',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="restaurant-outline" activeName="restaurant" color={color} focused={focused} />
          ),
        }}
      />

      {/* 2 — Arama */}
      <Tabs.Screen
        name="arama"
        options={{
          href: isMusteri ? undefined : null,
          title: 'Arama',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search-outline" activeName="search" color={color} focused={focused} />
          ),
        }}
      />

      {/* 3 — Sepetler (cart modalı açar) */}
      <Tabs.Screen
        name="orders"
        options={{
          href: isMusteri ? undefined : null,
          title: 'Sepetler',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="cart-outline"
              activeName="cart"
              color={color}
              focused={focused}
              badge={cartCount}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/cart');
          },
        }}
      />

      {/* 4 — Hesabım (tüm roller) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" activeName="person" color={color} focused={focused} />
          ),
        }}
      />

      {/* Restoran — Siparişler */}
      <Tabs.Screen
        name="restaurant-panel"
        options={{
          href: isRestoran ? undefined : null,
          title: 'Siparişler',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="receipt-outline" activeName="receipt" color={color} focused={focused} />
          ),
        }}
      />

      {/* Kurye — Teslimatlar */}
      <Tabs.Screen
        name="courier"
        options={{
          href: isKurye ? undefined : null,
          title: 'Teslimatlar',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bicycle-outline" activeName="bicycle" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
