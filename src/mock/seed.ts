import type {
  Bill,
  Company,
  FuelRequest,
  Pump,
  Transaction,
  User,
} from '@/src/types';

export const SEED_COMPANY: Company = {
  id: 'co1',
  name: 'Karma Cargo Movers',
  gstin: '06XXXXX1234X1ZX',
};

export const SEED_USERS: User[] = [
  {
    id: 'u-admin',
    role: 'admin',
    name: 'Company Owner',
    loginId: 'admin',
    password: 'admin123',
    companyId: 'co1',
  },
  {
    id: 'u-pump1',
    role: 'pumpOwner',
    name: 'HPE Pump Owner',
    loginId: 'pump1',
    password: 'pump123',
    pumpId: 'p1',
    companyId: 'co1',
  },
  {
    id: 'u-pump2',
    role: 'pumpOwner',
    name: 'Ellar FS Owner',
    loginId: 'pump2',
    password: 'pump123',
    pumpId: 'p2',
    companyId: 'co1',
  },
  {
    id: 'u-emp1',
    role: 'employee',
    name: 'Shift A',
    loginId: 'emp1',
    password: 'emp123',
    pumpId: 'p1',
    companyId: 'co1',
  },
];

export const SEED_PUMPS: Pump[] = [
  {
    id: 'p1',
    companyId: 'co1',
    name: 'HPE Filling Station',
    address: 'Sector 59, Ballabgarh',
    contact: '+91 98765 43210',
    ownerUserId: 'u-pump1',
  },
  {
    id: 'p2',
    companyId: 'co1',
    name: 'HP Ellar Filling Station',
    address: 'Ballabgarh',
    contact: '+91 91234 56789',
    ownerUserId: 'u-pump2',
  },
];

export const SEED_REQUESTS: FuelRequest[] = [
  {
    id: 'req-old1',
    pumpId: 'p1',
    vehicleNo: 'HR55XY1111',
    fuel: 'HSD',
    qty: 300,
    status: 'filled',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    txnId: 'txn1',
  },
  {
    id: 'req-old2',
    pumpId: 'p1',
    vehicleNo: 'HR55AB8888',
    fuel: 'MS',
    qty: 50,
    status: 'filled',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    txnId: 'txn2',
  },
  {
    id: 'req1',
    pumpId: 'p1',
    vehicleNo: 'HR55AB9044',
    fuel: 'HSD',
    qty: 300,
    status: 'pending',
    notes: 'Night shift',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req2',
    pumpId: 'p1',
    vehicleNo: 'DL01CA1234',
    fuel: 'MS',
    qty: 45,
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'req3',
    pumpId: 'p2',
    vehicleNo: 'HR38T9999',
    fuel: 'HSD',
    qty: 500,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req4',
    pumpId: 'p1',
    vehicleNo: 'HR55AB9044',
    fuel: 'HSD',
    qty: 100,
    status: 'filled',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    txnId: 'txn-unbilled-1',
  },
];

const t1: Transaction = {
  id: 'txn1',
  requestId: 'req-old1',
  pumpId: 'p1',
  vehicleNo: 'HR55XY1111',
  fuel: 'HSD',
  actualQty: 281.74,
  rate: 88.39,
  gross: 24903,
  extraCash: 500,
  advance: 0,
  voucherNo: '32410/9044',
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  filledByUserId: 'u-emp1',
  billId: 'bill1',
};

const t2: Transaction = {
  id: 'txn2',
  requestId: 'req-old2',
  pumpId: 'p1',
  vehicleNo: 'HR55AB8888',
  fuel: 'MS',
  actualQty: 50.45,
  rate: 95.95,
  gross: 4840.68,
  extraCash: 0,
  advance: 2000,
  voucherNo: '32411/8888',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  filledByUserId: 'u-emp1',
  billId: 'bill1',
};

/** Unbilled sample for "Raise bill" demo */
const t3: Transaction = {
  id: 'txn-unbilled-1',
  requestId: 'req4',
  pumpId: 'p1',
  vehicleNo: 'HR55AB9044',
  fuel: 'HSD',
  actualQty: 100,
  rate: 88.39,
  gross: 8839,
  extraCash: 0,
  advance: 0,
  voucherNo: '9001/9044',
  createdAt: new Date().toISOString(),
  filledByUserId: 'u-emp1',
};

export const SEED_TRANSACTIONS: Transaction[] = [t1, t2, t3];

export const SEED_BILLS: Bill[] = [
  {
    id: 'bill1',
    pumpId: 'p1',
    companyId: 'co1',
    billNo: 'KCM-BILL-2026-001',
    period: {
      from: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
      to: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    },
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    itemIds: ['txn1', 'txn2'],
    discountHSD: { mode: 'per_liter', value: 0.5 },
    discountMS: { mode: 'flat', value: 100 },
    previousBalance: 15000,
    status: 'raised',
  },
];
