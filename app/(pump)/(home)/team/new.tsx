import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';

export default function NewEmployeeScreen() {
  const router = useRouter();
  const { createEmployee, currentUser } = useApp();
  const pumpId = currentUser?.pumpId!;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onCreate = async () => {
    if (!name.trim() || !email.trim()) {
      appAlert('Name and email required');
      return;
    }
    await createEmployee(pumpId, name.trim(), email.trim());
    appAlert('Invite sent', `${email.trim()} can now complete signup from the login screen.`, [
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
          <Text style={styles.subtitle}>Enter employee name and email to send password setup invite.</Text>
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
  submitBtn: {
    marginTop: 8,
    borderRadius: 18,
    elevation: 4,
  },
});
