import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import {
  Card,
  CompanyFilterBar,
  EmptyState,
  FuelTypePill,
  Header,
  Input,
  Screen,
  SectionTitle,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpHomePending() {
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
    <Screen style={styles.screen}>
      <Header 
        title="Pending tasks" 
        subtitle={pump?.name ?? ''} 
        showBack={false} 
        right={
          <View style={styles.statsIconBox}>
            <Ionicons name="time" size={22} color={FuelColors.primary} />
          </View>
        }
      />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>


            <View style={styles.filterSection}>
              <CompanyFilterBar 
                companies={linked} 
                selectedId={filter} 
                onChange={setFilter} 
              />
            </View>
            
            <View style={styles.searchSection}>
              <Input
                label="Search by Vehicle Number"
                value={q}
                onChangeText={setQ}
                placeholder="e.g. HR 55"
                style={styles.searchInput}
                leftIcon={<Ionicons name="search" size={18} color={FuelColors.textMuted} />}
              />
            </View>

            <SectionTitle title="Awaiting Fill" style={styles.sectionTitle} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              title="All clear!"
              subtitle={
                filter === 'all'
                  ? 'No pending fuel requests at the moment.'
                  : `No pending requests for this company.`
              }
            />
          </View>
        }
        renderItem={({ item }) => {
          const co = getCompany(item.companyId);
          const showCo = filter === 'all';
          return (
            <Pressable
              onPress={() =>
                router.push(href(`/(pump)/${item.companyId}/fill/${item.id}`))
              }
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.leftInfo}>
                    <View style={styles.vehicleIcon}>
                      <Ionicons 
                        name={item.fuel === 'HSD' ? 'bus' : 'car'} 
                        size={20} 
                        color={FuelColors.primary} 
                      />
                    </View>
                    <View>
                      <Text style={styles.vehicleNo}>{item.vehicleNo}</Text>
                      {showCo && <Text style={styles.coName}>{co?.name}</Text>}
                    </View>
                  </View>
                  <View style={styles.actionIcon}>
                    <Ionicons name="chevron-forward" size={18} color={FuelColors.textMuted} />
                  </View>
                </View>
                
                <View style={styles.cardDivider} />
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fuel Type</Text>
                    <FuelTypePill fuel={item.fuel} />
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Req. Qty</Text>
                    <Text style={styles.detailVal}>{item.qty} L</Text>
                  </View>
                  <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                    <Text style={styles.detailLabel}>Max Amount</Text>
                    <Text style={[styles.detailVal, { color: FuelColors.success }]}>₹{(item.qty * 90).toLocaleString()}</Text>
                  </View>
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
  screen: { backgroundColor: FuelColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '900', color: FuelColors.text, letterSpacing: -0.5 },
  sub: { color: FuelColors.textSecondary, marginTop: 2, fontSize: 15, fontWeight: '500' },
  statsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: { marginTop: 8 },
  searchSection: { paddingHorizontal: 20, marginTop: 12, marginBottom: 8 },
  searchInput: { backgroundColor: '#fff', borderRadius: 16 },
  sectionTitle: { marginTop: 12, marginBottom: 16, paddingHorizontal: 20 },
  list: { paddingBottom: 40 },
  emptyContainer: { marginTop: 40, paddingHorizontal: 20 },
  card: { marginHorizontal: 20, marginBottom: 16, padding: 0, overflow: 'hidden', borderRadius: 24 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleNo: { fontSize: 17, fontWeight: '900', color: FuelColors.text },
  coName: { fontSize: 11, color: FuelColors.primary, fontWeight: '700', marginTop: 2 },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FuelColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: FuelColors.background,
    marginHorizontal: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  detailItem: { flex: 1 },
  detailLabel: { 
    fontSize: 10, 
    color: FuelColors.textSecondary, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailVal: { fontSize: 14, fontWeight: '700', color: FuelColors.text },
});
