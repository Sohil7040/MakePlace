'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorApi, type Badge } from '@/lib/api';

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorApi.getBadges().then(({ badges: b }) => setBadges(b)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Badges</h1>
          <p className="text-muted-foreground">Achievement badges available for students</p>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <CardHeader className="text-center">
                  <span className="text-4xl">{badge.icon}</span>
                  <CardTitle className="text-lg mt-2">{badge.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  <span className="inline-block mt-2 text-xs bg-secondary px-2 py-1 rounded-full">{badge.category}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
