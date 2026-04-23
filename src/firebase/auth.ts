import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function onAuthStateChanged(
  listener: (user: FirebaseAuthTypes.User | null) => void
) {
  return auth().onAuthStateChanged(listener);
}

export async function signIn(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email.trim().toLowerCase(), password);
}

export async function signUp(email: string, password: string) {
  return auth().createUserWithEmailAndPassword(email.trim().toLowerCase(), password);
}

export async function signOut() {
  return auth().signOut();
}

export async function sendPasswordReset(email: string) {
  return auth().sendPasswordResetEmail(email.trim().toLowerCase());
}

export function currentFirebaseUser() {
  return auth().currentUser;
}
