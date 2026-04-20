import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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

export default function PumpBillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    bills,
    pumps,
    transactions,
    getCompany,
    updateBill,
    assignTransactionsToBill,
    getUnbilledTransactions,
  } = useApp();
  const bill = bills.find((b) => b.id === id);
  const pump = pumps.find((p) => p.id === bill?.pumpId);
  const company = bill ? getCompany(bill.companyId) : undefined;
  const editable = bill ? bill.status !== 'paid' : false;

  const unbilled = useMemo(
    () =>
      bill
        ? getUnbilledTransactions(bill.pumpId, bill.companyId)
        : ([] as ReturnType<typeof getUnbilledTransactions>),
    [getUnbilledTransactions, bill]
  );

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [prevBal, setPrevBal] = useState('0');
  const [hsdMode, setHsdMode] = useState<'per_liter' | 'flat'>('per_liter');
  const [hsdVal, setHsdVal] = useState('0');
  const [msMode, setMsMode] = useState<'per_liter' | 'flat'>('flat');
  const [msVal, setMsVal] = useState('0');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const b = bills.find((x) => x.id === id);
    if (!b) return;
    setFrom(b.period.from.slice(0, 10));
    setTo(b.period.to.slice(0, 10));
    setPrevBal(String(b.previousBalance));
    setHsdMode(b.discountHSD.mode);
    setHsdVal(String(b.discountHSD.value));
    setMsMode(b.discountMS.mode);
    setMsVal(String(b.discountMS.value));
    setSelected(new Set(b.itemIds));
  }, [id, bills]);

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
    if (!bill) return null;
    return {
      ...bill,
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      itemIds: [...selected],
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
    };
  }, [bill, from, to, selected, discountHSD, discountMS, prevBal]);

  const due = previewBill
    ? billTotalForItems(previewBill, transactions).totalDue
    : 0;

  const removeLine = (txnId: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(txnId);
      return n;
    });
  };

  const addUnbilled = (txnId: string) => {
    setSelected((prev) => new Set([...prev, txnId]));
  };

  const saveChanges = () => {
    if (!bill || !pump || !company) return;
    if (selected.size === 0) {
      Alert.alert('Line items', 'Keep at least one transaction on the bill');
      return;
    }
    updateBill(bill.id, {
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
    });
    assignTransactionsToBill(bill.id, [...selected]);
    Alert.alert('Saved', 'Bill updated.');
  };

  if (!bill || !pump || !company) {
    return (
      <Screen>
        <Header title="Bill" />
        <Text style={styles.miss}>Not found</Text>
      </Screen>
    );
  }

  const inBillTx = transactions.filter((t) => selected.has(t.id));
  const addable = unbilled.filter((t) => !selected.has(t.id));

  return (
    <Screen>
      <Header title={bill.billNo} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.banner}>
          <Text style={styles.dueLabel}>Total due</Text>
          <Text style={styles.due}>₹ {due.toLocaleString('en-IN')}</Text>
          <Text style={styles.st}>Status: {bill.status}</Text>
        </View>

        {editable ? (
          <>
            <Text style={styles.section}>Line items on this bill</Text>
            {inBillTx.map((t) => (
              <Pressable key={t.id} onPress={() => removeLine(t.id)}>
                <Card style={styles.trow}>
                  <Text style={styles.ttxt}>
                    Tap to remove · {t.vehicleNo} · {t.fuel} · ₹
                    {t.gross.toLocaleString('en-IN')}
                  </Text>
                </Card>
              </Pressable>
            ))}
            {inBillTx.length === 0 ? (
              <Text style={styles.hint}>No transactions selected</Text>
            ) : null}

            <Text style={styles.section}>Add unbilled transactions</Text>
            {addable.map((t) => (
              <Pressable key={t.id} onPress={() => addUnbilled(t.id)}>
                <Card style={styles.trow}>
                  <Text style={styles.ttxt}>
                    Tap to add · {t.vehicleNo} · {t.fuel} · ₹
                    {t.gross.toLocaleString('en-IN')}
                  </Text>
                </Card>
              </Pressable>
            ))}
            {addable.length === 0 ? (
              <Text style={styles.hint}>No other unbilled fills for this company</Text>
            ) : null}

            <View style={styles.form}>
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
                label="Mode: per_liter or flat"
                value={hsdMode}
                onChangeText={(x) =>
                  setHsdMode(x === 'flat' ? 'flat' : 'per_liter')
                }
              />
              <Input
                label="Value"
                value={hsdVal}
                onChangeText={setHsdVal}
                keyboardType="decimal-pad"
              />

              <Text style={styles.section}>MS discount</Text>
              <Input
                label="Mode"
                value={msMode}
                onChangeText={(x) =>
                  setMsMode(x === 'flat' ? 'flat' : 'per_liter')
                }
              />
              <Input
                label="Value"
                value={msVal}
                onChangeText={setMsVal}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.actions}>
              <Button title="Save changes" onPress={saveChanges} />
            </View>

            {previewBill ? (
              <BillView
                bill={previewBill}
                pump={pump}
                company={company}
                transactions={transactions}
              />
            ) : null}
          </>
        ) : (
          <BillView bill={bill} pump={pump} company={company} transactions={transactions} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20 },
  banner: {
    margin: 16,
    padding: 16,
    backgroundColor: FuelColors.primaryMuted,
    borderRadius: 12,
  },
  dueLabel: { fontSize: 12, color: FuelColors.textSecondary },
  due: { fontSize: 24, fontWeight: '800', color: FuelColors.primary },
  st: { marginTop: 8, color: FuelColors.textSecondary },
  section: {
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    color: FuelColors.text,
  },
  form: { paddingHorizontal: 16 },
  trow: { marginHorizontal: 16, marginBottom: 8, padding: 12 },
  ttxt: { fontSize: 14, color: FuelColors.text },
  hint: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: FuelColors.textMuted,
    fontSize: 13,
  },
  actions: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
});
