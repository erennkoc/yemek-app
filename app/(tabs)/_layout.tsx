import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { Colors } from '../../src/constants/colors';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.adet, 0));

  if (!user) return null;

  const isMusteri = user.rol === 'MUSTERI';
  const isRestoran = user.rol === 'RESTORAN';
  const isKurye = user.rol === 'KURYE';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {isMusteri && (
        <Tabs.Screen name="index" options={{ title: 'Keşfet', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
      )}
      {isMusteri && (
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Sepet',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>🛒{cartCount > 0 ? ` ${cartCount}` : ''}</Text>
            ),
          }}
          listeners={{ tabPress: (e) => { e.preventDefault(); router.push('/cart'); } }}
        />
      )}
      {isMusteri && (
        <Tabs.Screen name="orders" options={{ title: 'Siparişler', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }} />
      )}
      {isRestoran && (
        <Tabs.Screen name="restaurant-panel" options={{ title: 'Siparişler', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍽️</Text> }} />
      )}
      {isKurye && (
        <Tabs.Screen name="courier" options={{ title: 'Teslimatlar', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛵</Text> }} />
      )}
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
