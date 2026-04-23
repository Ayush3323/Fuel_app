import React, { type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  style,
  leftIcon,
  containerStyle,
  ...rest
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error && styles.inputError, containerStyle, style as any]}>
        {leftIcon && <View style={styles.iconBox}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={FuelColors.textMuted}
          style={styles.input}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: FuelColors.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 10,
    backgroundColor: FuelColors.surface,
  },
  iconBox: {
    paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: FuelColors.text,
  },
  inputError: { borderColor: FuelColors.danger },
  err: { color: FuelColors.danger, fontSize: 12, marginTop: 4 },
});
