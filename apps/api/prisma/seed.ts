import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@makerspace.in' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@makerspace.in',
      passwordHash,
      role: 'admin',
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@makerspace.in' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'mentor@makerspace.in',
      passwordHash,
      role: 'mentor',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@makerspace.in' },
    update: {},
    create: {
      name: 'Arjun Patel',
      email: 'student@makerspace.in',
      passwordHash,
      role: 'student',
    },
  });

  const program = await prisma.program.upsert({
    where: { id: 'prog-robotics' },
    update: {},
    create: {
      id: 'prog-robotics',
      name: 'Robotics Explorer',
      description: 'Introduction to robotics, sensors, and programming for young makers.',
    },
  });

  const program2 = await prisma.program.upsert({
    where: { id: 'prog-coding' },
    update: {},
    create: {
      id: 'prog-coding',
      name: 'Creative Coding',
      description: 'Learn programming through creative projects and games.',
    },
  });

  const studio1 = await prisma.studio.upsert({
    where: { id: 'studio-alpha' },
    update: {},
    create: { id: 'studio-alpha', name: 'Studio Alpha' },
  });

  const studio2 = await prisma.studio.upsert({
    where: { id: 'studio-beta' },
    update: {},
    create: { id: 'studio-beta', name: 'Studio Beta' },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      fullName: 'Arjun Patel',
      age: 12,
      contact: '+91 98765 43210',
      email: 'student@makerspace.in',
      programId: program.id,
      studioId: studio1.id,
    },
  });

  await prisma.portfolio.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      publicSlug: 'arjun-patel',
      content: null,
    },
  });

  const badges = [
    { name: 'First Build', description: 'Completed your first project', icon: '🔧', category: 'milestone' },
    { name: 'Team Player', description: 'Collaborated on a group project', icon: '🤝', category: 'social' },
    { name: 'Problem Solver', description: 'Debugged a complex issue independently', icon: '💡', category: 'skill' },
    { name: 'Creative Coder', description: 'Built an original creative coding project', icon: '🎨', category: 'skill' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: `badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: { id: `badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}`, ...badge },
    });
  }

  console.log('Seed complete:', { admin: admin.email, mentor: mentor.email, student: student.fullName });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
