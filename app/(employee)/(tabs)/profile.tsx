import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen, Header } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function PumpEmployeeProfile() {
  const { currentUser, pumps, logout } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);

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
          <Text style={styles.role}>Pump Staff Member</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Pump</Text>
            <Text style={styles.val}>{pump?.name || '---'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Login Username</Text>
            <Text style={styles.val}>{currentUser?.loginId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Access Level</Text>
            <Text style={styles.val}>{currentUser?.role}</Text>
          </View>
        </Card>

        <View style={styles.btnRow}>
          <Button
            title="Sign Out"
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
  body: { padding: 16, paddingBottom: 40 },
  topPad: { height: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarTxt: { fontSize: 28, fontWeight: '800', color: 'white' },
  name: { fontSize: 20, fontWeight: '800', color: FuelColors.text },
  role: { fontSize: 13, color: FuelColors.textSecondary, marginTop: 2, fontWeight: '600' },
  infoCard: { padding: 4, marginBottom: 24 },
  infoRow: { padding: 14 },
  label: { fontSize: 12, color: FuelColors.textSecondary, marginBottom: 2, fontWeight: '600' },
  val: { fontSize: 15, fontWeight: '700', color: FuelColors.text },
  divider: { height: 1, backgroundColor: FuelColors.border, marginHorizontal: 12 },
  btnRow: { marginTop: 4 },
  version: { 
    textAlign: 'center', 
    color: FuelColors.textMuted, 
    fontSize: 11, 
    marginTop: 24,
    fontWeight: '500'
  },
});
