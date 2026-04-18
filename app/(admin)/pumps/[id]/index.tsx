import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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
        <Header title="Pump" />
        <Text style={styles.miss}>Not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={pump.name} subtitle={pump.address} />
      <View style={styles.stats}>
        <StatTile
          label="Outstanding"
          value={`₹ ${outstanding.toLocaleString('en-IN')}`}
        />
        <StatTile label="Pending req." value={String(pending.length)} />
      </View>

      <View style={styles.cta}>
        <Button
          title="New fuel request"
          onPress={() => router.push(href(`/(admin)/pumps/${id}/request`))}
        />
      </View>

      <SectionTitle title="Transaction history" />
      <FlatList
        data={txns}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Text style={styles.v}>{item.vehicleNo}</Text>
            <Text style={styles.meta}>
              {item.fuel} · {item.actualQty.toFixed(2)} L @ ₹{item.rate} = ₹
              {item.gross.toLocaleString('en-IN')}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20, color: FuelColors.danger },
  stats: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  cta: { paddingHorizontal: 16, marginVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { marginBottom: 8 },
  v: { fontWeight: '700', color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 20 },
});
