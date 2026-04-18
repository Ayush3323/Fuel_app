import { useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import {
  BillView,
  Button,
  Card,
  Header,
  Input,
  Screen,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelDiscount } from '@/src/types';
import { billTotalForItems } from '@/src/utils/billMath';

export default function NewBillScreen() {
  const router = useRouter();
  const { preselect } = useLocalSearchParams<{ preselect?: string }>();

  useEffect(() => {
    if (preselect)
      setSelected((prev) => new Set([...prev, preselect]));
  }, [preselect]);
  const {
    getUnbilledTransactions,
    currentUser,
    company,
    createBillDraft,
    raiseBill,
    transactions,
    pumps,
  } = useApp();
  const pumpId = currentUser?.pumpId!;
  const pump = pumps.find((p) => p.id === pumpId);

  const unbilled = useMemo(
    () => getUnbilledTransactions(pumpId),
    [getUnbilledTransactions, pumpId]
  );

  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (preselect) s.add(preselect);
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

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

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
      companyId: company.id,
      billNo: 'PREVIEW',
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      generatedAt: new Date().toISOString(),
      itemIds,
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
      status: 'draft' as const,
    };
  }, [selected, pumpId, company.id, from, to, discountHSD, discountMS, prevBal]);

  const parts = billTotalForItems(previewBill, transactions);

  const saveDraft = () => {
    if (selected.size === 0) {
      Alert.alert('Select items', 'Pick at least one transaction');
      return;
    }
    const b = createBillDraft({
      pumpId,
      companyId: company.id,
      itemIds: [...selected],
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
    });
    Alert.alert('Draft saved', b.billNo, [
      { text: 'OK', onPress: () => router.replace(href(`/(pump)/billing/${b.id}`)) },
    ]);
  };

  const raise = () => {
    if (selected.size === 0) {
      Alert.alert('Select items', 'Pick at least one transaction');
      return;
    }
    const b = createBillDraft({
      pumpId,
      companyId: company.id,
      itemIds: [...selected],
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
    });
    raiseBill(b.id);
    Alert.alert('Bill raised', 'Company will see it under Bills.', [
      { text: 'OK', onPress: () => router.replace(href(`/(pump)/billing/${b.id}`)) },
    ]);
  };

  return (
    <Screen>
      <Header title="Raise bill" subtitle={pump?.name} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>Unbilled transactions</Text>
        {unbilled.map((t) => (
          <Card
            key={t.id}
            style={[styles.trow, selected.has(t.id) && styles.trowOn]}
          >
            <Text onPress={() => toggle(t.id)} style={styles.ttxt}>
              {selected.has(t.id) ? '☑ ' : '☐ '}
              {t.vehicleNo} · {t.fuel} · ₹{t.gross.toLocaleString('en-IN')}
            </Text>
          </Card>
        ))}
        {unbilled.length === 0 ? (
          <Text style={styles.empty}>Nothing unbilled</Text>
        ) : null}

        <Input label="Period from" value={from} onChangeText={setFrom} />
        <Input label="Period to" value={to} onChangeText={setTo} />
        <Input
          label="Previous balance (₹)"
          keyboardType="decimal-pad"
          value={prevBal}
          onChangeText={setPrevBal}
        />

        <Text style={styles.section}>HSD discount</Text>
        <Input
          label="Mode: per_liter or flat (type per_liter or flat)"
          value={hsdMode}
          onChangeText={(x) =>
            setHsdMode(x === 'flat' ? 'flat' : 'per_liter')
          }
        />
        <Input label="Value" value={hsdVal} onChangeText={setHsdVal} keyboardType="decimal-pad" />

        <Text style={styles.section}>MS discount</Text>
        <Input
          label="Mode"
          value={msMode}
          onChangeText={(x) =>
            setMsMode(x === 'flat' ? 'flat' : 'per_liter')
          }
        />
        <Input label="Value" value={msVal} onChangeText={setMsVal} keyboardType="decimal-pad" />

        <Card style={styles.preview}>
          <Text style={styles.previewTitle}>Total due (preview)</Text>
          <Text style={styles.previewAmt}>
            ₹ {parts.totalDue.toLocaleString('en-IN')}
          </Text>
        </Card>

        {pump ? (
          <BillView
            bill={previewBill}
            pump={pump}
            company={company}
            transactions={transactions}
          />
        ) : null}

        <View style={styles.actions}>
          <Button title="Save draft" variant="secondary" onPress={saveDraft} />
          <Button title="Raise bill" onPress={raise} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 48 },
  section: {
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    color: FuelColors.text,
  },
  trow: { marginBottom: 8, padding: 12 },
  trowOn: { borderColor: FuelColors.primary, borderWidth: 2 },
  ttxt: { fontSize: 14, color: FuelColors.text },
  empty: { color: FuelColors.textMuted, marginBottom: 12 },
  preview: { marginVertical: 12, alignItems: 'center' },
  previewTitle: { color: FuelColors.textSecondary },
  previewAmt: {
    fontSize: 24,
    fontWeight: '800',
    color: FuelColors.primary,
    marginTop: 4,
  },
  actions: { gap: 12, marginTop: 16 },
});
