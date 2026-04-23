import firestore from '@react-native-firebase/firestore';
import {
  SEED_BILLS,
  SEED_COMPANIES,
  SEED_INVITES,
  SEED_LINKS,
  SEED_PUMPS,
  SEED_REQUESTS,
  SEED_TRANSACTIONS,
  SEED_USERS,
} from '../src/mock/seed';

async function seed() {
  const db = firestore();
  const batch = db.batch();

  for (const co of SEED_COMPANIES) {
    const { id, ...data } = co;
    batch.set(db.collection('companies').doc(id), data);
  }
  for (const pump of SEED_PUMPS) {
    const { id, ...data } = pump;
    batch.set(db.collection('pumps').doc(id), data);
  }
  for (const user of SEED_USERS) {
    const { id, ...data } = user;
    batch.set(db.collection('users').doc(id), data);
  }
  for (const link of SEED_LINKS) {
    const { id, ...data } = link;
    batch.set(db.collection('companyPumpLinks').doc(id), data);
  }
  for (const invite of SEED_INVITES) {
    const { id, ...data } = invite;
    batch.set(db.collection('pumpInvites').doc(id), data);
  }
  for (const req of SEED_REQUESTS) {
    const { id, ...data } = req;
    batch.set(db.collection('fuelRequests').doc(id), data);
  }
  for (const tx of SEED_TRANSACTIONS) {
    const { id, ...data } = tx;
    batch.set(db.collection('transactions').doc(id), data);
  }
  for (const bill of SEED_BILLS) {
    const { id, ...data } = bill;
    batch.set(db.collection('bills').doc(id), data);
  }

  await batch.commit();
}

// eslint-disable-next-line no-console
seed().then(() => console.log('Firestore seed complete'));
