import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { BillView, Button, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';
import { billTotalForItems } from '@/src/utils/billMath';

export default function AdminBillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { bills, pumps, transactions, getCompany, markBillPaid } = useApp();
  const bill = bills.find((b) => b.id === id);
  const pump = pumps.find((p) => p.id === bill?.pumpId);
  const company = bill ? getCompany(bill.companyId) : undefined;
  const [modal, setModal] = useState(false);
  const [refNo, setRefNo] = useState('');
  const [proof, setProof] = useState('');

  if (!bill || !pump || !company) {
    return (
      <Screen>
        <Header title="Bill" />
        <Text style={styles.miss}>Bill not found</Text>
      </Screen>
    );
  }

  const due = billTotalForItems(bill, transactions).totalDue;

  const onPaid = () => {
    if (!refNo.trim()) {
      appAlert('Reference required', 'Enter payment reference / UTR');
      return;
    }
    markBillPaid(bill.id, refNo.trim(), proof || undefined);
    setModal(false);
    appAlert('Marked paid', 'Pump will see this under paid bills.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <Header title={bill.billNo} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {bill.status === 'raised' ? (
          <View style={styles.payRow}>
            <Button title="Mark as paid" onPress={() => setModal(true)} />
          </View>
        ) : null}
        <View style={styles.banner}>
          <Text style={styles.dueLabel}>Amount due</Text>
          <Text style={styles.due}>₹ {due.toLocaleString('en-IN')}</Text>
          <Text style={styles.st}>Status: {bill.status}</Text>
        </View>
        <BillView bill={bill} pump={pump} company={company} transactions={transactions} />
      </ScrollView>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mark as paid</Text>
            <Input
              label="Payment ref / UTR"
              value={refNo}
              onChangeText={setRefNo}
            />
            <Input
              label="Proof note (optional)"
              value={proof}
              onChangeText={setProof}
              placeholder="e.g. NEFT ref screenshot id"
            />
            <View style={styles.modalActions}>
              <View style={styles.modalBtn}>
                <Button title="Cancel" variant="secondary" onPress={() => setModal(false)} />
              </View>
              <View style={styles.modalBtn}>
                <Button title="Confirm paid" onPress={onPaid} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20 },
  payRow: { paddingHorizontal: 16, marginBottom: 8 },
  banner: {
    margin: 16,
    padding: 16,
    backgroundColor: FuelColors.primaryMuted,
    borderRadius: 12,
  },
  dueLabel: { color: FuelColors.textSecondary, fontSize: 12 },
  due: { fontSize: 28, fontWeight: '800', color: FuelColors.primary },
  st: { marginTop: 8, color: FuelColors.textSecondary },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: FuelColors.surface,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1 },
});
