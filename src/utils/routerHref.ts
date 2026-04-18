import type { Href } from 'expo-router';

/** Dynamic paths until Expo generates full typed routes */
export function href(path: string): Href {
  return path as Href;
}
