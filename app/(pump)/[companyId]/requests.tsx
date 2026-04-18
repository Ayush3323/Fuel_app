import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function PumpCompanyRequests() {
  const router = useRouter();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const { requests, currentUser, pumps, getCompany, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const linked = getCompaniesForPump(pumpId);
  const [filter, setFilter] = useState<'all' | string>(() =>
    companyId && linked.some((c) => c.id === companyId) ? companyId : 'all'
  );
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!companyId || !pumpId) return;
    const next = getCompaniesForPump(pumpId);
    if (next.some((c) => c.id === companyId)) {
      setFilter(companyId);
    }
  }, [companyId, pumpId, getCompaniesForPump]);

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
      <Text style={styles.title}>Pending requests</Text>
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
      <SectionTitle title="Awaiting fill" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No pending requests"
            subtitle={
              filter === 'all'
                ? 'No transport companies have queued work for this pump'
                : 'Nothing queued for this company on your pump'
            }
          />
        }
        renderItem={({ item }) => {
          const co = getCompany(item.companyId);
          const showCo = filter === 'all';
          return (
            <Pressable
              onPress={() =>
                router.push(href(`/(pump)/${item.companyId}/fill/${item.id}`))
              }
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    {showCo ? (
                      <Text style={styles.coTag}>{co?.name ?? 'Company'}</Text>
                    ) : null}
                    <Text style={styles.v}>{item.vehicleNo}</Text>
                    <FuelTypePill fuel={item.fuel} />
                    <Text style={styles.meta}>{item.qty} L requested</Text>
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
