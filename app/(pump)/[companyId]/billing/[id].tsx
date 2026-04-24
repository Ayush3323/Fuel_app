import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { href } from '@/src/utils/routerHref';
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
import { appAlert } from '@/src/utils/appAlert';
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
    deleteBill,
  } = useApp();
  const router = useRouter();
  const bill = bills.find((b) => b.id === id);
  const pump = pumps.find((p) => p.id === bill?.pumpId);
  const company = bill ? getCompany(bill.companyId) : undefined;
  const editable = bill ? bill.status !== 'paid' : false;

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

  const saveChanges = () => {
    if (!bill || !pump || !company) return;
    if (selected.size === 0) {
      appAlert('Line items', 'Keep at least one transaction on the bill');
      return;
    }
    updateBill(bill.id, {
      period: { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` },
      discountHSD,
      discountMS,
      previousBalance: parseFloat(prevBal) || 0,
    });
    assignTransactionsToBill(bill.id, [...selected]);
    appAlert('Saved', 'Bill updated.');
  };

  const onDeleteRaisedBill = () => {
    if (!bill || bill.status !== 'raised') return;
    appAlert(
      'Delete raised bill?',
      'This will remove the raised bill and move all its transactions back to Unbilled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBill(bill.id);
              appAlert('Deleted', 'Bill deleted and transactions moved to Unbilled.', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace(
                      href(`/(pump)/${bill.companyId}/billing?tab=unbilled`)
                    );
                  },
                },
              ]);
            } catch {
              appAlert('Delete failed', 'Could not delete this bill right now. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!bill || !pump || !company) {
    return (
      <Screen>
        <Header title="Bill" />
        <Text style={styles.miss}>Not found</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <Header title={bill.billNo} subtitle={company?.name} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topDashboard}>
          <View style={styles.mainAmtBox}>
            <Text style={styles.previewTitle}>Total Due</Text>
            <Text style={styles.previewAmt}>
              ₹ {due.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.statsIconBox, { backgroundColor: bill.status === 'paid' ? FuelColors.successMuted : FuelColors.primaryMuted }]}>
            <Ionicons 
              name={bill.status === 'paid' ? "checkmark-circle" : "receipt"} 
              size={32} 
              color={bill.status === 'paid' ? FuelColors.success : FuelColors.primary} 
            />
          </View>
        </View>

        {editable ? (
          <>
            <SectionTitle title="Configuration" style={styles.section} />
            <Card style={styles.configCard}>
              <View style={styles.configGrid}>
                <View style={{ flex: 1 }}>
                  <Input label="From" value={from} onChangeText={setFrom} />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Input label="To" value={to} onChangeText={setTo} />
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

            <SectionTitle title="Discounts" style={styles.section} />
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

            <SectionTitle title="Live Preview" style={styles.section} />
            <View style={styles.previewContainer}>
              <Card style={styles.billPreviewCard}>
                {previewBill && (
                  <BillView
                    bill={previewBill}
                    pump={pump}
                    company={company}
                    transactions={transactions}
                  />
                )}
              </Card>
            </View>

            <View style={styles.actions}>
              {bill.status === 'raised' ? (
                <Button
                  title="Delete Raised Bill"
                  variant="danger"
                  onPress={onDeleteRaisedBill}
                  style={styles.deleteBtn}
                />
              ) : null}
              <Button title={`Save Changes • ₹${due.toLocaleString('en-IN')}`} onPress={saveChanges} style={styles.actionBtn} />
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <Card style={styles.billPreviewCard}>
              <BillView bill={bill} pump={pump} company={company} transactions={transactions} />
            </Card>
          </View>
        )}
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
  discountRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  discountCard: { flex: 1, padding: 20, borderRadius: 24 },
  discountLabel: { fontSize: 12, fontWeight: '900', color: FuelColors.primary, marginBottom: 16, letterSpacing: 0.5 },
  previewContainer: { paddingHorizontal: 12 },
  billPreviewCard: { marginHorizontal: 8, padding: 0, borderRadius: 28, marginTop: 8, borderColor: 'transparent', elevation: 4 },
  actions: { padding: 20, marginTop: 16 },
  deleteBtn: { height: 52, borderRadius: 14, marginBottom: 10 },
  actionBtn: { height: 64, borderRadius: 20, shadowColor: FuelColors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  empty: { color: FuelColors.textMuted, paddingHorizontal: 20, marginVertical: 32, fontStyle: 'italic', textAlign: 'center' },
  miss: { padding: 20, textAlign: 'center', color: FuelColors.textSecondary },
});
