import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Card, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import type { FuelType } from '@/src/types';

export default function NewRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { createFuelRequest, company } = useApp();
  const [vehicleNo, setVehicleNo] = useState('');
  const [qty, setQty] = useState('');
  const [fuel, setFuel] = useState<FuelType>('HSD');
  const [notes, setNotes] = useState('');

  const submit = () => {
    const q = parseFloat(qty);
    if (!vehicleNo.trim() || !q || q <= 0) {
      Alert.alert('Check inputs', 'Enter vehicle and quantity');
      return;
    }
    createFuelRequest({
      pumpId: id!,
      vehicleNo,
      fuel,
      qty: q,
      notes: notes || undefined,
    });
    Alert.alert('Request sent', 'Pump will see it in real time (demo).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <Header title="Fuel request" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.co}>{company.name}</Text>
        <Input
          label="Vehicle number"
          value={vehicleNo}
          onChangeText={setVehicleNo}
          autoCapitalize="characters"
        />
        <Input
          label="Quantity (L)"
          keyboardType="decimal-pad"
          value={qty}
          onChangeText={setQty}
        />
        <Text style={styles.label}>Fuel type</Text>
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
        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} />
        <Button title="Submit request" onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  co: { marginBottom: 12, color: FuelColors.textSecondary },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: FuelColors.textSecondary,
    marginBottom: 8,
  },
  fuelRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  fuelCard: { flex: 1, padding: 12 },
  fuelOn: { borderColor: FuelColors.primary, borderWidth: 2 },
  fuelTxt: { textAlign: 'center', color: FuelColors.text },
  fuelTxtOn: { fontWeight: '800', color: FuelColors.primary },
});
