'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { feesApi, studentsApi, type Fee, type Student } from '@/lib/api';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function FeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ studentId: '', amount: '', description: '', dueDate: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    Promise.all([feesApi.list(), studentsApi.list()])
      .then(([fRes, sRes]) => {
        setFees(fRes.fees);
        setStudents(sRes.students);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleCreate = async () => {
    if (!form.studentId || !form.amount || !form.description || !form.dueDate) return;
    setCreating(true);
    try {
      const { fee } = await feesApi.create({
        studentId: form.studentId,
        amount: parseFloat(form.amount),
        description: form.description,
        dueDate: new Date(form.dueDate).toISOString(),
      });
      setFees([fee, ...fees]);
      setShowModal(false);
      setForm({ studentId: '', amount: '', description: '', dueDate: '' });
      toast({ title: 'Fee assigned successfully!' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const { fee } = await feesApi.updateStatus(id, newStatus);
      setFees(fees.map(f => f.id === id ? fee : f));
      toast({ title: newStatus === 'paid' ? 'Marked as Paid' : 'Marked as Pending' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fees & Payments</h1>
            <p className="text-muted-foreground">Manage academy tuition and project fees</p>
          </div>
          <Button className="gap-2" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Assign Fee
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {fees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No fees assigned yet.</div>
              ) : (
                fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-lg">₹{fee.amount}</p>
                      <p className="text-sm">{fee.description} — {fee.student?.fullName}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        fee.status === 'paid' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-vermillion/15 text-vermillion'
                      }`}>
                        {fee.status}
                      </span>
                      <Button
                        variant={fee.status === 'paid' ? 'outline' : 'default'}
                        className="gap-2 w-36"
                        onClick={() => handleToggleStatus(fee.id, fee.status)}
                      >
                        {fee.status === 'paid' ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        {fee.status === 'paid' ? 'Paid' : 'Mark as Paid'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle>Assign New Fee</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 1500" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly Tuition - June" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating}>{creating ? 'Assigning...' : 'Assign Fee'}</Button>
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
