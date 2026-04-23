import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function PumpHomeCompleted() {
  const { transactions, currentUser, pumps, users, getCompany, getCompaniesForPump } =
    useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const linked = getCompaniesForPump(pumpId);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let t = transactions.filter(
      (x) => x.pumpId === pumpId && (filter === 'all' || x.companyId === filter)
    );
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      t = t.filter((x) => x.vehicleNo.toLowerCase().includes(qq));
    }
    return t.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, pumpId, filter, q]);


  return (
    <Screen style={styles.screen}>
      <Header 
        title="History" 
        subtitle={pump?.name ?? ''} 
        showBack={false} 
        right={
          <View style={styles.statsIconBox}>
            <Ionicons name="analytics" size={22} color={FuelColors.primary} />
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
                label="Search Transactions"
                value={q}
                onChangeText={setQ}
                placeholder="Enter vehicle number"
                style={styles.searchInput}
                leftIcon={<Ionicons name="search" size={18} color={FuelColors.textMuted} />}
              />
            </View>

            <SectionTitle title="Recent Successful Fills" style={styles.sectionTitle} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState 
              title="No transactions found" 
              subtitle="Try adjusting your filters or search query." 
            />
          </View>
        }
        renderItem={({ item }) => {
          const filler = users.find((u) => u.id === item.filledByUserId);
          const co = getCompany(item.companyId);
          const showCo = filter === 'all';
          return (
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
                <View style={styles.rightInfo}>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                  <Text style={styles.amountText}>
                    ₹{item.gross.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fuel Type</Text>
                  <FuelTypePill fuel={item.fuel} />
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailVal}>{item.actualQty} L</Text>
                </View>
                <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.detailLabel}>Served By</Text>
                  <Text style={styles.fillerText}>{filler?.name?.split(' ')[0]}</Text>
                </View>
              </View>
            </Card>
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
  filterSection: { marginTop: 16 },
  searchSection: { paddingHorizontal: 0, marginTop: 12, marginBottom: 8 },
  searchInput: { backgroundColor: '#fff', borderRadius: 16 },
  sectionTitle: { marginTop: 12, marginBottom: 16, paddingHorizontal: 0 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyContainer: { marginTop: 40 },
  card: { marginBottom: 16, padding: 0, overflow: 'hidden', borderRadius: 24 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
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
  rightInfo: { alignItems: 'flex-end' },
  dateText: {
    fontSize: 12,
    color: FuelColors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: FuelColors.success,
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
  fillerText: { fontSize: 13, fontWeight: '600', color: FuelColors.textSecondary },
});
