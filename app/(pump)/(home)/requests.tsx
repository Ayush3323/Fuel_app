import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
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
const PAGE_SIZE = 12;

export default function PumpRequestsScreen() {
  const router = useRouter();
  const { requests, transactions, currentUser, pumps, getCompany, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const linked = getCompaniesForPump(pumpId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<RequestsTab>('pending');
  const [pendingVisible, setPendingVisible] = useState(PAGE_SIZE);
  const [completedVisible, setCompletedVisible] = useState(PAGE_SIZE);

  const pendingRows = useMemo(() => {
    let rows = requests.filter(
      (r) =>
        r.pumpId === pumpId &&
        r.status === 'pending' &&
        (filter === 'all' || r.companyId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((r) => r.vehicleNo.toLowerCase().includes(qq));
    }
    return rows;
  }, [requests, pumpId, filter, q]);

  const completedRows = useMemo(() => {
    let rows = transactions.filter(
      (t) =>
        t.pumpId === pumpId &&
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
  }, [transactions, pumpId, filter, q]);

  const isPending = tab === 'pending';
  const pendingData = useMemo(
    () => pendingRows.slice(0, pendingVisible),
    [pendingRows, pendingVisible]
  );
  const completedData = useMemo(
    () => completedRows.slice(0, completedVisible),
    [completedRows, completedVisible]
  );

  useEffect(() => {
    setPendingVisible(PAGE_SIZE);
    setCompletedVisible(PAGE_SIZE);
  }, [filter, q, tab]);

  return (
    <Screen>
      <Header title="Requests" subtitle={pump?.name ?? ''} showBack={false} />
      <View style={styles.topPad} />

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
        <Pressable onPress={() => setTab('completed')} style={[styles.tab, !isPending && styles.tabOn]}>
          <Text style={[styles.tabTxt, !isPending && styles.tabTxtOn]}>Completed</Text>
        </Pressable>
      </View>

      {isPending ? (
        <FlatList
          data={pendingData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (pendingVisible < pendingRows.length) {
              setPendingVisible((v) => v + PAGE_SIZE);
            }
          }}
          ListEmptyComponent={<EmptyState title="No pending requests" />}
          ListFooterComponent={
            pendingVisible < pendingRows.length ? (
              <Text style={styles.loadMore}>Loading more...</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const company = getCompany(item.companyId);
            return (
              <Pressable
                onPress={() => {
                  router.push(
                    href(
                      `/(pump)/fill/${item.id}?companyId=${encodeURIComponent(item.companyId)}&returnTo=pump-pending`
                    )
                  );
                }}
              >
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coTag}>{company?.name ?? 'Company'}</Text>
                      <Text style={styles.v}>{item.vehicleNo}</Text>
                      <View style={styles.primaryMeta}>
                        <FuelTypePill fuel={item.fuel} />
                        <Text style={styles.meta}>
                          {item.isTankFull ? 'Full Tank' : `${item.qty} L`}
                          {item.extraCash ? ` · ₹${item.extraCash}` : ''}
                        </Text>
                      </View>
                    </View>
                    <Badge status="pending" />
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={completedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (completedVisible < completedRows.length) {
              setCompletedVisible((v) => v + PAGE_SIZE);
            }
          }}
          ListEmptyComponent={<EmptyState title="No completed records" />}
          ListFooterComponent={
            completedVisible < completedRows.length ? (
              <Text style={styles.loadMore}>Loading more...</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const company = getCompany(item.companyId);
            return (
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coTag}>{company?.name ?? 'Company'}</Text>
                    <View style={styles.primaryMeta}>
                      <Text style={styles.v}>{item.vehicleNo}</Text>
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
  coTag: {
    fontSize: 11,
    fontWeight: '700',
    color: FuelColors.textSecondary,
    marginBottom: 4,
  },
  v: { fontSize: 16, fontWeight: '800', color: FuelColors.text },
  primaryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  meta: { color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
  loadMore: {
    textAlign: 'center',
    color: FuelColors.textMuted,
    fontSize: 12,
    paddingVertical: 8,
    fontWeight: '600',
  },
});
