import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen, Header } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeProfile() {
  const { currentUser, getCompany, logout } = useApp();
  const company = getCompany(currentUser?.companyId ?? '');

  return (
    <Screen>
      <Header title="My Profile" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topPad} />
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.role}>Company Employee</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.val}>{company?.name || '---'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Login ID</Text>
            <Text style={styles.val}>{currentUser?.loginId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>User Role</Text>
            <Text style={styles.val}>{currentUser?.role}</Text>
          </View>
        </Card>

        <View style={styles.btnRow}>
          <Button
            title="Logout Account"
            variant="outline"
            onPress={logout}
          />
        </View>
        
        <Text style={styles.version}>FuelFlow v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  topPad: { height: 30 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarTxt: { fontSize: 32, fontWeight: '800', color: 'white' },
  name: { fontSize: 24, fontWeight: '800', color: FuelColors.text },
  role: { fontSize: 14, color: FuelColors.textSecondary, marginTop: 4, fontWeight: '600' },
  infoCard: { padding: 8, marginBottom: 32 },
  infoRow: { padding: 16 },
  label: { fontSize: 13, color: FuelColors.textSecondary, marginBottom: 4, fontWeight: '600' },
  val: { fontSize: 16, fontWeight: '700', color: FuelColors.text },
  divider: { height: 1, backgroundColor: FuelColors.border, marginHorizontal: 16 },
  btnRow: { marginTop: 8 },
  version: { 
    textAlign: 'center', 
    color: FuelColors.textMuted, 
    fontSize: 12, 
    marginTop: 32,
    fontWeight: '500'
  },
});
