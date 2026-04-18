import { useMemo } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Card, EmptyState, FuelTypePill, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeCompleted() {
  const { transactions, currentUser } = useApp();
  const pumpId = currentUser?.pumpId;
  const uid = currentUser?.id;

  const list = useMemo(() => {
    return transactions
      .filter((t) => t.pumpId === pumpId && t.filledByUserId === uid)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [transactions, pumpId, uid]);

  return (
    <Screen>
      <Text style={styles.title}>Completed</Text>
      <Text style={styles.sub}>Your fills only</Text>
      <SectionTitle title="History" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No completed fills yet" />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.v}>{item.vehicleNo}</Text>
            <FuelTypePill fuel={item.fuel} />
            <Text style={styles.meta}>
              ₹{item.gross.toLocaleString('en-IN')} · {item.actualQty} L
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FuelColors.text,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sub: { color: FuelColors.textSecondary, paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { marginTop: 6, color: FuelColors.textSecondary, fontSize: 13 },
});
