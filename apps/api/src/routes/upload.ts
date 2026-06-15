import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import { presignSchema } from '../lib/schemas.js';
import { anyAuthenticated } from '../lib/auth.js';
import { getPresignedUploadUrl } from '../lib/r2.js';
import { getStorageMode } from '../lib/storage.js';
import { getUploadDir, saveLocalFile } from '../lib/local-storage.js';

export async function uploadRoutes(app: FastifyInstance) {
  const uploadDir = getUploadDir();
  await mkdirSafe(uploadDir);

  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.get('/api/upload/mode', { preHandler: anyAuthenticated }, async () => {
    return { mode: getStorageMode() };
  });

  app.post('/api/upload', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { folder } = request.query as { folder?: string };
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'No file provided' });

    const buffer = await data.toBuffer();
    const result = await saveLocalFile(buffer, data.filename, folder || 'uploads');

    return reply.status(201).send(result);
  });

  app.post('/api/upload/presign', { preHandler: anyAuthenticated }, async (request, reply) => {
    if (getStorageMode() !== 'r2') {
      return reply.status(400).send({ error: 'Presigned uploads require R2 storage. Use /api/upload instead.' });
    }

    const body = presignSchema.parse(request.body);
    const result = await getPresignedUploadUrl(body.filename, body.contentType, body.folder);
    return result;
  });
}

async function mkdirSafe(dir: string) {
  const { mkdir } = await import('fs/promises');
  await mkdir(dir, { recursive: true });
}
