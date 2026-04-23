import { useMemo, useState } from 'react';
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import {
  BillView,
  Button,
  Card,
  Header,
  Input,
  Screen,
  SectionTitle,
  Select,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelDiscount } from '@/src/types';
import { billTotalForItems } from '@/src/utils/billMath';

function parseItemIdsParam(raw?: string) {
  if (!raw) return [];
  try {
    return decodeURIComponent(raw)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  } catch {
    return raw
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
}

function routeParamString(v: string | string[] | undefined): string {
  if (v == null) return '';
  return Array.isArray(v) ? String(v[0] ?? '') : String(v);
}

export default function NewBillScreen() {
  const router = useRouter();
  const { itemIds: itemIdsRaw } = useLocalSearchParams<{
    itemIds?: string | string[];
  }>();
  const { companyId: companyIdRaw } = useGlobalSearchParams<{
    companyId: string | string[];
  }>();
  const companyId = routeParamString(companyIdRaw);
  const itemIdsParam = routeParamString(itemIdsRaw);

  const {
    currentUser,
    getCompany,
    createBill,
    transactions,
    pumps,
  } = useApp();
  const pumpId = currentUser?.pumpId!;
  const pump = pumps.find((p) => p.id === pumpId);
  const company = companyId ? getCompany(companyId) : undefined;

  const [selected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const id of parseItemIdsParam(itemIdsParam)) {
      s.add(id);
    }
    return s;
  });
  const [from, setFrom] = useState(
    new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [prevBal, setPrevBal] = useState('0');
  const [hsdMode, setHsdMode] = useState<'per_liter' | 'flat'>('per_liter');
  const [hsdVal, setHsdVal] = useState('0.5');
  const [msMode, setMsMode] = useState<'per_liter' | 'flat'>('flat');
  const [msVal, setMsVal] = useState('100');


  const discountHSD = useMemo<FuelDiscount>(
    () => ({
      mode: hsdMode,
      value: parseFloat(hsdVal) || 0,
    }),
    [hsdMode, hsdVal]
  );
  const discountMS = useMemo<FuelDiscount>(
    () => ({
      mode: msMode,
      value: parseFloat(msVal) || 0,
    }),
    [msMode, msVal]
  );

  const previewBill = useMemo(() => {
    const itemIds = [...selected];
    return {
      id: 'preview',
      pumpId,
      companyId,
      billNo: 'PREVIEW',
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      generatedAt: new Date().toISOString(),
      itemIds,
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
      status: 'draft' as const,
    };
  }, [selected, pumpId, companyId, from, to, discountHSD, discountMS, prevBal]);

  const parts = billTotalForItems(previewBill, transactions);

  const raise = () => {
    if (!company) return;
    if (selected.size === 0) {
      Alert.alert('Select items', 'Pick at least one transaction');
      return;
    }
    createBill({
      pumpId,
      companyId,
      itemIds: [...selected],
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
      status: 'raised',
    });
    Alert.alert('Bill raised', 'Company will see it under Bills.', [
      {
        text: 'OK',
        onPress: () => router.replace(href(`/(pump)/${companyId}/billing?tab=raised`)),
      },
    ]);
  };

  if (!company) {
    return (
      <Screen>
        <Header title="Raise bill" />
        <View style={styles.center}>
          <Text style={styles.empty}>Company not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <Header title="Raise Bill" subtitle={pump?.name ?? 'Generating Bill...'} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topDashboard}>
          <View style={styles.mainAmtBox}>
            <Text style={styles.previewTitle}>TOTAL DUE (SELECTED)</Text>
            <Text style={styles.previewAmt}>
              ₹ {parts.totalDue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.statsIconBox}>
            <Ionicons name="receipt" size={32} color={FuelColors.primary} />
          </View>
        </View>


        <SectionTitle title="Bill Configuration" style={styles.section} />
        <Card style={styles.configCard}>
          <View style={styles.configGrid}>
            <View style={{ flex: 1 }}>
              <Input label="Period From" value={from} onChangeText={setFrom} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Input label="Period To" value={to} onChangeText={setTo} />
            </View>
          </View>
          <Input
            label="Previous Balance (₹)"
            keyboardType="decimal-pad"
            value={prevBal}
            onChangeText={setPrevBal}
            leftIcon={<Text style={{ fontSize: 16, color: FuelColors.textMuted, fontWeight: '700' }}>₹ </Text>}
          />
        </Card>

        <SectionTitle title="Custom Discounts" style={styles.section} />
        <View style={styles.discountRow}>
          <Card style={styles.discountCard}>
            <Text style={styles.discountLabel}>HSD DISCOUNT</Text>
            <Select 
              label="Mode"
              value={hsdMode}
              options={[{ label: 'Flat Amount', value: 'flat' }, { label: 'Per Liter (₹/L)', value: 'per_liter' }]}
              onSelect={setHsdMode}
              style={{ marginBottom: 12 }}
            />
            <Input 
              label="Value"
              value={hsdVal} 
              onChangeText={setHsdVal} 
              keyboardType="decimal-pad" 
              leftIcon={<Text style={{ fontWeight: '700', color: FuelColors.textMuted }}>{hsdMode === 'flat' ? '₹' : '₹/L'}</Text>}
              style={{ marginBottom: 0 }}
            />
          </Card>
          <Card style={styles.discountCard}>
            <Text style={styles.discountLabel}>MS DISCOUNT</Text>
            <Select 
              label="Mode"
              value={msMode}
              options={[{ label: 'Flat Amount', value: 'flat' }, { label: 'Per Liter (₹/L)', value: 'per_liter' }]}
              onSelect={setMsMode}
              style={{ marginBottom: 12 }}
            />
            <Input 
              label="Value"
              value={msVal} 
              onChangeText={setMsVal} 
              keyboardType="decimal-pad" 
              leftIcon={<Text style={{ fontWeight: '700', color: FuelColors.textMuted }}>{msMode === 'flat' ? '₹' : '₹/L'}</Text>}
              style={{ marginBottom: 0 }}
            />
          </Card>
        </View>

        <SectionTitle title="Bill Preview" style={styles.section} />
        <View style={styles.previewContainer}>
          <Card style={styles.billPreviewCard}>
            {pump ? (
              <BillView
                key={`preview-${parts.totalDue}-${hsdVal}-${msVal}-${hsdMode}-${msMode}`}
                bill={previewBill}
                pump={pump}
                company={company}
                transactions={transactions}
              />
            ) : null}
          </Card>
        </View>

        <View style={styles.actions}>
          <Button 
            title={`Raise Bill • ₹${parts.totalDue.toLocaleString('en-IN')}`} 
            onPress={raise} 
            style={styles.raiseBtn}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: FuelColors.background },
  body: { paddingBottom: 60 },
  topDashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: FuelColors.background,
  },
  mainAmtBox: { flex: 1 },
  previewTitle: { fontSize: 13, color: FuelColors.textSecondary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewAmt: { fontSize: 36, fontWeight: '900', color: FuelColors.primary, marginTop: 4 },
  statsIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { paddingHorizontal: 20, marginTop: 16, marginBottom: 4 },
  configCard: { marginHorizontal: 20, padding: 20, borderRadius: 24 },
  configGrid: { flexDirection: 'row', marginBottom: 4 },
  discountRow: { flexDirection: 'column', gap: 12, paddingHorizontal: 20 },
  discountCard: { padding: 20, borderRadius: 24 },
  discountLabel: { fontSize: 12, fontWeight: '900', color: FuelColors.primary, marginBottom: 16, letterSpacing: 0.5 },
  previewContainer: { paddingHorizontal: 12 },
  billPreviewCard: { marginHorizontal: 8, padding: 0, borderRadius: 28, marginTop: 8, borderColor: 'transparent', elevation: 4 },
  actions: { padding: 20, marginTop: 16 },
  raiseBtn: { height: 64, borderRadius: 20, shadowColor: FuelColors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  empty: { color: FuelColors.textMuted, paddingHorizontal: 20, marginVertical: 32, fontStyle: 'italic', textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
