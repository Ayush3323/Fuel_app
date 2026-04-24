import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen, SectionTitle, StatTile } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';
import { billTotalForItems } from '@/src/utils/billMath';
import { href } from '@/src/utils/routerHref';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboard() {
  const router = useRouter();
  const [showPumpPicker, setShowPumpPicker] = useState(false);
  const { requests, transactions, bills, currentUser, getCompany, getPumpsForCompany } =
    useApp();
  const companyId = currentUser?.companyId;
  const company = companyId ? getCompany(companyId) : undefined;
  const linkedPumps = useMemo(
    () => (companyId ? getPumpsForCompany(companyId) : []),
    [companyId, getPumpsForCompany]
  );

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (r) => r.companyId === companyId && r.status === 'pending'
      ).length,
    [requests, companyId]
  );

  const totalOutstanding = useMemo(() => {
    if (!companyId) return 0;
    const pumps = getPumpsForCompany(companyId);
    let o = 0;
    for (const p of pumps) {
      for (const b of bills) {
        if (b.pumpId !== p.id || b.companyId !== companyId || b.status === 'paid')
          continue;
        o += billTotalForItems(b, transactions).totalDue;
      }
      const unbilled = transactions.filter(
        (t) =>
          t.pumpId === p.id && t.companyId === companyId && !t.billId
      );
      for (const t of unbilled) o += t.gross + t.extraCash + t.advance;
    }
    return Math.round(o * 100) / 100;
  }, [getPumpsForCompany, bills, transactions, companyId]);

  const hsdMs = useMemo(() => {
    let hsd = 0;
    let ms = 0;
    for (const t of transactions) {
      if (t.companyId !== companyId) continue;
      if (t.fuel === 'HSD') hsd += t.gross;
      else ms += t.gross;
    }
    return { hsd, ms };
  }, [transactions, companyId]);

  const recent = useMemo(() => {
    return [...transactions]
      .filter((t) => t.companyId === companyId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [transactions, companyId]);

  return (
    <Screen>
      <Header title="Admin Dashboard" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.co}>{company?.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Action</Text>
          <Button
            title="Create Fuel Request"
            onPress={() => {
              if (linkedPumps.length === 0) {
                appAlert('No linked pump', 'Link a pump first from the Pumps tab.');
                return;
              }
              if (linkedPumps.length === 1) {
                router.push(href(`/(admin)/pumps/${linkedPumps[0].id}/request`));
                return;
              }
              setShowPumpPicker(true);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Overview</Text>
          <View style={styles.statsRow}>
            <StatTile
              label="Outstanding Credit"
              value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
              style={{ flex: 1.2 }}
            />
            <StatTile
              label="Pending Requests"
              value={String(pendingCount)}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Expense Summary" />
          <View style={styles.statsRow}>
            <StatTile
              label="Diesel (HSD)"
              value={`₹${hsdMs.hsd.toLocaleString('en-IN')}`}
            />
            <StatTile
              label="Petrol (MS)"
              value={`₹${hsdMs.ms.toLocaleString('en-IN')}`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title="Recent Fills" />
            <Pressable onPress={() => router.push(href('/(admin)/(tabs)/requests'))}>
              <Text style={styles.link}>View all</Text>
            </Pressable>
          </View>
          {recent.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.v}>{item.vehicleNo}</Text>
                  <Text style={styles.meta}>
                    {item.fuel} · ₹{item.gross.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
              </View>
            </Card>
          ))}
          {recent.length === 0 && (
            <Text style={styles.empty}>No transaction history available</Text>
          )}
          <View style={styles.inlineActions}>
            <Pressable onPress={() => router.push(href('/(admin)/(tabs)/requests'))} style={styles.miniCta}>
              <Text style={styles.miniCtaTxt}>Open Requests</Text>
            </Pressable>
            <Pressable onPress={() => router.push(href('/(admin)/(tabs)/bills'))} style={styles.miniCta}>
              <Text style={styles.miniCtaTxt}>Open Bills</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showPumpPicker} transparent animationType="fade" onRequestClose={() => setShowPumpPicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPumpPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Petrol Pump</Text>
            <Text style={styles.modalSub}>Choose the pump for this fuel request.</Text>
            {linkedPumps.map((pump) => (
              <Pressable
                key={pump.id}
                style={styles.pumpRow}
                onPress={() => {
                  setShowPumpPicker(false);
                  router.push(href(`/(admin)/pumps/${pump.id}/request`));
                }}
              >
                <Text style={styles.pumpName}>{pump.name}</Text>
                <Text style={styles.pumpAddr}>{pump.address}</Text>
              </Pressable>
            ))}
            <Button title="Cancel" variant="secondary" onPress={() => setShowPumpPicker(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  co: { 
    color: FuelColors.primary, 
    marginBottom: 20, 
    fontWeight: '800', 
    fontSize: 16,
    textTransform: 'uppercase'
  },
  section: { marginBottom: 20 },
  sectionLabel: { color: FuelColors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: FuelColors.primary, fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  card: { marginBottom: 10, padding: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  date: { fontSize: 11, color: FuelColors.textMuted },
  empty: { padding: 20, color: FuelColors.textMuted, textAlign: 'center', fontSize: 13 },
  inlineActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  miniCta: {
    flex: 1,
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: FuelColors.surface,
  },
  miniCtaTxt: { color: FuelColors.primary, fontSize: 12, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: FuelColors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 10,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: FuelColors.text },
  modalSub: { fontSize: 13, color: FuelColors.textSecondary, marginBottom: 6 },
  pumpRow: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  pumpName: { fontSize: 14, fontWeight: '700', color: FuelColors.text },
  pumpAddr: { fontSize: 12, color: FuelColors.textSecondary, marginTop: 2 },
});
