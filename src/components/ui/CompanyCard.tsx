import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';

type Props = {
  companyName: string;
  outstanding: string;
  pendingCount: number;
  lastBillLabel?: string;
  onPress: () => void;
};

export function CompanyCard({
  companyName,
  outstanding,
  pendingCount,
  lastBillLabel,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{companyName}</Text>
            <Text style={styles.sub}>
              Outstanding {outstanding} · {pendingCount} pending
            </Text>
            {lastBillLabel ? (
              <Text style={styles.bill}>{lastBillLabel}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={22} color={FuelColors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FuelColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '800', color: FuelColors.text },
  sub: { marginTop: 6, fontSize: 13, color: FuelColors.textSecondary },
  bill: { marginTop: 4, fontSize: 12, color: FuelColors.textMuted },
});
