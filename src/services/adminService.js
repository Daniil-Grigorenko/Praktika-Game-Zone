import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function checkIsAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

export function createZone(data) {
  return addDoc(collection(db, 'zones'), data);
}

export function updateZone(id, data) {
  return updateDoc(doc(db, 'zones', id), data);
}

export function deleteZone(id) {
  return deleteDoc(doc(db, 'zones', id));
}

export async function getUserRole(uid) {
  const [owner, admin] = await Promise.all([
    getDoc(doc(db, 'owners', uid)),
    getDoc(doc(db, 'admins', uid)),
  ]);
  if (owner.exists()) return 'owner';
  if (admin.exists()) return 'admin';
  return 'user';
}