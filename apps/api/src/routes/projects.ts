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
  app.get('/api/projects/:id/collaborators', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId: id },
      include: { student: { select: { id: true, fullName: true, photo: true } } }
    });
    return { collaborators };
  });

  app.post('/api/projects/:id/collaborators', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { studentId } = request.body as { studentId: string };
    
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Only owner can add collaborators' });
    }

    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId: id, studentId },
      include: { student: { select: { id: true, fullName: true, photo: true } } }
    });

    return reply.status(201).send({ collaborator });
  });

  app.delete('/api/projects/:id/collaborators/:collaboratorId', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id, collaboratorId } = request.params as { id: string, collaboratorId: string };
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      if (student?.id !== existing.studentId) return reply.status(403).send({ error: 'Only owner can remove collaborators' });
    }

    await prisma.projectCollaborator.delete({ where: { id: collaboratorId } });
    return reply.status(204).send();
  });

  app.get('/api/projects/explore', { preHandler: anyAuthenticated }, async (request) => {
    const projects = await prisma.project.findMany({
      where: { status: 'published' },
      include: { 
        media: true, 
        student: { select: { id: true, fullName: true, photo: true } },
        _count: { select: { sparks: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
    return { projects };
  });

  app.post('/api/projects/:id/spark', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const student = await getStudentForUser(request.user.id, request.user.role);
    
    if (!student) return reply.status(403).send({ error: 'Only students can give sparks' });

    const existing = await prisma.spark.findUnique({
      where: { studentId_projectId: { studentId: student.id, projectId: id } }
    });

    if (existing) {
      await prisma.spark.delete({ where: { id: existing.id } });
      return { success: true, sparked: false };
    } else {
      await prisma.spark.create({ data: { studentId: student.id, projectId: id } });
      return { success: true, sparked: true };
    }
  });

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
        collaborators: { include: { student: { select: { id: true, fullName: true, photo: true } } } }
      },
    });
    if (!project) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      const isOwner = student?.id === project.studentId;
      const isCollab = project.collaborators.some(c => c.studentId === student?.id);
      if (!isOwner && !isCollab) {
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

    const existing = await prisma.project.findUnique({ 
      where: { id },
      include: { collaborators: true }
    });
    if (!existing) return reply.status(404).send({ error: 'Project not found' });

    if (request.user.role === 'student') {
      const student = await getStudentForUser(request.user.id, request.user.role);
      const isOwner = student?.id === existing.studentId;
      const isCollab = existing.collaborators.some(c => c.studentId === student?.id);
      if (!isOwner && !isCollab) return reply.status(403).send({ error: 'Forbidden' });
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
