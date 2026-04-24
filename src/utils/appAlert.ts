type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AppAlertPayload = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type Listener = (payload: AppAlertPayload) => void;

const listeners = new Set<Listener>();

export function appAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const payload: AppAlertPayload = { title, message, buttons };
  listeners.forEach((listener) => listener(payload));
}

export function subscribeAppAlert(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
