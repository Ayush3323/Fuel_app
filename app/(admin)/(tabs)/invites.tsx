import { FuelColors } from '@/constants/theme';
import { Badge, Button, Card, Header, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { appAlert } from '@/src/utils/appAlert';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const THRESHOLD = 12;
const INVITE_TTL_MS = 5 * 60 * 1000;

export default function AdminInvitesScreen() {
  const { invites, pumps, currentUser, createInvite } = useApp();
  const companyId = currentUser?.companyId ?? '';
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(THRESHOLD);

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
  const visibleList = useMemo(
    () => (list.length > THRESHOLD ? list.slice(0, visibleCount) : list),
    [list, visibleCount]
  );
  useEffect(() => {
    setVisibleCount(THRESHOLD);
  }, [list.length]);

  const onGenerate = async () => {
    try {
      const inv = await createInvite(companyId);
      setLastCode(inv.code);
      appAlert(
        'Invite Code Generated',
        `Share code ${inv.code} with the petrol pump operator. It expires in 5 minutes.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate invite code.';
      appAlert('Invite limit reached', message);
    }
  };

  return (
    <Screen>
      <Header title="Invite Pumps" showBack={false} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topAction}>
          <Text style={styles.hint}>
            Generate a unique code to link a new petrol pump to your company credit line.
          </Text>
          <Button title="Generate New Code" onPress={onGenerate} />
        </View>

        {lastCode ? (
          <Card style={styles.highlight}>
            <Text style={styles.lastLabel}>LATEST ACTIVE CODE</Text>
            <Text style={styles.code}>{lastCode}</Text>
          </Card>
        ) : null}

        <View style={styles.headingWrap}>
          <SectionTitle title="Invite History" />
        </View>

        <View style={styles.list}>
          {visibleList.map((inv) => {
            const redeemed = !!inv.redeemedByPumpId;
            const expiresAtMs =
              typeof inv.expiresAt === 'string'
                ? new Date(inv.expiresAt).getTime()
                : new Date(inv.createdAt).getTime() + INVITE_TTL_MS;
            const isExpired = !redeemed && Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();
            const pumpName = inv.redeemedByPumpId
              ? pumps.find((p) => p.id === inv.redeemedByPumpId)?.name ?? inv.redeemedByPumpId
              : null;
            return (
              <Card key={inv.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.codeSm}>{inv.code}</Text>
                  <Badge
                    status={redeemed ? 'paid' : isExpired ? 'expired' : 'pending'}
                    label={redeemed ? 'Redeemed' : isExpired ? 'Expired' : 'Pending'}
                  />
                </View>
                <Text style={styles.meta}>
                  Generated on {new Date(inv.createdAt).toLocaleDateString()}
                </Text>
                {redeemed && pumpName ? (
                  <Text style={styles.redeemed}>Redeemed by {pumpName}</Text>
                ) : isExpired ? (
                  <Text style={styles.expired}>Expired</Text>
                ) : !redeemed ? (
                  <Text style={styles.active}>Available for use</Text>
                ) : null}
              </Card>
            );
          })}
          {list.length === 0 && !lastCode && (
            <Text style={styles.empty}>No active or past invite codes found.</Text>
          )}
          {list.length > THRESHOLD && visibleCount < list.length ? (
            <Button title="Load More" variant="secondary" onPress={() => setVisibleCount((v) => v + THRESHOLD)} />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 16, paddingBottom: 40 },
  topAction: { marginBottom: 20 },
  hint: {
    color: FuelColors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
    paddingHorizontal: 2,
    fontWeight: '500',
    lineHeight: 18
  },
  highlight: {
    marginBottom: 24,
    backgroundColor: FuelColors.primaryMuted,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: FuelColors.primary
  },
  lastLabel: { fontSize: 11, fontWeight: '800', color: FuelColors.primary, letterSpacing: 1 },
  code: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
    color: FuelColors.primary,
    marginTop: 8,
  },
  headingWrap: { marginBottom: 6 },
  list: { },
  card: { marginBottom: 12, padding: 14 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeSm: { fontSize: 18, fontWeight: '800', color: FuelColors.text, letterSpacing: 1 },
  meta: { fontSize: 12, color: FuelColors.textMuted, marginTop: 6 },
  redeemed: { marginTop: 8, fontSize: 13, color: FuelColors.success, fontWeight: '600' },
  active: { marginTop: 8, fontSize: 13, color: FuelColors.warning, fontWeight: '600' },
  expired: { marginTop: 8, fontSize: 13, color: FuelColors.textMuted, fontWeight: '600' },
  empty: { textAlign: 'center', color: FuelColors.textMuted, padding: 32, fontSize: 14 },
});
