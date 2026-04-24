import { FuelColors } from '@/constants/theme';
import { Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp, useOutstandingForLink } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.addr}>{address}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.outstanding}>₹{outstanding.toLocaleString('en-IN')}</Text>
              {pending > 0 && <Text style={styles.pendingBadge}>{pending} pending</Text>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FuelColors.textMuted} />
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
      <Header title="Linked Pumps" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.note}>
          Manage linked pumps and outstanding credit. Invite new pumps from More -> Invites.
        </Text>
        
        <View style={styles.headingWrap}>
          <SectionTitle title="Fuel Stations" />
        </View>

        <View style={styles.list}>
          {pumps.map((p) => (
            <PumpRow
              key={p.id}
              id={p.id}
              name={p.name}
              address={p.address}
              companyId={companyId}
            />
          ))}
          {pumps.length === 0 && (
            <Text style={styles.empty}>No pumps linked yet. Use + Invite to share a code with pump owners.</Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  note: {
    color: FuelColors.textSecondary,
    fontSize: 13,
    marginBottom: 20,
    paddingHorizontal: 2,
    fontWeight: '500'
  },
  headingWrap: { marginBottom: 6 },
  list: { },
  card: { marginBottom: 12, padding: 14 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: FuelColors.text },
  addr: { color: FuelColors.textSecondary, marginTop: 4, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  outstanding: { color: FuelColors.primary, fontSize: 14, fontWeight: '700' },
  pendingBadge: { 
    backgroundColor: '#FFF4ED', 
    color: '#D44D00', 
    fontSize: 11, 
    fontWeight: '700', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6 
  },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 32, fontSize: 14 },
});
