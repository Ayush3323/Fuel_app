import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeProfile() {
  const router = useRouter();
  const { currentUser, pumps, logout } = useApp();
  const pump = pumps.find((p) => p.id === currentUser?.pumpId);

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
});
