import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  sub?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatTile({ label, value, sub, style }: Props) {
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: FuelColors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  label: { fontSize: 12, color: FuelColors.textSecondary, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '800', color: FuelColors.text },
  sub: { fontSize: 11, color: FuelColors.textMuted, marginTop: 2 },
});
