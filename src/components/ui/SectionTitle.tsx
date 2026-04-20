import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

export function SectionTitle({ 
  title, 
  action, 
  style 
}: { 
  title: string; 
  action?: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.row, style]}>
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
