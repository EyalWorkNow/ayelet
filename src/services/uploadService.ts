import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadBookingImages(
  files: File[],
  bookingId?: string
): Promise<string[]> {
  const folder = bookingId ? `bookings/${bookingId}` : `bookings/pending`;
  const urls: string[] = [];

  for (const file of files) {
    const name = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${name}`);
    await uploadBytes(storageRef, file);
    urls.push(await getDownloadURL(storageRef));
  }

  return urls;
}

export async function deleteStorageFile(url: string): Promise<void> {
  try {
    // Extract path from download URL
    const match = url.match(/\/o\/(.+?)\?/);
    if (!match) return;
    const path = decodeURIComponent(match[1]);
    await deleteObject(ref(storage, path));
  } catch {
    // Non-fatal: file may already be deleted
  }
}

export function createLocalPreviews(files: File[]): string[] {
  return files.map(f => URL.createObjectURL(f));
}

export function revokeLocalPreviews(urls: string[]): void {
  urls.forEach(u => URL.revokeObjectURL(u));
}
