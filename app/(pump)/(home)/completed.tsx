import { Redirect } from 'expo-router';
import { href } from '@/src/utils/routerHref';

export default function PumpHomeCompleted() {
  return <Redirect href={href('/(pump)/(home)/requests')} />;
}
