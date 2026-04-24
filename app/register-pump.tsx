import { useRef, useState } from 'react';
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
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

export default function RegisterPumpScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const { registerPump } = useApp();
  const [pumpName, setPumpName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
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

  const isFormValid =
    pumpName.trim() &&
    address.trim() &&
    contact.trim() &&
    email.trim() &&
    password.length >= 6;

  const onSubmit = async () => {
    if (!isFormValid || loading) return;
    setError('');
    setLoading(true);
    try {
      await registerPump({
        name: pumpName.trim(),
        address: address.trim(),
        contact: contact.trim(),
        email: email.trim(),
        password,
        ownerDisplayName: ownerName.trim() || undefined,
      });
      router.replace(href('/(pump)/(home)/companies') as Href);
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
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Pump Account</Text>
            <Text style={styles.sub}>
              Register your fuel station and connect with transport companies.
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Pump / station name"
              placeholder="e.g. Reliable Fuels"
              value={pumpName}
              onChangeText={(t) => {
                setPumpName(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(130)}
            />
            <Input
              label="Address"
              placeholder="Full location details"
              value={address}
              onChangeText={(t) => {
                setAddress(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(190)}
            />
            <Input
              label="Contact number"
              keyboardType="phone-pad"
              placeholder="+91 XXXXX XXXXX"
              value={contact}
              onChangeText={(t) => {
                setContact(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(250)}
            />
            <Input
              label="Owner name"
              placeholder="Full name for display"
              value={ownerName}
              onChangeText={(t) => {
                setOwnerName(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(300)}
            />
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="owner@pump.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(380)}
            />
            <Input
              label="Password"
              secureTextEntry
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              editable={!loading}
              onFocus={() => scrollForFocus(430, true)}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={loading ? 'Creating account...' : 'Create account'}
              onPress={onSubmit}
              style={styles.submitBtn}
              disabled={!isFormValid || loading}
            />
          </Card>

          <Button
            title="Back to sign in"
            variant="outline"
            onPress={() => router.back()}
            style={styles.backBtn}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 72, flexGrow: 1 },
  headerSection: {
    marginBottom: 20,
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
  formCard: {
    padding: 18,
    marginBottom: 20,
  },
  error: { color: FuelColors.danger, marginBottom: 10, fontSize: 13 },
  submitBtn: { marginTop: 6 },
  backBtn: { marginTop: 10 },
});
