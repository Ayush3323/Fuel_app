import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Badge, Card, EmptyState, FuelTypePill, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpRequests() {
  const router = useRouter();
  const { requests, currentUser, pumps } = useApp();
  const pumpId = currentUser?.pumpId;
  const pump = pumps.find((p) => p.id === pumpId);
  const list = requests.filter(
    (r) => r.pumpId === pumpId && r.status === 'pending'
  );

  return (
    <Screen>
      <Text style={styles.title}>Pending requests</Text>
      <Text style={styles.sub}>{pump?.name}</Text>
      <SectionTitle title="Awaiting fill" />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No pending requests"
            subtitle="New company requests appear here"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push(href(`/(pump)/fill/${item.id}`))
            }
          >
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.v}>{item.vehicleNo}</Text>
                  <FuelTypePill fuel={item.fuel} />
                  <Text style={styles.meta}>{item.qty} L requested</Text>
                </View>
                <Badge status="pending" />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FuelColors.text,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sub: { color: FuelColors.textSecondary, paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  v: { fontSize: 18, fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 8, color: FuelColors.textSecondary },
});
