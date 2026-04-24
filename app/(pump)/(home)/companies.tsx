import { FuelColors } from '@/constants/theme';
import { Card, CompanyCard, EmptyState, Header, Input, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';
import { href } from '@/src/utils/routerHref';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const PAGE_SIZE = 10;
type FilterKey = 'all' | 'has_pending' | 'no_pending' | 'high_outstanding';

type CompanyDirectoryItem = {
  id: string;
  name: string;
  pending: number;
  outstanding: number;
  lastBillLabel?: string;
};

function CompanyRow({ item }: { item: CompanyDirectoryItem }) {
  const router = useRouter();
  return (
    <CompanyCard
      companyName={item.name}
      outstanding={`₹ ${item.outstanding.toLocaleString('en-IN')}`}
      pendingCount={item.pending}
      lastBillLabel={item.lastBillLabel}
      onPress={() => router.push(href(`/(pump)/${item.id}/billing`))}
    />
  );
}

export default function PumpCompaniesHome() {
  const router = useRouter();
  const { currentUser, pumps, getCompaniesForPump, requests, bills, transactions } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const companies = getCompaniesForPump(pumpId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const directoryRows = useMemo<CompanyDirectoryItem[]>(() => {
    return companies
      .map((company) => {
        const pending = requests.filter(
          (r) =>
            r.companyId === company.id &&
            r.pumpId === pumpId &&
            r.status === 'pending'
        ).length;
        let outstanding = 0;
        for (const b of bills) {
          if (b.pumpId !== pumpId || b.companyId !== company.id || b.status === 'paid') continue;
          outstanding += billTotalForItems(b, transactions).totalDue;
        }
        const unbilled = transactions.filter(
          (t) => t.pumpId === pumpId && t.companyId === company.id && !t.billId
        );
        for (const t of unbilled) outstanding += t.gross + t.extraCash + t.advance;
        outstanding = Math.round(outstanding * 100) / 100;

        const pairBills = bills
          .filter((b) => b.companyId === company.id && b.pumpId === pumpId)
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        const last = pairBills[0];
        const lastBillLabel = last ? `Last bill: ${last.billNo} (${last.status})` : undefined;
        return { id: company.id, name: company.name, pending, outstanding, lastBillLabel };
      })
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [companies, requests, bills, transactions, pumpId]);

  const filteredRows = useMemo(() => {
    const highestOutstanding = directoryRows.reduce(
      (max, row) => Math.max(max, row.outstanding),
      0
    );
    const dynamicHighOutstandingThreshold =
      highestOutstanding > 0 ? highestOutstanding * 0.7 : 0;
    const q = query.trim().toLowerCase();
    return directoryRows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'has_pending':
          return row.pending > 0;
        case 'no_pending':
          return row.pending === 0;
        case 'high_outstanding':
          return (
            row.outstanding > 0 &&
            row.outstanding >= dynamicHighOutstandingThreshold
          );
        default:
          return true;
      }
    });
  }, [directoryRows, query, filter]);
  const visibleRows = useMemo(() => filteredRows.slice(0, visibleCount), [filteredRows, visibleCount]);

  const summary = useMemo(() => {
    return {
      linkedCompanies: directoryRows.length,
      pendingTotal: directoryRows.reduce((sum, row) => sum + row.pending, 0),
      outstandingTotal: directoryRows.reduce((sum, row) => sum + row.outstanding, 0),
    };
  }, [directoryRows]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, filter, directoryRows.length]);

  return (
    <Screen>
      <Header
        title="Companies"
        subtitle={pump?.name ?? ''}
        showBack={false}
        right={
          <Pressable
            onPress={() => router.push(href('/(pump)/(home)/join'))}
            style={styles.joinBtn}
          >
            <Text style={styles.joinTxt}>Link Company</Text>
          </Pressable>
        }
      />

      <View style={styles.section}>
        <SectionTitle title="Portfolio Snapshot" />
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Connected</Text>
            <Text style={styles.summaryValue}>{summary.linkedCompanies}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{summary.pendingTotal}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={styles.summaryValue}>₹{summary.outstandingTotal.toLocaleString('en-IN')}</Text>
          </Card>
        </View>
      </View>

      <View style={styles.searchSection}>
        <Input
          label="Search company"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Acme Logistics"
        />
      </View>

      <View style={styles.chipsRow}>
        {[
          { key: 'all' as FilterKey, label: 'All' },
          { key: 'has_pending' as FilterKey, label: 'Has Pending' },
          { key: 'no_pending' as FilterKey, label: 'No Pending' },
          { key: 'high_outstanding' as FilterKey, label: 'High Outstanding' },
        ].map((chip) => (
          <Pressable
            key={chip.key}
            style={[styles.chip, filter === chip.key && styles.chipOn]}
            onPress={() => setFilter(chip.key)}
          >
            <Text style={[styles.chipTxt, filter === chip.key && styles.chipTxtOn]}>{chip.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Connected Companies" style={styles.section} />

      {directoryRows.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No companies yet"
            subtitle="Tap Link Company and enter an invite code from a transport company to start billing."
          />
        </View>
      ) : (
        <FlatList
          data={visibleRows}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CompanyRow item={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No companies match this filter"
              subtitle="Try changing search text or selecting a different status."
            />
          }
          ListFooterComponent={
            visibleCount < filteredRows.length ? (
              <Pressable style={styles.loadMoreBtn} onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                <Text style={styles.loadMoreTxt}>Load More</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginTop: 8 },
  joinBtn: {
    backgroundColor: FuelColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  summaryCard: { flex: 1, padding: 10 },
  summaryLabel: { color: FuelColors.textSecondary, fontSize: 11, fontWeight: '700' },
  summaryValue: { color: FuelColors.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
  searchSection: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 2 },
  chip: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: FuelColors.surface,
  },
  chipOn: {
    borderColor: FuelColors.primary,
    backgroundColor: FuelColors.primaryMuted,
  },
  chipTxt: { color: FuelColors.textSecondary, fontSize: 12, fontWeight: '700' },
  chipTxtOn: { color: FuelColors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  loadMoreBtn: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 10,
    backgroundColor: FuelColors.surface,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  loadMoreTxt: { color: FuelColors.primary, fontWeight: '700', fontSize: 12 },
});
