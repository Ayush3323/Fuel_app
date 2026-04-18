import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
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
    <Screen>
      <Header title="New employee" />
      <ScrollView contentContainerStyle={styles.body}>
        <Input label="Display name" value={name} onChangeText={setName} />
        {creds ? (
          <Card style={styles.cred}>
            <Text style={styles.credTitle}>Credentials</Text>
            <Text style={styles.line}>ID: {creds.loginId}</Text>
            <Text style={styles.line}>Pass: {creds.password}</Text>
          </Card>
        ) : null}
        <Button title="Create employee" onPress={onCreate} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  cred: { backgroundColor: FuelColors.primaryMuted, marginBottom: 16 },
  credTitle: { fontWeight: '800', marginBottom: 8 },
  line: { fontFamily: 'monospace', marginTop: 4 },
});
