import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { FuelColors } from '@/constants/theme';

type Props = ViewProps & { edges?: 'top' | 'all' };

export function Screen({ children, edges = 'top', style, ...rest }: Props) {
  const safeEdges: Edge[] = edges === 'all' ? ['top', 'right', 'bottom', 'left'] : ['top', 'right', 'left'];

  return (
    <SafeAreaView edges={safeEdges} style={[styles.safe, style]} {...rest}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: FuelColors.background,
  },
  inner: {
    flex: 1,
  },
});
