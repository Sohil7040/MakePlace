'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, FileText, Pencil, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import {
  studentsApi,
  programsApi,
  studiosApi,
  uploadApi,
  mentorApi,
  type Student,
  type Program,
  type Studio,
  type Badge,
  type User,
} from '@/lib/api';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [badgeNote, setBadgeNote] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    contact: '',
    email: '',
    programId: '',
    studioId: '',
    mentorId: 'none',
  });

  const canEdit = user?.role === 'admin' || (user?.role === 'student' && student?.userId === user.id);
  const isMentor = user?.role === 'admin' || user?.role === 'mentor';

  useEffect(() => {
    Promise.all([
      studentsApi.get(id),
      programsApi.list(),
      studiosApi.list(),
      isMentor ? mentorApi.getBadges() : Promise.resolve({ badges: [] }),
      user?.role === 'admin' ? mentorApi.listMentors() : Promise.resolve({ mentors: [] }),
    ])
      .then(([s, p, st, b, m]) => {
        setStudent(s.student);
        setPrograms(p.programs);
        setStudios(st.studios);
        setBadges(b.badges);
        setMentors(m.mentors);
        setForm({
          fullName: s.student.fullName,
          age: String(s.student.age),
          contact: s.student.contact,
          email: s.student.email,
          programId: s.student.programId,
          studioId: s.student.studioId,
          mentorId: s.student.mentorId || 'none',
        });
      })
      .catch(() => router.push('/dashboard/students'))
      .finally(() => setLoading(false));
  }, [id, router, isMentor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { student: updated } = await studentsApi.update(id, {
        fullName: form.fullName,
        age: parseInt(form.age),
        contact: form.contact,
        email: form.email,
        programId: form.programId,
        studioId: form.studioId,
        mentorId: form.mentorId === 'none' ? null : form.mentorId,
      });
      setStudent(updated);
      setEditing(false);
      toast({ title: 'Profile updated' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photo = await uploadApi.uploadFile(file, 'students');
      const { student: updated } = await studentsApi.update(id, { photo });
      setStudent(updated);
      toast({ title: 'Photo uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge) return;
    try {
      await mentorApi.awardBadge(id, { badgeId: selectedBadge, note: badgeNote || undefined });
      const { student: updated } = await studentsApi.get(id);
      setStudent(updated);
      setShowBadgeModal(false);
      setSelectedBadge('');
      setBadgeNote('');
      toast({ title: 'Badge awarded!' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    );
  }

  if (!student) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{student.fullName}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 text-center">
              {student.photo ? (
                <img src={student.photo} alt="" className="mx-auto h-32 w-32 rounded-full object-cover" />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/15">
                  <User className="h-16 w-16 text-primary" />
                </div>
              )}
              {canEdit && (
                <div className="mt-4">
                  <Label htmlFor="photo-upload" className="cursor-pointer text-sm text-primary hover:underline">
                    Upload photo
                  </Label>
                  <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              )}
              <p className="mt-4 text-muted-foreground">{student.program?.name}</p>
              <p className="text-sm text-muted-foreground">{student.studio?.name}</p>
              {student.portfolio && (
                <Link href={`/portfolio/${student.portfolio.publicSlug}`} target="_blank">
                  <Button variant="outline" size="sm" className="mt-4">
                    View Public Portfolio
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Details</CardTitle>
              {canEdit && !editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Program</Label>
                      <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Studio</Label>
                      <Select value={form.studioId} onValueChange={(v) => setForm({ ...form, studioId: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {studios.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="space-y-2">
                        <Label>Assigned Mentor</Label>
                        <Select value={form.mentorId} onValueChange={(v) => setForm({ ...form, mentorId: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {mentors.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-sm text-muted-foreground">Age</dt><dd>{student.age}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Email</dt><dd>{student.email}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Contact</dt><dd>{student.contact}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Program</dt><dd>{student.program?.name}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Studio</dt><dd>{student.studio?.name}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Mentor</dt><dd>{student.mentor?.name || 'Unassigned'}</dd></div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        {isMentor && (
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/students/${id}/reports`}>
              <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Weekly Reports</Button>
            </Link>
            <Link href={`/dashboard/portfolio?studentId=${id}`}>
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                <FileText className="h-4 w-4" /> Manage Portfolio
              </Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={() => setShowBadgeModal(true)}>
              <Award className="h-4 w-4" /> Award Badge
            </Button>
          </div>
        )}

        {student.badgeAwards && student.badgeAwards.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Badges Earned</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {student.badgeAwards.map((award) => (
                  <div key={award.id} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                    <span className="text-2xl">{award.badge?.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{award.badge?.name}</p>
                      {award.note && <p className="text-xs text-muted-foreground">{award.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle>Award Badge</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                    <SelectTrigger><SelectValue placeholder="Select badge" /></SelectTrigger>
                    <SelectContent>
                      {badges.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Input value={badgeNote} onChange={(e) => setBadgeNote(e.target.value)} placeholder="Great teamwork!" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAwardBadge}>Award</Button>
                  <Button variant="outline" onClick={() => setShowBadgeModal(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
