import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FuelColors } from '@/constants/theme';
import { AppProvider } from '@/src/context/AppContext';

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

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider value={navTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register-company" />
          <Stack.Screen name="register-pump" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(pump)" />
          <Stack.Screen name="(employee)" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AppProvider>
  );
}
