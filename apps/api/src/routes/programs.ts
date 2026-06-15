import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { adminOnly } from '../lib/auth.js';

export async function programRoutes(app: FastifyInstance) {
  app.get('/api/programs', async () => {
    const programs = await prisma.program.findMany({ orderBy: { name: 'asc' } });
    return { programs };
  });

  app.post('/api/programs', { preHandler: adminOnly }, async (request, reply) => {
    const body = request.body as { name: string; description?: string };
    const program = await prisma.program.create({ data: body });
    return reply.status(201).send({ program });
  });
}

export async function studioRoutes(app: FastifyInstance) {
  app.get('/api/studios', async () => {
    const studios = await prisma.studio.findMany({ orderBy: { name: 'asc' } });
    return { studios };
  });

  app.post('/api/studios', { preHandler: adminOnly }, async (request, reply) => {
    const body = request.body as { name: string };
    const studio = await prisma.studio.create({ data: body });
    return reply.status(201).send({ studio });
  });
}
