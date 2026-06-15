import { getPresignedUploadUrl, isR2Configured } from './r2.js';
import { saveLocalFile } from './local-storage.js';

export type StorageMode = 'r2' | 'local';

export function getStorageMode(): StorageMode {
  if (process.env.STORAGE_MODE === 'r2' && isR2Configured()) return 'r2';
  if (process.env.STORAGE_MODE === 'local') return 'local';
  return isR2Configured() ? 'r2' : 'local';
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder = 'uploads'
) {
  if (getStorageMode() === 'r2') {
    const { uploadUrl, publicUrl, key } = await getPresignedUploadUrl(filename, contentType, folder);
    await fetch(uploadUrl, {
      method: 'PUT',
      body: new Uint8Array(buffer),
      headers: { 'Content-Type': contentType },
    });
    return { publicUrl, key };
  }

  return saveLocalFile(buffer, filename, folder);
}
