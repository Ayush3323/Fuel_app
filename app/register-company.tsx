import { FuelColors } from '@/constants/theme';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native';

/* ---------- Validators ---------- */

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidGSTIN = (gst: string) =>
  !gst || /^[0-9A-Z]{15}$/.test(gst);

/* ---------- Screen ---------- */

export default function RegisterCompanyScreen() {
  const router = useRouter();
  const { registerCompany } = useApp();
  const scrollRef = useRef<ScrollView | null>(null);

  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollForFocus = (y: number, forceEnd = false) => {
    scrollRef.current?.scrollTo({ y, animated: true });
    if (forceEnd) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  };

  /* ---------- Validation ---------- */

  const isFormValid =
    name.trim() &&
    email.trim() &&
    password.length >= 6 &&
    isValidEmail(email) &&
    isValidGSTIN(gstin);

  /* ---------- Submit ---------- */

  const onSubmit = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setError('');

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
      setError(e?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>Create Company Account</Text>
          <Text style={styles.sub}>
            Register your company and manage fuel operations
          </Text>

          {/* Form */}
          <Card style={styles.card}>
            <Input
              label="Company name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(130)}
            />

            <Input
              label="GSTIN (optional)"
              value={gstin}
              onChangeText={(t) => {
                setGstin(t.toUpperCase());
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(180)}
            />

            <Input
              label="Owner name (optional)"
              value={ownerName}
              onChangeText={(t) => {
                setOwnerName(t);
                setError('');
              }}
              placeholder="e.g. Rahul Sharma"
              editable={!loading}
              onFocus={() => scrollForFocus(230)}
            />

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
              onFocus={() => scrollForFocus(290)}
            />

            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              placeholder="Minimum 6 characters"
              editable={!loading}
              onFocus={() => scrollForFocus(350, true)}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={loading ? 'Creating account...' : 'Create account'}
              onPress={onSubmit}
              disabled={!isFormValid || loading}
              style={[
                styles.submitBtn,
                (!isFormValid || loading) && styles.disabledBtn,
              ]}
            />
          </Card>

          {/* Back */}
          <Button
            title="Back to sign in"
            variant="outline"
            onPress={() => router.back()}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },

  body: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 72,
    flexGrow: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '900',
    color: FuelColors.text,
  },

  sub: {
    color: FuelColors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
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

  submitBtn: {
    marginTop: 6,
  },

  disabledBtn: {
    opacity: 0.5,
  },
});