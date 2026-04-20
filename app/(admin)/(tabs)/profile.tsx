import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Screen, Header } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function AdminProfile() {
  const { currentUser, getCompany, logout } = useApp();
  const company = getCompany(currentUser?.companyId ?? '');

  return (
    <Screen>
      <Header title="Admin Settings" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topPad} />
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.role}>Company Administrator</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Company Name</Text>
            <Text style={styles.val}>{company?.name || '---'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Admin ID</Text>
            <Text style={styles.val}>{currentUser?.loginId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Account Status</Text>
            <Text style={styles.val}>Active Verified</Text>
          </View>
        </Card>

        <View style={styles.btnRow}>
          <Button
            title="Update Profile"
            variant="outline"
            onPress={() => {}}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Log Out"
            variant="outline"
            onPress={logout}
          />
        </View>
        
        <Text style={styles.version}>FuelFlow Enterprise v1.2.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  topPad: { height: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarTxt: { fontSize: 32, fontWeight: '800', color: 'white' },
  name: { fontSize: 22, fontWeight: '800', color: FuelColors.text },
  role: { fontSize: 13, color: FuelColors.textSecondary, marginTop: 4, fontWeight: '600' },
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
    marginTop: 32,
    fontWeight: '500'
  },
});
