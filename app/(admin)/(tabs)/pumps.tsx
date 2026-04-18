import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp, useOutstandingForPump } from '@/src/context/AppContext';

function PumpRow({
  id,
  name,
  address,
}: {
  id: string;
  name: string;
  address: string;
}) {
  const router = useRouter();
  const outstanding = useOutstandingForPump(id);
  const { requests } = useApp();
  const pending = requests.filter(
    (r) => r.pumpId === id && r.status === 'pending'
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
  const router = useRouter();
  const { pumps } = useApp();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Petrol pumps</Text>
        <Pressable
          onPress={() => router.push(href('/(admin)/pumps/new'))}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      <SectionTitle title="Connected pumps" />
      <ScrollView contentContainerStyle={styles.list}>
        {pumps.map((p) => (
          <PumpRow key={p.id} id={p.id} name={p.name} address={p.address} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', color: FuelColors.text },
  addBtn: {
    backgroundColor: FuelColors.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: FuelColors.text },
  addr: { color: FuelColors.textSecondary, marginTop: 4, fontSize: 13 },
  sub: { color: FuelColors.primary, marginTop: 8, fontSize: 13, fontWeight: '600' },
});
