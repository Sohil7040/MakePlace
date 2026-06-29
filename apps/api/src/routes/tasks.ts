import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function taskRoutes(app: FastifyInstance) {
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

  const isAuthorizedForProject = async (projectId: string, user: any) => {
    if (user.role === 'admin' || user.role === 'mentor') return true;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const studentId = await getStudentId(user);
    return project && project.studentId === studentId;
  };

  const isAuthorizedForTask = async (taskId: string, user: any) => {
    if (user.role === 'admin' || user.role === 'mentor') return true;
    const task = await prisma.projectTask.findUnique({ where: { id: taskId }, include: { project: true } });
    const studentId = await getStudentId(user);
    return task && task.project.studentId === studentId;
  };

  // Get tasks for a project
  app.get('/api/projects/:projectId/tasks', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    
    if (!(await isAuthorizedForProject(projectId, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const tasks = await prisma.projectTask.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
    
    return tasks;
  });

  // Create a task
  app.post('/api/projects/:projectId/tasks', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { title, status = 'todo' } = request.body as { title: string; status?: string };

    if (!(await isAuthorizedForProject(projectId, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const lastTask = await prisma.projectTask.findFirst({
      where: { projectId, status },
      orderBy: { order: 'desc' },
    });
    
    const nextOrder = lastTask ? lastTask.order + 1000 : 1000;

    const task = await prisma.projectTask.create({
      data: {
        projectId,
        title,
        status,
        order: nextOrder,
      },
    });

    return task;
  });

  // Update a task (status, title, order)
  app.patch('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as { title?: string; status?: string; order?: number };

    if (!(await isAuthorizedForTask(id, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const task = await prisma.projectTask.update({
      where: { id },
      data: updates,
    });

    return task;
  });

  // Delete a task
  app.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!(await isAuthorizedForTask(id, request.user))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    await prisma.projectTask.delete({
      where: { id },
    });

    return { success: true };
  });
}
