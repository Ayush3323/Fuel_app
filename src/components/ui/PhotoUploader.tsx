import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';

type Props = {
  label: string;
  uri?: string;
  onPick: () => void;
};

/** Mock: sets a placeholder asset on pick */
export function PhotoUploader({ label, uri, onPick }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPick}
        style={({ pressed }) => [
          styles.box,
          pressed && { opacity: 0.85 },
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.img} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={32} color={FuelColors.primary} />
            <Text style={styles.hint}>Tap to add (demo)</Text>
          </View>
        )}
      </Pressable>
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
  box: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderStyle: 'dashed',
    backgroundColor: FuelColors.primaryMuted,
  },
  img: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { marginTop: 6, fontSize: 12, color: FuelColors.textSecondary },
});
