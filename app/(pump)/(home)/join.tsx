import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FuelColors } from '@/constants/theme';
import { Button, Header, Input, Screen } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';
import { href } from '@/src/utils/routerHref';

export default function PumpJoinScreen() {
  const router = useRouter();
  const { redeemInvite, currentUser } = useApp();
  const [code, setCode] = useState('');
  const pumpId = currentUser?.pumpId ?? '';

  const onJoin = async () => {
    const r = await redeemInvite(code, pumpId);
    if (!r.ok) {
      appAlert('Could not join', r.error);
      return;
    }
    appAlert('Connected', `You are now linked to ${r.company.name}.`, [
      {
        text: 'OK',
        onPress: () => router.replace(href('/(pump)/(home)/dashboard')),
      },
    ]);
  };

  return (
    <Screen>
      <Header title="Join company" />
      <View style={styles.body}>
        <Text style={styles.hint}>
          Enter the 6-character invite code your transport partner shared.
        </Text>
        <Input
          label="Invite code"
          autoCapitalize="characters"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={8}
        />
        <Button title="Join" onPress={onJoin} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  hint: { color: FuelColors.textSecondary, marginBottom: 16, lineHeight: 22 },
});
