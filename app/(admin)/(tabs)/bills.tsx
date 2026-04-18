import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Badge, Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

export default function BillsList() {
  const router = useRouter();
  const { bills, pumps, transactions, currentUser, getCompany } = useApp();
  const companyId = currentUser?.companyId;
  const company = companyId ? getCompany(companyId) : undefined;
  const [tab, setTab] = useState<'pending' | 'paid'>('pending');

  const list = useMemo(() => {
    const f = bills.filter(
      (b) =>
        b.companyId === companyId &&
        (tab === 'pending' ? b.status === 'raised' : b.status === 'paid')
    );
    return f.sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }, [bills, tab, companyId]);

  return (
    <Screen>
      <Text style={styles.title}>Bills</Text>
      <Text style={styles.sub}>{company?.name ?? '—'}</Text>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('pending')}
          style={[styles.tab, tab === 'pending' && styles.tabOn]}
        >
          <Text style={[styles.tabTxt, tab === 'pending' && styles.tabTxtOn]}>
            Pending payment
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('paid')}
          style={[styles.tab, tab === 'paid' && styles.tabOn]}
        >
          <Text style={[styles.tabTxt, tab === 'paid' && styles.tabTxtOn]}>
            Paid
          </Text>
        </Pressable>
      </View>

      <SectionTitle title={tab === 'pending' ? 'Awaiting verification' : 'Settled'} />
      <ScrollView contentContainerStyle={styles.list}>
        {list.map((b) => {
          const pump = pumps.find((p) => p.id === b.pumpId);
          const due = billTotalForItems(b, transactions).totalDue;
          return (
            <Pressable
              key={b.id}
              onPress={() => router.push(href(`/(admin)/bills/${b.id}`))}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billNo}>{b.billNo}</Text>
                    <Text style={styles.pump}>{pump?.name}</Text>
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
        {list.length === 0 ? (
          <Text style={styles.empty}>No bills in this tab</Text>
        ) : null}
      </ScrollView>
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
  sub: {
    color: FuelColors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: FuelColors.chipBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: FuelColors.surface },
  tabTxt: { fontWeight: '600', color: FuelColors.textSecondary },
  tabTxtOn: { color: FuelColors.text },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  billNo: { fontWeight: '800', color: FuelColors.text },
  pump: { color: FuelColors.textSecondary, marginTop: 4 },
  amt: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: FuelColors.primary,
  },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
