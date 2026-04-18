import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeProfile() {
  const router = useRouter();
  const { currentUser, pumps, logout, getCompaniesForPump } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const joined = getCompaniesForPump(pumpId);

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Card style={styles.card}>
        <Text style={styles.label}>Pump</Text>
        <Text style={styles.val}>{pump?.name}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Employee</Text>
        <Text style={styles.val}>{currentUser?.name}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Login</Text>
        <Text style={styles.val}>{currentUser?.loginId}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Companies your pump serves</Text>
        {joined.length === 0 ? (
          <Text style={styles.empty}>
            This pump hasn’t joined any company yet.
          </Text>
        ) : (
          joined.map((c) => (
            <View key={c.id} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.val}>{c.name}</Text>
            </View>
          ))
        )}
      </Card>
      <Button
        title="Sign out"
        variant="outline"
        onPress={() => {
          logout();
          router.replace(href('/login'));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FuelColors.text,
    padding: 20,
  },
  card: { marginHorizontal: 16, marginBottom: 20 },
  label: { fontSize: 12, color: FuelColors.textSecondary, fontWeight: '600' },
  val: { fontSize: 16, color: FuelColors.text, marginTop: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FuelColors.text,
    marginBottom: 10,
  },
  empty: { fontSize: 14, color: FuelColors.textMuted, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  bullet: {
    fontSize: 16,
    color: FuelColors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
});
