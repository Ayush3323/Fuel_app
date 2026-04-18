import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { FuelColors } from '@/constants/theme';

export type CompanyFilterOption = { id: string; name: string };

type Props = {
  companies: CompanyFilterOption[];
  selectedId: 'all' | string;
  onChange: (id: 'all' | string) => void;
};

export function CompanyFilterBar({ companies, selectedId, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        onPress={() => onChange('all')}
        style={[styles.chip, selectedId === 'all' && styles.chipActive]}
      >
        <Text style={[styles.chipText, selectedId === 'all' && styles.chipTextActive]}>
          All
        </Text>
      </Pressable>
      {companies.map((c) => {
        const active = selectedId === c.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FuelColors.surface,
    borderWidth: 1,
    borderColor: FuelColors.border,
    maxWidth: 200,
  },
  chipActive: {
    backgroundColor: FuelColors.primaryMuted,
    borderColor: FuelColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: FuelColors.textSecondary,
  },
  chipTextActive: {
    color: FuelColors.primary,
  },
});
