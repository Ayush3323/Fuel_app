import { StyleSheet, Text, View } from 'react-native';
import { FuelColors } from '@/constants/theme';
import { billTotalForItems } from '@/src/utils/billMath';
import type { Bill, Company, Pump, Transaction } from '@/src/types';
import { AmountRow } from './AmountRow';

type Props = {
  bill: Bill;
  pump: Pump;
  company: Company;
  transactions: Transaction[];
};

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BillView({ bill, pump, company, transactions }: Props) {
  const items = transactions.filter((t) => bill.itemIds.includes(t.id));
  const parts = billTotalForItems(bill, transactions);

  return (
    <View style={styles.scroll} collapsable={false}>
      <View style={styles.header}>
        <Text style={styles.pumpName}>{pump.name}</Text>
        <Text style={styles.meta}>{pump.address}</Text>
        <Text style={styles.meta}>{pump.contact}</Text>
        <View style={styles.divider} />
        <Text style={styles.billTo}>Bill To</Text>
        <Text style={styles.company}>{company.name}</Text>
        {company.gstin ? <Text style={styles.meta}>GSTIN: {company.gstin}</Text> : null}
      </View>

      <View style={styles.rowMeta}>
        <View>
          <Text style={styles.smallLabel}>Bill No.</Text>
          <Text style={styles.smallVal}>{bill.billNo}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.smallLabel}>Period</Text>
          <Text style={styles.smallVal}>
            {fmtDate(bill.period.from)} – {fmtDate(bill.period.to)}
          </Text>
        </View>
      </View>
      <Text style={styles.genOn}>
        Generated: {fmtDate(bill.generatedAt)}
      </Text>

      <Text style={styles.tableTitle}>Line items</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, { flex: 1.1 }]}>Date</Text>
        <Text style={[styles.th, { flex: 1 }]}>Vehicle</Text>
        <Text style={[styles.th, { flex: 0.5 }]}>Fuel</Text>
        <Text style={[styles.th, { flex: 0.6 }]}>Qty</Text>
        <Text style={[styles.th, { flex: 0.7 }]}>Rate</Text>
        <Text style={[styles.th, { flex: 0.9, textAlign: 'right' }]}>Gross</Text>
      </View>
      {items.map((t) => (
        <View key={t.id} style={styles.tr}>
          <Text style={[styles.td, { flex: 1.1 }]} numberOfLines={1}>
            {fmtDate(t.createdAt)}
          </Text>
          <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>
            {t.vehicleNo}
          </Text>
          <Text style={[styles.td, { flex: 0.5 }]}>{t.fuel}</Text>
          <Text style={[styles.td, { flex: 0.6 }]}>
            {t.actualQty.toFixed(2)}
          </Text>
          <Text style={[styles.td, { flex: 0.7 }]}>{t.rate.toFixed(2)}</Text>
          <Text style={[styles.td, { flex: 0.9, textAlign: 'right' }]}>
            ₹{t.gross.toLocaleString('en-IN')}
          </Text>
        </View>
      ))}
      {items.length === 0 ? (
        <Text style={styles.empty}>No line items</Text>
      ) : null}

      <View style={styles.split}>
        <View style={styles.splitCol}>
          <Text style={styles.splitTitle}>Diesel (HSD)</Text>
          <AmountRow label="Qty (L)" amount={parts.hsdQty.toFixed(2)} />
          <AmountRow label="Gross" amount={parts.hsdGross} />
          <AmountRow
            label={`Discount (${bill.discountHSD.mode === 'per_liter' ? '₹/L' : 'flat'})`}
            amount={-parts.hsdDiscountAmt}
            muted
          />
          <AmountRow label="Net HSD" amount={parts.netHSD} bold />
        </View>
        <View style={styles.splitCol}>
          <Text style={styles.splitTitle}>Petrol (MS)</Text>
          <AmountRow label="Qty (L)" amount={parts.msQty.toFixed(2)} />
          <AmountRow label="Gross" amount={parts.msGross} />
          <AmountRow
            label={`Discount (${bill.discountMS.mode === 'per_liter' ? '₹/L' : 'flat'})`}
            amount={-parts.msDiscountAmt}
            muted
          />
          <AmountRow label="Net MS" amount={parts.netMS} bold />
        </View>
      </View>

      <View style={styles.summary}>
        <AmountRow label="Extra cash (drivers)" amount={parts.extraCash} />
        <AmountRow label="Advances" amount={parts.advances} />
        <AmountRow label="Previous balance" amount={bill.previousBalance} />
        <View style={styles.hr} />
        <AmountRow label="Total due" amount={parts.totalDue} bold />
      </View>

      {bill.status === 'paid' && bill.paymentRefNo ? (
        <View style={styles.paidBox}>
          <Text style={styles.paidTitle}>Payment</Text>
          <Text style={styles.meta}>Ref: {bill.paymentRefNo}</Text>
          {bill.paymentProof ? (
            <Text style={styles.meta}>Proof attached</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.footerNote}>
        Universal credit bill — same format for all pumps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 12 },
  pumpName: {
    fontSize: 18,
    fontWeight: '800',
    color: FuelColors.text,
  },
  meta: { fontSize: 12, color: FuelColors.textSecondary, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: FuelColors.border,
    marginVertical: 12,
  },
  billTo: { fontSize: 11, fontWeight: '700', color: FuelColors.textMuted },
  company: { fontSize: 16, fontWeight: '700', color: FuelColors.text },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  smallLabel: { fontSize: 11, color: FuelColors.textMuted },
  smallVal: { fontSize: 13, fontWeight: '600', color: FuelColors.text },
  genOn: { fontSize: 11, color: FuelColors.textSecondary, marginTop: 6 },
  tableTitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    color: FuelColors.text,
  },
  tableHead: {
    flexDirection: 'row',
    marginTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: FuelColors.border,
  },
  th: { fontSize: 10, fontWeight: '700', color: FuelColors.textSecondary },
  tr: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: FuelColors.border },
  td: { fontSize: 11, color: FuelColors.text },
  empty: { padding: 12, color: FuelColors.textMuted, fontStyle: 'italic' },
  split: { flexDirection: 'row', gap: 12, marginTop: 16 },
  splitCol: {
    flex: 1,
    backgroundColor: FuelColors.chipBg,
    borderRadius: 10,
    padding: 12,
  },
  splitTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    color: FuelColors.text,
  },
  summary: {
    marginTop: 16,
    backgroundColor: FuelColors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: FuelColors.border,
  },
  hr: {
    height: 1,
    backgroundColor: FuelColors.border,
    marginVertical: 8,
  },
  paidBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
  },
  paidTitle: { fontWeight: '800', color: FuelColors.success, marginBottom: 4 },
  footerNote: {
    marginTop: 20,
    fontSize: 11,
    color: FuelColors.textMuted,
    textAlign: 'center',
  },
});
