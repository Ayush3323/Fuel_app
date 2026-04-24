import { FuelColors } from '@/constants/theme';
import { subscribeAppAlert, type AppAlertPayload } from '@/src/utils/appAlert';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export function AppAlertHost() {
  const [alert, setAlert] = useState<AppAlertPayload | null>(null);

  useEffect(() => {
    return subscribeAppAlert((payload) => setAlert(payload));
  }, []);

  const buttons = useMemo(() => {
    if (!alert?.buttons?.length) return [{ text: 'OK' }];
    return alert.buttons;
  }, [alert]);

  const close = () => setAlert(null);

  return (
    <Modal visible={!!alert} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{alert?.title}</Text>
          {alert?.message ? <Text style={styles.message}>{alert.message}</Text> : null}
          <View style={[styles.actions, buttons.length > 1 && styles.actionsSplit]}>
            {buttons.map((button, idx) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              return (
                <Pressable
                  key={`${button.text ?? 'OK'}-${idx}`}
                  style={[
                    styles.actionBtn,
                    buttons.length > 1 && styles.actionBtnSplit,
                    isCancel && styles.actionBtnGhost,
                    isDestructive && styles.actionBtnDanger,
                  ]}
                  onPress={() => {
                    close();
                    button.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.actionTxt,
                      isCancel && styles.actionTxtGhost,
                      isDestructive && styles.actionTxtDanger,
                    ]}
                  >
                    {button.text ?? 'OK'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: FuelColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  title: { fontSize: 17, fontWeight: '900', color: FuelColors.text },
  message: { marginTop: 8, color: FuelColors.textSecondary, fontSize: 14, lineHeight: 20 },
  actions: { marginTop: 16, gap: 8 },
  actionsSplit: { flexDirection: 'row' },
  actionBtn: {
    backgroundColor: FuelColors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSplit: { flex: 1 },
  actionBtnGhost: {
    backgroundColor: FuelColors.surface,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  actionBtnDanger: { backgroundColor: '#FEE2E2' },
  actionTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  actionTxtGhost: { color: FuelColors.textSecondary },
  actionTxtDanger: { color: FuelColors.danger },
});
