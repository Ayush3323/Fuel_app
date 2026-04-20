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
      <Header title="Incoming Queue" showBack={false} />
      <View style={styles.topPad} />
      <Text style={styles.sub}>{pump?.name}</Text>
      
      <View style={styles.filterSection}>
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

      <View style={styles.headingWrap}>
        <SectionTitle title="Awaiting Fills" />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="Queue is empty" />
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
                    <View style={styles.metaRow}>
                      <FuelTypePill fuel={item.fuel} />
                      <Text style={styles.meta}>
                        {item.isTankFull ? 'Tank Full' : `${item.qty} L`}
                        {item.extraCash ? ` · Cash: ₹${item.extraCash}` : ''}
                      </Text>
                    </View>
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
  topPad: { height: 12 },
  sub: { 
    color: FuelColors.primary, 
    paddingHorizontal: 16, 
    marginBottom: 12, 
    fontWeight: '800', 
    fontSize: 14,
    textTransform: 'uppercase'
  },
  filterSection: { marginBottom: 6 },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  headingWrap: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { marginBottom: 10, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  coTag: {
    fontSize: 11,
    fontWeight: '700',
    color: FuelColors.textSecondary,
    marginBottom: 4,
  },
  v: { fontSize: 16, fontWeight: '800', color: FuelColors.text, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
});
