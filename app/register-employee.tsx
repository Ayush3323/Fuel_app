import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function RegisterEmployeeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setErr('');
    setInfo('');
    if (!email.trim() || !password.trim()) {
      setErr('Email and password required');
      return;
    }
    setIsSubmitting(true);
    setInfo('Creating account...');
    try {
      const { signUp } = await import('@/src/firebase/auth');
      await signUp(email.trim(), password);
      const user = await login(email.trim(), password);
      if (!user) {
        setErr(
          'Invite not found for this email. Ask owner to add you in Team first, then try again.'
        );
        setIsSubmitting(false);
        setInfo('');
        return;
      }
      if (user.companyId) {
        router.replace('/companyEmployee/(tabs)/pending');
        return;
      }
      router.replace('/(employee)/(tabs)/pending');
    } catch (e: any) {
      setErr(e?.message || 'Could not create employee account for this invite');
      setIsSubmitting(false);
      setInfo('');
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
          <Text style={styles.title}>Employee signup</Text>
          <Text style={styles.sub}>Use the invited email from your pump owner or company owner to create your password.</Text>
          <Card>
            <Input
              label="Invited email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
              onFocus={() => scrollRef.current?.scrollTo({ y: 140, animated: true })}
            />
            <Input
              label="Create password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
              onFocus={() => scrollRef.current?.scrollTo({ y: 210, animated: true })}
            />
            {info ? <Text style={styles.info}>{info}</Text> : null}
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <Button
              title="Create employee account"
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Card>
          <Button title="Back to login" variant="outline" onPress={() => router.back()} disabled={isSubmitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 64, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: FuelColors.text },
  sub: { color: FuelColors.textSecondary, marginVertical: 16, lineHeight: 20 },
  info: { color: FuelColors.textSecondary, marginBottom: 12 },
  err: { color: FuelColors.danger, marginBottom: 12 },
});
