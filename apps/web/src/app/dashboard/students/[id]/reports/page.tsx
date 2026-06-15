'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { studentsApi, mentorApi, type Student, type Report } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function StudentReportsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [weekOf, setWeekOf] = useState('');
  const [sentToParent, setSentToParent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    setWeekOf(monday.toISOString().split('T')[0]);

    Promise.all([studentsApi.get(id), mentorApi.getReports(id)])
      .then(([s, r]) => {
        setStudent(s.student);
        setReports(r.reports);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { report } = await mentorApi.createReport(id, {
        content,
        weekOf: new Date(weekOf).toISOString(),
        sentToParent,
      });
      setReports([report, ...reports]);
      setContent('');
      setSentToParent(false);
      toast({ title: 'Report saved' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><Skeleton className="h-64" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/students/${id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Weekly Reports</h1>
            <p className="text-muted-foreground">{student?.fullName}</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>New Report</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Week of</Label>
                <Input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Report Content</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="This week Arjun worked on..." required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sentToParent} onChange={(e) => setSentToParent(e.target.checked)} />
                Mark as sent to parent
              </label>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Report'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Previous Reports</h2>
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reports yet.</p>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Week of {new Date(report.weekOf).toLocaleDateString()}
                    {report.sentToParent && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Sent to parent</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: report.content.replace(/\n/g, '<br/>') }} />
                  <p className="text-xs text-muted-foreground mt-2">By {report.mentor?.name}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
