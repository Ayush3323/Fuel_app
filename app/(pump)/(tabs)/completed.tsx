import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import {
  Card,
  EmptyState,
  FuelTypePill,
  Input,
  Screen,
  SectionTitle,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpCompleted() {
  const router = useRouter();
  const { transactions, currentUser, pumps, users } = useApp();
  const pumpId = currentUser?.pumpId;
  const pump = pumps.find((p) => p.id === pumpId);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let t = transactions.filter((x) => x.pumpId === pumpId);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      t = t.filter((x) => x.vehicleNo.toLowerCase().includes(qq));
    }
    return t.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, pumpId, q]);

  return (
    <Screen>
      <Text style={styles.title}>Completed fillings</Text>
      <Text style={styles.sub}>{pump?.name}</Text>
      <View style={styles.search}>
        <Input
          label="Search vehicle"
          value={q}
          onChangeText={setQ}
          placeholder="e.g. HR55"
        />
      </View>
      <SectionTitle title="All transactions (tap to include in bill)" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No completed fills" subtitle="Filled requests show here" />
        }
        renderItem={({ item }) => {
          const filler = users.find((u) => u.id === item.filledByUserId);
          return (
            <Card style={styles.card}>
              <Text style={styles.v}>{item.vehicleNo}</Text>
              <FuelTypePill fuel={item.fuel} />
              <Text style={styles.meta}>
                ₹{item.gross.toLocaleString('en-IN')} · {item.actualQty} L @ ₹
                {item.rate}
              </Text>
              <Text style={styles.by}>By {filler?.name ?? '—'}</Text>
              <Text
                style={styles.link}
                onPress={() =>
                  router.push(href(`/(pump)/billing/new?preselect=${item.id}`))
                }
              >
                Use in new bill →
              </Text>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FuelColors.text,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sub: { color: FuelColors.textSecondary, paddingHorizontal: 20, marginBottom: 4 },
  search: { paddingHorizontal: 16, marginBottom: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  v: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { marginTop: 6, color: FuelColors.textSecondary, fontSize: 13 },
  by: { marginTop: 6, fontSize: 12, color: FuelColors.textMuted },
  link: {
    marginTop: 10,
    color: FuelColors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
