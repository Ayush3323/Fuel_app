import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { FuelColors } from '@/constants/theme';
import { AppAlertHost } from '@/src/components/ui/AppAlertHost';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';
import { useEffect } from 'react';
import { useSegments } from 'expo-router';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: FuelColors.background,
    primary: FuelColors.primary,
    card: FuelColors.surface,
    text: FuelColors.text,
    border: FuelColors.border,
  },
};

function RootLayoutNav() {
  const { authReady } = useApp();
  const segments = useSegments();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const isMainTabScreen =
      (segments[0] === '(admin)' && segments[1] === '(tabs)' && ['dashboard', 'requests', 'pumps', 'bills', 'more'].includes(segments[2] ?? '')) ||
      (segments[0] === '(pump)' && segments[1] === '(home)' && ['dashboard', 'companies', 'pending', 'completed', 'team', 'profile'].includes(segments[2] ?? '')) ||
      (segments[0] === '(employee)' && segments[1] === '(tabs)' && ['pending', 'completed', 'team', 'profile'].includes(segments[2] ?? '')) ||
      (segments[0] === 'companyEmployee' && segments[1] === '(tabs)' && ['pumps', 'pending', 'completed', 'profile'].includes(segments[2] ?? ''));

    const onBackPress = () => {
      if (!isMainTabScreen) return false;
      appAlert('Exit app?', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [segments]);

  if (!authReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: FuelColors.background,
        }}
      >
        <ActivityIndicator size="large" color={FuelColors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register-company" />
        <Stack.Screen name="register-pump" />
        <Stack.Screen name="register-employee" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(pump)" />
        <Stack.Screen name="(employee)" />
      </Stack>
      <AppAlertHost />
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
