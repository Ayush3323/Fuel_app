import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: FuelColors.text,
  },
});
