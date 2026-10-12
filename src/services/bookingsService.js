import {
  collection, doc, getDoc, getDocs, onSnapshot,
  query, where, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const bookingsRef = collection(db, 'bookings');
const slotsRef = collection(db, 'slots');

const slotId = (zoneId, date, hour) => `${zoneId}_${date}_${hour}`;
const hoursOf = (start, duration) => Array.from({ length: duration }, (_, i) => start + i);

function slotData(booking, hour, ownerId, bookingId) {
  return { zoneId: booking.zoneId, date: booking.date, hour, ownerId, bookingId };
}

export async function getBookedHours(zoneId, date) {
  const q = query(slotsRef, where('zoneId', '==', zoneId), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().hour);
}

export function subscribeToUserBookings(uid, onData, onError) {
  const q = query(bookingsRef, where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
      onData(list);
    },
    onError
  );
}

export async function getBookingById(id) {
  const snap = await getDoc(doc(db, 'bookings', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createBooking(uid, data) {
  const bookingRef = doc(bookingsRef);
  const batch = writeBatch(db);

  batch.set(bookingRef, {
    zoneId: data.zoneId,
    zoneName: data.zoneName,
    ownerId: uid,
    date: data.date,
    startHour: data.startHour,
    duration: data.duration,
    guests: data.guests,
    comment: data.comment ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  for (const hour of hoursOf(data.startHour, data.duration)) {
    batch.set(doc(slotsRef, slotId(data.zoneId, data.date, hour)), slotData(data, hour, uid, bookingRef.id));
  }

  await batch.commit();
  return bookingRef.id;
}

export async function updateBooking(uid, old, data) {
  const batch = writeBatch(db);
  const bookingRef = doc(bookingsRef, old.id);

  const oldIds = new Set(hoursOf(old.startHour, old.duration).map((h) => slotId(old.zoneId, old.date, h)));
  const newHours = hoursOf(data.startHour, data.duration);
  const newIds = new Set(newHours.map((h) => slotId(old.zoneId, data.date, h)));

  batch.update(bookingRef, {
    date: data.date,
    startHour: data.startHour,
    duration: data.duration,
    guests: data.guests,
    comment: data.comment ?? '',
    zoneId: old.zoneId,
    zoneName: old.zoneName,
    ownerId: uid,
    createdAt: old.createdAt,
    updatedAt: serverTimestamp(),
  });

  for (const id of oldIds) if (!newIds.has(id)) batch.delete(doc(slotsRef, id));
  for (const h of newHours) {
    const id = slotId(old.zoneId, data.date, h);
    if (!oldIds.has(id)) {
      batch.set(doc(slotsRef, id), slotData({ zoneId: old.zoneId, date: data.date }, h, uid, old.id));
    }
  }

  await batch.commit();
}

export async function deleteBooking(booking) {
  const batch = writeBatch(db);
  batch.delete(doc(bookingsRef, booking.id));
  for (const h of hoursOf(booking.startHour, booking.duration)) {
    batch.delete(doc(slotsRef, slotId(booking.zoneId, booking.date, h)));
  }
  await batch.commit();
}

export function getBookingErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Это время уже занято или у вас нет прав на это действие';
  }
  if (error?.code === 'unavailable') return 'Нет соединения с сетью';
  return 'Не удалось выполнить операцию. Попробуйте ещё раз';
}