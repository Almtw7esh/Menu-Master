import { storage } from './firebase';
import { ref, uploadBytes } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage under the given path.
 * Does NOT save or return the download URL.
 * @param file File or Blob to upload
 * @param path Storage path (e.g. 'uploads/image.png')
 * @returns Promise<void>
 */
export async function uploadImageToStorage(file: File | Blob, path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
}
