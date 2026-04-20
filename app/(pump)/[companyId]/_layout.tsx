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
        name="billing"
        options={{
          title: co?.name?.slice(0, 12) ?? 'Billing',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="fill/[requestId]" options={{ href: null }} />
    </Tabs>
  );
}
