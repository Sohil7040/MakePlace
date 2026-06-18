'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorApi, type Badge } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import { Plus } from 'lucide-react';

export default function BadgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '🌟', category: 'General' });

  const isMentor = user?.role === 'admin' || user?.role === 'mentor';

  useEffect(() => {
    mentorApi.getBadges().then(({ badges: b }) => setBadges(b)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.description) return;
    setCreating(true);
    try {
      const { badge } = await mentorApi.createBadge(form);
      setBadges([...badges, badge]);
      setShowModal(false);
      setForm({ name: '', description: '', icon: '🌟', category: 'General' });
      toast({ title: 'Badge created successfully!' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Badges</h1>
            <p className="text-muted-foreground">Achievement badges available for students</p>
          </div>
          {isMentor && (
            <Button className="gap-2" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Create Badge
            </Button>
          )}
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle>Create New Badge</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Master Builder" />
                </div>
                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🛠️" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Robotics" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Awarded for..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
