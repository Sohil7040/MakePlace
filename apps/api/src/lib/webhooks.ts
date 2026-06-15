import type { FastifyInstance } from 'fastify';

export async function fireWebhook(
  app: FastifyInstance,
  event: string,
  payload: Record<string, unknown>
) {
  app.log.info({ event, payload }, 'Webhook event');
}
