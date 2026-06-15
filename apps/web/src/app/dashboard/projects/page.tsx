'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { projectsApi, studentsApi, type Project } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function ProjectsPage() {
  const { user, student: myStudent } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (user?.role === 'student') {
        const { student } = await studentsApi.me();
        setStudentId(student.id);
      }
      const { projects: p } = await projectsApi.list();
      setProjects(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              {user?.role === 'student' ? 'Your maker projects' : 'All student projects'}
            </p>
          </div>
          {user?.role === 'student' && studentId && (
            <Link href="/dashboard/projects/new">
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Project</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No projects yet. Start building something amazing!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const thumb = project.media?.find((m) => m.type === 'image');
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="hover:border-primary/50 transition-colors h-full overflow-hidden">
                    {thumb ? (
                      <img src={thumb.url} alt="" className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-secondary">
                        <FolderKanban className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {project.student && (
                        <p className="text-sm text-muted-foreground">{project.student.fullName}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
