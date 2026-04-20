import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

type BillingTab = 'unbilled' | 'raised' | 'paid';

function routeParamString(v: string | string[] | undefined): string {
  if (v == null) return '';
  return Array.isArray(v) ? String(v[0] ?? '') : String(v);
}

export default function PumpCompanyBillingIndex() {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{
    tab?: string | string[];
  }>();
  const { companyId: companyIdRaw } = useGlobalSearchParams<{
    companyId: string | string[];
  }>();
  const companyId = routeParamString(companyIdRaw);
  const { bills, transactions, currentUser, pumps, getCompany } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const company = companyId ? getCompany(companyId) : undefined;
  const [tab, setTab] = useState<BillingTab>('unbilled');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = routeParamString(tabParam);
    if (t === 'raised' || t === 'paid') setTab(t);
    else if (t === 'unbilled' || t === 'draft') setTab('unbilled');
  }, [tabParam]);

  const billList = useMemo(() => {
    if (tab === 'unbilled') return [];
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

  /** All fills for this pump+company (same pool as Completed tab); only !billId rows are selectable. */
  const companyFills = useMemo(
    () =>
      transactions
        .filter((t) => t.pumpId === pumpId && t.companyId === companyId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [transactions, pumpId, companyId]
  );

  const selectableFills = useMemo(
    () => companyFills.filter((t) => !t.billId),
    [companyFills]
  );

  const billedFills = useMemo(
    () => companyFills.filter((t) => !!t.billId),
    [companyFills]
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
    const validIds = [...selected].filter((id) =>
      selectableFills.some((t) => t.id === id)
    );
    if (!companyId || validIds.length === 0) return;
    const ids = encodeURIComponent(validIds.join(','));
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
        {(
          [
            { key: 'unbilled' as const, label: 'Unbilled' },
            { key: 'raised' as const, label: 'Raised' },
            { key: 'paid' as const, label: 'Paid' },
          ] as const
        ).map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabOn]}
          >
            <Text style={[styles.tabTxt, tab === key && styles.tabTxtOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'unbilled' ? (
        <>
          <SectionTitle title="Select fills to bill" />
          <ScrollView contentContainerStyle={styles.list}>
            {selectableFills.map((t) => (
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
            {billedFills.length > 0 ? (
              <>
                <SectionTitle title="Already on a bill" />
                {billedFills.map((t) => {
                  const b = bills.find((x) => x.id === t.billId);
                  return (
                    <Card key={t.id} style={[styles.card, styles.cardMuted]}>
                      <Text style={styles.billNo}>{t.vehicleNo}</Text>
                      <Text style={styles.meta}>
                        {t.fuel} · ₹{t.gross.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.onBill}>
                        {b ? `On ${b.billNo} (${b.status})` : 'On a bill'}
                      </Text>
                    </Card>
                  );
                })}
              </>
            ) : null}
            {companyFills.length === 0 ? (
              <Text style={styles.empty}>
                No completed fills for this company yet. Complete a request first.
              </Text>
            ) : selectableFills.length === 0 ? (
              <Text style={styles.empty}>
                Every fill here is already on a bill. Open a raised bill to change line
                items, or add new fills from Completed.
              </Text>
            ) : (
              <Button
                title={`Continue (${selected.size})`}
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
  cardMuted: { opacity: 0.72, backgroundColor: FuelColors.chipBg },
  onBill: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: FuelColors.textMuted,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  billNo: { fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 6, color: FuelColors.textSecondary, fontSize: 13 },
  amt: { marginTop: 6, fontSize: 16, fontWeight: '700', color: FuelColors.primary },
  check: { fontSize: 22, color: FuelColors.primary, marginLeft: 8 },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
