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
            <h1 className="font-heading text-headline-lg text-charcoal-900">Projects</h1>
            <p className="text-charcoal-400 font-sans text-body-md mt-1">
              {user?.role === 'student' ? 'Your maker projects' : 'All student projects'}
            </p>
          </div>
          {user?.role === 'student' && studentId && (
            <Link href="/dashboard/projects/new">
              <Button className="gap-2 bg-accent text-white hover:bg-accent-dark"><Plus className="h-4 w-4" /> New Project</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-charcoal-100 rounded-xl p-12 text-center text-charcoal-400">
            No projects yet. Start building something amazing!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const thumb = project.media?.find((m) => m.type === 'image');
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <div className="bg-white border border-charcoal-100 rounded-xl hover:border-charcoal-200 hover:shadow-card-hover transition-all duration-300 h-full overflow-hidden group">
                    {thumb ? (
                      <img src={thumb.url} alt="" className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-charcoal-50">
                        <FolderKanban className="h-12 w-12 text-charcoal-200" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-heading text-title-lg text-charcoal-900 mb-1">{project.title}</h3>
                      {project.student && (
                        <p className="text-sm text-charcoal-400 mb-3">{project.student.fullName}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-full font-semibold">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
