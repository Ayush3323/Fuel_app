import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Card, Screen, SectionTitle, StatTile } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

export default function AdminDashboard() {
  const { requests, transactions, bills, currentUser, getCompany, getPumpsForCompany } =
    useApp();
  const companyId = currentUser?.companyId;
  const company = companyId ? getCompany(companyId) : undefined;

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
      .slice(0, 6);
  }, [transactions, companyId]);

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.co}>{company?.name ?? '—'}</Text>
      </View>

      <View style={styles.stats}>
        <StatTile
          label="Credit outstanding"
          value={`₹ ${totalOutstanding.toLocaleString('en-IN')}`}
        />
        <StatTile
          label="Pending requests"
          value={String(pendingCount)}
          sub="Linked pumps"
        />
      </View>

      <SectionTitle title="Fuel volume (this company)" />
      <View style={styles.stats}>
        <StatTile
          label="Diesel (HSD) gross"
          value={`₹ ${hsdMs.hsd.toLocaleString('en-IN')}`}
        />
        <StatTile
          label="Petrol (MS) gross"
          value={`₹ ${hsdMs.ms.toLocaleString('en-IN')}`}
        />
      </View>

      <SectionTitle title="Recent transactions" />
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Text style={styles.v}>{item.vehicleNo}</Text>
            <Text style={styles.meta}>
              {item.fuel} · ₹{item.gross.toLocaleString('en-IN')}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: FuelColors.text },
  co: { color: FuelColors.textSecondary, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  row: { marginHorizontal: 16, marginBottom: 8 },
  v: { fontWeight: '700', color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  empty: { padding: 20, color: FuelColors.textMuted, textAlign: 'center' },
});
