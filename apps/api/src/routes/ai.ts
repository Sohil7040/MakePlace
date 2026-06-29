import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { anyAuthenticated } from '../lib/auth.js';
import { GoogleGenAI } from '@google/genai';

const scrapYardSchema = z.object({
  parts: z.string().min(1),
});

export async function aiRoutes(app: FastifyInstance) {
  app.post('/api/ai/scrap-yard', { preHandler: anyAuthenticated }, async (request, reply) => {
    const body = scrapYardSchema.parse(request.body);

    if (!process.env.GEMINI_API_KEY) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an enthusiastic engineering mentor. 
      The student has the following loose parts available in their maker-space: ${body.parts}
      
      Generate 3 wacky, creative, and fun project ideas they could build using some or all of these parts.
      Format the response cleanly with emojis and bullet points. Keep it highly engaging and concise (under 200 words).`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
      });

      return { ideas: response.text };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Failed to generate ideas' });
    }
  });
}
