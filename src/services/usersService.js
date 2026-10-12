import {
  collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp,
  setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const usersRef = collection(db, 'users');
const adminsRef = collection(db, 'admins');
const ownersRef = collection(db, 'owners');
const bookingsRef = collection(db, 'bookings');
const slotsRef = collection(db, 'slots');

export async function syncUserDoc(user, { login = false } = {}) {
  const deletedSnap = await getDoc(doc(db, 'deletedUsers', user.uid));
  if (deletedSnap.exists()) return { blocked: true, deleted: true };

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date();
    const lastSeen = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : new Date();

    await setDoc(ref, {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      createdAt: Timestamp.fromDate(created),
      lastLoginAt: login ? serverTimestamp() : Timestamp.fromDate(lastSeen),
      blocked: false,
    });
    return { blocked: false, deleted: false };
  }

  const data = snap.data();
  const patch = {};
  if ((user.email ?? '') !== data.email) patch.email = user.email ?? '';
  if ((user.displayName ?? '') !== data.displayName) patch.displayName = user.displayName ?? '';
  if (login) patch.lastLoginAt = serverTimestamp();
  if (Object.keys(patch).length > 0) await updateDoc(ref, patch);

  return { blocked: data.blocked === true, deleted: false };
}

export function updateOwnUserDoc(uid, data) {
  return updateDoc(doc(db, 'users', uid), data);
}

const toDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : null);

export async function getAllUsers() {
  const snap = await getDocs(usersRef);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      blocked: data.blocked === true,
      createdAt: toDate(data.createdAt),
      lastLoginAt: toDate(data.lastLoginAt),
    };
  });
}

export async function getAdminIds() {
  const snap = await getDocs(adminsRef);
  return new Set(snap.docs.map((d) => d.id));
}

export async function getOwnerIds() {
  const snap = await getDocs(ownersRef);
  return new Set(snap.docs.map((d) => d.id));
}

export function setUserBlocked(uid, blocked) {
  return updateDoc(doc(db, 'users', uid), { blocked });
}

export function grantAdmin(uid) {
  return setDoc(doc(db, 'admins', uid), { role: 'admin' });
}

export function revokeAdmin(uid) {
  return deleteDoc(doc(db, 'admins', uid));
}

async function deleteInChunks(refs) {
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }
}

export async function deleteUserData(target, ownerUid) {
  const [bookingsSnap, slotsSnap] = await Promise.all([
    getDocs(query(bookingsRef, where('ownerId', '==', target.id))),
    getDocs(query(slotsRef, where('ownerId', '==', target.id))),
  ]);

  await deleteInChunks([
    ...bookingsSnap.docs.map((d) => d.ref),
    ...slotsSnap.docs.map((d) => d.ref),
  ]);

  const batch = writeBatch(db);
  batch.set(doc(db, 'deletedUsers', target.id), {
    email: target.email ?? '',
    deletedAt: serverTimestamp(),
    deletedBy: ownerUid,
  });
  batch.delete(doc(db, 'users', target.id));
  batch.delete(doc(db, 'admins', target.id));
  await batch.commit();
}