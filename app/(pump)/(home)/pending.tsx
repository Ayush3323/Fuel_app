import { Redirect } from 'expo-router';
import { href } from '@/src/utils/routerHref';

export default function PumpHomePending() {
  return <Redirect href={href('/(pump)/(home)/requests')} />;
}
