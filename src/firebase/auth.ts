import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Platform } from 'react-native';

function isNetworkError(error: unknown) {
  return (error as { code?: string })?.code === 'auth/network-request-failed';
}

async function withNetworkRetry<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return fn();
  }
}

export function onAuthStateChanged(
  listener: (user: FirebaseAuthTypes.User | null) => void
) {
  if (Platform.OS === 'web') {
    listener(null);
    return () => {};
  }
  return auth().onAuthStateChanged(listener);
}

export async function signIn(email: string, password: string) {
  if (Platform.OS === 'web') {
    throw Object.assign(new Error('Native Firebase auth is not supported on web build.'), {
      code: 'app/no-native-firebase',
    });
  }
  return withNetworkRetry(() =>
    auth().signInWithEmailAndPassword(email.trim().toLowerCase(), password)
  );
}

export async function signUp(email: string, password: string) {
  if (Platform.OS === 'web') {
    throw Object.assign(new Error('Native Firebase auth is not supported on web build.'), {
      code: 'app/no-native-firebase',
    });
  }
  return withNetworkRetry(() =>
    auth().createUserWithEmailAndPassword(email.trim().toLowerCase(), password)
  );
}

export async function signOut() {
  if (Platform.OS === 'web') return;
  return auth().signOut();
}

export async function sendPasswordReset(email: string) {
  if (Platform.OS === 'web') {
    throw Object.assign(new Error('Native Firebase auth is not supported on web build.'), {
      code: 'app/no-native-firebase',
    });
  }
  return withNetworkRetry(() =>
    auth().sendPasswordResetEmail(email.trim().toLowerCase())
  );
}

export function currentFirebaseUser() {
  if (Platform.OS === 'web') return null;
  return auth().currentUser;
}
