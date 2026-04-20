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
        <ScrollView 
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>⛽</Text>
            </View>
            <Text style={styles.title}>Register your pump</Text>
            <Text style={styles.sub}>
              Join the Fuel Credit network and connect with transport companies seamlessly.
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input 
              label="Pump / station name" 
              placeholder="e.g. Reliable Fuels"
              value={pumpName} 
              onChangeText={setPumpName} 
            />
            <Input 
              label="Address" 
              placeholder="Full location details"
              value={address} 
              onChangeText={setAddress} 
            />
            <Input 
              label="Contact number" 
              keyboardType="phone-pad"
              placeholder="+91 XXXXX XXXXX"
              value={contact} 
              onChangeText={setContact} 
            />
            <Input
              label="Owner name"
              placeholder="Full name for display"
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <View style={styles.divider} />
            <Input
              label="Login ID"
              autoCapitalize="none"
              placeholder="Choose a unique ID"
              value={loginId}
              onChangeText={setLoginId}
            />
            <Input
              label="Password"
              secureTextEntry
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
            />
            <Button 
              title="Create Pump Account" 
              onPress={onSubmit} 
              style={styles.submitBtn}
            />
          </Card>
          
          <Button
            title="Back to login"
            variant="outline"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 60 },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: FuelColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: { fontSize: 32 },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: FuelColors.text,
    textAlign: 'center',
  },
  sub: { 
    color: FuelColors.textSecondary, 
    marginTop: 10, 
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 15,
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: FuelColors.border,
    marginVertical: 16,
    opacity: 0.5,
  },
  submitBtn: { marginTop: 12 },
  backBtn: { marginTop: 10 },
});
