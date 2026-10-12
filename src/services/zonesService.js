import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const zonesRef = collection(db, 'zones');

export async function getZones() {
  const snap = await getDocs(zonesRef);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((z) => z.isActive !== false);
}


export async function getZoneById(id) {
  const snap = await getDoc(doc(db, 'zones', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getAllZones() {
  const snap = await getDocs(zonesRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}