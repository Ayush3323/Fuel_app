import { Redirect } from 'expo-router';
import { href } from '@/src/utils/routerHref';

export default function PumpHomeIndex() {
  return <Redirect href={href('/(pump)/(home)/dashboard')} />;
}
