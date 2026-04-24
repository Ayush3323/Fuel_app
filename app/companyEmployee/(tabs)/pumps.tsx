import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelType, Pump } from '@/src/types';
import { appAlert } from '@/src/utils/appAlert';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MAX_QTY_LITRES = 2000;
const MAX_EXTRA_CASH = 20000;
const VEHICLE_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

function normalizeVehicleNo(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export default function PumpsTabRequest() {
  const router = useRouter();
  const { createFuelRequest, currentUser, getCompany, getPumpsForCompany, transactions, requests } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const company = getCompany(companyId);
  const pumps = getPumpsForCompany(companyId);

  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [showPumpPicker, setShowPumpPicker] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [qty, setQty] = useState('');
  const [isTankFull, setIsTankFull] = useState(false);
  const [fuel, setFuel] = useState<FuelType>('HSD');
  const [extraCash, setExtraCash] = useState('');
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const normalizedVehicle = useMemo(() => normalizeVehicleNo(vehicleNo), [vehicleNo]);
  const isVehicleValid = useMemo(() => VEHICLE_REGEX.test(normalizedVehicle), [normalizedVehicle]);
  const qtyValue = useMemo(() => parseFloat(qty), [qty]);
  const extraCashValue = useMemo(() => parseFloat(extraCash), [extraCash]);
  const isQtyOverLimit = useMemo(
    () => !isTankFull && Number.isFinite(qtyValue) && qtyValue > MAX_QTY_LITRES,
    [isTankFull, qtyValue]
  );
  const isExtraCashOverLimit = useMemo(
    () => Number.isFinite(extraCashValue) && extraCashValue > MAX_EXTRA_CASH,
    [extraCashValue]
  );

  // Autocomplete logic for vehicle number
  const vehicleHistory = useMemo(() => {
    const fromTxns = transactions
      .filter(t => t.companyId === companyId)
      .map(t => t.vehicleNo);
    const fromReqs = requests
      .filter(r => r.companyId === companyId)
      .map(r => r.vehicleNo);
    
    // Combine and get unique set
    const all = Array.from(new Set([...fromTxns, ...fromReqs]))
      .filter(v => v && v.trim() !== '')
      .sort();
    return all;
  }, [transactions, requests, companyId]);

  const vehicleSuggestions = useMemo(() => {
    if (!vehicleNo.trim()) return [];
    const search = vehicleNo.trim().toUpperCase();
    return vehicleHistory.filter(v => v.includes(search) && v !== search).slice(0, 5);
  }, [vehicleNo, vehicleHistory]);

  const submit = () => {
    const qValue = isTankFull ? 0 : qtyValue;
    const ec = extraCashValue || 0;
    
    if (!selectedPump) {
      appAlert('Selection required', 'Please select a petrol pump');
      return;
    }
    if (!vehicleNo.trim()) {
      appAlert('Check inputs', 'Enter vehicle number');
      return;
    }
    if (!isVehicleValid) {
      appAlert('Check inputs', 'Vehicle number format should look like: HR55AB1234');
      return;
    }
    if (!isTankFull && (!qValue || qValue <= 0)) {
      appAlert('Check inputs', 'Enter quantity in litres');
      return;
    }
    if (!isTankFull && qValue > MAX_QTY_LITRES) {
      appAlert('Quantity limit', `Fuel quantity cannot exceed ${MAX_QTY_LITRES} L`);
      return;
    }
    if (ec > MAX_EXTRA_CASH) {
      appAlert('Extra cash limit', `Extra cash cannot exceed ₹${MAX_EXTRA_CASH.toLocaleString('en-IN')}`);
      return;
    }

    createFuelRequest({
      companyId,
      pumpId: selectedPump.id,
      vehicleNo: vehicleNo.trim().toUpperCase(),
      fuel,
      qty: qValue,
      isTankFull,
      extraCash: ec > 0 ? ec : undefined,
      notes: notes || undefined,
    });

    appAlert('Request sent', `Request for ${vehicleNo.toUpperCase()} sent to ${selectedPump.name}.`, [
      { text: 'OK', onPress: () => {
        setVehicleNo('');
        setQty('');
        setIsTankFull(false);
        setExtraCash('');
        setNotes('');
        router.push(href('/companyEmployee/(tabs)/pending'));
      }},
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <Screen>
      <Header title="New Fuel Request" showBack={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.body} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FuelColors.primary} />
          }
        >
          <Text style={styles.co}>{company?.name}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Select Petrol Pump</Text>
          <View style={styles.pickerWrap}>
            <Pressable onPress={() => setShowPumpPicker((prev) => !prev)}>
              <Card style={styles.pickerCard}>
                <View style={styles.pickerRow}>
                  <View style={styles.pickerTextContent}>
                    {selectedPump ? (
                      <>
                        <Text style={styles.pickerVal}>{selectedPump.name}</Text>
                        <Text style={styles.pickerSub}>{selectedPump.address}</Text>
                      </>
                    ) : (
                      <Text style={styles.pickerPlaceholder}>Choose a petrol pump</Text>
                    )}
                  </View>
                  <Ionicons
                    name={showPumpPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={FuelColors.primary}
                  />
                </View>
              </Card>
            </Pressable>
            {showPumpPicker && (
              <Card style={styles.dropdownCard}>
                {pumps.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pumpItem, selectedPump?.id === item.id && styles.pumpItemSelected]}
                    onPress={() => {
                      setSelectedPump(item);
                      setShowPumpPicker(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pumpName, selectedPump?.id === item.id && styles.pumpTextSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.pumpAddr}>{item.address}</Text>
                    </View>
                    {selectedPump?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color={FuelColors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            )}
          </View>
        </View>

        <View style={[styles.section, styles.inputWrap]}>
          <Input
            label="Vehicle number"
            value={vehicleNo}
            onChangeText={(t) => setVehicleNo(normalizeVehicleNo(t).slice(0, 10))}
            autoCapitalize="characters"
            placeholder="e.g. HR55AB1234"
            maxLength={10}
          />
          {vehicleNo.trim().length > 0 && !isVehicleValid ? (
            <Text style={styles.warn}>Enter valid format: HR55AB1234</Text>
          ) : null}
          {vehicleSuggestions.length > 0 && (
            <View style={styles.suggestions}>
              {vehicleSuggestions.map((v) => (
                <TouchableOpacity 
                  key={v} 
                  style={styles.suggestionItem}
                  onPress={() => setVehicleNo(v)}
                >
                  <Ionicons name="time-outline" size={16} color={FuelColors.textMuted} style={{marginRight: 10}}/>
                  <Text style={styles.suggestionText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, styles.qtySection]}>
          <View style={styles.inputRow}>
            <View style={{ flex: 1.3 }}>
              <Input
                label="Quantity (Litres)"
                keyboardType="decimal-pad"
                value={isTankFull ? '' : qty}
                onChangeText={setQty}
                editable={!isTankFull}
                placeholder={isTankFull ? 'Full' : '0.00'}
                containerStyle={isTankFull && styles.disabledInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Extra Cash"
                keyboardType="numeric"
                value={extraCash}
                onChangeText={setExtraCash}
                placeholder="₹ 0"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.7}
            style={styles.tankToggle} 
            onPress={() => {
              setIsTankFull(!isTankFull);
              if (!isTankFull) setQty('');
            }}
          >
            <View style={[styles.checkbox, isTankFull && styles.checkboxActive]}>
              {isTankFull && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={[styles.tankLabel, isTankFull && styles.tankLabelActive]}>Tank Full Request</Text>
          </TouchableOpacity>
          {isQtyOverLimit ? (
            <Text style={styles.warn}>Enter valid quantity</Text>
          ) : null}
          {isExtraCashOverLimit ? (
            <Text style={styles.warn}>Extra cash cannot be more than ₹{MAX_EXTRA_CASH.toLocaleString('en-IN')}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Fuel type</Text>
          <View style={styles.fuelRow}>
            {(['HSD', 'MS'] as FuelType[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFuel(f)}
                style={{ flex: 1 }}
              >
                <Card style={[styles.fuelCard, fuel === f && styles.fuelOn]}>
                  <Text style={[styles.fuelTxt, fuel === f && styles.fuelTxtOn]}>
                    {f === 'HSD' ? 'Diesel' : 'Petrol'}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Input 
            label="Additional Notes (optional)" 
            value={notes} 
            onChangeText={setNotes} 
            multiline 
            numberOfLines={2}
            placeholder="Instructions for pump..."
          />
        </View>
        
          <View style={styles.btnPad}>
            <Button
              title="Submit Request"
              onPress={submit}
              disabled={isQtyOverLimit || isExtraCashOverLimit || !isVehicleValid}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  co: { 
    marginBottom: 16, 
    color: FuelColors.primary, 
    fontWeight: '800', 
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  section: { marginBottom: 16 },
  pickerWrap: {
    position: 'relative',
    zIndex: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FuelColors.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  pickerCard: { 
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1, 
    borderColor: FuelColors.border,
    backgroundColor: FuelColors.surface,
  },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTextContent: { flex: 1 },
  pickerVal: { color: FuelColors.text, fontSize: 15, fontWeight: '700' },
  pickerSub: { color: FuelColors.textSecondary, fontSize: 11, marginTop: 1 },
  pickerPlaceholder: { color: FuelColors.textMuted, fontSize: 14 },
  dropdownCard: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: FuelColors.border,
    zIndex: 40,
    elevation: 8,
  },
  
  inputWrap: { zIndex: 10, position: 'relative' },
  suggestions: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: FuelColors.surface,
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: FuelColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: { color: FuelColors.text, fontWeight: '700', fontSize: 14 },
  warn: { color: FuelColors.warning, fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 2 },
  
  qtySection: { },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  disabledInput: { opacity: 0.6, backgroundColor: '#f0f0f0' },
  tankToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  checkbox: { 
    width: 22, 
    height: 22, 
    borderWidth: 2, 
    borderColor: FuelColors.primary, 
    borderRadius: 6, 
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxActive: { backgroundColor: FuelColors.primary },
  tankLabel: { fontSize: 14, color: FuelColors.textSecondary, fontWeight: '600' },
  tankLabelActive: { color: FuelColors.primary, fontWeight: '700' },

  fuelRow: { flexDirection: 'row', gap: 10 },
  fuelCard: { 
    flex: 1, 
    padding: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FuelColors.border
  },
  fuelOn: { borderColor: FuelColors.primary, backgroundColor: FuelColors.primaryMuted },
  fuelTxt: { textAlign: 'center', color: FuelColors.text, fontSize: 14, fontWeight: '600' },
  fuelTxtOn: { fontWeight: '800', color: FuelColors.primary },
  
  btnPad: { marginTop: 8 },
  
  pumpItem: { 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: FuelColors.border,
    flexDirection: 'row',
    alignItems: 'center'
  },
  pumpItemSelected: { backgroundColor: FuelColors.primaryMuted },
  pumpName: { fontSize: 16, fontWeight: '700', color: FuelColors.text },
  pumpTextSelected: { color: FuelColors.primary },
  pumpAddr: { fontSize: 13, color: FuelColors.textSecondary, marginTop: 2 },
});
