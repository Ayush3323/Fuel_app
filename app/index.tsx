import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { href } from '@/src/utils/routerHref';

export default function SplashScreen() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace(href('/login')), 700);
    return () => clearTimeout(t);
  }, [router]);

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
