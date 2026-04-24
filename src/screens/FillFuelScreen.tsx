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
import { appAlert } from '@/src/utils/appAlert';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [readingPhoto, setReadingPhoto] = useState<string>();

  const transactionNo = useMemo(() => {
    const id = String(req?.id ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return id ? `TXN-${id.slice(-10)}` : 'TXN-UNKNOWN';
  }, [req?.id]);
  const ownerDefinedRate = useMemo(() => {
    if (!req || !pump) return null;
    if (req.fuel === 'HSD') return pump.hsdRate ?? null;
    return pump.msRate ?? null;
  }, [req, pump]);
  const isRateLockedByOwner = Number.isFinite(ownerDefinedRate) && (ownerDefinedRate ?? 0) > 0;

  useEffect(() => {
    if (!isRateLockedByOwner) return;
    setRate(String(ownerDefinedRate));
  }, [ownerDefinedRate, isRateLockedByOwner]);

  const goToPending = () => {
    if (returnTo === 'pump-pending') {
      router.replace(href('/(pump)/(home)/pending'));
      return;
    }
    if (returnTo === 'employee-pending') {
      router.replace(href('/(employee)/(tabs)/pending'));
      return;
    }
    const segmentValues = segments as unknown as string[];
    const isPumpFlow = segmentValues.includes('(pump)') || segmentValues.includes('pump');
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

  const takePhoto = async (onPhotoPicked: (uri: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      appAlert('Permission denied', 'We need camera permission to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) onPhotoPicked(result.assets[0].uri);
  };

  const submit = () => {
    if (!req || !currentUser) return;
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!q || !r) {
      appAlert('Required', 'Enter actual quantity and rate');
      return;
    }
    if (!readingPhoto || !vehiclePhoto) {
      appAlert('Photos required', 'Please upload both reading and vehicle proof photos');
      return;
    }
    fillFuelRequest({
      requestId: req.id,
      actualQty: q,
      rate: r,
      voucherNo: transactionNo,
      vehiclePhoto,
      receiptPhoto: readingPhoto,
      extraCash: parseFloat(extraCash) || 0,
      filledByUserId: currentUser.id,
    });
    appAlert('Submitted', 'Request marked complete.', [
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
          <View style={styles.reqTop}>
            <View style={styles.vehicleIcon}>
              <Ionicons name={req.fuel === 'HSD' ? 'bus-outline' : 'car-outline'} size={22} color={FuelColors.primary} />
            </View>
            <View style={styles.reqTitleBlock}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.v}>{req.vehicleNo}</Text>
            </View>
            <FuelTypePill fuel={req.fuel} />
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.label}>Requested</Text>
              <Text style={styles.summaryValue}>{isFullTank ? 'Full Tank' : `${req.qty} L`}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.label}>Transaction</Text>
              <Text style={styles.txnValue}>{transactionNo}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fuel Details</Text>
          <Text style={styles.sectionHint}>Enter the actual fill values</Text>
        </View>

        <Card style={styles.formCard}>
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
                editable={!isRateLockedByOwner}
                placeholder={isRateLockedByOwner ? 'Auto-fetched from pump owner pricing' : '0.00'}
                style={isRateLockedByOwner ? styles.disabledInput : undefined}
              />
            </View>
          </View>
          {isRateLockedByOwner ? (
            <Text style={styles.lockedHint}>Rate is managed by pump owner and auto-filled for this fuel type.</Text>
          ) : (
            <Text style={styles.lockedHint}>No owner price set. You can enter rate manually.</Text>
          )}

          <Input
            label="Cash to driver (₹)"
            keyboardType="decimal-pad"
            value={extraCash}
            onChangeText={setExtraCash}
            placeholder="0"
            editable={false}
            style={styles.disabledInput}
          />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.label}>Calculated total</Text>
              <Text style={styles.totalCaption}>Quantity multiplied by rate</Text>
            </View>
            <Text style={styles.gross}>₹ {gross.toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Proof Photos</Text>
          <Text style={styles.sectionHint}>Upload reading photo and vehicle photo separately</Text>
        </View>

        <View style={styles.photoSection}>
          <PhotoUploader
            label="Meter Reading Photo"
            uri={readingPhoto}
            onPick={() => takePhoto(setReadingPhoto)}
          />
        </View>

        <View style={styles.photoSection}>
          <PhotoUploader
            label="Vehicle Photo"
            uri={vehiclePhoto}
            onPick={() => takePhoto(setVehiclePhoto)}
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
  reqCard: { marginBottom: 18, padding: 14 },
  reqTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FuelColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqTitleBlock: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FuelColors.textSecondary,
  },
  v: { fontSize: 20, fontWeight: '900', color: FuelColors.text, marginTop: 2 },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: FuelColors.border,
  },
  summaryItem: { flex: 1 },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: FuelColors.border,
    marginHorizontal: 14,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: FuelColors.text,
  },
  txnValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '900',
    color: FuelColors.primary,
  },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: FuelColors.text },
  sectionHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: FuelColors.textSecondary,
  },
  formCard: { marginBottom: 18, padding: 14 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  disabledInput: { backgroundColor: '#f9f9f9', opacity: 0.8 },
  totalRow: {
    marginTop: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: FuelColors.successMuted,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  lockedHint: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: FuelColors.textSecondary,
  },
  totalCaption: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: FuelColors.textSecondary,
  },
  gross: {
    fontWeight: '900',
    color: FuelColors.success,
    fontSize: 20,
  },
  photoSection: { marginBottom: 16 },
  btnPad: { marginTop: 4 },
});
