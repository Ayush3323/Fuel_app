import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function RegisterEmployeeScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async () => {
    setErr('');
    if (!email.trim() || !password.trim()) {
      setErr('Email and password required');
      return;
    }
    try {
      const { signUp } = await import('@/src/firebase/auth');
      await signUp(email.trim(), password);
      const user = await login(email.trim(), password);
      if (!user) {
        setErr(
          'Invite not found for this email. Ask owner to add you in Team first, then try again.'
        );
        return;
      }
      if (user.companyId) {
        router.replace('/companyEmployee/(tabs)/pending');
        return;
      }
      router.replace('/(employee)/(tabs)/pending');
    } catch (e: any) {
      setErr(e?.message || 'Could not create employee account for this invite');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Employee signup</Text>
          <Text style={styles.sub}>Use the invited email from your pump owner or company owner to create your password.</Text>
          <Card>
            <Input
              label="Invited email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Create password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <Button title="Create employee account" onPress={onSubmit} />
          </Card>
          <Button title="Back to login" variant="outline" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: FuelColors.text },
  sub: { color: FuelColors.textSecondary, marginVertical: 16, lineHeight: 20 },
  err: { color: FuelColors.danger, marginBottom: 12 },
});
