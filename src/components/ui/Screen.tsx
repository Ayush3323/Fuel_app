import { Platform, SafeAreaView, StatusBar, StyleSheet, View, type ViewProps } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = ViewProps & { edges?: 'top' | 'all' };

export function Screen({ children, style, ...rest }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} {...rest}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: FuelColors.background,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 48) : 0,
  },
  inner: {
    flex: 1,
  },
});
