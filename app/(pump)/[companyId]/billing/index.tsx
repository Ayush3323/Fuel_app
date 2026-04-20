import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

export default function PumpCompanyBillingIndex() {
  const router = useRouter();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const { bills, transactions, currentUser, pumps, getCompany } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const company = companyId ? getCompany(companyId) : undefined;
  const [tab, setTab] = useState<'draft' | 'raised' | 'paid'>('draft');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const billList = useMemo(() => {
    return bills
      .filter(
        (b) =>
          b.pumpId === pumpId &&
          b.companyId === companyId &&
          b.status === tab
      )
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
  }, [bills, pumpId, companyId, tab]);

  const draftItems = useMemo(
    () =>
      transactions
        .filter(
          (t) => t.pumpId === pumpId && t.companyId === companyId && !t.billId
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [transactions, pumpId, companyId]
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitDraftSelection = () => {
    if (!companyId || selected.size === 0) return;
    const ids = encodeURIComponent([...selected].join(','));
    router.push(href(`/(pump)/${companyId}/billing/new?itemIds=${ids}`));
  };

  return (
    <Screen>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Billing</Text>
          <Text style={styles.sub}>
            {company?.name ?? ''} · {pump?.name}
          </Text>
        </View>
        <Button
          title="Raise"
          onPress={() =>
            router.push(href(`/(pump)/${companyId}/billing/new`))
          }
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
      {tab === 'draft' ? (
        <>
          <SectionTitle title="Select completed transactions" />
          <ScrollView contentContainerStyle={styles.list}>
            {draftItems.map((t) => (
              <Pressable key={t.id} onPress={() => toggle(t.id)}>
                <Card style={[styles.card, selected.has(t.id) && styles.cardOn]}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billNo}>{t.vehicleNo}</Text>
                      <Text style={styles.meta}>
                        {t.fuel} · {t.actualQty.toFixed(2)} L · ₹
                        {t.gross.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={styles.check}>{selected.has(t.id) ? '☑' : '☐'}</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
            {draftItems.length === 0 ? (
              <Text style={styles.empty}>No completed transactions available</Text>
            ) : (
              <Button
                title={`Submit (${selected.size})`}
                onPress={submitDraftSelection}
                disabled={selected.size === 0}
              />
            )}
          </ScrollView>
        </>
      ) : (
        <>
          <SectionTitle title="Bills" />
          <ScrollView contentContainerStyle={styles.list}>
            {billList.map((b) => {
              const due = billTotalForItems(b, transactions).totalDue;
              return (
                <Pressable
                  key={b.id}
                  onPress={() =>
                    router.push(href(`/(pump)/${companyId}/billing/${b.id}`))
                  }
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
            {billList.length === 0 ? (
              <Text style={styles.empty}>No bills in this tab</Text>
            ) : null}
          </ScrollView>
        </>
      )}
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
  cardOn: { borderWidth: 2, borderColor: FuelColors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  billNo: { fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 6, color: FuelColors.textSecondary, fontSize: 13 },
  amt: { marginTop: 6, fontSize: 16, fontWeight: '700', color: FuelColors.primary },
  check: { fontSize: 22, color: FuelColors.primary, marginLeft: 8 },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
