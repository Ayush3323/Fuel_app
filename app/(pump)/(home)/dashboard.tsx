import { FuelColors } from '@/constants/theme';
import { Card, CompanyCard, EmptyState, Header, Input, Screen, SectionTitle } from '@/src/components/ui';
import { useApp } from '@/src/context/AppContext';
import { billTotalForItems } from '@/src/utils/billMath';
import { href } from '@/src/utils/routerHref';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type FilterKey = 'all' | 'has_pending' | 'no_pending' | 'high_outstanding';

type CompanyDirectoryItem = {
  id: string;
  name: string;
  pending: number;
  outstanding: number;
  lastBillLabel?: string;
};

function CompanyRow({ item }: { item: CompanyDirectoryItem }) {
  const router = useRouter();
  return (
    <CompanyCard
      companyName={item.name}
      outstanding={`₹ ${item.outstanding.toLocaleString('en-IN')}`}
      pendingCount={item.pending}
      lastBillLabel={item.lastBillLabel}
      onPress={() => router.push(href(`/(pump)/${item.id}/billing`))}
    />
  );
}

export default function PumpCompaniesHome() {
  const router = useRouter();
  const { currentUser, pumps, getCompaniesForPump, requests, bills, transactions, updateMyPumpRates } = useApp();
  const pumpId = currentUser?.pumpId ?? '';
  const pump = pumps.find((p) => p.id === pumpId);
  const companies = getCompaniesForPump(pumpId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [hsdRate, setHsdRate] = useState(pump?.hsdRate != null ? String(pump.hsdRate) : '');
  const [msRate, setMsRate] = useState(pump?.msRate != null ? String(pump.msRate) : '');
  const [savingRates, setSavingRates] = useState(false);
  const [editingRates, setEditingRates] = useState(false);
  const [rateErr, setRateErr] = useState('');
  const [rateInfo, setRateInfo] = useState('');

  const directoryRows = useMemo<CompanyDirectoryItem[]>(() => {
    return companies
      .map((company) => {
        const pending = requests.filter(
          (r) =>
            r.companyId === company.id &&
            r.pumpId === pumpId &&
            r.status === 'pending'
        ).length;
        let outstanding = 0;
        for (const b of bills) {
          if (b.pumpId !== pumpId || b.companyId !== company.id || b.status === 'paid') continue;
          outstanding += billTotalForItems(b, transactions).totalDue;
        }
        const unbilled = transactions.filter(
          (t) => t.pumpId === pumpId && t.companyId === company.id && !t.billId
        );
        for (const t of unbilled) outstanding += t.gross + t.extraCash + t.advance;
        outstanding = Math.round(outstanding * 100) / 100;

        const pairBills = bills
          .filter((b) => b.companyId === company.id && b.pumpId === pumpId)
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        const last = pairBills[0];
        const lastBillLabel = last ? `Last bill: ${last.billNo} (${last.status})` : undefined;
        return { id: company.id, name: company.name, pending, outstanding, lastBillLabel };
      })
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [companies, requests, bills, transactions, pumpId]);

  const filteredRows = useMemo(() => {
    const highestOutstanding = directoryRows.reduce(
      (max, row) => Math.max(max, row.outstanding),
      0
    );
    const dynamicHighOutstandingThreshold =
      highestOutstanding > 0 ? highestOutstanding * 0.7 : 0;
    const q = query.trim().toLowerCase();
    return directoryRows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'has_pending':
          return row.pending > 0;
        case 'no_pending':
          return row.pending === 0;
        case 'high_outstanding':
          return (
            row.outstanding > 0 &&
            row.outstanding >= dynamicHighOutstandingThreshold
          );
        default:
          return true;
      }
    });
  }, [directoryRows, query, filter]);
  const previewRows = useMemo(() => filteredRows.slice(0, 2), [filteredRows]);

  const summary = useMemo(() => {
    return {
      linkedCompanies: directoryRows.length,
      pendingTotal: directoryRows.reduce((sum, row) => sum + row.pending, 0),
      outstandingTotal: directoryRows.reduce((sum, row) => sum + row.outstanding, 0),
    };
  }, [directoryRows]);

  useEffect(() => {
    setHsdRate(pump?.hsdRate != null ? String(pump.hsdRate) : '');
    setMsRate(pump?.msRate != null ? String(pump.msRate) : '');
  }, [pump?.hsdRate, pump?.msRate]);

  const onSaveRates = async () => {
    const hsd = hsdRate.trim() ? parseFloat(hsdRate) : null;
    const ms = msRate.trim() ? parseFloat(msRate) : null;
    if ((hsdRate.trim() && (!Number.isFinite(hsd) || (hsd ?? 0) <= 0)) || (msRate.trim() && (!Number.isFinite(ms) || (ms ?? 0) <= 0))) {
      setRateErr('Enter valid positive rates or keep fields empty.');
      setRateInfo('');
      return false;
    }
    setRateErr('');
    setRateInfo('');
    setSavingRates(true);
    try {
      await updateMyPumpRates({ hsdRate: hsd, msRate: ms });
      setRateInfo('Fuel prices saved. Fill screens now auto-fetch these rates.');
      return true;
    } catch {
      setRateErr('Could not save pump fuel prices.');
      return false;
    } finally {
      setSavingRates(false);
    }
  };

  return (
    <Screen>
      <Header
        title={pump?.name ?? 'Pump'}
        subtitle={pump?.address ?? ''}
        showBack={false}
        right={
          <Pressable
            onPress={() => router.push(href('/(pump)/(home)/join'))}
            style={styles.joinBtn}
          >
            <Text style={styles.joinTxt}>Link Company</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionTitle title="Today's Fuel Prices" />
          <Card style={styles.pricingCard}>
            {!editingRates ? (
              <View style={styles.priceGrid}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceKey}>HSD</Text>
                  <Text style={styles.priceVal}>
                    {hsdRate.trim() ? `₹${parseFloat(hsdRate).toLocaleString('en-IN')}` : '-'}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceKey}>MS</Text>
                  <Text style={styles.priceVal}>
                    {msRate.trim() ? `₹${parseFloat(msRate).toLocaleString('en-IN')}` : '-'}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Input
                  label="HSD"
                  keyboardType="decimal-pad"
                  value={hsdRate}
                  onChangeText={setHsdRate}
                  placeholder="Enter HSD rate"
                  editable={!savingRates}
                />
                <Input
                  label="MS"
                  keyboardType="decimal-pad"
                  value={msRate}
                  onChangeText={setMsRate}
                  placeholder="Enter MS rate"
                  editable={!savingRates}
                />
              </>
            )}
            {rateErr ? <Text style={styles.rateErr}>{rateErr}</Text> : null}
            {rateInfo ? <Text style={styles.rateInfo}>{rateInfo}</Text> : null}
            <View style={styles.rateActionRow}>
              {editingRates ? (
                <>
                  <Pressable
                    style={styles.rateActionGhost}
                    onPress={() => {
                      setEditingRates(false);
                      setRateErr('');
                      setRateInfo('');
                      setHsdRate(pump?.hsdRate != null ? String(pump.hsdRate) : '');
                      setMsRate(pump?.msRate != null ? String(pump.msRate) : '');
                    }}
                    disabled={savingRates}
                  >
                    <Text style={styles.rateActionGhostTxt}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.rateActionPrimary}
                    onPress={async () => {
                      const ok = await onSaveRates();
                      if (ok) setEditingRates(false);
                    }}
                    disabled={savingRates}
                  >
                    <Text style={styles.rateActionPrimaryTxt}>{savingRates ? 'Saving...' : 'Save'}</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.rateActionPrimary}
                  onPress={() => {
                    setRateErr('');
                    setRateInfo('');
                    setEditingRates(true);
                  }}
                >
                  <Text style={styles.rateActionPrimaryTxt}>Update</Text>
                </Pressable>
              )}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Portfolio Snapshot" />
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Connected</Text>
              <Text style={styles.summaryValue}>{summary.linkedCompanies}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{summary.pendingTotal}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={styles.summaryValue}>₹{summary.outstandingTotal.toLocaleString('en-IN')}</Text>
            </Card>
          </View>
        </View>

        <View style={styles.previewHeader}>
          <SectionTitle title="Connected Companies" style={styles.section} />
          <Pressable onPress={() => router.push(href('/(pump)/(home)/companies'))}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.searchSection}>
          <Input
            label="Search company"
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Acme Logistics"
          />
        </View>

        <View style={styles.chipsRow}>
          {[
            { key: 'all' as FilterKey, label: 'All' },
            { key: 'has_pending' as FilterKey, label: 'Has Pending' },
            { key: 'no_pending' as FilterKey, label: 'No Pending' },
            { key: 'high_outstanding' as FilterKey, label: 'High Outstanding' },
          ].map((chip) => (
            <Pressable
              key={chip.key}
              style={[styles.chip, filter === chip.key && styles.chipOn]}
              onPress={() => setFilter(chip.key)}
            >
              <Text style={[styles.chipTxt, filter === chip.key && styles.chipTxtOn]}>{chip.label}</Text>
            </Pressable>
          ))}
        </View>

        {directoryRows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No companies yet"
              subtitle="Tap Link Company and enter an invite code from a transport company to start billing."
            />
          </View>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="No companies match this filter"
            subtitle="Try changing search text or selecting a different status."
          />
        ) : (
          <View style={styles.list}>
            {previewRows.map((item) => (
              <CompanyRow key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginTop: 8 },
  joinBtn: {
    backgroundColor: FuelColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  pricingCard: { padding: 12, marginTop: 6 },
  priceGrid: { gap: 8 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceKey: { fontSize: 13, fontWeight: '800', color: FuelColors.textSecondary },
  priceVal: { fontSize: 14, fontWeight: '800', color: FuelColors.text },
  rateActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  rateActionPrimary: {
    backgroundColor: FuelColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rateActionPrimaryTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  rateActionGhost: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    backgroundColor: FuelColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rateActionGhostTxt: { color: FuelColors.textSecondary, fontSize: 12, fontWeight: '700' },
  summaryCard: { flex: 1, padding: 10 },
  summaryLabel: { color: FuelColors.textSecondary, fontSize: 11, fontWeight: '700' },
  summaryValue: { color: FuelColors.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
  previewHeader: {
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllText: { color: FuelColors.primary, fontWeight: '800', fontSize: 13 },
  searchSection: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 2 },
  scrollBody: { paddingBottom: 24 },
  chip: {
    borderWidth: 1,
    borderColor: FuelColors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: FuelColors.surface,
  },
  chipOn: {
    borderColor: FuelColors.primary,
    backgroundColor: FuelColors.primaryMuted,
  },
  chipTxt: { color: FuelColors.textSecondary, fontSize: 12, fontWeight: '700' },
  chipTxtOn: { color: FuelColors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  rateErr: { color: FuelColors.danger, marginBottom: 8, fontSize: 13 },
  rateInfo: { color: FuelColors.success, marginBottom: 8, fontSize: 13, fontWeight: '600' },
});
