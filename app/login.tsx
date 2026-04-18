import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import type { Role } from '@/src/types';

const DEV_USERS: { label: string; loginId: string; role: Role }[] = [
  { label: 'Company', loginId: 'admin', role: 'admin' },
  { label: 'Pump 1', loginId: 'pump1', role: 'pumpOwner' },
  { label: 'Pump 2', loginId: 'pump2', role: 'pumpOwner' },
  { label: 'Employee', loginId: 'emp1', role: 'employee' },
];

function routeForRole(role: Role): Href {
  if (role === 'admin') return href('/(admin)/(tabs)/dashboard');
  if (role === 'pumpOwner') return href('/(pump)/(tabs)/requests');
  return href('/(employee)/(tabs)/pending');
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, devSwitchUser, users } = useApp();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onLogin = () => {
    setErr('');
    const u = login(loginId.trim(), password);
    if (!u) {
      setErr('Invalid ID or password');
      return;
    }
    router.replace(routeForRole(u.role));
  };

  const onDevChip = (lid: string) => {
    devSwitchUser(lid);
    const u = users.find((x) => x.loginId.toLowerCase() === lid.toLowerCase());
    if (u) router.replace(routeForRole(u.role));
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
              label="User ID"
              autoCapitalize="none"
              value={loginId}
              onChangeText={setLoginId}
              placeholder="e.g. admin"
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
          </Card>

          <Text style={styles.devTitle}>Dev: jump as</Text>
          <View style={styles.chips}>
            {DEV_USERS.map((d) => (
              <Pressable
                key={d.loginId}
                onPress={() => onDevChip(d.loginId)}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.chipText}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.devNote}>
            Demo only — switches user without password check.
          </Text>
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
  card: { marginBottom: 24 },
  err: { color: FuelColors.danger, marginBottom: 12, fontSize: 14 },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: FuelColors.textMuted,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: FuelColors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  chipText: { color: FuelColors.primary, fontWeight: '700', fontSize: 13 },
  devNote: {
    marginTop: 16,
    fontSize: 11,
    color: FuelColors.textMuted,
  },
});
