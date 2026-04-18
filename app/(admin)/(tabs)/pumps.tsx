import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp, useOutstandingForLink } from '@/src/context/AppContext';

function PumpRow({
  id,
  name,
  address,
  companyId,
}: {
  id: string;
  name: string;
  address: string;
  companyId: string;
}) {
  const router = useRouter();
  const outstanding = useOutstandingForLink(id, companyId);
  const { requests } = useApp();
  const pending = requests.filter(
    (r) =>
      r.pumpId === id &&
      r.companyId === companyId &&
      r.status === 'pending'
  ).length;

  return (
    <Pressable onPress={() => router.push(href(`/(admin)/pumps/${id}`))}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.addr}>{address}</Text>
            <Text style={styles.sub}>
              Outstanding ₹{outstanding.toLocaleString('en-IN')} · {pending}{' '}
              pending
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={FuelColors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function PumpsList() {
  const { currentUser, getPumpsForCompany } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const pumps = getPumpsForCompany(companyId);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Petrol pumps</Text>
      </View>
      <Text style={styles.note}>
        Pumps join via invite code. Generate codes in the Invites tab.
      </Text>
      <SectionTitle title="Linked pumps" />
      <ScrollView contentContainerStyle={styles.list}>
        {pumps.map((p) => (
          <PumpRow
            key={p.id}
            id={p.id}
            name={p.name}
            address={p.address}
            companyId={companyId}
          />
        ))}
        {pumps.length === 0 ? (
          <Text style={styles.empty}>No pumps linked yet. Share an invite code.</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', color: FuelColors.text },
  note: {
    paddingHorizontal: 20,
    color: FuelColors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: FuelColors.text },
  addr: { color: FuelColors.textSecondary, marginTop: 4, fontSize: 13 },
  sub: { color: FuelColors.primary, marginTop: 8, fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
