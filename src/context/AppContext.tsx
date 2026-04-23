import { onAuthStateChanged, signIn, signOut, signUp } from '@/src/firebase/auth';
import {
    claimPendingCompanyEmployee,
    claimPendingEmployee,
    assignTransactionsToBill as fsAssignTransactionsToBill,
    createBill as fsCreateBill,
    createFuelRequest as fsCreateFuelRequest,
    createInvite as fsCreateInvite,
    deleteBill as fsDeleteBill,
    fillFuelRequest as fsFillFuelRequest,
    markBillPaid as fsMarkBillPaid,
    raiseBill as fsRaiseBill,
    redeemInvite as fsRedeemInvite,
    updateBill as fsUpdateBill,
    getUserDoc,
    inviteCompanyEmployee,
    inviteEmployee,
    registerCompanyInFirestore,
    registerPumpInFirestore,
    subscribeBills,
    subscribeCompanies,
    subscribeInvites,
    subscribeLinks,
    subscribePumps,
    subscribeRequests,
    subscribeTransactions,
    subscribeUsers,
    type UserScope,
} from '@/src/firebase/firestore';
import type { Bill, BillStatus, Company, CompanyPumpLink, FuelDiscount, FuelRequest, FuelType, Pump, PumpInvite, Transaction, User } from '@/src/types';
import { billTotalForItems } from '@/src/utils/billMath';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type RegisterCompanyInput = {
  name: string;
  gstin?: string;
  email: string;
  password: string;
  ownerDisplayName?: string;
};

type RegisterPumpInput = {
  name: string;
  address: string;
  contact: string;
  email: string;
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
  authReady: boolean;
  getCompany: (id: string) => Company | undefined;
  getPumpsForCompany: (companyId: string) => Pump[];
  getCompaniesForPump: (pumpId: string) => Company[];
  isPumpLinkedToCompany: (pumpId: string, companyId: string) => boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  devSwitchUser: (loginId: string) => void;
  registerCompany: (input: RegisterCompanyInput) => Promise<User>;
  registerPump: (input: RegisterPumpInput) => Promise<User>;
  createInvite: (companyId: string) => Promise<PumpInvite>;
  redeemInvite: (
    code: string,
    pumpId: string
  ) => Promise<{ ok: true; company: Company } | { ok: false; error: string }>;
  createEmployee: (pumpId: string, name: string, email: string) => Promise<{ ok: true }>;
  createCompanyEmployee: (
    companyId: string,
    name: string,
    email: string
  ) => Promise<{ ok: true }>;
  createFuelRequest: (input: {
    companyId: string;
    pumpId: string;
    vehicleNo: string;
    fuel: FuelType;
    qty: number;
    extraCash?: number;
    isTankFull?: boolean;
    notes?: string;
  }) => Promise<FuelRequest>;
  fillFuelRequest: (input: {
    requestId: string;
    actualQty: number;
    rate: number;
    voucherNo?: string;
    vehiclePhoto?: string;
    receiptPhoto?: string;
    extraCash: number;
    advance?: number;
    filledByUserId: string;
  }) => Promise<Transaction | null>;
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
  }) => Promise<Bill>;
  updateBill: (id: string, patch: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  raiseBill: (id: string) => Promise<void>;
  markBillPaid: (
    id: string,
    paymentRefNo: string,
    paymentProof?: string
  ) => Promise<void>;
  assignTransactionsToBill: (billId: string, itemIds: string[]) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function isHydratedUser(user: User | null): user is User {
  if (!user) return false;
  if (!user.role || !user.name || !user.email) return false;
  if (user.role === 'admin') return !!user.companyId;
  if (user.role === 'pumpOwner') return !!user.pumpId;
  if (user.role === 'employee') return !!user.pumpId || !!user.companyId;
  return false;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [links, setLinks] = useState<CompanyPumpLink[]>([]);
  const [invites, setInvites] = useState<PumpInvite[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

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

  const login = useCallback(async (email: string, password: string) => {
    const creds = await signIn(email, password);
    let appUser = await getUserDoc(creds.user.uid);
    if (!isHydratedUser(appUser)) {
      appUser = await claimPendingEmployee({
        uid: creds.user.uid,
        email: creds.user.email || email,
      });
      if (!isHydratedUser(appUser)) {
        appUser = await claimPendingCompanyEmployee({
          uid: creds.user.uid,
          email: creds.user.email || email,
        });
      }
    }
    if (!isHydratedUser(appUser)) return null;
    setCurrentUser(appUser);
    return appUser;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setCurrentUser(null);
  }, []);

  const devSwitchUser = useCallback((_loginId: string) => {
    // Disabled in Firebase-backed mode.
  }, []);

  const registerCompany = useCallback(async (input: RegisterCompanyInput) => {
    const creds = await signUp(input.email, input.password);
    const user = await registerCompanyInFirestore({
      uid: creds.user.uid,
      email: input.email,
      name: input.name,
      gstin: input.gstin,
      ownerDisplayName: input.ownerDisplayName,
    });
    setCurrentUser(user);
    return user;
  }, []);

  const registerPump = useCallback(async (input: RegisterPumpInput) => {
    const creds = await signUp(input.email, input.password);
    const user = await registerPumpInFirestore({
      uid: creds.user.uid,
      email: input.email,
      name: input.name,
      address: input.address,
      contact: input.contact,
      ownerDisplayName: input.ownerDisplayName,
    });
    setCurrentUser(user);
    return user;
  }, []);

  const createInvite = useCallback(async (companyId: string) => fsCreateInvite(companyId), []);

  const redeemInvite = useCallback(
    async (code: string, pumpId: string) => fsRedeemInvite(code, pumpId),
    []
  );

  const createEmployee = useCallback(
    async (pumpId: string, name: string, email: string) => {
      await inviteEmployee({
        pumpId,
        name,
        email,
        invitedBy: currentUser?.id || '',
      });
      return { ok: true as const };
    },
    [currentUser?.id]
  );

  const createCompanyEmployee = useCallback(
    async (companyId: string, name: string, email: string) => {
      await inviteCompanyEmployee({
        companyId,
        name,
        email,
        invitedBy: currentUser?.id || '',
      });
      return { ok: true as const };
    },
    [currentUser?.id]
  );

  const createFuelRequest = useCallback(
    async (input: {
      companyId: string;
      pumpId: string;
      vehicleNo: string;
      fuel: FuelType;
      qty: number;
      extraCash?: number;
      isTankFull?: boolean;
      notes?: string;
    }) => fsCreateFuelRequest(input),
    []
  );

  const fillFuelRequest = useCallback(
    async (input: {
      requestId: string;
      actualQty: number;
      rate: number;
      voucherNo?: string;
      vehiclePhoto?: string;
      receiptPhoto?: string;
      extraCash: number;
      advance?: number;
      filledByUserId: string;
    }) => fsFillFuelRequest(input),
    []
  );

  const getUnbilledTransactions = useCallback(
    (pumpId: string, companyId: string) =>
      transactions.filter(
        (t) => t.pumpId === pumpId && t.companyId === companyId && !t.billId
      ),
    [transactions]
  );

  const createBill = useCallback(
    async (input: {
      pumpId: string;
      companyId: string;
      itemIds: string[];
      period: { from: string; to: string };
      discountHSD: FuelDiscount;
      discountMS: FuelDiscount;
      previousBalance: number;
      status?: BillStatus;
    }) => fsCreateBill(input),
    []
  );

  const updateBill = useCallback(async (id: string, patch: Partial<Bill>) => fsUpdateBill(id, patch), []);

  const raiseBill = useCallback(async (id: string) => fsRaiseBill(id), []);

  const deleteBill = useCallback(async (id: string) => fsDeleteBill(id), []);

  const markBillPaid = useCallback(
    async (id: string, paymentRefNo: string, paymentProof?: string) =>
      fsMarkBillPaid(id, paymentRefNo, paymentProof),
    []
  );

  const assignTransactionsToBill = useCallback(
    async (billId: string, itemIds: string[]) => fsAssignTransactionsToBill(billId, itemIds),
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }
      let appUser = await getUserDoc(firebaseUser.uid);
      if (firebaseUser.email && !isHydratedUser(appUser)) {
        const claimed = await claimPendingEmployee({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
        if (claimed) appUser = claimed;
      }
      if (firebaseUser.email && !isHydratedUser(appUser)) {
        const claimed = await claimPendingCompanyEmployee({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
        if (claimed) appUser = claimed;
      }
      setCurrentUser(isHydratedUser(appUser) ? appUser : null);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCompanies([]);
      setPumps([]);
      setUsers([]);
      setLinks([]);
      setInvites([]);
      setRequests([]);
      setTransactions([]);
      setBills([]);
      return;
    }
    const scope: UserScope = {
      uid: currentUser.id,
      role: currentUser.role,
      companyId: currentUser.companyId,
      pumpId: currentUser.pumpId,
    };

    const unsubs = [
      subscribeUsers(scope, setUsers),
      subscribeCompanies(scope, setCompanies),
      subscribePumps(scope, setPumps),
      subscribeLinks(scope, setLinks),
      subscribeInvites(scope, setInvites),
      subscribeRequests(scope, setRequests),
      subscribeTransactions(scope, setTransactions),
      subscribeBills(scope, setBills),
    ];
    return () => unsubs.forEach((u) => u());
  }, [currentUser]);

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
      authReady,
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
      createCompanyEmployee,
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
      authReady,
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
      createCompanyEmployee,
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
