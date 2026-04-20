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
  Header,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeePending() {
  const router = useRouter();
  const { requests, currentUser, pumps, getCompany, getPumpsForCompany } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const company = getCompany(companyId);
  const linked = getPumpsForCompany(companyId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let rows = requests.filter(
      (r) =>
        r.companyId === companyId &&
        r.status === 'pending' &&
        (filter === 'all' || r.pumpId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      rows = rows.filter((r) => r.vehicleNo.toLowerCase().includes(qq));
    }
    return rows;
  }, [requests, companyId, filter, q]);

  return (
    <Screen>
      <Header title="Pending Requests" showBack={false} />
      <View style={styles.topPad} />
      <Text style={styles.sub}>{company?.name}</Text>
      
      <View style={styles.section}>
        <CompanyFilterBar companies={linked} selectedId={filter} onChange={setFilter} />
      </View>

      <View style={styles.searchSection}>
        <Input
          label="Search vehicle"
          value={q}
          onChangeText={setQ}
          placeholder="e.g. HR55"
        />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <SectionTitle title="Live Queue" />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="No pending requests" subtitle="Wait for company requests" />
        }
        renderItem={({ item }) => {
          const pump = pumps.find(p => p.id === item.pumpId);
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.coTag}>{pump?.name ?? 'Pump'}</Text>
                  <Text style={styles.v}>{item.vehicleNo}</Text>
                  <View style={styles.metaRow}>
                    <FuelTypePill fuel={item.fuel} />
                    <Text style={styles.meta}>
                      {item.isTankFull ? 'Tank Full' : `${item.qty} L`}
                      {item.extraCash ? ` · ₹${item.extraCash}` : ''}
                    </Text>
                  </View>
                </View>
                <Badge status="pending" />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topPad: { height: 24 },
  sub: { color: FuelColors.textSecondary, paddingHorizontal: 20, marginBottom: 16, fontWeight: '600' },
  section: { marginBottom: 8 },
  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 12, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  coTag: {
    fontSize: 12,
    fontWeight: '800',
    color: FuelColors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  v: { fontSize: 18, fontWeight: '800', color: FuelColors.text, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { color: FuelColors.textSecondary, fontSize: 14, fontWeight: '600' },
});
