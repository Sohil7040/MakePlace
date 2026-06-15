'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toaster';
import { studentsApi, programsApi, studiosApi, uploadApi, type Program, type Studio } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    contact: '',
    email: '',
    programId: '',
    studioId: '',
  });

  useEffect(() => {
    Promise.all([programsApi.list(), studiosApi.list()]).then(([p, s]) => {
      setPrograms(p.programs);
      setStudios(s.studios);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photo: string | undefined;
      if (photoFile) {
        photo = await uploadApi.uploadFile(photoFile, 'students');
      }

      const { student } = await studentsApi.create({
        fullName: form.fullName,
        age: parseInt(form.age),
        contact: form.contact,
        email: form.email,
        programId: form.programId,
        studioId: form.studioId,
        photo,
      });

      toast({ title: 'Student created', description: `${student.fullName} has been added.` });
      router.push(`/dashboard/students/${student.id}`);
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={5}
                  max={25}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Studio</Label>
                <Select value={form.studioId} onValueChange={(v) => setForm({ ...form, studioId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select studio" />
                  </SelectTrigger>
                  <SelectContent>
                    {studios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="photo">Photo (optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Student'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
