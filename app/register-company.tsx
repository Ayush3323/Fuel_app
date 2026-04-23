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

export default function RegisterCompanyScreen() {
  const router = useRouter();
  const { registerCompany } = useApp();
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async () => {
    setErr('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErr('Company name, email and password are required');
      return;
    }
    try {
      await registerCompany({
        name: name.trim(),
        gstin: gstin.trim() || undefined,
        email: email.trim(),
        password,
        ownerDisplayName: ownerName.trim() || undefined,
      });
      router.replace(href('/(admin)/(tabs)/dashboard') as Href);
    } catch (e: any) {
      setErr(e?.message || 'Could not create company account');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Register company</Text>
          <Text style={styles.sub}>
            Create your transport company. You will invite pumps with codes from
            the Invites tab.
          </Text>
          <Card>
            <Input label="Company name" value={name} onChangeText={setName} />
            <Input
              label="GSTIN (optional)"
              value={gstin}
              onChangeText={setGstin}
            />
            <Input
              label="Your display name (optional)"
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Rahul Sharma"
            />
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {err ? <Text style={styles.err}>{err}</Text> : null}
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
  err: { color: FuelColors.danger, marginBottom: 10, fontSize: 13 },
});
