import { Redirect, Stack } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

export default function PumpStackLayout() {
  const { currentUser } = useApp();
  if (!currentUser) return <Redirect href={href('/login')} />;
  if (currentUser.role === 'admin')
    return <Redirect href={href('/(admin)/(tabs)/dashboard')} />;
  if (currentUser.role === 'employee')
    return <Redirect href={href('/(employee)/(tabs)/pending')} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
