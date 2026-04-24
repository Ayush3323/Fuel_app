import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { FuelColors } from '@/constants/theme';

export default function PumpHomeStack() {
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
        name="companies"
        options={{
          title: 'Companies',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pending"
        options={{
          title: 'Pending',
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
        name="team"
        options={{
          title: 'Team',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="join" options={{ href: null }} />
    </Tabs>
  );
}
