'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorApi, studentsApi, type Student } from '@/lib/api';
import Link from 'next/link';

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.list().then(({ students: s }) => setStudents(s)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Reports</h1>
          <p className="text-muted-foreground">Select a student to write their weekly report</p>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Link key={student.id} href={`/dashboard/students/${student.id}/reports`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{student.fullName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{student.program?.name}</p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
