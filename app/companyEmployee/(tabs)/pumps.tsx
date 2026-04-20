import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { href } from '@/src/utils/routerHref';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelType, Pump } from '@/src/types';

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

  // Default to first pump if available
  useEffect(() => {
    if (pumps.length > 0 && !selectedPump) {
      setSelectedPump(pumps[0]);
    }
  }, [pumps]);

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
    
    if (!selectedPump) {
      Alert.alert('Selection required', 'Please select a petrol pump');
      return;
    }
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
      pumpId: selectedPump.id,
      vehicleNo: vehicleNo.trim().toUpperCase(),
      fuel,
      qty: qValue,
      isTankFull,
      extraCash: ec > 0 ? ec : undefined,
      notes: notes || undefined,
    });

    Alert.alert('Request sent', `Request for ${vehicleNo.toUpperCase()} sent to ${selectedPump.name}.`, [
      { text: 'OK', onPress: () => {
        setVehicleNo('');
        setQty('');
        setIsTankFull(false);
        setExtraCash('');
        setNotes('');
        router.push(href('/companyEmployee/pending'));
      }},
    ]);
  };

  return (
    <Screen>
      <Header title="New Fuel Request" showBack={false} />
      <ScrollView 
        contentContainerStyle={[styles.body, { paddingTop: 40 }]} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.co}>{company?.name}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Select Petrol Pump</Text>
          <Pressable onPress={() => setShowPumpPicker(true)}>
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
                <Ionicons name="chevron-down" size={20} color={FuelColors.primary} />
              </View>
            </Card>
          </Pressable>
        </View>

        <View style={[styles.section, styles.inputWrap]}>
          <Input
            label="Vehicle number"
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
                label="Quantity (Litres)"
                keyboardType="decimal-pad"
                value={isTankFull ? '' : qty}
                onChangeText={setQty}
                editable={!isTankFull}
                placeholder={isTankFull ? 'Full Tank' : '0.00'}
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
              {isTankFull && <Ionicons name="checkmark" size={18} color="white" />}
            </View>
            <Text style={[styles.tankLabel, isTankFull && styles.tankLabelActive]}>Tank Full / Full Tank Request</Text>
          </TouchableOpacity>
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
                    {f === 'HSD' ? 'Diesel (HSD)' : 'Petrol (MS)'}
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
            numberOfLines={3}
            placeholder="Add any instructions for the pump staff..."
          />
        </View>
        
        <View style={styles.btnPad}>
          <Button title="Submit Request" onPress={submit} />
        </View>
      </ScrollView>

      {/* Pump Selector Modal */}
      <Modal visible={showPumpPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Petrol Pump</Text>
              <Pressable onPress={() => setShowPumpPicker(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={FuelColors.text} />
              </Pressable>
            </View>
            <FlatList
              data={pumps}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.pumpItem, selectedPump?.id === item.id && styles.pumpItemSelected]}
                  onPress={() => {
                    setSelectedPump(item);
                    setShowPumpPicker(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pumpName, selectedPump?.id === item.id && styles.pumpTextSelected]}>{item.name}</Text>
                    <Text style={styles.pumpAddr}>{item.address}</Text>
                  </View>
                  {selectedPump?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={20} color={FuelColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 50 },
  co: { 
    marginBottom: 24, 
    color: FuelColors.primary, 
    fontWeight: '800', 
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  section: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: FuelColors.text,
    marginBottom: 10,
    marginLeft: 2,
  },
  pickerCard: { 
    padding: 16, 
    borderWidth: 1.5, 
    borderColor: FuelColors.border,
    backgroundColor: FuelColors.surface
  },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTextContent: { flex: 1 },
  pickerVal: { color: FuelColors.text, fontSize: 17, fontWeight: '700' },
  pickerSub: { color: FuelColors.textSecondary, fontSize: 13, marginTop: 4 },
  pickerPlaceholder: { color: FuelColors.textMuted, fontSize: 16 },
  
  inputWrap: { zIndex: 10, position: 'relative' },
  suggestions: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: FuelColors.surface,
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: FuelColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: { color: FuelColors.text, fontWeight: '700', fontSize: 15 },
  
  qtySection: { },
  inputRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  disabledInput: { opacity: 0.6, backgroundColor: '#f0f0f0' },
  tankToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  checkbox: { 
    width: 26, 
    height: 26, 
    borderWidth: 2, 
    borderColor: FuelColors.primary, 
    borderRadius: 8, 
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxActive: { backgroundColor: FuelColors.primary },
  tankLabel: { fontSize: 15, color: FuelColors.textSecondary, fontWeight: '600' },
  tankLabelActive: { color: FuelColors.primary, fontWeight: '700' },

  fuelRow: { flexDirection: 'row', gap: 12 },
  fuelCard: { 
    flex: 1, 
    padding: 16, 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: FuelColors.border
  },
  fuelOn: { borderColor: FuelColors.primary, backgroundColor: FuelColors.primaryMuted },
  fuelTxt: { textAlign: 'center', color: FuelColors.text, fontSize: 15, fontWeight: '600' },
  fuelTxtOn: { fontWeight: '800', color: FuelColors.primary },
  
  btnPad: { marginTop: 16 },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: FuelColors.background, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '85%',
    paddingTop: 10
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: FuelColors.border 
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: FuelColors.text },
  closeBtn: { padding: 4 },
  pumpItem: { 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: FuelColors.border,
    flexDirection: 'row',
    alignItems: 'center'
  },
  pumpItemSelected: { backgroundColor: FuelColors.primaryMuted },
  pumpName: { fontSize: 17, fontWeight: '800', color: FuelColors.text },
  pumpTextSelected: { color: FuelColors.primary },
  pumpAddr: { fontSize: 13, color: FuelColors.textSecondary, marginTop: 4 },
});
