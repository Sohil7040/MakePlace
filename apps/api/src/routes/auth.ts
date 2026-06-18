import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { loginSchema, registerSchema, passwordChangeSchema } from '../lib/schemas.js';
import { anyAuthenticated } from '../lib/auth.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' });

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    };
  });

  app.post('/api/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.status(409).send({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: body.role || 'student',
      },
    });

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
    return reply.status(201).send({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  });

  app.get('/api/auth/me', { preHandler: anyAuthenticated }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, student: true },
    });
    return { user };
  });

  app.patch('/api/auth/password', { preHandler: anyAuthenticated }, async (request, reply) => {
    const body = passwordChangeSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return reply.status(401).send({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({
      where: { id: request.user.id },
      data: { passwordHash },
    });

    return { success: true };
  });
}
