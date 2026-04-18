import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function NewPumpScreen() {
  const router = useRouter();
  const { createPump } = useApp();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [creds, setCreds] = useState<{
    loginId: string;
    password: string;
  } | null>(null);

  const onCreate = () => {
    if (!name.trim() || !address.trim() || !contact.trim()) {
      Alert.alert('Missing fields', 'Fill all fields');
      return;
    }
    const { pump, ownerLoginId, ownerPassword } = createPump({
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
    });
    setCreds({ loginId: ownerLoginId, password: ownerPassword });
    Alert.alert('Pump created', 'Share credentials with the pump owner.', [
      { text: 'OK', onPress: () => router.replace(href(`/(admin)/pumps/${pump.id}`)) },
    ]);
  };

  return (
    <Screen>
      <Header title="Add petrol pump" />
      <ScrollView contentContainerStyle={styles.body}>
        <Input label="Pump name" value={name} onChangeText={setName} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input label="Contact" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
        {creds ? (
          <Card style={styles.cred}>
            <Text style={styles.credTitle}>Owner login (share securely)</Text>
            <Text style={styles.credLine}>ID: {creds.loginId}</Text>
            <Text style={styles.credLine}>Pass: {creds.password}</Text>
          </Card>
        ) : null}
        <Button title="Create pump" onPress={onCreate} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  cred: { backgroundColor: FuelColors.primaryMuted, marginBottom: 16 },
  credTitle: { fontWeight: '800', marginBottom: 8, color: FuelColors.text },
  credLine: { fontFamily: 'monospace', color: FuelColors.text, marginTop: 4 },
});
