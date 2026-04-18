import { StyleSheet, View, type ViewProps } from 'react-native';
import { FuelColors } from '@/constants/theme';

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FuelColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FuelColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
