import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { FuelColors } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const v = stylesForVariant[variant];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        v.container,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && { opacity: 0.92 },
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.indicator} />
      ) : (
        <Text style={[styles.label, v.label]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FuelColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

const stylesForVariant: Record<
  Variant,
  {
    container: object;
    label: object;
    indicator: string;
  }
> = {
  primary: {
    container: { backgroundColor: FuelColors.primary },
    label: { color: '#fff' },
    indicator: '#fff',
  },
  secondary: {
    container: { backgroundColor: FuelColors.chipBg },
    label: { color: FuelColors.text },
    indicator: FuelColors.text,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: FuelColors.primary,
    },
    label: { color: FuelColors.primary },
    indicator: FuelColors.primary,
  },
  danger: {
    container: { backgroundColor: FuelColors.danger },
    label: { color: '#fff' },
    indicator: '#fff',
  },
};
