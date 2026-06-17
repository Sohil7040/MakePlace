import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { reportCreateSchema, badgeAwardSchema, commentCreateSchema } from '../lib/schemas.js';
import { adminOnly, mentorOrAdmin, anyAuthenticated } from '../lib/auth.js';
import { fireWebhook } from '../lib/webhooks.js';
import { sendPlatformCredentials } from '../lib/mailer.js';

export async function mentorRoutes(app: FastifyInstance) {
  app.get('/api/mentors', { preHandler: adminOnly }, async () => {
    const mentors = await prisma.user.findMany({
      where: { role: 'mentor' },
      select: { id: true, name: true, email: true, avatar: true },
      orderBy: { name: 'asc' },
    });
    return { mentors };
  });

  app.post('/api/mentors', { preHandler: adminOnly }, async (request, reply) => {
    const body = z.object({ name: z.string().min(2), email: z.string().email() }).parse(request.body);
    
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.status(409).send({ error: 'User with this email already exists' });

    const plainPassword = nanoid(10);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const mentor = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: 'mentor',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await sendPlatformCredentials(body.email, body.name, plainPassword);

    return reply.status(201).send({ mentor });
  });

  app.delete('/api/mentors/:id', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const mentor = await prisma.user.findUnique({ where: { id } });
    if (!mentor || mentor.role !== 'mentor') {
      return reply.status(404).send({ error: 'Mentor not found' });
    }

    // Unassign mentor from any students before deleting
    await prisma.student.updateMany({
      where: { mentorId: id },
      data: { mentorId: null },
    });

    await prisma.user.delete({ where: { id } });

    return reply.status(204).send();
  });

  app.get('/api/students/:studentId/reports', { preHandler: mentorOrAdmin }, async (request) => {
    const { studentId } = request.params as { studentId: string };
    const reports = await prisma.report.findMany({
      where: { studentId },
      include: { mentor: { select: { name: true } } },
      orderBy: { weekOf: 'desc' },
    });
    return { reports };
  });

  app.post('/api/students/:studentId/reports', { preHandler: mentorOrAdmin }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = reportCreateSchema.parse(request.body);

    const report = await prisma.report.create({
      data: {
        studentId,
        mentorId: request.user.id,
        content: body.content,
        weekOf: new Date(body.weekOf),
        sentToParent: body.sentToParent,
      },
      include: { mentor: { select: { name: true } }, student: { select: { fullName: true } } },
    });

    await fireWebhook(app, 'report-created', {
      reportId: report.id,
      studentId,
      studentName: report.student.fullName,
      mentorName: report.mentor.name,
      weekOf: report.weekOf,
      sentToParent: report.sentToParent,
    });

    return reply.status(201).send({ report });
  });

  app.patch('/api/reports/:id', { preHandler: mentorOrAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = reportCreateSchema.partial().parse(request.body);

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        ...(body.weekOf !== undefined && { weekOf: new Date(body.weekOf) }),
        ...(body.sentToParent !== undefined && { sentToParent: body.sentToParent }),
      },
      include: { mentor: { select: { name: true } }, student: { select: { fullName: true } } },
    });

    return { report };
  });

  app.get('/api/badges', { preHandler: anyAuthenticated }, async () => {
    const badges = await prisma.badge.findMany({ orderBy: { name: 'asc' } });
    return { badges };
  });

  app.post('/api/students/:studentId/badges', { preHandler: mentorOrAdmin }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = badgeAwardSchema.parse(request.body);

    const award = await prisma.badgeAward.create({
      data: {
        studentId,
        badgeId: body.badgeId,
        awardedBy: request.user.id,
        note: body.note,
      },
      include: { badge: true, mentor: { select: { name: true } }, student: { select: { fullName: true } } },
    });

    await fireWebhook(app, 'badge-awarded', {
      awardId: award.id,
      studentId,
      studentName: award.student.fullName,
      badgeName: award.badge.name,
      mentorName: award.mentor.name,
    });

    return reply.status(201).send({ award });
  });

  app.get('/api/comments', { preHandler: anyAuthenticated }, async (request) => {
    const { targetType, targetId } = request.query as { targetType?: string; targetId?: string };
    const comments = await prisma.comment.findMany({
      where: {
        ...(targetType && { targetType: targetType as 'project' | 'portfolio' }),
        ...(targetId && { targetId }),
      },
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { comments };
  });

  app.post('/api/comments', { preHandler: mentorOrAdmin }, async (request, reply) => {
    const body = commentCreateSchema.parse(request.body);

    const comment = await prisma.comment.create({
      data: {
        authorId: request.user.id,
        targetType: body.targetType,
        targetId: body.targetId,
        content: body.content,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return reply.status(201).send({ comment });
  });
}
