import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  rol: 'MUSTERI' | 'RESTORAN' | 'KURYE';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
    const user = jwtDecode<{ sub: string; email: string; rol: User['rol'] }>(token);
    set({ token, user: { id: user.sub, email: user.email, rol: user.rol } });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null });
  },

  loadToken: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const user = jwtDecode<{ sub: string; email: string; rol: User['rol'] }>(token);
        set({ token, user: { id: user.sub, email: user.email, rol: user.rol } });
      } catch {
        await AsyncStorage.removeItem('token');
      }
    }
  },
}));
