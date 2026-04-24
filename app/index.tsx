import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { href } from '@/src/utils/routerHref';
import { useApp } from '@/src/context/AppContext';
import type { User } from '@/src/types';

function routeForRole(user: User) {
  if (user.role === 'admin') return href('/(admin)/(tabs)/dashboard');
  if (user.role === 'pumpOwner') return href('/(pump)/(home)/dashboard');
  if (user.role === 'employee' && user.companyId) return href('/companyEmployee/(tabs)/pending');
  return href('/(employee)/(tabs)/pending');
}

export default function SplashScreen() {
  const router = useRouter();
  const { currentUser, authReady } = useApp();
  useEffect(() => {
    if (!authReady) return;
    const next = currentUser ? routeForRole(currentUser) : href('/login');
    const t = setTimeout(() => router.replace(next), 400);
    return () => clearTimeout(t);
  }, [router, currentUser, authReady]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fuel Credit</Text>
      <Text style={styles.sub}>Transport · Pumps · Ledger</Text>
      <ActivityIndicator size="large" color={FuelColors.primary} style={styles.spin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FuelColors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FuelColors.primary,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: FuelColors.textSecondary,
  },
  spin: { marginTop: 24 },
});
