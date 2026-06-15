import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import {
  projectCreateSchema,
  projectUpdateSchema,
  mediaCreateSchema,
} from '../lib/schemas.js';
import { anyAuthenticated, mentorOrAdmin } from '../lib/auth.js';

async function getStudentForUser(userId: string, role: string) {
  if (role !== 'student') return null;
  return prisma.student.findFirst({ where: { userId } });
}

export async function projectRoutes(app: FastifyInstance) {
  app.get('/api/projects', { preHandler: anyAuthenticated }, async (request) => {
    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      const projects = await prisma.project.findMany({
        where: { studentId: student?.id },
        include: { media: true },
        orderBy: { createdAt: 'desc' },
      });
      return { projects };
    }

    const projects = await prisma.project.findMany({
      include: { media: true, student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { projects };
  });

  app.get('/api/students/:studentId/projects', { preHandler: anyAuthenticated }, async (request) => {
    const { studentId } = request.params as { studentId: string };
    const projects = await prisma.project.findMany({
      where: { studentId },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
    return { projects };
  });

  app.get('/api/projects/:id', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        media: true,
        student: { select: { id: true, fullName: true, userId: true } },
      },
    });
    if (!project) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== project.studentId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }
    }

    return { project };
  });

  app.post('/api/students/:studentId/projects', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = projectCreateSchema.parse(request.body);

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const project = await prisma.project.create({
      data: {
        ...body,
        studentId,
        publishedAt: body.status === 'published' ? new Date() : null,
      },
      include: { media: true },
    });

    return reply.status(201).send({ project });
  });

  app.patch('/api/projects/:id', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = projectUpdateSchema.parse(request.body);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...body,
        publishedAt:
          body.status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: { media: true },
    });

    return { project };
  });

  app.delete('/api/projects/:id', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    await prisma.project.delete({ where: { id } });
    return reply.status(204).send();
  });

  app.post('/api/projects/:id/media', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = mediaCreateSchema.parse(request.body);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const media = await prisma.projectMedia.create({
      data: { ...body, projectId: id },
    });

    return reply.status(201).send({ media });
  });

  app.delete('/api/projects/:projectId/media/:mediaId', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { projectId, mediaId } = request.params as { projectId: string; mediaId: string };

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    await prisma.projectMedia.delete({ where: { id: mediaId } });
    return reply.status(204).send();
  });
}
