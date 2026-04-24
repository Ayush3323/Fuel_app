import { FuelColors } from '@/constants/theme';
import { Card, Header, Screen } from '@/src/components/ui';
import { href } from '@/src/utils/routerHref';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function MoreRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons name={icon} size={18} color={FuelColors.primary} />
            <Text style={styles.label}>{label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FuelColors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function AdminMoreScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Header title="More" showBack={false} />
      <View style={styles.body}>
        <MoreRow
          label="Team"
          icon="people-outline"
          onPress={() => router.push(href('/(admin)/(tabs)/team'))}
        />
        <MoreRow
          label="Invites"
          icon="key-outline"
          onPress={() => router.push(href('/(admin)/(tabs)/invites'))}
        />
        <MoreRow
          label="Profile"
          icon="person-outline"
          onPress={() => router.push(href('/(admin)/(tabs)/profile'))}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  card: { marginBottom: 12, padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 15, fontWeight: '700', color: FuelColors.text },
});
