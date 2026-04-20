import React, { useState, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelType } from '@/src/types';

export default function NewRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { createFuelRequest, currentUser, getCompany, pumps, transactions, requests } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const company = getCompany(companyId);
  const pump = pumps.find(p => p.id === id);

  const [vehicleNo, setVehicleNo] = useState('');
  const [qty, setQty] = useState('');
  const [isTankFull, setIsTankFull] = useState(false);
  const [fuel, setFuel] = useState<FuelType>('HSD');
  const [extraCash, setExtraCash] = useState('');
  const [notes, setNotes] = useState('');

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
    const qValue = isTankFull ? 0 : parseFloat(qty);
    const ec = parseFloat(extraCash) || 0;

    if (!vehicleNo.trim()) {
      Alert.alert('Check inputs', 'Enter vehicle number');
      return;
    }
    if (!isTankFull && (!qValue || qValue <= 0)) {
      Alert.alert('Check inputs', 'Enter quantity in litres');
      return;
    }

    createFuelRequest({
      companyId,
      pumpId: id!,
      vehicleNo: vehicleNo.trim().toUpperCase(),
      fuel,
      qty: qValue,
      isTankFull,
      extraCash: ec > 0 ? ec : undefined,
      notes: notes || undefined,
    });
    Alert.alert('Request Sent', `Fuel request for ${vehicleNo.toUpperCase()} has been raised with ${pump?.name}.`, [
      { text: 'OK', onPress: () => router.push(href(`/(admin)/pumps/${id}`)) },
    ]);
  };

  return (
    <Screen>
      <Header title="New Request" subtitle={pump?.name}/>
      <ScrollView 
        contentContainerStyle={styles.body} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.co}>{company?.name}</Text>
        
        <View style={[styles.section, styles.inputWrap]}>
          <Input
            label="Vehicle Number"
            value={vehicleNo}
            onChangeText={setVehicleNo}
            autoCapitalize="characters"
            placeholder="e.g. HR55 XY 1234"
          />
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
                label="Quantity (L)"
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
            <Text style={[styles.tankLabel, isTankFull && styles.tankLabelActive]}>Tank Full / Full Tank Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Fuel Type</Text>
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
            label="Internal Notes (optional)" 
            value={notes} 
            onChangeText={setNotes} 
            multiline 
            numberOfLines={2}
            placeholder="Instructions for pump..."
          />
        </View>

        <View style={styles.btnPad}>
          <Button title="Raise Fuel Request" onPress={submit} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  co: { 
    marginBottom: 16, 
    color: FuelColors.primary, 
    fontWeight: '800', 
    fontSize: 16,
    textTransform: 'uppercase'
  },
  section: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FuelColors.text,
    marginBottom: 6,
    marginLeft: 2,
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
});
