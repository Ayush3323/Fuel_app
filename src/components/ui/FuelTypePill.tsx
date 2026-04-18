import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import type { FuelType } from '@/src/types';

const map: Record<FuelType, { label: string; bg: string; fg: string }> = {
  HSD: { label: 'Diesel (HSD)', bg: '#CCFBF1', fg: FuelColors.hsd },
  MS: { label: 'Petrol (MS)', bg: '#EDE9FE', fg: FuelColors.ms },
};

export function FuelTypePill({ fuel }: { fuel: FuelType }) {
  const m = map[fuel];
  return (
    <View style={[styles.wrap, { backgroundColor: m.bg }]}>
      <Text style={[styles.txt, { color: m.fg }]}>{m.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  txt: { fontSize: 11, fontWeight: '700' },
});
