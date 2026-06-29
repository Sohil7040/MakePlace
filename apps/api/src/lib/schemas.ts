import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'mentor', 'student']).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const studentCreateSchema = z.object({
  fullName: z.string().min(2),
  age: z.number().int().min(5).max(25),
  contact: z.string().min(5),
  email: z.string().email(),
  photo: z.string().url().optional(),
  programId: z.string(),
  studioId: z.string(),
  userId: z.string().optional(),
  mentorId: z.string().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const projectCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  phase: z.enum(['idea', 'research', 'design', 'build', 'testing', 'completed']).default('idea'),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const mediaCreateSchema = z.object({
  type: z.enum(['image', 'video', 'file']),
  url: z.string().url(),
  caption: z.string().optional(),
});

export const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional(),
});

export const reportCreateSchema = z.object({
  content: z.string().min(1),
  weekOf: z.string().datetime(),
  sentToParent: z.boolean().default(false),
});

export const badgeAwardSchema = z.object({
  badgeId: z.string(),
  note: z.string().optional(),
});

export const commentCreateSchema = z.object({
  targetType: z.enum(['project', 'portfolio']),
  targetId: z.string(),
  content: z.string().min(1),
});

export const badgeCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  icon: z.string().min(1),
  category: z.string().min(2),
});

export const feeCreateSchema = z.object({
  studentId: z.string(),
  amount: z.number().min(0),
  description: z.string().min(2),
  dueDate: z.string().datetime(),
});

export const portfolioChatSchema = z.object({
  message: z.string().min(1),
});

export const portfolioPublishSchema = z.object({
  published: z.boolean(),
});

export const portfolioThemeSchema = z.object({
  theme: z.string().min(1),
});
