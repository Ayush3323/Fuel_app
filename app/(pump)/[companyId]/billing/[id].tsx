import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { BillView, Header, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';

export default function PumpBillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bills, pumps, transactions, getCompany } = useApp();
  const bill = bills.find((b) => b.id === id);
  const pump = pumps.find((p) => p.id === bill?.pumpId);
  const company = bill ? getCompany(bill.companyId) : undefined;

  if (!bill || !pump || !company) {
    return (
      <Screen>
        <Header title="Bill" />
        <Text style={styles.miss}>Not found</Text>
      </Screen>
    );
  }

  const due = billTotalForItems(bill, transactions).totalDue;

  return (
    <Screen>
      <Header title={bill.billNo} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.banner}>
          <Text style={styles.dueLabel}>Total due</Text>
          <Text style={styles.due}>₹ {due.toLocaleString('en-IN')}</Text>
          <Text style={styles.st}>Status: {bill.status}</Text>
        </View>
        <BillView bill={bill} pump={pump} company={company} transactions={transactions} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20 },
  banner: {
    margin: 16,
    padding: 16,
    backgroundColor: FuelColors.primaryMuted,
    borderRadius: 12,
  },
  dueLabel: { fontSize: 12, color: FuelColors.textSecondary },
  due: { fontSize: 24, fontWeight: '800', color: FuelColors.primary },
  st: { marginTop: 8, color: FuelColors.textSecondary },
});
