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
  Header,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function AdminCompletedRequests() {
  const { transactions, currentUser, getPumpsForCompany, getCompany } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const linked = getPumpsForCompany(companyId);
  const company = getCompany(companyId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let rows = transactions.filter(
      (t) =>
        t.companyId === companyId &&
        (filter === 'all' || t.pumpId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((t) => t.vehicleNo.toLowerCase().includes(qq));
    }
    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, companyId, filter, q]);

  return (
    <Screen>
      <Header title="Completed Fills" showBack={false} />
      <View style={styles.topPad} />
      <Text style={styles.sub}>{company?.name}</Text>

      <View style={styles.filterSection}>
        <CompanyFilterBar companies={linked} selectedId={filter} onChange={setFilter} />
      </View>

      <View style={styles.searchSection}>
        <Input
          label="Search vehicle"
          value={q}
          onChangeText={setQ}
          placeholder="e.g. HR55"
        />
      </View>

      <View style={styles.headingWrap}>
        <SectionTitle title="Historical Records" />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState title="No history found" />}
        renderItem={({ item }) => {
          const pump = linked.find((p) => p.id === item.pumpId);
          return (
            <Card style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.coTag}>{pump?.name ?? 'Pump'}</Text>
                <View style={styles.row}>
                  <Text style={styles.v}>{item.vehicleNo}</Text>
                  <FuelTypePill fuel={item.fuel} />
                </View>
                <Text style={styles.meta}>
                  ₹{item.gross.toLocaleString('en-IN')}
                  {item.extraCash ? ` + ₹${item.extraCash} cash` : ''} · {item.actualQty} L
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topPad: { height: 12 },
  sub: {
    color: FuelColors.primary,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  filterSection: { marginBottom: 6 },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  headingWrap: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { marginBottom: 10, padding: 14 },
  coTag: {
    fontSize: 11,
    fontWeight: '700',
    color: FuelColors.textSecondary,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
});
