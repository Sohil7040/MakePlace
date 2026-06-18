import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { feeCreateSchema } from '../lib/schemas.js';
import { adminOnly } from '../lib/auth.js';
import { sendFeeReceipt } from '../lib/mailer.js';

export async function feesRoutes(app: FastifyInstance) {
  app.get('/api/fees', { preHandler: adminOnly }, async () => {
    const fees = await prisma.fee.findMany({
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
            program: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { fees };
  });

  app.post('/api/fees', { preHandler: adminOnly }, async (request, reply) => {
    const body = feeCreateSchema.parse(request.body);

    const fee = await prisma.fee.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        description: body.description,
        dueDate: new Date(body.dueDate),
        status: 'pending',
      },
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
            program: { select: { name: true } },
          },
        },
      },
    });

    return reply.status(201).send({ fee });
  });

  app.patch('/api/fees/:id/status', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: 'pending' | 'paid' | 'overdue' };

    const existingFee = await prisma.fee.findUnique({
      where: { id },
      include: { student: { select: { email: true, fullName: true } } },
    });

    if (!existingFee) {
      return reply.status(404).send({ error: 'Fee not found' });
    }

    const isNewlyPaid = status === 'paid' && existingFee.status !== 'paid';

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : null,
      },
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
            program: { select: { name: true } },
          },
        },
      },
    });

    // Send automated email receipt if it was just marked as paid
    if (isNewlyPaid && fee.student.email) {
      await sendFeeReceipt(fee.student.email, fee.student.fullName, fee.amount, fee.description);
    }

    return { fee };
  });
}
