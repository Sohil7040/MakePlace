'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toaster';
import { projectsApi, studentsApi } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tags: '', status: 'draft' as 'draft' | 'published' });

  useEffect(() => {
    studentsApi.me().then(({ student }) => setStudentId(student.id)).catch(() => router.push('/dashboard'));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    try {
      const { project } = await projectsApi.create(studentId, {
        title: form.title,
        description: form.description,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: form.status,
      });
      toast({ title: 'Project created' });
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>New Project</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="robotics, arduino, coding" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'draft' | 'published' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
