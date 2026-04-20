import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, ScrollView } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Card, Screen, SectionTitle, StatTile, Header } from '@/src/components/ui';
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
      .slice(0, 5);
  }, [transactions, companyId]);

  return (
    <Screen>
      <Header title="Admin Dashboard" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.co}>{company?.name}</Text>

        <View style={styles.section}>
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
          <SectionTitle title="Recent Fills" />
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
        </View>
      </ScrollView>
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
  statsRow: { flexDirection: 'row', gap: 10 },
  card: { marginBottom: 10, padding: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  date: { fontSize: 11, color: FuelColors.textMuted },
  empty: { padding: 20, color: FuelColors.textMuted, textAlign: 'center', fontSize: 13 },
});
