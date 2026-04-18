import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  SEED_BILLS,
  SEED_COMPANY,
  SEED_PUMPS,
  SEED_REQUESTS,
  SEED_TRANSACTIONS,
  SEED_USERS,
} from '@/src/mock/seed';
import type {
  Bill,
  BillStatus,
  Company,
  FuelDiscount,
  FuelRequest,
  FuelType,
  Pump,
  RequestStatus,
  Transaction,
  User,
} from '@/src/types';
import { billTotalForItems } from '@/src/utils/billMath';

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type AppContextValue = {
  company: Company;
  users: User[];
  pumps: Pump[];
  requests: FuelRequest[];
  transactions: Transaction[];
  bills: Bill[];
  currentUser: User | null;
  login: (loginId: string, password: string) => User | null;
  logout: () => void;
  devSwitchUser: (loginId: string) => void;
  createPump: (input: {
    name: string;
    address: string;
    contact: string;
  }) => { pump: Pump; ownerLoginId: string; ownerPassword: string };
  createEmployee: (pumpId: string, name: string) => {
    user: User;
    loginId: string;
    password: string;
  };
  createFuelRequest: (input: {
    pumpId: string;
    vehicleNo: string;
    fuel: FuelType;
    qty: number;
    notes?: string;
  }) => FuelRequest;
  fillFuelRequest: (input: {
    requestId: string;
    actualQty: number;
    rate: number;
    voucherNo?: string;
    vehiclePhoto?: string;
    receiptPhoto?: string;
    extraCash: number;
    advance: number;
    filledByUserId: string;
  }) => Transaction | null;
  getUnbilledTransactions: (pumpId: string) => Transaction[];
  createBillDraft: (input: {
    pumpId: string;
    companyId: string;
    itemIds: string[];
    period: { from: string; to: string };
    discountHSD: FuelDiscount;
    discountMS: FuelDiscount;
    previousBalance: number;
  }) => Bill;
  updateBill: (id: string, patch: Partial<Bill>) => void;
  raiseBill: (id: string) => void;
  markBillPaid: (
    id: string,
    paymentRefNo: string,
    paymentProof?: string
  ) => void;
  assignTransactionsToBill: (billId: string, itemIds: string[]) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [company] = useState<Company>(SEED_COMPANY);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [pumps, setPumps] = useState<Pump[]>(SEED_PUMPS);
  const [requests, setRequests] = useState<FuelRequest[]>(SEED_REQUESTS);
  const [transactions, setTransactions] = useState<Transaction[]>(
    SEED_TRANSACTIONS
  );
  const [bills, setBills] = useState<Bill[]>(SEED_BILLS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback((loginId: string, password: string) => {
    const u = users.find(
      (x) =>
        x.loginId.toLowerCase() === loginId.trim().toLowerCase() &&
        x.password === password
    );
    if (!u) return null;
    setCurrentUser(u);
    return u;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const devSwitchUser = useCallback(
    (loginId: string) => {
      const u = users.find(
        (x) => x.loginId.toLowerCase() === loginId.trim().toLowerCase()
      );
      if (u) setCurrentUser(u);
    },
    [users]
  );

  const createPump = useCallback(
    (input: { name: string; address: string; contact: string }) => {
      const ownerPassword = `p${Math.random().toString(36).slice(2, 8)}`;
      const ownerLoginId = `pump_${Math.random().toString(36).slice(2, 6)}`;
      const pumpId = genId('pump');
      const ownerId = genId('u');
      const owner: User = {
        id: ownerId,
        role: 'pumpOwner',
        name: `${input.name} Owner`,
        loginId: ownerLoginId,
        password: ownerPassword,
        pumpId,
        companyId: company.id,
      };
      const pump: Pump = {
        id: pumpId,
        companyId: company.id,
        name: input.name,
        address: input.address,
        contact: input.contact,
        ownerUserId: ownerId,
      };
      setUsers((prev) => [...prev, owner]);
      setPumps((prev) => [...prev, pump]);
      return { pump, ownerLoginId, ownerPassword };
    },
    [company.id]
  );

  const createEmployee = useCallback(
    (pumpId: string, name: string) => {
      const password = `e${Math.random().toString(36).slice(2, 8)}`;
      const loginId = `emp_${Math.random().toString(36).slice(2, 6)}`;
      const user: User = {
        id: genId('u'),
        role: 'employee',
        name,
        loginId,
        password,
        pumpId,
        companyId: company.id,
      };
      setUsers((prev) => [...prev, user]);
      return { user, loginId, password };
    },
    [company.id]
  );

  const createFuelRequest = useCallback(
    (input: {
      pumpId: string;
      vehicleNo: string;
      fuel: FuelType;
      qty: number;
      notes?: string;
    }) => {
      const r: FuelRequest = {
        id: genId('req'),
        pumpId: input.pumpId,
        vehicleNo: input.vehicleNo.trim().toUpperCase(),
        fuel: input.fuel,
        qty: input.qty,
        status: 'pending' as RequestStatus,
        notes: input.notes,
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [...prev, r]);
      return r;
    },
    []
  );

  const fillFuelRequest = useCallback(
    (input: {
      requestId: string;
      actualQty: number;
      rate: number;
      voucherNo?: string;
      vehiclePhoto?: string;
      receiptPhoto?: string;
      extraCash: number;
      advance: number;
      filledByUserId: string;
    }) => {
      const req = requests.find((r) => r.id === input.requestId);
      if (!req || req.status !== 'pending') return null;
      const gross = Math.round(input.actualQty * input.rate * 100) / 100;
      const txn: Transaction = {
        id: genId('txn'),
        requestId: req.id,
        pumpId: req.pumpId,
        vehicleNo: req.vehicleNo,
        fuel: req.fuel,
        actualQty: input.actualQty,
        rate: input.rate,
        gross,
        vehiclePhoto: input.vehiclePhoto,
        receiptPhoto: input.receiptPhoto,
        extraCash: input.extraCash,
        advance: input.advance,
        voucherNo: input.voucherNo,
        createdAt: new Date().toISOString(),
        filledByUserId: input.filledByUserId,
      };
      setTransactions((prev) => [...prev, txn]);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? {
                ...r,
                status: 'filled' as RequestStatus,
                filledBy: input.filledByUserId,
                txnId: txn.id,
              }
            : r
        )
      );
      return txn;
    },
    [requests]
  );

  const getUnbilledTransactions = useCallback(
    (pumpId: string) =>
      transactions.filter((t) => t.pumpId === pumpId && !t.billId),
    [transactions]
  );

  const createBillDraft = useCallback(
    (input: {
      pumpId: string;
      companyId: string;
      itemIds: string[];
      period: { from: string; to: string };
      discountHSD: FuelDiscount;
      discountMS: FuelDiscount;
      previousBalance: number;
    }) => {
      const billNo = `BILL-${Date.now().toString(36).toUpperCase()}`;
      const b: Bill = {
        id: genId('bill'),
        pumpId: input.pumpId,
        companyId: input.companyId,
        billNo,
        period: input.period,
        generatedAt: new Date().toISOString(),
        itemIds: input.itemIds,
        discountHSD: input.discountHSD,
        discountMS: input.discountMS,
        previousBalance: input.previousBalance,
        status: 'draft' as BillStatus,
      };
      setBills((prev) => [...prev, b]);
      setTransactions((prev) =>
        prev.map((t) =>
          input.itemIds.includes(t.id) ? { ...t, billId: b.id } : t
        )
      );
      return b;
    },
    []
  );

  const updateBill = useCallback((id: string, patch: Partial<Bill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const raiseBill = useCallback((id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'raised' as BillStatus } : b))
    );
  }, []);

  const markBillPaid = useCallback(
    (id: string, paymentRefNo: string, paymentProof?: string) => {
      setBills((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: 'paid' as BillStatus,
                paymentRefNo,
                paymentProof,
              }
            : b
        )
      );
    },
    []
  );

  const assignTransactionsToBill = useCallback(
    (billId: string, itemIds: string[]) => {
      setBills((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, itemIds } : b))
      );
      setTransactions((prev) =>
        prev.map((t) => {
          if (itemIds.includes(t.id)) return { ...t, billId };
          if (t.billId === billId && !itemIds.includes(t.id))
            return { ...t, billId: undefined };
          return t;
        })
      );
    },
    []
  );

  const value = useMemo<AppContextValue>(
    () => ({
      company,
      users,
      pumps,
      requests,
      transactions,
      bills,
      currentUser,
      login,
      logout,
      devSwitchUser,
      createPump,
      createEmployee,
      createFuelRequest,
      fillFuelRequest,
      getUnbilledTransactions,
      createBillDraft,
      updateBill,
      raiseBill,
      markBillPaid,
      assignTransactionsToBill,
    }),
    [
      company,
      users,
      pumps,
      requests,
      transactions,
      bills,
      currentUser,
      login,
      logout,
      devSwitchUser,
      createPump,
      createEmployee,
      createFuelRequest,
      fillFuelRequest,
      getUnbilledTransactions,
      createBillDraft,
      updateBill,
      raiseBill,
      markBillPaid,
      assignTransactionsToBill,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useOutstandingForPump(pumpId: string) {
  const { transactions, bills } = useApp();
  return useMemo(() => {
    let owed = 0;
    for (const b of bills) {
      if (b.pumpId !== pumpId) continue;
      if (b.status === 'paid') continue;
      const parts = billTotalForItems(b, transactions);
      owed += parts.totalDue;
    }
    const unbilled = transactions.filter(
      (t) => t.pumpId === pumpId && !t.billId
    );
    for (const t of unbilled) {
      owed += t.gross + t.extraCash + t.advance;
    }
    return Math.round(owed * 100) / 100;
  }, [pumpId, transactions, bills]);
}
