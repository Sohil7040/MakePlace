'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DesignJournalsList } from '@/components/projects/design-journals-list';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function JournalsPage() {
  const { user, student } = useAuth();

  if (!user) return <DashboardLayout><Skeleton className="h-96" /></DashboardLayout>;
  if (!student?.id) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh] text-charcoal-400 font-sans">
          Only students have access to design journals.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <header className="mb-10">
          <h1 className="font-heading text-headline-lg font-bold text-charcoal-900">My Journals</h1>
          <p className="font-sans text-body-md text-charcoal-400 mt-2">
            Access all your standalone sketches and project-attached design journals here.
          </p>
        </header>

        <DesignJournalsList studentId={student.id} />
      </div>
    </DashboardLayout>
  );
}
