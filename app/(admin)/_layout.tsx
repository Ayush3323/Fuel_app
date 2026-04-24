import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';
import { Redirect, Stack } from 'expo-router';

export default function AdminStack() {
  const { currentUser } = useApp();
  if (!currentUser) return <Redirect href={href('/login')} />;
  if (currentUser.role === 'pumpOwner')
    return <Redirect href={href('/(pump)/(home)/dashboard')} />;
  if (currentUser.role === 'employee' && currentUser.companyId)
    return <Redirect href={href('/companyEmployee/(tabs)/pending')} />;
  if (currentUser.role === 'employee')
    return <Redirect href={href('/(employee)/(tabs)/pending')} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
