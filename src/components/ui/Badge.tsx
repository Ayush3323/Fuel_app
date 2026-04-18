import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Status = 'pending' | 'filled' | 'cancelled' | 'expired' | 'draft' | 'raised' | 'paid';

const labels: Record<Status, string> = {
  pending: 'Pending',
  filled: 'Filled',
  cancelled: 'Cancelled',
  expired: 'Expired',
  draft: 'Draft',
  raised: 'Raised',
  paid: 'Paid',
};

const colors: Record<Status, { bg: string; fg: string }> = {
  pending: { bg: '#FEF3C7', fg: '#B45309' },
  filled: { bg: '#D1FAE5', fg: FuelColors.success },
  cancelled: { bg: '#FEE2E2', fg: FuelColors.danger },
  expired: { bg: FuelColors.chipBg, fg: FuelColors.textSecondary },
  draft: { bg: '#E0E7FF', fg: '#4338CA' },
  raised: { bg: '#DBEAFE', fg: FuelColors.primary },
  paid: { bg: '#D1FAE5', fg: FuelColors.success },
};

export function Badge({ status }: { status: Status }) {
  const c = colors[status];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Text style={[styles.txt, { color: c.fg }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  txt: { fontSize: 12, fontWeight: '700' },
});
