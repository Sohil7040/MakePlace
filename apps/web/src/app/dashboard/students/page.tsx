'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { studentsApi, type Student } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi
      .list()
      .then(({ students: s }) => setStudents(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage academy students</p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/dashboard/students/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No students yet. Add your first student to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Link key={student.id} href={`/dashboard/students/${student.id}`}>
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {student.photo ? (
                      <img src={student.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{student.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {student.program?.name} · Age {student.age}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{student.studio?.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
