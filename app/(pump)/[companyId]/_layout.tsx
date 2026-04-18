import { Ionicons } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { useApp } from '@/src/context/AppContext';

export default function PumpCompanyTabs() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const { getCompany } = useApp();
  const co = companyId ? getCompany(companyId) : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FuelColors.primary,
        tabBarInactiveTintColor: FuelColors.textMuted,
        tabBarStyle: {
          backgroundColor: FuelColors.surface,
          borderTopColor: FuelColors.border,
        },
      }}
    >
      <Tabs.Screen
        name="requests"
        options={{
          title: co?.name?.slice(0, 12) ?? 'Requests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Completed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="fill" options={{ href: null }} />
    </Tabs>
  );
}
