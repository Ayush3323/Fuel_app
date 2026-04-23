import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { href } from '@/src/utils/routerHref';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { User } from '@/src/types';
import { sendPasswordReset } from '@/src/firebase/auth';

function routeForRole(user: User): Href {
  if (user.role === 'admin') return href('/(admin)/(tabs)/dashboard');
  if (user.role === 'pumpOwner') return href('/(pump)/(home)/companies');
  if (user.role === 'employee' && user.companyId) return href('/companyEmployee/(tabs)/pending');
  return href('/(employee)/(tabs)/pending');
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onLogin = async () => {
    setErr('');
    let u = null;
    try {
      u = await login(email.trim(), password);
    } catch {
      setErr('Invalid email or password');
      return;
    }
    if (!u) {
      setErr('Invalid email or password');
      return;
    }
    router.replace(routeForRole(u));
  };

  const onForgotPassword = async () => {
    if (!email.trim()) {
      setErr('Enter email first to reset password');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setErr('Password reset email sent');
    } catch {
      setErr('Could not send reset email');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>Fuel Credit</Text>
          <Text style={styles.hint}>Sign in with pump or company credentials</Text>

          <Card style={styles.card}>
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <Button title="Sign in" onPress={onLogin} />
            <Button title="Forgot password" variant="outline" onPress={onForgotPassword} />
          </Card>

          <View style={styles.regRow}>
            <Button
              title="Register company"
              variant="secondary"
              onPress={() => router.push(href('/register-company'))}
            />
            <Button
              title="Register pump"
              variant="secondary"
              onPress={() => router.push(href('/register-pump'))}
            />
            <Button
              title="Employee signup"
              variant="secondary"
              onPress={() => router.push(href('/register-employee'))}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: FuelColors.text,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: FuelColors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  card: { marginBottom: 16 },
  err: { color: FuelColors.danger, marginBottom: 12, fontSize: 14 },
  regRow: { gap: 10, marginBottom: 24 },
});
