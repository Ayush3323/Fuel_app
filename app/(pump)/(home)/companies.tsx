import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { CompanyCard, EmptyState, Screen } from '@/src/components/ui';
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
      onPress={() => router.push(href(`/(pump)/${companyId}/requests`))}
    />
  );
}

export default function PumpCompaniesHome() {
  const router = useRouter();
  const { currentUser, pumps, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const companies = getCompaniesForPump(pumpId);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Companies</Text>
          <Text style={styles.sub}>{pump?.name ?? 'Pump'}</Text>
        </View>
        <Pressable
          onPress={() => router.push(href('/(pump)/(home)/join'))}
          style={styles.joinBtn}
        >
          <Text style={styles.joinTxt}>Join</Text>
        </Pressable>
      </View>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          subtitle="Tap Join and enter an invite code from a transport company."
        />
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CompanyRow companyId={item.id} pumpId={pumpId} />
          )}
        />
      )}

      <View style={styles.footer}>
        <Pressable
          style={styles.link}
          onPress={() => router.push(href('/(pump)/(home)/team'))}
        >
          <Ionicons name="people-outline" size={20} color={FuelColors.primary} />
          <Text style={styles.linkTxt}>Team</Text>
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => router.push(href('/(pump)/(home)/profile'))}
        >
          <Ionicons name="person-outline" size={20} color={FuelColors.primary} />
          <Text style={styles.linkTxt}>Profile</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: FuelColors.text },
  sub: { color: FuelColors.textSecondary, marginTop: 4 },
  joinBtn: {
    backgroundColor: FuelColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FuelColors.border,
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkTxt: { color: FuelColors.primary, fontWeight: '700' },
});
