import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
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

const db = firestore();
const INVITE_TTL_MS = 5 * 60 * 1000;
const MAX_ACTIVE_INVITES = 3;

export type UserScope = {
  uid: string;
  role: User['role'];
  companyId?: string;
  pumpId?: string;
};

type Unsubscribe = () => void;

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function asDoc<T>(id: string, data: FirebaseFirestoreTypes.DocumentData): T {
  return { id, ...data } as T;
}

export function usersRef() {
  return db.collection('users');
}
export function companiesRef() {
  return db.collection('companies');
}
export function pumpsRef() {
  return db.collection('pumps');
}
export function linksRef() {
  return db.collection('companyPumpLinks');
}
export function invitesRef() {
  return db.collection('pumpInvites');
}
export function pendingEmployeesRef() {
  return db.collection('pendingEmployees');
}
export function pendingCompanyEmployeesRef() {
  return db.collection('pendingCompanyEmployees');
}
export function requestsRef() {
  return db.collection('fuelRequests');
}
export function transactionsRef() {
  return db.collection('transactions');
}
export function billsRef() {
  return db.collection('bills');
}

export function subscribeUsers(scope: UserScope, cb: (users: User[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return usersRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<User>(d.id, d.data()))));
  }
  if (scope.role === 'employee' && scope.companyId) {
    return usersRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<User>(d.id, d.data()))));
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return usersRef()
      .where('pumpId', '==', scope.pumpId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<User>(d.id, d.data()))));
  }
  return () => {};
}

export function subscribeCompanies(scope: UserScope, cb: (companies: Company[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return companiesRef()
      .doc(scope.companyId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          cb([]);
          return;
        }
        cb([asDoc<Company>(doc.id, doc.data()!)]);
      });
  }
  if (scope.role === 'employee' && scope.companyId) {
    return companiesRef()
      .doc(scope.companyId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          cb([]);
          return;
        }
        cb([asDoc<Company>(doc.id, doc.data()!)]);
      });
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return linksRef()
      .where('pumpId', '==', scope.pumpId)
      .where('active', '==', true)
      .onSnapshot(async (linkSnap) => {
        const companyIds = linkSnap.docs.map((d) => d.data().companyId as string);
        if (!companyIds.length) return cb([]);
        const docs = await Promise.all(companyIds.map((id) => companiesRef().doc(id).get()));
        cb(docs.filter((d) => d.exists).map((d) => asDoc<Company>(d.id, d.data()!)));
      });
  }
  return () => {};
}

export function subscribePumps(scope: UserScope, cb: (pumps: Pump[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return linksRef()
      .where('companyId', '==', scope.companyId)
      .where('active', '==', true)
      .onSnapshot(async (linkSnap) => {
        const pumpIds = linkSnap.docs.map((d) => d.data().pumpId as string);
        if (!pumpIds.length) return cb([]);
        const docs = await Promise.all(pumpIds.map((id) => pumpsRef().doc(id).get()));
        cb(docs.filter((d) => d.exists).map((d) => asDoc<Pump>(d.id, d.data()!)));
      });
  }
  if (scope.role === 'employee' && scope.companyId) {
    return linksRef()
      .where('companyId', '==', scope.companyId)
      .where('active', '==', true)
      .onSnapshot(async (linkSnap) => {
        const pumpIds = linkSnap.docs.map((d) => d.data().pumpId as string);
        if (!pumpIds.length) return cb([]);
        const docs = await Promise.all(pumpIds.map((id) => pumpsRef().doc(id).get()));
        cb(docs.filter((d) => d.exists).map((d) => asDoc<Pump>(d.id, d.data()!)));
      });
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return pumpsRef()
      .doc(scope.pumpId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          cb([]);
          return;
        }
        cb([asDoc<Pump>(doc.id, doc.data()!)]);
      });
  }
  return () => {};
}

export function subscribeLinks(scope: UserScope, cb: (links: CompanyPumpLink[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return linksRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) =>
        cb(snap.docs.map((d) => asDoc<CompanyPumpLink>(d.id, d.data())))
      );
  }
  if (scope.role === 'employee' && scope.companyId) {
    return linksRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) =>
        cb(snap.docs.map((d) => asDoc<CompanyPumpLink>(d.id, d.data())))
      );
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return linksRef()
      .where('pumpId', '==', scope.pumpId)
      .onSnapshot((snap) =>
        cb(snap.docs.map((d) => asDoc<CompanyPumpLink>(d.id, d.data())))
      );
  }
  return () => {};
}

export function subscribeInvites(scope: UserScope, cb: (invites: PumpInvite[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return invitesRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<PumpInvite>(d.id, d.data()))));
  }
  cb([]);
  return () => {};
}

export function subscribeRequests(scope: UserScope, cb: (requests: FuelRequest[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return requestsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<FuelRequest>(d.id, d.data()))));
  }
  if (scope.role === 'employee' && scope.companyId) {
    return requestsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<FuelRequest>(d.id, d.data()))));
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return requestsRef()
      .where('pumpId', '==', scope.pumpId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<FuelRequest>(d.id, d.data()))));
  }
  return () => {};
}

export function subscribeTransactions(scope: UserScope, cb: (transactions: Transaction[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return transactionsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Transaction>(d.id, d.data()))));
  }
  if (scope.role === 'employee' && scope.companyId) {
    return transactionsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Transaction>(d.id, d.data()))));
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return transactionsRef()
      .where('pumpId', '==', scope.pumpId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Transaction>(d.id, d.data()))));
  }
  return () => {};
}

export function subscribeBills(scope: UserScope, cb: (bills: Bill[]) => void): Unsubscribe {
  if (scope.role === 'admin' && scope.companyId) {
    return billsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Bill>(d.id, d.data()))));
  }
  if (scope.role === 'employee' && scope.companyId) {
    return billsRef()
      .where('companyId', '==', scope.companyId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Bill>(d.id, d.data()))));
  }
  if ((scope.role === 'pumpOwner' || scope.role === 'employee') && scope.pumpId) {
    return billsRef()
      .where('pumpId', '==', scope.pumpId)
      .onSnapshot((snap) => cb(snap.docs.map((d) => asDoc<Bill>(d.id, d.data()))));
  }
  return () => {};
}

export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await usersRef().doc(uid).get();
  if (!snap.exists) return null;
  return asDoc<User>(snap.id, snap.data()!);
}

export async function registerCompanyInFirestore(input: {
  uid: string;
  email: string;
  name: string;
  gstin?: string;
  ownerDisplayName?: string;
}): Promise<User> {
  const companyId = genId('co');
  const user: User = {
    id: input.uid,
    role: 'admin',
    email: input.email.trim().toLowerCase(),
    name: input.ownerDisplayName?.trim() || `${input.name.trim()} Admin`,
    companyId,
    createdAt: new Date().toISOString(),
  };
  const batch = db.batch();
  batch.set(companiesRef().doc(companyId), {
    name: input.name.trim(),
    gstin: input.gstin?.trim() || null,
  });
  batch.set(usersRef().doc(input.uid), user);
  await batch.commit();
  return user;
}

export async function registerPumpInFirestore(input: {
  uid: string;
  email: string;
  name: string;
  address: string;
  contact: string;
  ownerDisplayName?: string;
}): Promise<User> {
  const pumpId = genId('pump');
  const user: User = {
    id: input.uid,
    role: 'pumpOwner',
    email: input.email.trim().toLowerCase(),
    name: input.ownerDisplayName?.trim() || `${input.name.trim()} Owner`,
    pumpId,
    createdAt: new Date().toISOString(),
  };
  const batch = db.batch();
  batch.set(pumpsRef().doc(pumpId), {
    name: input.name.trim(),
    address: input.address.trim(),
    contact: input.contact.trim(),
    ownerUserId: input.uid,
  });
  batch.set(usersRef().doc(input.uid), user);
  await batch.commit();
  return user;
}

export async function createInvite(companyId: string): Promise<PumpInvite> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const expiresAt = new Date(now + INVITE_TTL_MS).toISOString();

  const existingSnap = await invitesRef().where('companyId', '==', companyId).get();
  const activeCount = existingSnap.docs.reduce((count, doc) => {
    const data = doc.data();
    if (data.redeemedByPumpId) return count;
    if (typeof data.expiresAt !== 'string') return count;
    return new Date(data.expiresAt).getTime() > now ? count + 1 : count;
  }, 0);

  if (activeCount >= MAX_ACTIVE_INVITES) {
    throw new Error('Maximum 3 active invite codes allowed. Wait for expiry or redemption.');
  }

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const id = genId('inv');
  const invite: PumpInvite = {
    id,
    companyId,
    code,
    createdAt: nowIso,
    expiresAt,
  };
  await invitesRef().doc(id).set({
    companyId,
    code,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
    redeemedByPumpId: null,
    redeemedAt: null,
  });
  return invite;
}

export async function redeemInvite(
  code: string,
  pumpId: string
): Promise<{ ok: true; company: Company } | { ok: false; error: string }> {
  try {
    const codeSnap = await invitesRef()
      .where('code', '==', code.trim().toUpperCase())
      .limit(1)
      .get();
    if (codeSnap.empty) return { ok: false, error: 'Invalid or already used code' };
    const inviteDoc = codeSnap.docs[0];

    const linkSnap = await linksRef()
      .where('companyId', '==', inviteDoc.data().companyId)
      .where('pumpId', '==', pumpId)
      .where('active', '==', true)
      .limit(1)
      .get();
    if (!linkSnap.empty) return { ok: false, error: 'Already connected to this company' };

    return await db.runTransaction(async (tx) => {
      const freshInviteDoc = await tx.get(inviteDoc.ref);
      if (!freshInviteDoc.exists) return { ok: false, error: 'Invalid or already used code' } as const;
      const invite = freshInviteDoc.data()!;
      if (invite.redeemedByPumpId) return { ok: false, error: 'Invalid or already used code' } as const;
      const expiresAtMs =
        typeof invite.expiresAt === 'string' ? new Date(invite.expiresAt).getTime() : NaN;
      if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
        return { ok: false, error: 'Invite code expired. Ask company to generate a new code.' } as const;
      }

      const companyDoc = await tx.get(companiesRef().doc(invite.companyId));
      if (!companyDoc.exists) return { ok: false, error: 'Company not found' } as const;

      const linkId = genId('link');
      tx.set(linksRef().doc(linkId), {
        companyId: invite.companyId,
        pumpId,
        joinedAt: new Date().toISOString(),
        active: true,
      });
      tx.update(freshInviteDoc.ref, {
        redeemedByPumpId: pumpId,
        redeemedAt: new Date().toISOString(),
      });
      return {
        ok: true,
        company: asDoc<Company>(companyDoc.id, companyDoc.data()!),
      } as const;
    });
  } catch {
    return { ok: false, error: 'Unable to redeem invite right now' };
  }
}

export async function inviteEmployee(input: {
  pumpId: string;
  name: string;
  email: string;
  invitedBy: string;
}) {
  await pendingEmployeesRef()
    .doc(input.email.trim().toLowerCase())
    .set({
      pumpId: input.pumpId,
      name: input.name.trim(),
      invitedBy: input.invitedBy,
      createdAt: new Date().toISOString(),
    });
}

export async function inviteCompanyEmployee(input: {
  companyId: string;
  name: string;
  email: string;
  invitedBy: string;
}) {
  await pendingCompanyEmployeesRef()
    .doc(input.email.trim().toLowerCase())
    .set({
      companyId: input.companyId,
      name: input.name.trim(),
      invitedBy: input.invitedBy,
      createdAt: new Date().toISOString(),
    });
}

export async function claimPendingEmployee(input: {
  uid: string;
  email: string;
}): Promise<User | null> {
  const key = input.email.trim().toLowerCase();
  return db.runTransaction(async (tx) => {
    const pendingDoc = await tx.get(pendingEmployeesRef().doc(key));
    if (!pendingDoc.exists) return null;
    const pending = pendingDoc.data();
    if (!pending || typeof pending !== 'object') return null;
    if (typeof pending.pumpId !== 'string' || !pending.pumpId) return null;
    const user: User = {
      id: input.uid,
      role: 'employee',
      name:
        typeof pending.name === 'string' && pending.name.trim().length > 0
          ? pending.name.trim()
          : 'Employee',
      email: key,
      pumpId: pending.pumpId,
      createdAt: new Date().toISOString(),
    };
    tx.set(usersRef().doc(input.uid), user);
    tx.delete(pendingDoc.ref);
    return user;
  });
}

export async function claimPendingCompanyEmployee(input: {
  uid: string;
  email: string;
}): Promise<User | null> {
  const key = input.email.trim().toLowerCase();
  return db.runTransaction(async (tx) => {
    const pendingDoc = await tx.get(pendingCompanyEmployeesRef().doc(key));
    if (!pendingDoc.exists) return null;
    const pending = pendingDoc.data();
    if (!pending || typeof pending !== 'object') return null;
    if (typeof pending.companyId !== 'string' || !pending.companyId) return null;
    const user: User = {
      id: input.uid,
      role: 'employee',
      name:
        typeof pending.name === 'string' && pending.name.trim().length > 0
          ? pending.name.trim()
          : 'Employee',
      email: key,
      companyId: pending.companyId,
      createdAt: new Date().toISOString(),
    };
    tx.set(usersRef().doc(input.uid), user);
    tx.delete(pendingDoc.ref);
    return user;
  });
}

export async function createFuelRequest(input: {
  companyId: string;
  pumpId: string;
  vehicleNo: string;
  fuel: FuelType;
  qty: number;
  extraCash?: number;
  isTankFull?: boolean;
  notes?: string;
}): Promise<FuelRequest> {
  const id = genId('req');
  const req: FuelRequest = {
    id,
    companyId: input.companyId,
    pumpId: input.pumpId,
    vehicleNo: input.vehicleNo.trim().toUpperCase(),
    fuel: input.fuel,
    qty: input.qty,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  if (typeof input.notes === 'string' && input.notes.trim().length > 0) {
    req.notes = input.notes.trim();
  }
  if (typeof input.extraCash === 'number') {
    req.extraCash = input.extraCash;
  }
  if (typeof input.isTankFull === 'boolean') {
    req.isTankFull = input.isTankFull;
  }
  await requestsRef().doc(id).set(req);
  return req;
}

export async function fillFuelRequest(input: {
  requestId: string;
  actualQty: number;
  rate: number;
  voucherNo?: string;
  vehiclePhoto?: string;
  receiptPhoto?: string;
  extraCash: number;
  advance?: number;
  filledByUserId: string;
}): Promise<Transaction | null> {
  return db.runTransaction(async (tx) => {
    const reqDoc = await tx.get(requestsRef().doc(input.requestId));
    if (!reqDoc.exists) return null;
    const req = reqDoc.data() as FuelRequest;
    if (req.status !== 'pending') return null;
    const txnId = genId('txn');
    const gross = Math.round(input.actualQty * input.rate * 100) / 100;
    const txn: Transaction = {
      id: txnId,
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
      advance: input.advance || 0,
      voucherNo: input.voucherNo,
      createdAt: new Date().toISOString(),
      filledByUserId: input.filledByUserId,
    };
    tx.set(transactionsRef().doc(txnId), txn);
    tx.update(reqDoc.ref, { status: 'filled' as RequestStatus, filledBy: input.filledByUserId, txnId });
    return txn;
  });
}

export async function createBill(input: {
  pumpId: string;
  companyId: string;
  itemIds: string[];
  period: { from: string; to: string };
  discountHSD: FuelDiscount;
  discountMS: FuelDiscount;
  previousBalance: number;
  status?: BillStatus;
}): Promise<Bill> {
  return db.runTransaction(async (tx) => {
    const billId = genId('bill');
    const bill: Bill = {
      id: billId,
      pumpId: input.pumpId,
      companyId: input.companyId,
      billNo: `BILL-${Date.now().toString(36).toUpperCase()}`,
      period: input.period,
      generatedAt: new Date().toISOString(),
      itemIds: input.itemIds,
      discountHSD: input.discountHSD,
      discountMS: input.discountMS,
      previousBalance: input.previousBalance,
      status: input.status ?? 'draft',
    };
    tx.set(billsRef().doc(billId), bill);
    for (const itemId of input.itemIds) {
      tx.update(transactionsRef().doc(itemId), { billId });
    }
    return bill;
  });
}

export async function updateBill(id: string, patch: Partial<Bill>) {
  const safePatch = { ...patch } as Record<string, unknown>;
  delete safePatch.id;
  await billsRef().doc(id).update(safePatch);
}

export async function raiseBill(id: string) {
  await billsRef().doc(id).update({ status: 'raised' as BillStatus });
}

export async function deleteBill(id: string) {
  await db.runTransaction(async (tx) => {
    const billDoc = await tx.get(billsRef().doc(id));
    if (!billDoc.exists) return;
    const bill = billDoc.data() as Bill;
    for (const itemId of bill.itemIds) {
      tx.update(transactionsRef().doc(itemId), { billId: null });
    }
    tx.delete(billDoc.ref);
  });
}

export async function markBillPaid(id: string, paymentRefNo: string, paymentProof?: string) {
  await billsRef().doc(id).update({
    status: 'paid' as BillStatus,
    paymentRefNo,
    paymentProof: paymentProof ?? null,
  });
}

export async function assignTransactionsToBill(billId: string, itemIds: string[]) {
  await db.runTransaction(async (tx) => {
    const billDoc = await tx.get(billsRef().doc(billId));
    if (!billDoc.exists) return;
    const bill = billDoc.data() as Bill;
    const oldIds = bill.itemIds || [];
    const removed = oldIds.filter((id) => !itemIds.includes(id));
    const added = itemIds.filter((id) => !oldIds.includes(id));
    for (const itemId of removed) {
      tx.update(transactionsRef().doc(itemId), { billId: null });
    }
    for (const itemId of added) {
      tx.update(transactionsRef().doc(itemId), { billId });
    }
    tx.update(billDoc.ref, { itemIds });
  });
}

