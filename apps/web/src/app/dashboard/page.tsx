'use client';

import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = {
    admin: [
      { title: 'Students', desc: 'Manage student profiles', href: '/dashboard/students', icon: Users },
      { title: 'Projects', desc: 'View all student projects', href: '/dashboard/projects', icon: FolderKanban },
      { title: 'Badges', desc: 'Manage achievement badges', href: '/dashboard/badges', icon: Award },
    ],
    mentor: [
      { title: 'Students', desc: 'View and mentor students', href: '/dashboard/students', icon: Users },
      { title: 'Projects', desc: 'Review student projects', href: '/dashboard/projects', icon: FolderKanban },
      { title: 'Reports', desc: 'Write weekly reports', href: '/dashboard/reports', icon: FileText },
    ],
    student: [
      { title: 'My Projects', desc: 'Create and manage projects', href: '/dashboard/projects', icon: FolderKanban },
      { title: 'Portfolio', desc: 'AI-generated portfolio', href: '/dashboard/portfolio', icon: FileText },
    ],
  };

  const items = cards[user?.role || 'student'] || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground mt-1 font-body">Welcome back to your MakePlace dashboard</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:border-primary/40 transition-colors accent-glow-sm cursor-pointer h-full dashboard-panel">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
