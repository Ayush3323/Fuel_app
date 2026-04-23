import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen, SectionTitle, StatTile } from '@/src/components/ui';
import { useApp, useOutstandingForLink } from '@/src/context/AppContext';

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
        <View style={styles.statsRow}>
          <StatTile
            label="Outstanding Credit"
            value={`₹${outstanding.toLocaleString('en-IN')}`}
            style={{ flex: 1.3 }}
          />
          <StatTile 
            label="Pending Req." 
            value={String(pending.length)} 
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.cta}>
          <Button
            title="New Fuel Request"
            onPress={() => router.push(href(`/(admin)/pumps/${id}/request`))}
          />
        </View>

        <View style={styles.headingWrap}>
          <SectionTitle title="Recent Records" />
        </View>

        <View style={styles.list}>
          {txns.map((item) => (
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
                </View>
              </View>
            </Card>
          ))}
          {txns.length === 0 && (
            <Text style={styles.empty}>No transaction history for this pump.</Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  miss: { padding: 20, color: FuelColors.danger, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cta: { marginBottom: 24 },
  headingWrap: { marginBottom: 6 },
  list: { },
  recordCard: { marginBottom: 10, padding: 14 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4, fontWeight: '500' },
  metaSub: { color: FuelColors.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  date: { fontSize: 11, color: FuelColors.textMuted },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 32, fontSize: 14 },
});
