import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = {
  label: string;
  amount: string | number;
  bold?: boolean;
  muted?: boolean;
};

export function AmountRow({ label, amount, bold, muted }: Props) {
  const a =
    typeof amount === 'number'
      ? `₹ ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
      : amount;
  return (
    <View style={styles.row}>
      <Text style={[styles.label, muted && styles.muted]}>{label}</Text>
      <Text style={[styles.amt, bold && styles.bold, muted && styles.muted]}>
        {a}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: { fontSize: 14, color: FuelColors.text },
  amt: { fontSize: 14, color: FuelColors.text },
  bold: { fontWeight: '800', fontSize: 16 },
  muted: { color: FuelColors.textSecondary },
});
