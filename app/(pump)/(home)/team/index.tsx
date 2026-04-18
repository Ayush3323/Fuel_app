import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpTeam() {
  const router = useRouter();
  const { users, currentUser } = useApp();
  const pumpId = currentUser?.pumpId;
  const team = users.filter(
    (u) => u.pumpId === pumpId && u.role === 'employee'
  );

  return (
    <Screen>
      <Header
        title="Team"
        right={
          <Pressable
            onPress={() => router.push(href('/(pump)/(home)/team/new'))}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />
      <SectionTitle title="Pump employees" />
      <ScrollView contentContainerStyle={styles.list}>
        {team.map((u) => (
          <Card key={u.id} style={styles.card}>
            <Text style={styles.name}>{u.name}</Text>
            <Text style={styles.meta}>Login: {u.loginId}</Text>
          </Card>
        ))}
        {team.length === 0 ? (
          <Text style={styles.empty}>No employees yet — optional</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: FuelColors.primary,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  name: { fontWeight: '800', fontSize: 16, color: FuelColors.text },
  meta: { color: FuelColors.textSecondary, marginTop: 4 },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
