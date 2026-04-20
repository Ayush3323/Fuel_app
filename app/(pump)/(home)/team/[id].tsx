import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function EmployeeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { users, transactions } = useApp();
  const user = users.find((u) => u.id === id);

  const userTransactions = transactions.filter((t) => t.filledByUserId === id);
  const totalVolume = userTransactions.reduce((acc, t) => acc + t.actualQty, 0);
  const totalValue = userTransactions.reduce((acc, t) => acc + t.gross, 0);

  if (!user) {
    return (
      <Screen>
        <Header title="Not Found" />
        <View style={styles.errorContainer}>
          <Text>Employee not found.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <Header title="Employee Details" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Pump Operator</Text>
          </View>
        </View>

        <View style={styles.content}>
          <SectionTitle title="IDENTIFICATION" />
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="finger-print" size={20} color={FuelColors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.label}>Login ID</Text>
                <Text style={styles.val}>{user.loginId}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color={FuelColors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.label}>Login Password</Text>
                <Text style={styles.val}>{user.password}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={FuelColors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.label}>Joined On</Text>
                <Text style={styles.val}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>


          <View style={styles.actions}>
            <Button
              title="Reset Password"
              variant="outline"
              style={styles.resetBtn}
              onPress={() => Alert.alert('Request Sent', `A password reset link for ${user.name} has been generated and sent to your contact number.`)}
            />
            <Button
              title="Deactivate Account"
              variant="danger"
              style={styles.deactivateBtn}
              onPress={() => Alert.alert(
                'Deactivate Employee?',
                'This will prevent the employee from logging in. You can reactivate them later.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Deactivate', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Deactivated', `${user.name} has been successfully deactivated.`);
                      router.back();
                    }
                  }
                ]
              )}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: FuelColors.background },
  scroll: { paddingBottom: 40 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: FuelColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 24, fontWeight: '900', color: FuelColors.text },
  roleBadge: {
    backgroundColor: FuelColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: FuelColors.primary,
    textTransform: 'uppercase',
  },
  content: { padding: 20 },
  infoCard: { padding: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoText: { marginLeft: 16, flex: 1 },
  label: { fontSize: 11, color: FuelColors.textSecondary, fontWeight: '800', textTransform: 'uppercase' },
  val: { fontSize: 16, color: FuelColors.text, marginTop: 2, fontWeight: '600' },
  divider: { height: 1, backgroundColor: FuelColors.background, marginLeft: 52 },
  actions: { marginTop: 32, gap: 16 },
  resetBtn: {
    borderRadius: 18,
    borderWidth: 2,
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deactivateBtn: {
    borderRadius: 18,
    shadowColor: FuelColors.danger,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
