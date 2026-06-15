import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const uploadDir = path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

export function getUploadDir() {
  return uploadDir;
}

export function getPublicBaseUrl() {
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.API_PORT || 3001}`;
  return `${apiUrl}/uploads`;
}

export async function saveLocalFile(
  buffer: Buffer,
  filename: string,
  folder = 'uploads'
): Promise<{ publicUrl: string; key: string }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${nanoid()}-${safeName}`;
  const filePath = path.join(uploadDir, key);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return { publicUrl: `${getPublicBaseUrl()}/${key}`, key };
}
