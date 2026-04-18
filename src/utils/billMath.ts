import type { Bill, FuelDiscount, FuelType, Transaction } from '@/src/types';

export function applyDiscount(
  gross: number,
  qty: number,
  fuel: FuelType,
  discountHSD: FuelDiscount,
  discountMS: FuelDiscount
): number {
  const d = fuel === 'HSD' ? discountHSD : discountMS;
  if (d.mode === 'flat') return Math.max(0, gross - d.value);
  return Math.max(0, gross - d.value * qty);
}

export function computeBillParts(
  items: Transaction[],
  discountHSD: FuelDiscount,
  discountMS: FuelDiscount,
  previousBalance: number
) {
  const hsdItems = items.filter((t) => t.fuel === 'HSD');
  const msItems = items.filter((t) => t.fuel === 'MS');
  const hsdGross = hsdItems.reduce((s, t) => s + t.gross, 0);
  const msGross = msItems.reduce((s, t) => s + t.gross, 0);
  const hsdQty = hsdItems.reduce((s, t) => s + t.actualQty, 0);
  const msQty = msItems.reduce((s, t) => s + t.actualQty, 0);

  let hsdDiscountAmt = 0;
  if (discountHSD.mode === 'flat') hsdDiscountAmt = discountHSD.value;
  else hsdDiscountAmt = discountHSD.value * hsdQty;

  let msDiscountAmt = 0;
  if (discountMS.mode === 'flat') msDiscountAmt = discountMS.value;
  else msDiscountAmt = discountMS.value * msQty;

  const netHSD = Math.max(0, hsdGross - hsdDiscountAmt);
  const netMS = Math.max(0, msGross - msDiscountAmt);
  const extraCash = items.reduce((s, t) => s + t.extraCash, 0);
  const advances = items.reduce((s, t) => s + t.advance, 0);
  const periodNet = netHSD + netMS + extraCash + advances;
  const totalDue = previousBalance + periodNet;

  return {
    hsdQty,
    msQty,
    hsdGross,
    msGross,
    hsdDiscountAmt,
    msDiscountAmt,
    netHSD,
    netMS,
    extraCash,
    advances,
    periodNet,
    totalDue,
  };
}

export function billTotalForItems(
  bill: Bill,
  allTxns: Transaction[]
): ReturnType<typeof computeBillParts> {
  const items = allTxns.filter((t) => bill.itemIds.includes(t.id));
  return computeBillParts(
    items,
    bill.discountHSD,
    bill.discountMS,
    bill.previousBalance
  );
}
