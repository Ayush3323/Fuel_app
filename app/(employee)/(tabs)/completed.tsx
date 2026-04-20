import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import {
  Card,
  CompanyFilterBar,
  EmptyState,
  FuelTypePill,
  Input,
  Screen,
  SectionTitle,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeCompleted() {
  const { transactions, currentUser, getCompany, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const uid = currentUser?.id;
  const linked = getCompaniesForPump(pumpId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let rows = transactions.filter(
      (t) =>
        t.pumpId === pumpId &&
        t.filledByUserId === uid &&
        (filter === 'all' || t.companyId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((t) => t.vehicleNo.toLowerCase().includes(qq));
    }
    return rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, pumpId, uid, filter, q]);

  return (
    <Screen>
      <Text style={styles.title}>Completed</Text>
      <Text style={styles.sub}>Your fills only</Text>
      <CompanyFilterBar companies={linked} selectedId={filter} onChange={setFilter} />
      <View style={styles.search}>
        <Input
          label="Search vehicle"
          value={q}
          onChangeText={setQ}
          placeholder="e.g. HR55"
        />
      </View>
      <SectionTitle title="History" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No completed fills yet" />
        }
        renderItem={({ item }) => {
          const co = getCompany(item.companyId);
          return (
            <Card style={styles.card}>
              <Text style={styles.coTag}>{co?.name ?? 'Company'}</Text>
              <Text style={styles.v}>{item.vehicleNo}</Text>
              <FuelTypePill fuel={item.fuel} />
              <Text style={styles.meta}>
                ₹{item.gross.toLocaleString('en-IN')} · {item.actualQty} L{item.extraCash ? ` · Cash: ₹${item.extraCash}` : ''}
              </Text>
            </Card>
          );
        }}
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
  sub: { color: FuelColors.textSecondary, paddingHorizontal: 20, marginBottom: 4 },
  search: { paddingHorizontal: 16, marginBottom: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  coTag: {
    fontSize: 11,
    fontWeight: '700',
    color: FuelColors.primary,
    marginBottom: 4,
  },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { marginTop: 6, color: FuelColors.textSecondary, fontSize: 13 },
});
