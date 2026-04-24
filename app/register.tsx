import { FuelColors } from '@/constants/theme';
import { Button, Screen } from '@/src/components/ui';
import { href } from '@/src/utils/routerHref';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type RegisterRole = 'company' | 'pump' | 'employee';

export default function RegisterChooserScreen() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole | null>(null);

  const onRegister = () => {
    if (!role) return;

    const routeMap = {
      company: '/register-company',
      pump: '/register-pump',
      employee: '/register-employee',
    };

    router.push(href(routeMap[role]));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Select your role to continue</Text>

        {/* Role Selection */}
        <View style={styles.cardContainer}>
          {roles.map((item) => {
            const selected = role === item.key;

            return (
              <Pressable
                key={item.key}
                onPress={() => setRole(item.key)}
                style={({ pressed }) => [
                  styles.roleCard,
                  selected && styles.selectedCard,
                  pressed && styles.pressedCard,
                ]}
              >
                <View style={styles.roleContent}>
                  <Text style={styles.roleIcon}>{item.icon}</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>{item.title}</Text>
                    <Text style={styles.roleDesc}>{item.description}</Text>
                  </View>

                  {selected && <Text style={styles.check}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={onRegister}
          disabled={!role}
          style={[
            styles.continueBtn,
            !role && styles.disabledBtn,
          ]}
        />

        {/* Back */}
        <Button
          title="Back to sign in"
          variant="outline"
          onPress={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}

/* ---------- Role Data ---------- */

const roles: {
  key: RegisterRole;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'company',
    title: 'Company',
    description: 'Manage vehicles, employees & fuel requests',
    icon: '🏢',
  },
  {
    key: 'pump',
    title: 'Fuel Pump',
    description: 'Approve fuel requests & maintain logs',
    icon: '⛽',
  },
  {
    key: 'employee',
    title: 'Employee',
    description: 'Request fuel & track usage status',
    icon: '👨‍🔧',
  },
];

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: FuelColors.text,
    textAlign: 'center',
  },

  sub: {
    fontSize: 14,
    color: FuelColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  cardContainer: {
    gap: 14,
    marginBottom: 24,
  },

  roleCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FFF',
  },

  selectedCard: {
    borderColor: FuelColors.primary,
    backgroundColor: '#F0F6FF',
  },

  pressedCard: {
    opacity: 0.85,
  },

  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  roleIcon: {
    fontSize: 26,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FuelColors.text,
  },

  roleDesc: {
    fontSize: 13,
    color: FuelColors.textSecondary,
    marginTop: 2,
  },

  check: {
    fontSize: 18,
    color: FuelColors.primary,
    fontWeight: 'bold',
  },

  continueBtn: {
    marginBottom: 12,
  },

  disabledBtn: {
    opacity: 0.5,
  },
});