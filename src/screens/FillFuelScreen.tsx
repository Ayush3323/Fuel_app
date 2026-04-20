import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import {
  Button,
  Card,
  FuelTypePill,
  Header,
  Input,
  PhotoUploader,
  Screen,
} from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

const MOCK_URI = 'https://picsum.photos/seed/fuel/400/300';

export function FillFuelScreen() {
  const { requestId, companyId: routeCompanyId } = useLocalSearchParams<{
    requestId: string;
    companyId?: string;
  }>();
  const router = useRouter();
  const { requests, fillFuelRequest, currentUser, pumps } = useApp();
  const req = requests.find((r) => r.id === requestId);
  const pump = pumps.find((p) => p.id === req?.pumpId);
  const companyMismatch =
    !!routeCompanyId &&
    !!req &&
    req.companyId !== routeCompanyId;

  const isFullTank = req?.qty === 0;
  const [qty, setQty] = useState(isFullTank ? '' : String(req?.qty ?? ''));
  const [rate, setRate] = useState('');
  const [voucher, setVoucher] = useState(() => {
    const vNo = req?.vehicleNo.replace(/\s/g, '').slice(-4) || '0000';
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `${rand}/${vNo}`;
  });
  const [extraCash, setExtraCash] = useState('');
  const [advance, setAdvance] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState<string>();
  const [receiptPhoto, setReceiptPhoto] = useState<string>();

  const gross = useMemo(() => {
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!q || !r) return 0;
    return Math.round(q * r * 100) / 100;
  }, [qty, rate]);

  const submit = () => {
    if (!req || !currentUser) return;
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!q || !r) {
      Alert.alert('Required', 'Enter actual quantity and rate');
      return;
    }
    if (!vehiclePhoto || !receiptPhoto) {
      Alert.alert('Photos', 'Add vehicle and receipt photos (demo tap)');
      return;
    }
    fillFuelRequest({
      requestId: req.id,
      actualQty: q,
      rate: r,
      voucherNo: voucher || undefined,
      vehiclePhoto,
      receiptPhoto,
      extraCash: parseFloat(extraCash) || 0,
      advance: parseFloat(advance) || 0,
      filledByUserId: currentUser.id,
    });
    Alert.alert('Submitted', 'Request marked complete.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!req || companyMismatch) {
    return (
      <Screen>
        <Header title="Fill fuel" />
        <Text style={styles.miss}>
          {companyMismatch ? 'Request not for this company' : 'Request not found'}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen key={req.id}>
      <Header title="Fill fuel" subtitle={pump?.name} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.req}>
          <Text style={styles.v}>{req.vehicleNo}</Text>
          <FuelTypePill fuel={req.fuel} />
          <Text style={styles.meta}>Asked: {isFullTank ? 'Full Tank' : `${req.qty} L`}</Text>
        </Card>

        <Input
          label="Actual quantity (L)"
          keyboardType="decimal-pad"
          value={qty}
          onChangeText={setQty}
          editable={isFullTank}
          style={!isFullTank && { backgroundColor: FuelColors.background }}
        />
        <Input
          label="Rate (₹/L)"
          keyboardType="decimal-pad"
          value={rate}
          onChangeText={setRate}
        />
        <Text style={styles.gross}>Gross: ₹ {gross.toLocaleString('en-IN')}</Text>

        <Input
          label="Voucher / Txn no."
          value={voucher}
          onChangeText={setVoucher}
          placeholder="e.g. 32410/9044"
        />
        <Input
          label="Extra cash to driver (₹)"
          keyboardType="decimal-pad"
          value={extraCash}
          onChangeText={setExtraCash}
        />
        <Input
          label="Advance (₹)"
          keyboardType="decimal-pad"
          value={advance}
          onChangeText={setAdvance}
        />

        <PhotoUploader
          label="Vehicle photo"
          uri={vehiclePhoto}
          onPick={() => setVehiclePhoto(MOCK_URI)}
        />
        <PhotoUploader
          label="Receipt photo"
          uri={receiptPhoto}
          onPick={() => setReceiptPhoto(`${MOCK_URI}2`)}
        />

        <Button title="Submit & complete" onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20, color: FuelColors.danger },
  body: { padding: 16, paddingBottom: 40 },
  req: { marginBottom: 16 },
  v: { fontSize: 20, fontWeight: '800', color: FuelColors.text },
  meta: { marginTop: 8, color: FuelColors.textSecondary },
  gross: {
    fontWeight: '700',
    color: FuelColors.primary,
    marginBottom: 12,
    marginTop: -8,
  },
});
