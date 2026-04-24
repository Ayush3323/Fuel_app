import { FuelColors } from '@/constants/theme';
import { Badge, Card, EmptyState, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PAGE_SIZE = 12;

export default function CompanyTeamTab() {
  const router = useRouter();
  const { users, currentUser } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const employees = useMemo(
    () => users.filter((u) => u.role === 'employee' && u.companyId === companyId),
    [users, companyId]
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleEmployees = useMemo(() => employees.slice(0, visibleCount), [employees, visibleCount]);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [employees.length]);

  return (
    <Screen>
      <Header
        title="Company Team"
        showBack={false}
        right={
          <Pressable
            onPress={() => router.push(href('/(admin)/employee-new'))}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />
      <View style={styles.headerRow}>
        <SectionTitle title="Company Employees" style={styles.sectionTitle} />
        <Badge status="raised" label={`${employees.length} Active`} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visibleEmployees.map((u) => (
          <Card key={u.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.meta}>{u.email}</Text>
              </View>
            </View>
          </Card>
        ))}
        {employees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="No company employees yet"
              subtitle="Add team members so they can raise and track company requests."
            />
          </View>
        ) : null}
        {visibleCount < employees.length ? (
          <Pressable style={styles.loadMoreBtn} onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            <Text style={styles.loadMoreTxt}>Load More Employees</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: FuelColors.primary,
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { marginTop: 0, marginBottom: 0 },
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  card: { marginBottom: 16, padding: 16 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: FuelColors.primary },
  info: { flex: 1 },
  name: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  emptyContainer: { marginTop: 80 },
  loadMoreBtn: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: FuelColors.surface,
    marginTop: 4,
  },
  loadMoreTxt: { color: FuelColors.primary, fontWeight: '700', fontSize: 12 },
});
