'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, Upload, Share2, Grid, View, BookOpen, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { projectsApi, uploadApi, mentorApi, type Project, type Comment } from '@/lib/api';
import { TaskBoard } from '@/components/projects/task-board';
import { DesignJournalsList } from '@/components/projects/design-journals-list';
import { ProjectJourney } from '@/components/projects/ProjectJourney';
import { Switch } from '@/components/ui/switch';
import { studentsApi } from '@/lib/api';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, student } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

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
      
      // Load collaborators
      try {
        const collabRes = await projectsApi.getCollaborators(id);
        setCollaborators(collabRes.collaborators || []);
      } catch (err) {
        console.error('Failed to load collaborators:', err);
      }
        
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

  const handlePublishToggle = async (checked: boolean) => {
    try {
      const newStatus = checked ? 'published' : 'draft';
      const { project: updated } = await projectsApi.update(id, { status: newStatus });
      setProject(updated);
      toast({ title: checked ? 'Published to Gallery' : 'Unpublished' });
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

  const handleOpenCollab = async () => {
    setShowCollabModal(true);
    try {
      const { students } = await studentsApi.list();
      setAllStudents(students);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedStudentId) return;
    try {
      const { collaborator } = await projectsApi.addCollaborator(id, selectedStudentId);
      setCollaborators([...collaborators, collaborator]);
      setSelectedStudentId('');
      toast({ title: 'Collaborator added' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleRemoveCollaborator = async (collabId: string) => {
    try {
      await projectsApi.removeCollaborator(id, collabId);
      setCollaborators(collaborators.filter(c => c.id !== collabId));
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
      {/* Project Header */}
      <section className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-charcoal-300 font-sans text-label-sm mb-3">
            <Link href="/dashboard/projects" className="hover:text-charcoal-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Projects
            </Link>
            <span>/</span>
            <span className="text-charcoal-500">{project.title}</span>
          </nav>
          
          {editing ? (
            <Input className="text-2xl font-bold flex-1 mb-2 bg-transparent" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          ) : (
            <h2 className="font-heading text-headline-lg text-charcoal-900">{project.title}</h2>
          )}
          
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {project.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-charcoal-50 text-charcoal-600 rounded-full font-sans text-label-sm border border-charcoal-100">
                {tag}
              </span>
            ))}
            <span className="text-charcoal-300 font-sans text-label-sm">Updated recently</span>
            {canEdit && !editing && <button className="text-accent hover:underline font-sans text-label-sm ml-2" onClick={() => setEditing(true)}>Edit Details</button>}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {canEdit && (
            <div className="flex items-center gap-3 bg-charcoal-50 rounded-xl px-4 py-2 border border-charcoal-100">
              <span className="font-sans text-label-md text-charcoal-500">Publish to Gallery</span>
              <Switch 
                checked={project.status === 'published'} 
                onCheckedChange={handlePublishToggle}
              />
            </div>
          )}
          <button 
            onClick={handleOpenCollab}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-sans text-label-md hover:shadow-lg transition-all accent-button-glow"
          >
            <Share2 className="w-5 h-5" />
            Collaborate
          </button>
        </div>
      </section>

      {/* Project Journey */}
      <ProjectJourney project={project} onUpdate={setProject} canEdit={canEdit} />

      {/* Tabbed Interface Container */}
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          {/* Tabs Navigation */}
          <div className="border-b border-charcoal-100 px-4 md:px-8 bg-white overflow-x-auto no-scrollbar">
            <TabsList className="h-auto p-0 bg-transparent flex justify-start space-x-8">
              <TabsTrigger 
                value="overview" 
                className="px-2 py-4 font-sans text-label-md text-charcoal-400 data-[state=active]:text-charcoal-900 data-[state=active]:border-b-2 data-[state=active]:border-charcoal-900 rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent flex items-center gap-2 transition-all"
              >
                <Grid className="w-4 h-4" /> Overview & Media
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="px-2 py-4 font-sans text-label-md text-charcoal-400 data-[state=active]:text-charcoal-900 data-[state=active]:border-b-2 data-[state=active]:border-charcoal-900 rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent flex items-center gap-2 transition-all"
              >
                <View className="w-4 h-4" /> Task Board
              </TabsTrigger>
              <TabsTrigger 
                value="journals" 
                className="px-2 py-4 font-sans text-label-md text-charcoal-400 data-[state=active]:text-charcoal-900 data-[state=active]:border-b-2 data-[state=active]:border-charcoal-900 rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" /> Design Journals
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 md:p-8 bg-white min-h-[500px]">
            <TabsContent value="overview" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Media & Description */}
                <div className="flex-1 space-y-8">
                  {editing ? (
                    <div className="space-y-4 bg-charcoal-50 p-6 rounded-2xl border border-charcoal-100">
                      <div className="space-y-2">
                        <label className="font-sans text-label-md text-charcoal-500">Description</label>
                        <Textarea className="font-sans text-body-md" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-label-md text-charcoal-500">Tags (comma separated)</label>
                        <Input className="font-sans text-body-md" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-charcoal-900 text-white hover:bg-charcoal-800" onClick={handleSave}>Save</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    project.description && (
                      <p className="font-sans text-body-lg text-charcoal-400 leading-relaxed">
                        {project.description}
                      </p>
                    )
                  )}

                  {/* Uploader */}
                  {canEdit && (
                    <div
                      className="border-2 border-dashed border-charcoal-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-accent/50 hover:bg-accent/[0.02] transition-all cursor-pointer group"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                    >
                      <div className="w-14 h-14 rounded-full bg-charcoal-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-sans text-label-md text-charcoal-400">{uploading ? 'Uploading...' : 'Drag & drop media here, or click to browse'}</p>
                      <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                    </div>
                  )}

                  {/* Masonry Media Grid */}
                  {(images.length > 0 || videos.length > 0 || files.length > 0) && (
                    <div className="masonry-grid">
                      {videos.map((vid) => (
                        <div key={vid.id} className="masonry-item rounded-2xl overflow-hidden border border-charcoal-100 relative group bg-white">
                          <video src={vid.url} controls className="w-full object-cover" />
                          {canEdit && (
                            <button
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              onClick={() => projectsApi.deleteMedia(id, vid.id).then(load)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {images.map((img) => (
                        <div key={img.id} className="masonry-item rounded-2xl overflow-hidden border border-charcoal-100 relative group bg-white">
                          <img src={img.url} alt={img.caption || ''} className="w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <p className="text-white font-sans text-label-sm">{img.caption || 'Project Image'}</p>
                          </div>
                          {canEdit && (
                            <button
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                              onClick={() => projectsApi.deleteMedia(id, img.id).then(load)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {files.map((file) => (
                        <div key={file.id} className="masonry-item rounded-2xl border border-charcoal-100 p-6 aspect-square flex flex-col justify-between bg-white">
                          <div className="flex justify-between items-start">
                            <Download className="w-8 h-8 text-charcoal-400" />
                            {canEdit && (
                              <button className="text-charcoal-300 hover:text-red-500 transition-colors" onClick={() => projectsApi.deleteMedia(id, file.id).then(load)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="mt-4">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-sans text-label-md hover:underline hover:text-accent break-words text-charcoal-900">
                              {file.caption || 'Download File'}
                            </a>
                            <p className="font-sans text-label-sm text-charcoal-400 mt-1">Document</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Mentor Feed Sidebar */}
                <div className="w-full lg:w-80 xl:w-96 space-y-6">
                  <div className="bg-charcoal-50 rounded-2xl p-6 border border-charcoal-100">
                    <h3 className="font-sans text-label-md mb-4 flex items-center gap-2 text-charcoal-900 font-semibold">
                      <MessageSquare className="w-4 h-4 text-charcoal-400" />
                      Mentor Feed
                    </h3>
                    
                    <div className="space-y-5">
                      {comments.length === 0 ? (
                        <p className="text-charcoal-400 font-sans text-body-sm italic">No feedback yet.</p>
                      ) : (
                        comments.map((c) => (
                          <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-charcoal-900 flex items-center justify-center">
                              {(c.author as any)?.avatar ? (
                                <img src={(c.author as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-heading font-bold text-white text-xs">{c.author?.name?.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-sans text-label-sm font-bold text-charcoal-900">{c.author?.name}</p>
                              <p className="text-[13px] text-charcoal-500 leading-relaxed mt-1">{c.content}</p>
                              <span className="text-[11px] text-charcoal-300 mt-1 block">Recently</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {isMentor && (
                      <div className="mt-6 space-y-2 border-t border-charcoal-200 pt-4">
                        <Textarea 
                          className="w-full font-sans text-body-sm rounded-lg border-charcoal-200 bg-white" 
                          placeholder="Provide feedback..." 
                          value={commentText} 
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={2}
                        />
                        <button 
                          className="w-full py-2 bg-charcoal-900 text-white rounded-lg font-sans text-label-sm hover:bg-charcoal-800 transition-colors font-semibold"
                          onClick={handleComment}
                        >
                          Post Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="min-h-[500px]">
                <TaskBoard projectId={project.id} />
              </div>
            </TabsContent>

            <TabsContent value="journals" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <DesignJournalsList projectId={project.id} studentId={project.studentId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Collaborate Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-heading text-title-lg font-bold mb-4 text-charcoal-900">Manage Team</h3>
            
            <div className="space-y-4 mb-6">
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-charcoal-50 p-3 rounded-xl border border-charcoal-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal-200 overflow-hidden">
                      {c.student?.photo && <img src={c.student.photo} alt="Avatar" className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-sans font-semibold text-charcoal-900">{c.student?.fullName}</span>
                  </div>
                  {project.studentId === student?.id && (
                    <button onClick={() => handleRemoveCollaborator(c.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {collaborators.length === 0 && (
                <p className="text-charcoal-400 font-sans text-sm italic">No collaborators yet.</p>
              )}
            </div>

            {project.studentId === student?.id && (
              <div className="flex gap-2 mb-6">
                <select 
                  className="flex-1 bg-white border border-charcoal-200 rounded-lg px-3 font-sans text-sm"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select a student...</option>
                  {allStudents
                    .filter(s => s.id !== project.studentId && !collaborators.some(c => c.studentId === s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
                <Button onClick={handleAddCollaborator} disabled={!selectedStudentId}>Add</Button>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCollabModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
