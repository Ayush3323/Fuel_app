import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

export default function RegisterPumpScreen() {
  const router = useRouter();
  const { registerPump } = useApp();
  const [pumpName, setPumpName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const onSubmit = () => {
    if (
      !pumpName.trim() ||
      !address.trim() ||
      !contact.trim() ||
      !loginId.trim() ||
      !password.trim()
    ) {
      return;
    }
    registerPump({
      name: pumpName.trim(),
      address: address.trim(),
      contact: contact.trim(),
      loginId: loginId.trim(),
      password,
      ownerDisplayName: ownerName.trim() || undefined,
    });
    router.replace(href('/(pump)/(home)/companies') as Href);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Register pump</Text>
          <Text style={styles.sub}>
            Create your petrol pump account. Join transport companies with invite
            codes they send you.
          </Text>
          <Card>
            <Input label="Pump / station name" value={pumpName} onChangeText={setPumpName} />
            <Input label="Address" value={address} onChangeText={setAddress} />
            <Input label="Contact" value={contact} onChangeText={setContact} />
            <Input
              label="Owner display name (optional)"
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <Input
              label="Login ID"
              autoCapitalize="none"
              value={loginId}
              onChangeText={setLoginId}
            />
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title="Create account" onPress={onSubmit} />
          </Card>
          <Button
            title="Back to sign in"
            variant="outline"
            onPress={() => router.back()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: FuelColors.text },
  sub: { color: FuelColors.textSecondary, marginVertical: 16, lineHeight: 22 },
});
