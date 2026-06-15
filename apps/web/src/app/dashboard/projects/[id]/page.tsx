'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, MessageSquare, Trash2, Upload } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { projectsApi, uploadApi, mentorApi, type Project, type Comment } from '@/lib/api';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', tags: '' });

  const isMentor = user?.role === 'admin' || user?.role === 'mentor';
  const canEdit = user?.role === 'student' || user?.role === 'admin';

  const load = useCallback(async () => {
    try {
      const [{ project: p }, { comments: c }] = await Promise.all([
        projectsApi.get(id),
        mentorApi.getComments('project', id),
      ]);
      setProject(p);
      setComments(c);
      setForm({ title: p.title, description: p.description, tags: p.tags.join(', ') });
    } catch {
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const { project: updated } = await projectsApi.update(id, {
        title: form.title,
        description: form.description,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setProject(updated);
      setEditing(false);
      toast({ title: 'Project updated' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
        const url = await uploadApi.uploadFile(file, 'projects');
        await projectsApi.addMedia(id, { type, url });
      }
      await load();
      toast({ title: 'Media uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await mentorApi.createComment({ targetType: 'project', targetId: id, content: commentText });
      setCommentText('');
      const { comments: c } = await mentorApi.getComments('project', id);
      setComments(c);
      toast({ title: 'Comment added' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <DashboardLayout><Skeleton className="h-96" /></DashboardLayout>;
  }

  if (!project) return null;

  const images = project.media?.filter((m) => m.type === 'image') || [];
  const videos = project.media?.filter((m) => m.type === 'video') || [];
  const files = project.media?.filter((m) => m.type === 'file') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          {editing ? (
            <Input className="text-2xl font-bold flex-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          ) : (
            <h1 className="text-3xl font-bold">{project.title}</h1>
          )}
          {canEdit && !editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>}
        </div>

        {editing ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground text-lg">{project.description}</p>
        )}

        <div className="flex gap-2 flex-wrap">
          {project.tags.map((tag) => (
            <span key={tag} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>

        {canEdit && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{uploading ? 'Uploading...' : 'Drag & drop media here, or click to browse'}</p>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>
        )}

        {images.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.caption || ''} className="rounded-lg w-full h-48 object-cover" />
                    {canEdit && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                        onClick={() => projectsApi.deleteMedia(id, img.id).then(load)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {videos.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Videos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {videos.map((vid) => (
                <video key={vid.id} src={vid.url} controls className="w-full rounded-lg max-h-96" />
              ))}
            </CardContent>
          </Card>
        )}

        {files.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Files</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {files.map((file) => (
                <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <Download className="h-4 w-4" /> {file.caption || 'Download file'}
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="border-l-2 border-primary/30 pl-4 py-1">
                  <p className="text-sm font-medium">{c.author?.name} <span className="text-muted-foreground font-normal">· {c.author?.role}</span></p>
                  <p className="text-sm mt-1">{c.content}</p>
                </div>
              ))
            )}
            {isMentor && (
              <div className="flex gap-2">
                <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." rows={2} className="flex-1" />
                <Button onClick={handleComment}>Post</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
