import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function Header({ title, subtitle, showBack = true, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={24} color={FuelColors.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FuelColors.border,
    backgroundColor: FuelColors.surface,
  },
  back: { width: 40, justifyContent: 'center' },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: FuelColors.text,
  },
  sub: {
    fontSize: 12,
    color: FuelColors.textSecondary,
    marginTop: 2,
  },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
