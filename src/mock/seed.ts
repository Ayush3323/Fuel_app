import type {
  Bill,
  Company,
  CompanyPumpLink,
  FuelRequest,
  Pump,
  PumpInvite,
  Transaction,
  User,
} from '@/src/types';

export const SEED_COMPANIES: Company[] = [
  {
    id: 'co1',
    name: 'Karma Cargo Movers',
    gstin: '06XXXXX1234X1ZX',
  },
  {
    id: 'co2',
    name: 'Shree Logistics',
    gstin: '09YYYYY5678Y2ZY',
  },
];

export const SEED_LINKS: CompanyPumpLink[] = [
  {
    id: 'link-co1-p1',
    companyId: 'co1',
    pumpId: 'p1',
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    active: true,
  },
  {
    id: 'link-co1-p2',
    companyId: 'co1',
    pumpId: 'p2',
    joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    active: true,
  },
  {
    id: 'link-co2-p1',
    companyId: 'co2',
    pumpId: 'p1',
    joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    active: true,
  },
];

/** Active unredeemed invite for co2 — pump can join with ABC123 in demo */
export const SEED_INVITES: PumpInvite[] = [
  {
    id: 'inv-demo-co2',
    companyId: 'co2',
    code: 'ABC123',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_USERS: User[] = [
  {
    id: 'u-admin',
    role: 'admin',
    name: 'Karma Owner',
    loginId: 'admin',
    password: 'admin123',
    companyId: 'co1',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'u-admin-co2',
    role: 'admin',
    name: 'Shree Owner',
    loginId: 'shree',
    password: 'shree123',
    companyId: 'co2',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'u-pump1',
    role: 'pumpOwner',
    name: 'HPE Pump Owner',
    loginId: 'pump1',
    password: 'pump123',
    pumpId: 'p1',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
  {
    id: 'u-pump2',
    role: 'pumpOwner',
    name: 'Ellar FS Owner',
    loginId: 'pump2',
    password: 'pump123',
    pumpId: 'p2',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'u-emp1',
    role: 'employee',
    name: 'Shift A',
    loginId: 'emp1',
    password: 'emp123',
    pumpId: 'p1',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

export const SEED_PUMPS: Pump[] = [
  {
    id: 'p1',
    name: 'HPE Filling Station',
    address: 'Sector 59, Ballabgarh',
    contact: '+91 98765 43210',
    ownerUserId: 'u-pump1',
  },
  {
    id: 'p2',
    name: 'HP Ellar Filling Station',
    address: 'Ballabgarh',
    contact: '+91 91234 56789',
    ownerUserId: 'u-pump2',
  },
];

export const SEED_REQUESTS: FuelRequest[] = [
  {
    id: 'req-old1',
    companyId: 'co1',
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
    companyId: 'co1',
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
    companyId: 'co1',
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
    companyId: 'co1',
    pumpId: 'p1',
    vehicleNo: 'DL01CA1234',
    fuel: 'MS',
    qty: 45,
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'req-shree-pending',
    companyId: 'co2',
    pumpId: 'p1',
    vehicleNo: 'MH12KC7777',
    fuel: 'HSD',
    qty: 200,
    status: 'pending',
    notes: 'Shree Logistics',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'req-shree-filled',
    companyId: 'co2',
    pumpId: 'p1',
    vehicleNo: 'DL03SH1111',
    fuel: 'MS',
    qty: 30,
    status: 'filled',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    txnId: 'txn-shree-co2',
  },
  {
    id: 'req-unbilled-co2-2',
    companyId: 'co2',
    pumpId: 'p1',
    vehicleNo: 'MH14AB4567',
    fuel: 'HSD',
    qty: 120,
    status: 'filled',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    txnId: 'txn-unbilled-co2-2',
  },
  {
    id: 'req3',
    companyId: 'co1',
    pumpId: 'p2',
    vehicleNo: 'HR38T9999',
    fuel: 'HSD',
    qty: 500,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req4',
    companyId: 'co1',
    pumpId: 'p1',
    vehicleNo: 'HR55AB9044',
    fuel: 'HSD',
    qty: 100,
    status: 'filled',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    txnId: 'txn-unbilled-1',
  },
  {
    id: 'req-unbilled-co1-2',
    companyId: 'co1',
    pumpId: 'p1',
    vehicleNo: 'HR99ZZ1234',
    fuel: 'MS',
    qty: 20,
    status: 'filled',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    txnId: 'txn-unbilled-co1-2',
  },
];

const t1: Transaction = {
  id: 'txn1',
  requestId: 'req-old1',
  companyId: 'co1',
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
  companyId: 'co1',
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

const t3: Transaction = {
  id: 'txn-unbilled-1',
  requestId: 'req4',
  companyId: 'co1',
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

const tShreeCo2: Transaction = {
  id: 'txn-shree-co2',
  requestId: 'req-shree-filled',
  companyId: 'co2',
  pumpId: 'p1',
  vehicleNo: 'DL03SH1111',
  fuel: 'MS',
  actualQty: 30.2,
  rate: 96.1,
  gross: 2902.22,
  extraCash: 0,
  advance: 0,
  voucherNo: 'SHR/MS/001',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  filledByUserId: 'u-emp1',
};

const tUnbilledCo1_2: Transaction = {
  id: 'txn-unbilled-co1-2',
  requestId: 'req-unbilled-co1-2',
  companyId: 'co1',
  pumpId: 'p1',
  vehicleNo: 'HR99ZZ1234',
  fuel: 'MS',
  actualQty: 19.5,
  rate: 96,
  gross: 1872,
  extraCash: 0,
  advance: 0,
  voucherNo: 'HPE/MS/002',
  createdAt: new Date(Date.now() - 1800000).toISOString(),
  filledByUserId: 'u-emp1',
};

const tUnbilledCo2_2: Transaction = {
  id: 'txn-unbilled-co2-2',
  requestId: 'req-unbilled-co2-2',
  companyId: 'co2',
  pumpId: 'p1',
  vehicleNo: 'MH14AB4567',
  fuel: 'HSD',
  actualQty: 120,
  rate: 89.2,
  gross: 10704,
  extraCash: 0,
  advance: 0,
  voucherNo: 'SHR/HSD/002',
  createdAt: new Date(Date.now() - 1200000).toISOString(),
  filledByUserId: 'u-emp1',
};

export const SEED_TRANSACTIONS: Transaction[] = [
  t1,
  t2,
  t3,
  tShreeCo2,
  tUnbilledCo1_2,
  tUnbilledCo2_2,
];

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

/** @deprecated use SEED_COMPANIES[0] */
export const SEED_COMPANY = SEED_COMPANIES[0];
