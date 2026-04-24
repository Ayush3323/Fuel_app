import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import {
  Badge,
  Card,
  CompanyFilterBar,
  EmptyState,
  FuelTypePill,
  Header,
  Input,
  Screen,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

type RequestsTab = 'pending' | 'completed';

export default function AdminRequestsScreen() {
  const { requests, transactions, currentUser, pumps, getCompany, getPumpsForCompany } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const company = getCompany(companyId);
  const linked = getPumpsForCompany(companyId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<RequestsTab>('pending');

  const pendingRows = useMemo(() => {
    let rows = requests.filter(
      (r) =>
        r.companyId === companyId &&
        r.status === 'pending' &&
        (filter === 'all' || r.pumpId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((r) => r.vehicleNo.toLowerCase().includes(qq));
    }
    return rows;
  }, [requests, companyId, filter, q]);

  const completedRows = useMemo(() => {
    let rows = transactions.filter(
      (t) => t.companyId === companyId && (filter === 'all' || t.pumpId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((t) => t.vehicleNo.toLowerCase().includes(qq));
    }
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, companyId, filter, q]);

  const isPending = tab === 'pending';

  return (
    <Screen>
      <Header title="Requests" showBack={false} />
      <View style={styles.topPad} />
      <Text style={styles.sub}>{company?.name}</Text>

      <View style={styles.filterSection}>
        <CompanyFilterBar companies={linked} selectedId={filter} onChange={setFilter} />
      </View>

      <View style={styles.searchSection}>
        <Input label="Search vehicle" value={q} onChangeText={setQ} placeholder="e.g. HR55" />
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('pending')} style={[styles.tab, isPending && styles.tabOn]}>
          <Text style={[styles.tabTxt, isPending && styles.tabTxtOn]}>Pending</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('completed')}
          style={[styles.tab, !isPending && styles.tabOn]}
        >
          <Text style={[styles.tabTxt, !isPending && styles.tabTxtOn]}>Completed</Text>
        </Pressable>
      </View>

      {isPending ? (
        <FlatList
          data={pendingRows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="No pending requests" />}
          renderItem={({ item }) => {
            const pump =
              linked.find((p) => p.id === item.pumpId) ?? pumps.find((p) => p.id === item.pumpId);
            return (
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.v}>{item.vehicleNo}</Text>
                    <View style={styles.primaryMeta}>
                      <Text style={styles.coTag}>{pump?.name ?? 'Pump'}</Text>
                      <FuelTypePill fuel={item.fuel} />
                    </View>
                    <Text style={styles.meta}>
                      {item.isTankFull ? 'Full Tank' : `${item.qty} L`}
                      {item.extraCash ? ` · ₹${item.extraCash}` : ''}
                    </Text>
                  </View>
                  <Badge status="pending" />
                </View>
              </Card>
            );
          }}
        />
      ) : (
        <FlatList
          data={completedRows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="No completed records" />}
          renderItem={({ item }) => {
            const pump =
              linked.find((p) => p.id === item.pumpId) ?? pumps.find((p) => p.id === item.pumpId);
            return (
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.v}>{item.vehicleNo}</Text>
                    <View style={styles.primaryMeta}>
                      <Text style={styles.coTag}>{pump?.name ?? 'Pump'}</Text>
                      <FuelTypePill fuel={item.fuel} />
                    </View>
                    <Text style={styles.meta}>
                      {item.actualQty} L
                      {item.extraCash ? ` · ₹${item.extraCash}` : ''}
                      {` · ₹${item.gross.toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                  <Badge status="paid" />
                </View>
              </Card>
            );
          }}
        />
      )}
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
  tabs: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    backgroundColor: FuelColors.chipBg,
    borderRadius: 12,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: FuelColors.surface },
  tabTxt: { fontWeight: '700', color: FuelColors.textSecondary, fontSize: 13 },
  tabTxtOn: { color: FuelColors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { marginBottom: 10, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  coTag: { fontSize: 12, fontWeight: '700', color: FuelColors.textSecondary },
  v: { fontSize: 16, fontWeight: '800', color: FuelColors.text, marginBottom: 6 },
  primaryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  meta: { color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
});
