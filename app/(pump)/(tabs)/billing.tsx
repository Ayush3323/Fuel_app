import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

export default function PumpBilling() {
  const router = useRouter();
  const { bills, transactions, currentUser, pumps } = useApp();
  const pumpId = currentUser?.pumpId;
  const pump = pumps.find((p) => p.id === pumpId);
  const [tab, setTab] = useState<'draft' | 'raised' | 'paid'>('draft');

  const list = useMemo(() => {
    return bills
      .filter((b) => b.pumpId === pumpId && b.status === tab)
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
  }, [bills, pumpId, tab]);

  return (
    <Screen>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Billing</Text>
          <Text style={styles.sub}>{pump?.name}</Text>
        </View>
        <Button
          title="Raise"
          onPress={() => router.push(href('/(pump)/billing/new'))}
        />
      </View>

      <View style={styles.tabs}>
        {(['draft', 'raised', 'paid'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabOn]}
          >
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtOn]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Bills" />
      <ScrollView contentContainerStyle={styles.list}>
        {list.map((b) => {
          const due = billTotalForItems(b, transactions).totalDue;
          return (
            <Pressable
              key={b.id}
              onPress={() => router.push(href(`/(pump)/billing/${b.id}`))}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billNo}>{b.billNo}</Text>
                    <Text style={styles.amt}>₹ {due.toLocaleString('en-IN')}</Text>
                  </View>
                  <Badge status={b.status} />
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
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: FuelColors.text },
  sub: { color: FuelColors.textSecondary, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: FuelColors.chipBg,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: FuelColors.surface },
  tabTxt: { fontSize: 12, fontWeight: '600', color: FuelColors.textSecondary },
  tabTxtOn: { color: FuelColors.text },
  list: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  billNo: { fontWeight: '800', color: FuelColors.text },
  amt: { marginTop: 6, fontSize: 16, fontWeight: '700', color: FuelColors.primary },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
