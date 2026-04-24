import { Redirect } from 'expo-router';
import { href } from '@/src/utils/routerHref';

export default function AdminPendingRequestsRedirect() {
  return <Redirect href={href('/(admin)/(tabs)/requests')} />;
}
