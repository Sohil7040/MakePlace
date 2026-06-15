import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.js';
import { studentRoutes } from './routes/students.js';
import { programRoutes, studioRoutes } from './routes/programs.js';
import { uploadRoutes } from './routes/upload.js';
import { projectRoutes } from './routes/projects.js';
import { portfolioRoutes } from './routes/portfolios.js';
import { mentorRoutes } from './routes/mentor.js';
import { webhookRoutes } from './routes/webhooks.js';
import { prisma } from './lib/prisma.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes);
  await app.register(studentRoutes);
  await app.register(programRoutes);
  await app.register(studioRoutes);
  await app.register(uploadRoutes);
  await app.register(projectRoutes);
  await app.register(portfolioRoutes);
  await app.register(mentorRoutes);
  await app.register(webhookRoutes);

  const port = Number(process.env.API_PORT || 3001);
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`API running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

async function shutdown() {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
