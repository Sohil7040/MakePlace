'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background star-bg p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background star-bg">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="container mx-auto p-4 pt-16 lg:pt-8 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
