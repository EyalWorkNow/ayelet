import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Service } from '../types';

export async function getServices(activeOnly = false): Promise<Service[]> {
  const constraints = activeOnly ? [where('isActive', '==', true)] : [];
  const q = query(collection(db, 'services'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Service[];
}

export async function createService(data: Omit<Service, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'services'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  await updateDoc(doc(db, 'services', id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'services', id), { isActive });
}

export function subscribeToServices(
  callback: (services: Service[]) => void,
  activeOnly = false
): () => void {
  const constraints = activeOnly ? [where('isActive', '==', true)] : [];
  const q = query(collection(db, 'services'), ...constraints);
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Service[]);
  });
}
