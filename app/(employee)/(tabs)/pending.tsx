import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import {
  Badge,
  Card,
  CompanyFilterBar,
  EmptyState,
  FuelTypePill,
  Input,
  Screen,
  SectionTitle,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeePending() {
  const router = useRouter();
  const { requests, currentUser, pumps, getCompany, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const linked = getCompaniesForPump(pumpId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let rows = requests.filter(
      (r) =>
        r.pumpId === pumpId &&
        r.status === 'pending' &&
        (filter === 'all' || r.companyId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((r) => r.vehicleNo.toLowerCase().includes(qq));
    }
    return rows;
  }, [requests, pumpId, filter, q]);

  return (
    <Screen>
      <Text style={styles.title}>Pending</Text>
      <Text style={styles.sub}>{pump?.name}</Text>
      <CompanyFilterBar companies={linked} selectedId={filter} onChange={setFilter} />
      <View style={styles.search}>
        <Input
          label="Search vehicle"
          value={q}
          onChangeText={setQ}
          placeholder="e.g. HR55"
        />
      </View>
      <SectionTitle title="Your queue" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No pending requests" subtitle="Wait for company requests" />
        }
        renderItem={({ item }) => {
          const co = getCompany(item.companyId);
          return (
            <Pressable
              onPress={() => router.push(href(`/(employee)/fill/${item.id}`))}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coTag}>{co?.name ?? 'Company'}</Text>
                    <Text style={styles.v}>{item.vehicleNo}</Text>
                    <FuelTypePill fuel={item.fuel} />
                    <Text style={styles.meta}>
                      {item.isTankFull ? 'Tank Full' : `${item.qty} L`}
                      {item.extraCash ? ` · Cash: ₹${item.extraCash}` : ''}
                    </Text>
                  </View>
                  <Badge status="pending" />
                </View>
              </Card>
            </Pressable>
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  coTag: {
    fontSize: 11,
    fontWeight: '700',
    color: FuelColors.primary,
    marginBottom: 4,
  },
  v: { fontSize: 18, fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 8, color: FuelColors.textSecondary },
});
