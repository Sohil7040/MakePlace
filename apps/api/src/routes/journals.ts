import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function journalRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  const getStudentId = async (user: any) => {
    if (user.role !== 'student') return null;
    const student = await prisma.student.findFirst({ where: { userId: user.id } });
    return student?.id;
  };

  const isAuthorizedForStudent = async (studentId: string, user: any) => {
    if (user.role === 'admin' || user.role === 'mentor') return true;
    const requestingStudentId = await getStudentId(user);
    return requestingStudentId === studentId;
  };

  const isAuthorizedForJournal = async (journalId: string, user: any) => {
    if (user.role === 'admin' || user.role === 'mentor') return true;
    const journal = await prisma.designJournal.findUnique({ where: { id: journalId } });
    const studentId = await getStudentId(user);
    return journal && journal.studentId === studentId;
  };

  // Get journals for a student (can optionally filter by project)
  app.get('/api/students/:studentId/journals', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const { projectId } = request.query as { projectId?: string };
    
    if (!(await isAuthorizedForStudent(studentId, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const where: any = { studentId };
    if (projectId) {
      where.projectId = projectId;
    }
    
    const journals = await prisma.designJournal.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    
    return journals;
  });

  // Get single journal
  app.get('/api/journals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    if (!(await isAuthorizedForJournal(id, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const journal = await prisma.designJournal.findUnique({
      where: { id },
    });
    
    if (!journal) {
      return reply.status(404).send({ error: 'Journal not found' });
    }
    
    return journal;
  });

  // Create a journal
  app.post('/api/students/:studentId/journals', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const { title = 'New Journal', projectId, canvasData } = request.body as { title?: string; projectId?: string; canvasData?: any };

    if (!(await isAuthorizedForStudent(studentId, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const journal = await prisma.designJournal.create({
      data: {
        studentId,
        projectId,
        title,
        canvasData,
      },
    });

    return journal;
  });

  // Update a journal (title, canvasData)
  app.patch('/api/journals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, canvasData } = request.body as { title?: string; canvasData?: any };

    if (!(await isAuthorizedForJournal(id, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const journal = await prisma.designJournal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(canvasData && { canvasData }),
      },
    });

    return journal;
  });

  // Delete a journal
  app.delete('/api/journals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!(await isAuthorizedForJournal(id, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    await prisma.designJournal.delete({
      where: { id },
    });

    return { success: true };
  });
}
