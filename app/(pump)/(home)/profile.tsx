import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpProfile() {
  const router = useRouter();
  const { currentUser, pumps, logout } = useApp();
  const pump = pumps.find((p) => p.id === currentUser?.pumpId);

  return (
    <Screen>
      <Header title="Profile" />
      <Card style={styles.card}>
        <Text style={styles.label}>Pump</Text>
        <Text style={styles.val}>{pump?.name}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Signed in as</Text>
        <Text style={styles.val}>
          {currentUser?.name} (Owner)
        </Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Login ID</Text>
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
  card: { marginHorizontal: 16, marginTop: 8, marginBottom: 20 },
  label: { fontSize: 12, color: FuelColors.textSecondary, fontWeight: '600' },
  val: { fontSize: 16, color: FuelColors.text, marginTop: 4 },
});
