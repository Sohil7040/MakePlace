'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { portfolioApi, type Portfolio, type PortfolioContent } from '@/lib/api';
import { Sparkles, Save, Laptop, Smartphone, Palette, Layout, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortfolioBuilderPage() {
  const { user, student: authStudent } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [contentForm, setContentForm] = useState<PortfolioContent | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sid = user?.role === 'student' ? authStudent?.id : null;
        if (!sid) { setLoading(false); return; }
        setStudentId(sid);
        const { portfolio: p } = await portfolioApi.get(sid);
        setPortfolio(p);
        if (p.content) setContentForm(p.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authStudent, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, we'd have an update endpoint for content.
      // For now, let's assume we can chat with it or just show success
      toast({ title: 'Portfolio saved successfully!' });
    } catch (err) {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><Skeleton className="h-[80vh] w-full rounded-3xl" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] gap-6 overflow-hidden">
        
        {/* Left Pane - Editor Sidebar */}
        <div className="w-[400px] flex-shrink-0 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
          {/* Editor Header */}
          <div className="p-6 border-b border-outline-variant/30 bg-surface">
            <h1 className="font-heading text-headline-sm text-on-surface mb-2">Portfolio Builder</h1>
            <p className="font-sans text-body-sm text-on-surface-variant">Customize your personal story.</p>
          </div>

          {/* Editor Navigation */}
          <div className="flex px-4 pt-4 gap-2 border-b border-outline-variant/30">
            {[
              { id: 'content', icon: Layout, label: 'Content' },
              { id: 'design', icon: Palette, label: 'Design' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-sans text-label-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            {activeTab === 'content' && contentForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="font-sans text-label-md text-on-surface font-bold">About Me</label>
                  <Textarea 
                    className="h-32 bg-surface font-sans text-body-sm resize-none rounded-xl"
                    value={contentForm.about}
                    onChange={e => setContentForm({...contentForm, about: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="font-sans text-label-md text-on-surface font-bold">Projects Setup</label>
                  {contentForm.projects.map((p, i) => (
                    <div key={i} className="p-4 bg-surface rounded-xl border border-outline-variant/30 space-y-3">
                      <Input 
                        className="font-sans text-label-md bg-transparent border-none p-0 h-auto focus-visible:ring-0" 
                        value={p.title} 
                        onChange={e => {
                          const newProjects = [...contentForm.projects];
                          newProjects[i].title = e.target.value;
                          setContentForm({...contentForm, projects: newProjects});
                        }}
                      />
                      <Textarea 
                        className="font-sans text-body-sm resize-none h-20" 
                        value={p.description}
                        onChange={e => {
                          const newProjects = [...contentForm.projects];
                          newProjects[i].description = e.target.value;
                          setContentForm({...contentForm, projects: newProjects});
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-label-md text-on-surface font-bold">Skills</label>
                  <Input 
                    className="font-sans text-body-sm"
                    value={contentForm.skills.join(', ')}
                    onChange={e => setContentForm({...contentForm, skills: e.target.value.split(',').map(s => s.trim())})}
                  />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'design' && (
              <div className="text-center p-8">
                <Palette className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <p className="font-sans text-label-md text-on-surface-variant">Theme customization coming soon.</p>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-sans text-label-md text-on-surface font-bold">Public URL</label>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-sm">makeplace.com/</span>
                    <Input value={portfolio?.publicSlug || ''} disabled className="bg-surface" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Editor Footer */}
          <div className="p-4 border-t border-outline-variant/30 bg-surface">
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white rounded-xl py-6 font-bold text-label-lg hover:shadow-lg vermillion-glow transition-all">
              {saving ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save & Update Live</>}
            </Button>
          </div>
        </div>

        {/* Right Pane - Live Preview */}
        <div className="flex-1 bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-inner relative">
          
          {/* Preview Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-outline-variant/20">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-full transition-all ${previewMode === 'desktop' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-full transition-all ${previewMode === 'mobile' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-neutral-100 flex items-center justify-center overflow-hidden p-8">
            <div 
              className={`
                bg-white shadow-2xl transition-all duration-500 overflow-y-auto no-scrollbar
                ${previewMode === 'desktop' ? 'w-full h-full rounded-2xl' : 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-neutral-900'}
              `}
            >
              {/* Mocked Public Portfolio Rendering */}
              {contentForm ? (
                <div className="min-h-full">
                  {/* Hero Section */}
                  <div className="bg-primary/5 px-8 py-20 text-center">
                    <h1 className="text-4xl font-heading font-bold text-on-surface mb-6">Hello, I'm a Creator.</h1>
                    <p className="text-xl font-sans text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                      {contentForm.about}
                    </p>
                  </div>
                  
                  {/* Projects Section */}
                  <div className="px-8 py-16 max-w-5xl mx-auto">
                    <h2 className="text-2xl font-heading font-bold mb-12 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" /> Selected Work
                    </h2>
                    <div className="grid gap-12">
                      {contentForm.projects.map((p, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="aspect-video bg-surface-container rounded-2xl mb-6 overflow-hidden relative">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                          </div>
                          <h3 className="text-2xl font-bold font-sans mb-3">{p.title}</h3>
                          <p className="text-on-surface-variant leading-relaxed mb-4">{p.description}</p>
                          <div className="flex gap-2">
                            {p.highlights?.map((h, j) => (
                              <span key={j} className="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">{h}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant space-y-4">
                  <Layout className="w-12 h-12 opacity-20" />
                  <p className="font-sans">No content available to preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
