import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  SEED_BILLS,
  SEED_COMPANIES,
  SEED_INVITES,
  SEED_LINKS,
  SEED_PUMPS,
  SEED_REQUESTS,
  SEED_TRANSACTIONS,
  SEED_USERS,
} from '@/src/mock/seed';
import type {
  Bill,
  BillStatus,
  Company,
  CompanyPumpLink,
  FuelDiscount,
  FuelRequest,
  FuelType,
  Pump,
  PumpInvite,
  RequestStatus,
  Transaction,
  User,
} from '@/src/types';
import { billTotalForItems } from '@/src/utils/billMath';

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

type RegisterCompanyInput = {
  name: string;
  gstin?: string;
  loginId: string;
  password: string;
  ownerDisplayName?: string;
};

type RegisterPumpInput = {
  name: string;
  address: string;
  contact: string;
  loginId: string;
  password: string;
  ownerDisplayName?: string;
};

type AppContextValue = {
  companies: Company[];
  links: CompanyPumpLink[];
  invites: PumpInvite[];
  users: User[];
  pumps: Pump[];
  requests: FuelRequest[];
  transactions: Transaction[];
  bills: Bill[];
  currentUser: User | null;
  getCompany: (id: string) => Company | undefined;
  getPumpsForCompany: (companyId: string) => Pump[];
  getCompaniesForPump: (pumpId: string) => Company[];
  isPumpLinkedToCompany: (pumpId: string, companyId: string) => boolean;
  login: (loginId: string, password: string) => User | null;
  logout: () => void;
  devSwitchUser: (loginId: string) => void;
  registerCompany: (input: RegisterCompanyInput) => User;
  registerPump: (input: RegisterPumpInput) => User;
  createInvite: (companyId: string) => PumpInvite;
  redeemInvite: (
    code: string,
    pumpId: string
  ) => { ok: true; company: Company } | { ok: false; error: string };
  createEmployee: (pumpId: string, name: string) => {
    user: User;
    loginId: string;
    password: string;
  };
  createFuelRequest: (input: {
    companyId: string;
    pumpId: string;
    vehicleNo: string;
    fuel: FuelType;
    qty: number;
    extraCash?: number;
    isTankFull?: boolean;
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
  getUnbilledTransactions: (pumpId: string, companyId: string) => Transaction[];
  createBill: (input: {
    pumpId: string;
    companyId: string;
    itemIds: string[];
    period: { from: string; to: string };
    discountHSD: FuelDiscount;
    discountMS: FuelDiscount;
    previousBalance: number;
    status?: BillStatus;
  }) => Bill;
  updateBill: (id: string, patch: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
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
  const [companies, setCompanies] = useState<Company[]>(SEED_COMPANIES);
  const [links, setLinks] = useState<CompanyPumpLink[]>(SEED_LINKS);
  const [invites, setInvites] = useState<PumpInvite[]>(SEED_INVITES);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [pumps, setPumps] = useState<Pump[]>(SEED_PUMPS);
  const [requests, setRequests] = useState<FuelRequest[]>(SEED_REQUESTS);
  const [transactions, setTransactions] = useState<Transaction[]>(
    SEED_TRANSACTIONS
  );
  const [bills, setBills] = useState<Bill[]>(SEED_BILLS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const companiesRef = useRef(companies);
  const linksRef = useRef(links);
  const invitesRef = useRef(invites);
  useEffect(() => {
    companiesRef.current = companies;
  }, [companies]);
  useEffect(() => {
    linksRef.current = links;
  }, [links]);
  useEffect(() => {
    invitesRef.current = invites;
  }, [invites]);

  const getCompany = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies]
  );

  const getPumpsForCompany = useCallback(
    (companyId: string) => {
      const pumpIds = new Set(
        links.filter((l) => l.companyId === companyId && l.active).map((l) => l.pumpId)
      );
      return pumps.filter((p) => pumpIds.has(p.id));
    },
    [links, pumps]
  );

  const getCompaniesForPump = useCallback(
    (pumpId: string) => {
      const companyIds = links
        .filter((l) => l.pumpId === pumpId && l.active)
        .map((l) => l.companyId);
      return companies.filter((c) => companyIds.includes(c.id));
    },
    [links, companies]
  );

  const isPumpLinkedToCompany = useCallback(
    (pumpId: string, companyId: string) =>
      links.some(
        (l) => l.pumpId === pumpId && l.companyId === companyId && l.active
      ),
    [links]
  );

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

  const registerCompany = useCallback((input: RegisterCompanyInput) => {
    const companyId = genId('co');
    const userId = genId('u');
    const company: Company = {
      id: companyId,
      name: input.name.trim(),
      gstin: input.gstin?.trim() || undefined,
    };
    const admin: User = {
      id: userId,
      role: 'admin',
      name: input.ownerDisplayName?.trim() || `${input.name.trim()} Admin`,
      loginId: input.loginId.trim().toLowerCase(),
      password: input.password,
      companyId,
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [...prev, company]);
    setUsers((prev) => [...prev, admin]);
    setCurrentUser(admin);
    return admin;
  }, []);

  const registerPump = useCallback((input: RegisterPumpInput) => {
    const pumpId = genId('pump');
    const ownerId = genId('u');
    const pump: Pump = {
      id: pumpId,
      name: input.name.trim(),
      address: input.address.trim(),
      contact: input.contact.trim(),
      ownerUserId: ownerId,
    };
    const owner: User = {
      id: ownerId,
      role: 'pumpOwner',
      name: input.ownerDisplayName?.trim() || `${input.name.trim()} Owner`,
      loginId: input.loginId.trim().toLowerCase(),
      password: input.password,
      pumpId,
      createdAt: new Date().toISOString(),
    };
    setPumps((prev) => [...prev, pump]);
    setUsers((prev) => [...prev, owner]);
    setCurrentUser(owner);
    return owner;
  }, []);

  const createInvite = useCallback((companyId: string) => {
    let code = randomInviteCode();
    while (invitesRef.current.some((i) => i.code === code)) {
      code = randomInviteCode();
    }
    const inv: PumpInvite = {
      id: genId('inv'),
      companyId,
      code,
      createdAt: new Date().toISOString(),
    };
    setInvites((p) => [...p, inv]);
    return inv;
  }, []);

  const redeemInvite = useCallback(
    (code: string, pumpId: string): { ok: true; company: Company } | { ok: false; error: string } => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, error: 'Enter a code' };

      const inv = invitesRef.current.find(
        (i) => i.code.toUpperCase() === normalized && !i.redeemedByPumpId
      );
      if (!inv) return { ok: false, error: 'Invalid or already used code' };

      const company = companiesRef.current.find((c) => c.id === inv.companyId);
      if (!company) return { ok: false, error: 'Company not found' };

      if (
        linksRef.current.some(
          (l) => l.companyId === inv.companyId && l.pumpId === pumpId && l.active
        )
      ) {
        return { ok: false, error: 'Already connected to this company' };
      }

      const link: CompanyPumpLink = {
        id: genId('link'),
        companyId: inv.companyId,
        pumpId,
        joinedAt: new Date().toISOString(),
        active: true,
      };
      setLinks((prev) => [...prev, link]);
      setInvites((prev) =>
        prev.map((i) =>
          i.id === inv.id
            ? {
                ...i,
                redeemedByPumpId: pumpId,
                redeemedAt: new Date().toISOString(),
              }
            : i
        )
      );
      return { ok: true, company };
    },
    []
  );

  const createEmployee = useCallback((pumpId: string, name: string) => {
    const password = `e${Math.random().toString(36).slice(2, 8)}`;
    const loginId = `emp_${Math.random().toString(36).slice(2, 6)}`;
    const user: User = {
      id: genId('u'),
      role: 'employee',
      name,
      loginId,
      password,
      pumpId,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, user]);
    return { user, loginId, password };
  }, []);

  const createFuelRequest = useCallback(
    (input: {
      companyId: string;
      pumpId: string;
      vehicleNo: string;
      fuel: FuelType;
      qty: number;
      extraCash?: number;
      isTankFull?: boolean;
      notes?: string;
    }) => {
      const r: FuelRequest = {
        id: genId('req'),
        companyId: input.companyId,
        pumpId: input.pumpId,
        vehicleNo: input.vehicleNo.trim().toUpperCase(),
        fuel: input.fuel,
        qty: input.qty,
        status: 'pending' as RequestStatus,
        notes: input.notes,
        extraCash: input.extraCash,
        isTankFull: input.isTankFull,
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
        companyId: req.companyId,
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
    (pumpId: string, companyId: string) =>
      transactions.filter(
        (t) => t.pumpId === pumpId && t.companyId === companyId && !t.billId
      ),
    [transactions]
  );

  const createBill = useCallback(
    (input: {
      pumpId: string;
      companyId: string;
      itemIds: string[];
      period: { from: string; to: string };
      discountHSD: FuelDiscount;
      discountMS: FuelDiscount;
      previousBalance: number;
      status?: BillStatus;
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
        status: input.status ?? ('draft' as BillStatus),
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

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    setTransactions((prev) =>
      prev.map((t) => (t.billId === id ? { ...t, billId: undefined } : t))
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
      companies,
      links,
      invites,
      users,
      pumps,
      requests,
      transactions,
      bills,
      currentUser,
      getCompany,
      getPumpsForCompany,
      getCompaniesForPump,
      isPumpLinkedToCompany,
      login,
      logout,
      devSwitchUser,
      registerCompany,
      registerPump,
      createInvite,
      redeemInvite,
      createEmployee,
      createFuelRequest,
      fillFuelRequest,
      getUnbilledTransactions,
      createBill,
      updateBill,
      deleteBill,
      raiseBill,
      markBillPaid,
      assignTransactionsToBill,
    }),
    [
      companies,
      links,
      invites,
      users,
      pumps,
      requests,
      transactions,
      bills,
      currentUser,
      getCompany,
      getPumpsForCompany,
      getCompaniesForPump,
      isPumpLinkedToCompany,
      login,
      logout,
      devSwitchUser,
      registerCompany,
      registerPump,
      createInvite,
      redeemInvite,
      createEmployee,
      createFuelRequest,
      fillFuelRequest,
      getUnbilledTransactions,
      createBill,
      updateBill,
      deleteBill,
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

export function useOutstandingForLink(pumpId: string, companyId: string) {
  const { transactions, bills } = useApp();
  return useMemo(() => {
    let owed = 0;
    for (const b of bills) {
      if (b.pumpId !== pumpId || b.companyId !== companyId) continue;
      if (b.status === 'paid') continue;
      const parts = billTotalForItems(b, transactions);
      owed += parts.totalDue;
    }
    const unbilled = transactions.filter(
      (t) =>
        t.pumpId === pumpId && t.companyId === companyId && !t.billId
    );
    for (const t of unbilled) {
      owed += t.gross + t.extraCash + t.advance;
    }
    return Math.round(owed * 100) / 100;
  }, [pumpId, companyId, transactions, bills]);
}
