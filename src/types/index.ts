export type Role = 'admin' | 'pumpOwner' | 'employee';

export type FuelType = 'HSD' | 'MS';

export type RequestStatus = 'pending' | 'filled' | 'cancelled' | 'expired';

export type BillStatus = 'draft' | 'raised' | 'paid';

export type DiscountMode = 'per_liter' | 'flat';

export interface User {
  id: string;
  role: Role;
  name: string;
  loginId: string;
  password: string;
  pumpId?: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  gstin?: string;
}

export interface Pump {
  id: string;
  companyId: string;
  name: string;
  address: string;
  contact: string;
  ownerUserId: string;
}

export interface FuelRequest {
  id: string;
  pumpId: string;
  vehicleNo: string;
  fuel: FuelType;
  qty: number;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  filledBy?: string;
  txnId?: string;
}

export interface Transaction {
  id: string;
  requestId: string;
  pumpId: string;
  vehicleNo: string;
  fuel: FuelType;
  actualQty: number;
  rate: number;
  gross: number;
  vehiclePhoto?: string;
  receiptPhoto?: string;
  extraCash: number;
  advance: number;
  voucherNo?: string;
  createdAt: string;
  filledByUserId: string;
  billId?: string;
}

export interface FuelDiscount {
  mode: DiscountMode;
  value: number;
}

export interface Bill {
  id: string;
  pumpId: string;
  companyId: string;
  billNo: string;
  period: { from: string; to: string };
  generatedAt: string;
  itemIds: string[];
  discountHSD: FuelDiscount;
  discountMS: FuelDiscount;
  previousBalance: number;
  status: BillStatus;
  paymentRefNo?: string;
  paymentProof?: string;
}
