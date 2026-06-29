import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { portfolioChatSchema, portfolioPublishSchema, portfolioThemeSchema } from '../lib/schemas.js';
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
            projects: { where: { status: 'published' }, include: { media: true, journals: true } },
            reports: { where: { sentToParent: true }, include: { mentor: { select: { name: true } } } },
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

    const portfolio = await prisma.portfolio.upsert({
      where: { studentId },
      create: {
        studentId,
        publicSlug: `${student.fullName.replace(/\\s+/g, '-').toLowerCase()}-${Date.now().toString().slice(-4)}`,
        content: content as object,
        lastGeneratedAt: new Date()
      },
      update: { content: content as object, lastGeneratedAt: new Date() },
    });

    await prisma.student.update({
      where: { id: studentId },
      data: { xp: { increment: 10 } }
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

    const conversation = (portfolio.conversation as Array<{ role: string; content: string }>) || [];
    if (!portfolio.content) {
      return reply.status(400).send({ error: 'Generate portfolio first' });
    }

    const ctx = {
      student,
      projects: student.projects,
      badges: student.badgeAwards,
      mentorName: student.mentor?.name || 'Assigned Mentor'
    };

    const updatedContent = await refinePortfolio(ctx, conversation, body.message);
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

  app.patch('/api/students/:studentId/portfolio/theme', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const body = portfolioThemeSchema.parse(request.body);

    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const portfolio = await prisma.portfolio.update({
      where: { studentId },
      data: { theme: body.theme },
    });

    return { portfolio };
  });

  app.get('/api/students/:studentId/portfolio/export', { preHandler: anyAuthenticated }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    
    if (request.user.role === 'student') {
      const own = await prisma.student.findFirst({ where: { userId: request.user.id } });
      if (own?.id !== studentId) return reply.status(403).send({ error: 'Forbidden' });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { studentId },
      include: { student: true }
    });

    if (!portfolio || !portfolio.content) {
      return reply.status(400).send({ error: 'Generate portfolio first before exporting.' });
    }

    const content = portfolio.content as any;
    
    let themeCSS = `
      :root {
        --bg-color: #faf9f6;
        --text-color: #1e1e1e;
        --primary: #ff4500;
        --card-bg: #ffffff;
        --font-family: system-ui, -apple-system, sans-serif;
      }
    `;

    if (portfolio.theme === 'cyberpunk') {
      themeCSS = `
        :root {
          --bg-color: #0b0f19;
          --text-color: #00ffcc;
          --primary: #ff00ff;
          --card-bg: #1a1b26;
          --font-family: 'Courier New', monospace;
        }
      `;
    } else if (portfolio.theme === 'blueprint') {
      themeCSS = `
        :root {
          --bg-color: #1e4b85;
          --text-color: #ffffff;
          --primary: #f2e3c6;
          --card-bg: rgba(255,255,255,0.1);
          --font-family: 'Arial', sans-serif;
        }
        body {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `;
    } else if (portfolio.theme === 'terminal') {
      themeCSS = `
        :root {
          --bg-color: #000000;
          --text-color: #33ff00;
          --primary: #ffffff;
          --card-bg: #0a0a0a;
          --font-family: 'Consolas', monospace;
        }
      `;
    }

    const htmlString = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${portfolio.student.fullName} - Engineering Portfolio</title>
        <style>
          ${themeCSS}
          body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-family);
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: var(--primary); font-size: 2.5rem; margin-bottom: 10px; }
          .card {
            background-color: var(--card-bg);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .tag {
            display: inline-block;
            background: var(--primary);
            color: var(--bg-color);
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 14px;
            font-weight: bold;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          .project {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(128,128,128,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${portfolio.student.fullName}</h1>
          <div class="card">
            <h2>About Me</h2>
            <p>${content.about || ''}</p>
          </div>
          
          <div class="card">
            <h2>Core Skills</h2>
            <div>
              ${(content.skills || []).map((s: string) => `<span class="tag">${s}</span>`).join('')}
            </div>
          </div>
          
          <div class="card">
            <h2>Projects</h2>
            ${(content.projects || []).map((p: any) => `
              <div class="project">
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <ul>
                  ${(p.highlights || []).map((h: string) => `<li>${h}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    reply.header('Content-Type', 'text/html');
    reply.header('Content-Disposition', `attachment; filename="${portfolio.student.fullName.replace(/\\s+/g, '-').toLowerCase()}-portfolio.html"`);
    return reply.send(htmlString);
  });
}
