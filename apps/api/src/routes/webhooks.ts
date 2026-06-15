import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { fireWebhook } from '../lib/webhooks.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/report-created', async (request, reply) => {
    app.log.info({ body: request.body }, 'n8n webhook: report-created');
    return reply.status(200).send({ received: true, event: 'report-created' });
  });

  app.post('/api/webhooks/badge-awarded', async (request, reply) => {
    app.log.info({ body: request.body }, 'n8n webhook: badge-awarded');
    return reply.status(200).send({ received: true, event: 'badge-awarded' });
  });

  app.post('/api/webhooks/portfolio-published', async (request, reply) => {
    app.log.info({ body: request.body }, 'n8n webhook: portfolio-published');
    return reply.status(200).send({ received: true, event: 'portfolio-published' });
  });

  app.post('/api/webhooks/weekly-digest', async (request, reply) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const reports = await prisma.report.findMany({
      where: { weekOf: { gte: weekStart } },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        mentor: { select: { name: true } },
      },
      orderBy: { studentId: 'asc' },
    });

    const grouped = reports.reduce(
      (acc, report) => {
        const key = report.studentId;
        if (!acc[key]) {
          acc[key] = { student: report.student, reports: [] };
        }
        acc[key].reports.push({
          id: report.id,
          content: report.content,
          weekOf: report.weekOf,
          mentorName: report.mentor.name,
          sentToParent: report.sentToParent,
        });
        return acc;
      },
      {} as Record<string, { student: { id: string; fullName: string; email: string }; reports: unknown[] }>
    );

    const digest = { weekOf: weekStart, students: Object.values(grouped) };

    await fireWebhook(app, 'weekly-digest', digest);
    app.log.info({ digest }, 'n8n webhook: weekly-digest');

    return reply.status(200).send({ received: true, event: 'weekly-digest', digest });
  });
}
