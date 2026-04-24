import { FuelColors } from '@/constants/theme';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { sendPasswordReset } from '@/src/firebase/auth';
import type { User } from '@/src/types';
import { href } from '@/src/utils/routerHref';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'app/no-native-firebase':
      return 'This web build does not support Firebase native auth. Use Android/iOS app.';
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/user-not-found':
      return 'No account found for this email';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network issue. Check your internet and try again.';
    case 'firestore/unavailable':
      return 'Server temporarily unavailable. Please retry in a moment.';
    default:
      return 'Unable to sign in right now. Please try again.';
  }
}

/* ---------- Route Logic ---------- */
function routeForRole(user: User): Href {
  if (user.role === 'admin') return href('/(admin)/(tabs)/dashboard');
  if (user.role === 'pumpOwner') return href('/(pump)/(home)/dashboard');
  if (user.role === 'employee' && user.companyId)
    return href('/companyEmployee/(tabs)/pending');
  return href('/(employee)/(tabs)/pending');
}

/* ---------- Screen ---------- */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------- Validation ---------- */
  const isValid = email.trim() && password.trim();

  /* ---------- Login ---------- */
  const onLogin = async () => {
    if (!isValid || loading) return;

    setLoading(true);
    setError('');

    try {
      const user = await login(email.trim(), password);

      if (!user) {
        setError('Account exists but profile is not set up yet. Contact admin/support.');
        return;
      }

      router.replace(routeForRole(user));
    } catch (e) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Forgot Password ---------- */
  const onForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter email first');
      return;
    }

    try {
      await sendPasswordReset(email.trim());
      setError('');
      alert('Password reset email sent');
    } catch {
      setError('Failed to send reset email');
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
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- Header ---------- */}
          <View style={styles.hero}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FUEL CREDIT</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage fuel requests and operations
            </Text>
          </View>

          {/* ---------- Form ---------- */}
          <Card style={styles.card}>
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              placeholder="you@company.com"
              editable={!loading}
            />

            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              placeholder="••••••••"
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={loading ? 'Signing in...' : 'Sign in'}
              onPress={onLogin}
              disabled={!isValid || loading}
              style={[
                styles.loginBtn,
                (!isValid || loading) && styles.disabledBtn,
              ]}
            />

            <Button
              title="Forgot password?"
              variant="outline"
              onPress={onForgotPassword}
              disabled={loading}
            />
          </Card>

          {/* ---------- Register CTA ---------- */}
          <View style={styles.registerWrap}>
            <Text style={styles.registerText}>New here?</Text>

            <Button
              title="Create Account"
              variant="secondary"
              onPress={() => router.push(href('/register'))}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },

  scroll: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },

  badge: {
    backgroundColor: FuelColors.primaryMuted,
    borderColor: FuelColors.primary,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },

  badgeText: {
    color: FuelColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: FuelColors.text,
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    color: FuelColors.textSecondary,
    marginTop: 6,
    fontSize: 14,
  },

  card: {
    padding: 18,
    marginBottom: 20,
  },

  error: {
    color: FuelColors.danger,
    marginBottom: 10,
    fontSize: 13,
  },

  loginBtn: {
    marginBottom: 10,
  },

  disabledBtn: {
    opacity: 0.5,
  },

  registerWrap: {
    alignItems: 'center',
    gap: 10,
  },

  registerText: {
    color: FuelColors.textSecondary,
    fontSize: 13,
  },
});