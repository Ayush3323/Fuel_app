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
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const onSubmit = () => {
    if (!name.trim() || !loginId.trim() || !password.trim()) {
      return;
    }
    registerCompany({
      name: name.trim(),
      gstin: gstin.trim() || undefined,
      loginId: loginId.trim(),
      password,
      ownerDisplayName: ownerName.trim() || undefined,
    });
    router.replace(href('/(admin)/(tabs)/dashboard') as Href);
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
