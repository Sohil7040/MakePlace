import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { studentCreateSchema, studentUpdateSchema } from '../lib/schemas.js';
import { adminOnly, mentorOrAdmin, anyAuthenticated } from '../lib/auth.js';
import { sendPlatformCredentials } from '../lib/mailer.js';

export async function studentRoutes(app: FastifyInstance) {
  app.get('/api/students', { preHandler: mentorOrAdmin }, async () => {
    const students = await prisma.student.findMany({
      include: { program: true, studio: true, user: { select: { id: true, email: true } }, mentor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { students };
  });

  app.get('/api/students/me', { preHandler: anyAuthenticated }, async (request, reply) => {
    const student = await prisma.student.findFirst({
      where: { userId: request.user.id },
      include: { program: true, studio: true, portfolio: true },
    });
    if (!student) return reply.status(404).send({ error: 'Student profile not found' });
    return { student };
  });

  app.get('/api/students/:id', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        program: true,
        studio: true,
        portfolio: true,
        badgeAwards: { include: { badge: true, mentor: { select: { name: true } } } },
        projects: { include: { media: true } },
      },
    });
    if (!student) return reply.status(404).send({ error: 'Student not found' });

    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== id) return reply.status(403).send({ error: 'Forbidden' });
    }

    return { student };
  });

  app.post('/api/students', { preHandler: adminOnly }, async (request, reply) => {
    const body = studentCreateSchema.parse(request.body);
    const slug = body.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) return reply.status(409).send({ error: 'User with this email already exists' });

    const plainPassword = nanoid(10);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: body.fullName,
        email: body.email,
        passwordHash,
        role: 'student',
      },
    });

    const student = await prisma.student.create({
      data: {
        fullName: body.fullName,
        age: body.age,
        contact: body.contact,
        email: body.email,
        photo: body.photo,
        programId: body.programId,
        studioId: body.studioId,
        mentorId: body.mentorId,
        userId: user.id,
        portfolio: {
          create: { publicSlug: `${slug}-${nanoid(6)}` },
        },
      },
      include: { program: true, studio: true, portfolio: true, mentor: { select: { id: true, name: true } } },
    });

    await sendPlatformCredentials(body.email, body.fullName, plainPassword);

    return reply.status(201).send({ student });
  });

  app.patch('/api/students/:id', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = studentUpdateSchema.parse(request.body);

    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== id) return reply.status(403).send({ error: 'Forbidden' });
    } else if (request.user.role === 'mentor') {
      return reply.status(403).send({ error: 'Mentors cannot edit student profiles' });
    }

    const student = await prisma.student.update({
      where: { id },
      data: body,
      include: { program: true, studio: true, portfolio: true, mentor: { select: { id: true, name: true } } },
    });
    return { student };
  });

  app.delete('/api/students/:id', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.student.delete({ where: { id } });
    return reply.status(204).send();
  });
}
