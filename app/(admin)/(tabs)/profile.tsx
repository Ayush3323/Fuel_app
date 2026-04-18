import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function AdminProfile() {
  const router = useRouter();
  const { currentUser, company, logout } = useApp();

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Card style={styles.card}>
        <Text style={styles.label}>Company</Text>
        <Text style={styles.val}>{company.name}</Text>
        {company.gstin ? (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>GSTIN</Text>
            <Text style={styles.val}>{company.gstin}</Text>
          </>
        ) : null}
        <Text style={[styles.label, { marginTop: 12 }]}>Signed in as</Text>
        <Text style={styles.val}>
          {currentUser?.name} ({currentUser?.loginId})
        </Text>
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
