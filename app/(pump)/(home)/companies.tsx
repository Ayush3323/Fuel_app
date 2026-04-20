import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Card, CompanyCard, EmptyState, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp, useOutstandingForLink } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

function CompanyRow({
  companyId,
  pumpId,
}: {
  companyId: string;
  pumpId: string;
}) {
  const router = useRouter();
  const { getCompany, requests, bills } = useApp();
  const company = getCompany(companyId);
  const outstanding = useOutstandingForLink(pumpId, companyId);
  const pending = requests.filter(
    (r) =>
      r.companyId === companyId &&
      r.pumpId === pumpId &&
      r.status === 'pending'
  ).length;
  const pairBills = bills
    .filter((b) => b.companyId === companyId && b.pumpId === pumpId)
    .sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  const last = pairBills[0];
  const lastLabel = last
    ? `Last bill: ${last.billNo} (${last.status})`
    : undefined;

  if (!company) return null;

  return (
    <CompanyCard
      companyName={company.name}
      outstanding={`₹ ${outstanding.toLocaleString('en-IN')}`}
      pendingCount={pending}
      lastBillLabel={lastLabel}
      onPress={() => router.push(href(`/(pump)/${companyId}/billing`))}
    />
  );
}

export default function PumpCompaniesHome() {
  const router = useRouter();
  const { currentUser, pumps, getCompaniesForPump, requests } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const companies = getCompaniesForPump(pumpId);

  return (
    <Screen>
      <Header 
        title="Dashboard" 
        subtitle={pump?.name ?? ''} 
        showBack={false}
        right={
          <Pressable
            onPress={() => router.push(href('/(pump)/(home)/join'))}
            style={styles.joinBtn}
          >
            <Text style={styles.joinTxt}>+ Link</Text>
          </Pressable>
        }
      />

      <SectionTitle title="Connected Companies" style={styles.section} />

      {companies.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title="No companies yet"
            subtitle="Tap Link Company and enter an invite code from a transport company."
          />
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CompanyRow companyId={item.id} pumpId={pumpId} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  screen: { backgroundColor: FuelColors.background },
  section: { paddingHorizontal: 20, marginTop: 8 },
  joinBtn: {
    backgroundColor: FuelColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 16 },
});
