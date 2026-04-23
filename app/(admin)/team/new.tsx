import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function NewCompanyEmployeeScreen() {
  const router = useRouter();
  const { createCompanyEmployee, currentUser } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onCreate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Name and email required');
      return;
    }
    await createCompanyEmployee(companyId, name.trim(), email.trim());
    Alert.alert('Invite sent', `${email.trim()} can now complete signup from the login screen.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <Header title="Add Company Employee" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.introSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color={FuelColors.primary} />
          </View>
          <Text style={styles.title}>Create Company Access</Text>
          <Text style={styles.subtitle}>
            Enter employee name and email to send company employee signup invite.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Employee Display Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul Sharma"
            style={styles.input}
          />
          <Input
            label="Employee Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="employee@company.com"
            style={styles.input}
          />
        </Card>

        <Button
          title="Create Employee"
          onPress={onCreate}
          style={styles.submitBtn}
          disabled={!name.trim() || !email.trim()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: FuelColors.background },
  body: { padding: 20, paddingBottom: 40 },
  introSection: { alignItems: 'center', marginVertical: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '900', color: FuelColors.text },
  subtitle: {
    fontSize: 14,
    color: FuelColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: { padding: 20, marginBottom: 20 },
  input: { backgroundColor: FuelColors.surface },
  submitBtn: { marginTop: 8, borderRadius: 18 },
});
