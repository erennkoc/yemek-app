import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/colors';

export default function AramaScreen() {
  return (
    <View style={s.container}>
      <Text style={s.text}>Arama ekranı yapım aşamasında</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  text:      { color: Colors.textMuted, fontSize: 15 },
});
