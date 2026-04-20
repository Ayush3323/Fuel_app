import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Header, Screen, SectionTitle } from '@/src/components/ui';
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
    <Screen style={styles.screen}>
      <Header 
        title="Billing" 
        subtitle={`${company?.name ?? ''} · ${pump?.name ?? ''}`}
        right={
          <Button
            title="Raise"
            onPress={() => {
              const ids = Array.from(selected).join(',');
              router.push(href(`/(pump)/${companyId}/billing/new?itemIds=${ids}`));
            }}
            style={styles.headerBtn}
          />
        }
      />

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
          <SectionTitle title="Select fills to bill" style={styles.section} />
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
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
                    <Ionicons 
                      name={selected.has(t.id) ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={selected.has(t.id) ? FuelColors.primary : FuelColors.textMuted} 
                    />
                  </View>
                </Card>
              </Pressable>
            ))}
            {billedFills.length > 0 ? (
              <>
                <SectionTitle title="Already on a bill" style={styles.section} />
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
                No completed fills for this company yet.
              </Text>
            ) : selectableFills.length === 0 ? (
              <Text style={styles.empty}>
                Every fill here is already on a bill.
              </Text>
            ) : null}
          </ScrollView>
          {selected.size > 0 && (
            <View style={styles.bottomBar}>
              <Button
                title={`Continue with ${selected.size} items`}
                onPress={submitDraftSelection}
                style={styles.continueBtn}
              />
            </View>
          )}
        </>
      ) : (
        <>
          <SectionTitle title="Bills" style={styles.section} />
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
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
  screen: { backgroundColor: FuelColors.background },
  headerBtn: { height: 36, paddingHorizontal: 20, borderRadius: 10 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: FuelColors.primary, shadowColor: FuelColors.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  tabTxt: { fontSize: 13, fontWeight: '700', color: FuelColors.textSecondary },
  tabTxtOn: { color: '#fff' },
  section: { paddingHorizontal: 20, marginTop: 16 },
  list: { padding: 20, paddingBottom: 100 },
  card: { marginBottom: 12, borderRadius: 20, borderWidth: 1, borderColor: FuelColors.border },
  cardOn: { borderColor: FuelColors.primary, borderWidth: 2 },
  cardMuted: { opacity: 0.6, backgroundColor: FuelColors.background, borderStyle: 'dashed' },
  onBill: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: FuelColors.textMuted,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  billNo: { fontSize: 15, fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 4, color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
  amt: { marginTop: 6, fontSize: 18, fontWeight: '900', color: FuelColors.primary },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 40, fontStyle: 'italic' },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderTopWidth: 1, 
    borderTopColor: FuelColors.border 
  },
  continueBtn: { height: 56, borderRadius: 16, shadowColor: FuelColors.primary, shadowOpacity: 0.2 },
});
