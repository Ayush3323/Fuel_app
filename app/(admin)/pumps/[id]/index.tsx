import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen, SectionTitle, StatTile } from '@/src/components/ui';
import { useApp, useOutstandingForLink } from '@/src/context/AppContext';

const THRESHOLD = 12;

export default function PumpDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { pumps, requests, transactions, currentUser } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const pump = pumps.find((p) => p.id === id);
  const outstanding = useOutstandingForLink(id ?? '', companyId);

  const pending = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.pumpId === id &&
          r.companyId === companyId &&
          r.status === 'pending'
      ),
    [requests, id, companyId]
  );

  const txns = useMemo(
    () =>
      transactions
        .filter((t) => t.pumpId === id && t.companyId === companyId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [transactions, id, companyId]
  );
  const [visibleCount, setVisibleCount] = useState(THRESHOLD);
  const todaySpend = useMemo(() => {
    const today = new Date();
    return txns
      .filter((t) => {
        const d = new Date(t.createdAt);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .reduce((sum, t) => sum + t.gross + (t.extraCash || 0), 0);
  }, [txns]);
  const lastFillAt = txns[0]?.createdAt;
  const lastVehicle = txns[0]?.vehicleNo;
  const topVehicles = useMemo(() => {
    const now = Date.now();
    const last30Days = txns.filter(
      (t) => now - new Date(t.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
    );
    const map = new Map<string, number>();
    for (const txn of last30Days) {
      map.set(txn.vehicleNo, (map.get(txn.vehicleNo) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [txns]);
  const visibleTxns = useMemo(
    () => (txns.length > THRESHOLD ? txns.slice(0, visibleCount) : txns),
    [txns, visibleCount]
  );
  useEffect(() => {
    setVisibleCount(THRESHOLD);
  }, [txns.length]);

  if (!pump) {
    return (
      <Screen>
        <Header title="Pump Details" />
        <View style={styles.body}>
          <Text style={styles.miss}>Petrol pump not found or link has been removed.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={pump.name} subtitle={pump.address} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Pump Overview</Text>
          <Text style={styles.profileSub}>Monitor this pump's day-to-day operations and activity.</Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            label="Outstanding Credit"
            value={`₹${outstanding.toLocaleString('en-IN')}`}
            style={{ flex: 1 }}
          />
          <StatTile 
            label="Pending Req." 
            value={String(pending.length)} 
            style={{ flex: 1 }}
          />
        </View>

        <View style={[styles.statsRow, styles.statsRowBottom]}>
          <StatTile
            label="Today's Spend"
            value={`₹${todaySpend.toLocaleString('en-IN')}`}
            style={{ flex: 1 }}
          />
          <StatTile
            label="Last Fill"
            value={lastFillAt ? new Date(lastFillAt).toLocaleString('en-IN') : 'No activity'}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Vehicle Insights" />
          <Card style={styles.insightsCard}>
            <Text style={styles.insightLabel}>Last filled vehicle</Text>
            <Text style={styles.insightValue}>{lastVehicle || 'No fills yet'}</Text>
            <Text style={styles.insightLabelTop}>Top vehicles (30 days)</Text>
            {topVehicles.length === 0 ? (
              <Text style={styles.emptyInline}>No vehicle activity in last 30 days.</Text>
            ) : (
              topVehicles.map(([vehicle, count]) => (
                <View key={vehicle} style={styles.vehicleRow}>
                  <Text style={styles.vehicleNo}>{vehicle}</Text>
                  <Text style={styles.vehicleCount}>{count} fills</Text>
                </View>
              ))
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Quick Actions" />
          <View style={styles.quickActions}>
            <Button
              title="View Pump Bills"
              onPress={() => router.push(href(`/(admin)/(tabs)/bills?pumpId=${id}`))}
            />
            <Button
              title="Create Request For This Pump"
              variant="secondary"
              onPress={() => router.push(href(`/(admin)/pumps/${id}/request`))}
            />
          </View>
        </View>

        <View style={styles.headingWrap}>
          <SectionTitle title="Recent Activity" />
        </View>

        <View style={styles.list}>
          {visibleTxns.map((item) => (
            <Card key={item.id} style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.v}>{item.vehicleNo}</Text>
                  <Text style={styles.meta}>
                    {item.fuel} · {item.actualQty.toFixed(1)} L @ ₹{item.rate}
                  </Text>
                  <Text style={styles.metaSub}>
                     ₹{item.gross.toLocaleString('en-IN')}{item.extraCash ? ` + ₹${item.extraCash} cash` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
                  <Text style={styles.dateSub}>{new Date(item.createdAt).toLocaleTimeString('en-IN')}</Text>
                </View>
              </View>
            </Card>
          ))}
          {txns.length === 0 && (
            <Text style={styles.empty}>No transaction history for this pump.</Text>
          )}
          {txns.length > THRESHOLD && visibleCount < txns.length ? (
            <Button title="Load More Activity" variant="secondary" onPress={() => setVisibleCount((v) => v + THRESHOLD)} />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  miss: { padding: 20, color: FuelColors.danger, textAlign: 'center' },
  profileCard: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: FuelColors.surface,
  },
  profileTitle: { fontSize: 14, fontWeight: '800', color: FuelColors.text },
  profileSub: { marginTop: 4, fontSize: 12, color: FuelColors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10 },
  statsRowBottom: { marginTop: 10, marginBottom: 16 },
  section: { marginBottom: 18 },
  insightsCard: { padding: 14 },
  insightLabel: { fontSize: 12, color: FuelColors.textSecondary, fontWeight: '600' },
  insightValue: { marginTop: 2, fontSize: 15, fontWeight: '800', color: FuelColors.text },
  insightLabelTop: { marginTop: 12, fontSize: 12, color: FuelColors.textSecondary, fontWeight: '600' },
  emptyInline: { marginTop: 8, fontSize: 12, color: FuelColors.textMuted },
  vehicleRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleNo: { fontSize: 13, color: FuelColors.text, fontWeight: '700' },
  vehicleCount: { fontSize: 12, color: FuelColors.textSecondary, fontWeight: '600' },
  quickActions: { gap: 10 },
  headingWrap: { marginBottom: 6 },
  list: { },
  recordCard: { marginBottom: 10, padding: 14 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4, fontWeight: '500' },
  metaSub: { color: FuelColors.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  date: { fontSize: 11, color: FuelColors.textMuted },
  dateSub: { fontSize: 11, color: FuelColors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 32, fontSize: 14 },
});
