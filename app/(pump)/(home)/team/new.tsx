import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function NewEmployeeScreen() {
  const router = useRouter();
  const { createEmployee, currentUser } = useApp();
  const pumpId = currentUser?.pumpId!;
  const [name, setName] = useState('');
  const [creds, setCreds] = useState<{ loginId: string; password: string } | null>(
    null
  );

  const onCreate = () => {
    if (!name.trim()) {
      Alert.alert('Name required');
      return;
    }
    const { loginId, password } = createEmployee(pumpId, name.trim());
    setCreds({ loginId, password });
    Alert.alert('Employee created', `${loginId} / ${password}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <Header title="Add Team Member" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.introSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color={FuelColors.primary} />
          </View>
          <Text style={styles.title}>Create Access</Text>
          <Text style={styles.subtitle}>Enter the employee name to generate unique login credentials for them.</Text>
        </View>

        <Card style={styles.formCard}>
          <Input 
            label="Employee Display Name" 
            value={name} 
            onChangeText={setName} 
            placeholder="e.g. Rahul Sharma"
            style={styles.input}
          />
        </Card>

        {creds ? (
          <Card style={styles.credCard}>
            <View style={styles.credHeader}>
              <Ionicons name="key" size={20} color={FuelColors.success} />
              <Text style={styles.credTitle}>Credentials Generated</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Login ID</Text>
              <Text style={styles.credVal}>{creds.loginId}</Text>
            </View>
            <View style={styles.credDivider} />
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Secure PIN</Text>
              <Text style={styles.credVal}>{creds.password}</Text>
            </View>
            <Text style={styles.warningText}>Please share these credentials with the employee securely.</Text>
          </Card>
        ) : null}

        <Button 
          title="Create Employee" 
          onPress={onCreate} 
          style={styles.submitBtn}
          disabled={!name.trim()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: FuelColors.background },
  body: { padding: 20, paddingBottom: 40 },
  introSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: FuelColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: FuelColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: FuelColors.surface,
  },
  credCard: { 
    backgroundColor: '#F0FDF4', 
    borderColor: '#DCFCE7',
    marginBottom: 24,
    padding: 20,
  },
  credHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  credTitle: { 
    fontWeight: '800', 
    color: FuelColors.success,
    fontSize: 15,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FuelColors.textSecondary,
    textTransform: 'uppercase',
  },
  credVal: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '800',
    color: FuelColors.text,
  },
  credDivider: {
    height: 1,
    backgroundColor: '#DCFCE7',
    marginVertical: 4,
  },
  warningText: {
    fontSize: 12,
    color: FuelColors.textMuted,
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 18,
    elevation: 4,
  },
});
