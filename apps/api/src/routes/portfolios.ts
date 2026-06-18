import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { portfolioChatSchema, portfolioPublishSchema } from '../lib/schemas.js';
import { anyAuthenticated, mentorOrAdmin } from '../lib/auth.js';
import { generatePortfolio, refinePortfolio, isClaudeConfigured } from '../lib/portfolio-ai.js';
import { fireWebhook } from '../lib/webhooks.js';

export async function portfolioRoutes(app: FastifyInstance) {
  app.get('/api/portfolio/public/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const portfolio = await prisma.portfolio.findUnique({
      where: { publicSlug: slug },
      include: {
        student: {
          include: {
            program: true,
            badgeAwards: { include: { badge: true } },
            projects: { where: { status: 'published' }, include: { media: true } },
          },
        },
      },
    });

    if (!portfolio || !portfolio.published) {
      return reply.status(404).send({ error: 'Portfolio not found' });
    }

    return { portfolio };
  });

  app.get('/api/students/:studentId/portfolio', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const portfolio = await prisma.portfolio.findUnique({
      where: { studentId },
      include: { student: { select: { fullName: true } } },
    });
    if (!portfolio) return reply.status(404).send({ error: 'Portfolio not found' });
    return { portfolio };
  });

  app.post('/api/students/:studentId/portfolio/generate', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };

    if (!isClaudeConfigured()) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        program: true,
        projects: { include: { media: true } },
        badgeAwards: { include: { badge: true } },
        mentor: true,
      },
    });
    if (!student) return reply.status(404).send({ error: 'Student not found' });

    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const content = await generatePortfolio({ 
      student, 
      projects: student.projects, 
      badges: student.badgeAwards,
      mentorName: student.mentor?.name || 'Assigned Mentor'
    });

    const portfolio = await prisma.portfolio.update({
      where: { studentId },
      data: { content: content as object, lastGeneratedAt: new Date() },
    });

    return { portfolio };
  });

  app.post('/api/students/:studentId/portfolio/chat', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = portfolioChatSchema.parse(request.body);

    if (!isClaudeConfigured()) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { studentId } });
    if (!portfolio) return reply.status(404).send({ error: 'Portfolio not found' });

    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const conversation = (portfolio.conversation as Array<{ role: string; content: string }>) || [];
    const currentContent = portfolio.content as unknown as Parameters<typeof refinePortfolio>[0];

    if (!currentContent) {
      return reply.status(400).send({ error: 'Generate portfolio first' });
    }

    const updatedContent = await refinePortfolio(currentContent, conversation, body.message);
    const newConversation = [
      ...conversation,
      { role: 'user', content: body.message },
      { role: 'assistant', content: JSON.stringify(updatedContent) },
    ];

    const updated = await prisma.portfolio.update({
      where: { studentId },
      data: {
        content: updatedContent as object,
        conversation: newConversation,
        lastGeneratedAt: new Date(),
      },
    });

    return { portfolio: updated };
  });

  app.patch('/api/students/:studentId/portfolio/publish', { preHandler: mentorOrAdmin }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = portfolioPublishSchema.parse(request.body);

    const portfolio = await prisma.portfolio.update({
      where: { studentId },
      data: {
        published: body.published,
        publishedAt: body.published ? new Date() : null,
      },
      include: { student: true },
    });

    if (body.published) {
      await fireWebhook(app, 'portfolio-published', {
        studentId,
        studentName: portfolio.student.fullName,
        publicSlug: portfolio.publicSlug,
      });
    }

    return { portfolio };
  });
}
