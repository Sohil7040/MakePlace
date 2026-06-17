'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, User as UserIcon, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { mentorApi, type User } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function MentorsPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    mentorApi
      .listMentors()
      .then(({ mentors: m }) => setMentors(m))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}? This will unassign them from their students.`)) return;
    
    setDeletingId(id);
    try {
      await mentorApi.deleteMentor(id);
      setMentors((prev) => prev.filter((m) => m.id !== id));
      toast({ title: 'Mentor removed', description: `${name} has been removed from the platform.` });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mentors</h1>
            <p className="text-muted-foreground">Manage academy mentors</p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/dashboard/mentors/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Mentor
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No mentors yet. Add your first mentor to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  {mentor.avatar ? (
                    <img src={mentor.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{mentor.email}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deletingId === mentor.id}
                      onClick={() => handleDelete(mentor.id, mentor.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
