import { Redirect, Stack } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

export default function AdminStack() {
  const { currentUser } = useApp();
  if (!currentUser) return <Redirect href={href('/login')} />;
  if (currentUser.role === 'pumpOwner')
    return <Redirect href={href('/(pump)/(tabs)/requests')} />;
  if (currentUser.role === 'employee')
    return <Redirect href={href('/(employee)/(tabs)/pending')} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="pumps/new" />
      <Stack.Screen name="pumps/[id]/index" />
      <Stack.Screen name="pumps/[id]/request" />
      <Stack.Screen name="bills/[id]" />
    </Stack>
  );
}
