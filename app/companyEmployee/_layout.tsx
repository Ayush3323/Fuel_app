import { Redirect, Stack } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { href } from '@/src/utils/routerHref';

export default function EmployeeStackLayout() {
  const { currentUser } = useApp();
  if (!currentUser) return <Redirect href={href('/login')} />;
  if (currentUser.role === 'admin')
    return <Redirect href={href('/(admin)/(tabs)/dashboard')} />;
  if (currentUser.role === 'pumpOwner')
    return <Redirect href={href('/(pump)/(home)/companies')} />;
  if (currentUser.role === 'employee' && !currentUser.companyId)
    return <Redirect href={href('/(employee)/(tabs)/pending')} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
