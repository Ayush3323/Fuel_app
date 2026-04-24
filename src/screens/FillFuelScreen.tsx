import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
import { href } from '@/src/utils/routerHref';

export function FillFuelScreen() {
  const { requestId, companyId: routeCompanyId, returnTo } = useLocalSearchParams<{
    requestId: string;
    companyId?: string;
    returnTo?: string;
  }>();
  const router = useRouter();
  const segments = useSegments();
  const { requests, fillFuelRequest, currentUser, pumps } = useApp();
  const req = requests.find((r) => r.id === requestId);
  const pump = pumps.find((p) => p.id === req?.pumpId);
  const companyMismatch =
    !!routeCompanyId &&
    !!req &&
    req.companyId !== routeCompanyId;

  const isFullTank = req?.isTankFull || req?.qty === 0;
  const [qty, setQty] = useState(isFullTank ? '' : String(req?.qty ?? ''));
  const [rate, setRate] = useState('');
  const [extraCash, setExtraCash] = useState(req?.extraCash ? String(req.extraCash) : '');
  const [vehiclePhoto, setVehiclePhoto] = useState<string>();

  const transactionNo = useMemo(() => {
    const id = String(req?.id ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return id ? `TXN-${id.slice(-10)}` : 'TXN-UNKNOWN';
  }, [req?.id]);

  const goToPending = () => {
    if (returnTo === 'pump-pending') {
      router.replace(href('/(pump)/(home)/pending'));
      return;
    }
    if (returnTo === 'employee-pending') {
      router.replace(href('/(employee)/(tabs)/pending'));
      return;
    }
    const isPumpFlow = segments.includes('(pump)') || segments.includes('pump');
    if (isPumpFlow) {
      router.replace(href('/(pump)/(home)/pending'));
      return;
    }
    router.replace(href('/companyEmployee/(tabs)/pending'));
  };

  const gross = useMemo(() => {
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!q || !r) return 0;
    return Math.round(q * r * 100) / 100;
  }, [qty, rate]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera permission to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setVehiclePhoto(result.assets[0].uri);
    }
  };

  const submit = () => {
    if (!req || !currentUser) return;
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!q || !r) {
      Alert.alert('Required', 'Enter actual quantity and rate');
      return;
    }
    if (!vehiclePhoto) {
      Alert.alert('Photo required', 'Please take a photo of the vehicle');
      return;
    }
    fillFuelRequest({
      requestId: req.id,
      actualQty: q,
      rate: r,
      voucherNo: transactionNo,
      vehiclePhoto,
      receiptPhoto: vehiclePhoto,
      extraCash: parseFloat(extraCash) || 0,
      filledByUserId: currentUser.id,
    });
    Alert.alert('Submitted', 'Request marked complete.', [
      { text: 'OK', onPress: goToPending },
    ]);
  };

  if (!req || companyMismatch) {
    return (
      <Screen>
        <Header title="Fill Fuel" onBack={goToPending} />
        <Text style={styles.miss}>
          {companyMismatch ? 'Request not for this company' : 'Request not found'}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen key={req.id}>
      <Header title="Fill Fuel" subtitle={pump?.name} onBack={goToPending} />
      <ScrollView 
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.reqCard}>
          <Text style={styles.v}>{req.vehicleNo}</Text>
          <View style={styles.metaRow}>
            <FuelTypePill fuel={req.fuel} />
            <Text style={styles.meta}>Asked: {isFullTank ? 'Full Tank' : `${req.qty} L`}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.inputRow}>
            <View style={{ flex: 1.2 }}>
              <Input
                label="Actual qty (L)"
                keyboardType="decimal-pad"
                value={qty}
                onChangeText={setQty}
                editable={isFullTank}
                placeholder={isFullTank ? 'Full Tank' : String(req.qty)}
                style={!isFullTank && styles.disabledInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Rate (₹/L)"
                keyboardType="decimal-pad"
                value={rate}
                onChangeText={setRate}
                placeholder="0.00"
              />
            </View>
          </View>
          <Text style={styles.gross}>Total: ₹ {gross.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.section}>
          <Input
            label="Transaction No."
            value={transactionNo}
            editable={false}
            placeholder="Auto-generated"
            style={styles.disabledInput}
          />
          <Input
            label="Cash to driver (₹)"
            keyboardType="decimal-pad"
            value={extraCash}
            onChangeText={setExtraCash}
            placeholder="0"
          />
        </View>

        <View style={styles.section}>
          <PhotoUploader
            label="Vehicle & Odometer Photo"
            uri={vehiclePhoto}
            onPick={takePhoto}
          />
        </View>

        <View style={styles.btnPad}>
          <Button title="Complete Fill" onPress={submit} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 20, color: FuelColors.danger },
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  reqCard: { marginBottom: 16, padding: 12 },
  v: { fontSize: 18, fontWeight: '800', color: FuelColors.text, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { color: FuelColors.textSecondary, fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  disabledInput: { backgroundColor: '#f9f9f9', opacity: 0.8 },
  gross: {
    fontWeight: '800',
    color: FuelColors.primary,
    fontSize: 14,
    marginLeft: 2,
  },
  btnPad: { marginTop: 4 },
});
