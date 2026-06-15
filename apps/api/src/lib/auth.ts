import { Role } from '@prisma/client';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export function requireRoles(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const user = request.user;
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
  };
}

export const adminOnly = requireRoles('admin');
export const mentorOrAdmin = requireRoles('admin', 'mentor');
export const anyAuthenticated = requireRoles('admin', 'mentor', 'student');
