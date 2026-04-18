import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';

export default function AdminInvitesScreen() {
  const { invites, pumps, currentUser, createInvite } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const [lastCode, setLastCode] = useState<string | null>(null);

  const list = useMemo(
    () =>
      [...invites]
        .filter((i) => i.companyId === companyId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [invites, companyId]
  );

  const onGenerate = () => {
    const inv = createInvite(companyId);
    setLastCode(inv.code);
    Alert.alert('Invite code', inv.code, [{ text: 'OK' }]);
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Invites</Text>
        <Button title="Generate code" onPress={onGenerate} />
      </View>
      <Text style={styles.hint}>
        Share this code with a pump owner. They enter it under Join on their
        Companies screen.
      </Text>
      {lastCode ? (
        <Card style={styles.highlight}>
          <Text style={styles.lastLabel}>Latest code</Text>
          <Text style={styles.code}>{lastCode}</Text>
        </Card>
      ) : null}

      <SectionTitle title="History" />
      <ScrollView contentContainerStyle={styles.list}>
        {list.map((inv) => {
          const redeemed = !!inv.redeemedByPumpId;
          const pumpName = inv.redeemedByPumpId
            ? pumps.find((p) => p.id === inv.redeemedByPumpId)?.name ?? inv.redeemedByPumpId
            : null;
          return (
            <Card key={inv.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.codeSm}>{inv.code}</Text>
                <Badge status={redeemed ? 'paid' : 'pending'} />
              </View>
              <Text style={styles.meta}>
                {new Date(inv.createdAt).toLocaleString()}
              </Text>
              {redeemed && pumpName ? (
                <Text style={styles.redeemed}>Redeemed by {pumpName}</Text>
              ) : !redeemed ? (
                <Text style={styles.active}>Active — not yet used</Text>
              ) : null}
            </Card>
          );
        })}
        {list.length === 0 ? (
          <Text style={styles.empty}>No invites yet. Generate one.</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: FuelColors.text, flex: 1 },
  hint: {
    paddingHorizontal: 16,
    color: FuelColors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  highlight: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: FuelColors.primaryMuted,
    alignItems: 'center',
  },
  lastLabel: { fontSize: 12, color: FuelColors.textSecondary },
  code: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    color: FuelColors.primary,
    marginTop: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeSm: { fontSize: 18, fontWeight: '800', color: FuelColors.text },
  meta: { fontSize: 12, color: FuelColors.textMuted, marginTop: 6 },
  redeemed: { marginTop: 6, fontSize: 13, color: FuelColors.success },
  active: { marginTop: 6, fontSize: 13, color: FuelColors.warning },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 24 },
});
