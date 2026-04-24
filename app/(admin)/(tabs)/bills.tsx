import { FuelColors } from '@/constants/theme';
import { Badge, Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';
import { href } from '@/src/utils/routerHref';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PAGE_SIZE = 10;

export default function BillsList() {
  const router = useRouter();
  const { pumpId } = useLocalSearchParams<{ pumpId?: string }>();
  const { bills, pumps, transactions, currentUser, getCompany, getPumpsForCompany } = useApp();
  const companyId = currentUser?.companyId;
  const company = companyId ? getCompany(companyId) : undefined;
  const [tab, setTab] = useState<'pending' | 'paid'>('pending');
  const [pumpFilter, setPumpFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const availablePumps = useMemo(() => {
    if (!companyId) return [];
    return getPumpsForCompany(companyId).sort((a, b) => a.name.localeCompare(b.name));
  }, [companyId, getPumpsForCompany]);
  useEffect(() => {
    if (!pumpId) return;
    const hasPump = availablePumps.some((p) => p.id === pumpId);
    if (hasPump) setPumpFilter(pumpId);
  }, [pumpId, availablePumps]);

  const list = useMemo(() => {
    const f = bills.filter(
      (b) =>
        b.companyId === companyId &&
        (tab === 'pending' ? b.status === 'raised' : b.status === 'paid') &&
        (pumpFilter === 'all' || b.pumpId === pumpFilter)
    );
    return f.sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }, [bills, tab, companyId, pumpFilter]);
  const visibleList = useMemo(() => list.slice(0, visibleCount), [list, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, pumpFilter]);

  return (
    <Screen>
      <Header title="Credit Bills" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.co}>{company?.name}</Text>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab('pending')}
            style={[styles.tab, tab === 'pending' && styles.tabOn]}
          >
            <Text style={[styles.tabTxt, tab === 'pending' && styles.tabTxtOn]}>
              Awaiting Payment
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('paid')}
            style={[styles.tab, tab === 'paid' && styles.tabOn]}
          >
            <Text style={[styles.tabTxt, tab === 'paid' && styles.tabTxtOn]}>
              Settled
            </Text>
          </Pressable>
        </View>

        <View style={styles.filterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Pressable
              onPress={() => setPumpFilter('all')}
              style={[styles.filterChip, pumpFilter === 'all' && styles.filterChipOn]}
            >
              <Text style={[styles.filterTxt, pumpFilter === 'all' && styles.filterTxtOn]}>All</Text>
            </Pressable>
            {availablePumps.map((pump) => (
              <Pressable
                key={pump.id}
                onPress={() => setPumpFilter(pump.id)}
                style={[styles.filterChip, pumpFilter === pump.id && styles.filterChipOn]}
              >
                <Text style={[styles.filterTxt, pumpFilter === pump.id && styles.filterTxtOn]}>
                  {pump.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.headingWrap}>
          <SectionTitle title={tab === 'pending' ? 'Unpaid Invoices' : 'Payment History'} />
        </View>

        <View style={styles.list}>
          {visibleList.map((b) => {
            const pump = pumps.find((p) => p.id === b.pumpId);
            const due = billTotalForItems(b, transactions).totalDue;
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push(href(`/(admin)/bills/${b.id}`))}
              >
                <Card style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billNo}>{b.billNo}</Text>
                      <Text style={styles.pumpName}>{pump?.name}</Text>
                      <Text style={styles.amt}>
                        ₹{due.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Badge status={b.status === 'paid' ? 'paid' : 'raised'} />
                  </View>
                </Card>
              </Pressable>
            );
          })}
          {list.length === 0 && (
            <Text style={styles.empty}>No {tab} bills found.</Text>
          )}
          {visibleCount < list.length ? (
            <Pressable style={styles.loadMoreBtn} onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}>
              <Text style={styles.loadMoreTxt}>Load More</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  co: { 
    color: FuelColors.primary, 
    marginBottom: 16, 
    fontWeight: '800', 
    fontSize: 15,
    textTransform: 'uppercase'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: FuelColors.chipBg,
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: FuelColors.surface, shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabTxt: { fontWeight: '700', color: FuelColors.textSecondary, fontSize: 13 },
  tabTxtOn: { color: FuelColors.primary },
  filterWrap: { marginBottom: 14 },
  filterRow: { paddingRight: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FuelColors.border,
    backgroundColor: FuelColors.surface,
  },
  filterChipOn: {
    backgroundColor: FuelColors.primaryMuted,
    borderColor: FuelColors.primary,
  },
  filterTxt: { fontSize: 12, fontWeight: '700', color: FuelColors.textSecondary },
  filterTxtOn: { color: FuelColors.primary },
  headingWrap: { marginBottom: 6 },
  list: { },
  card: { marginBottom: 12, padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  billNo: { fontWeight: '800', fontSize: 15, color: FuelColors.text },
  pumpName: { color: FuelColors.textSecondary, marginTop: 4, fontSize: 13, fontWeight: '500' },
  amt: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: FuelColors.primary,
  },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 32, fontSize: 14 },
  loadMoreBtn: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    backgroundColor: FuelColors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  loadMoreTxt: { color: FuelColors.primary, fontSize: 12, fontWeight: '700' },
});
