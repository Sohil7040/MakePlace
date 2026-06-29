'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';
import { studentsApi, portfolioApi, type Portfolio, type PortfolioContent } from '@/lib/api';
import { Sparkles, Send, ExternalLink, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function PortfolioPage() {
  const { user, student: authStudent } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatting, setChatting] = useState(false);

  const isMentor = user?.role === 'admin' || user?.role === 'mentor';

  useEffect(() => {
    async function load() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let sid = urlParams.get('studentId') || authStudent?.id;
        if (!sid && user?.role === 'student') {
          const { student } = await studentsApi.me();
          sid = student.id;
        }
        if (!sid) { setLoading(false); return; }
        setStudentId(sid);
        const { portfolio: p } = await portfolioApi.get(sid);
        setPortfolio(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authStudent, user]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { portfolio: p } = await portfolioApi.generate(studentId);
      setPortfolio(p);
      toast({ title: 'Portfolio generated!', description: 'AI has created your portfolio content.' });
    } catch (err) {
      toast({ title: 'Generation failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setChatting(true);
    try {
      const { portfolio: p } = await portfolioApi.chat(studentId, chatMessage);
      setPortfolio(p);
      setChatMessage('');
      toast({ title: 'Portfolio updated' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setChatting(false);
    }
  };

  const handlePublishToggle = async (published: boolean) => {
    try {
      const { portfolio: p } = await portfolioApi.publish(studentId, published);
      setPortfolio(p);
      toast({ title: published ? 'Portfolio published' : 'Portfolio unpublished' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleThemeChange = async (theme: string) => {
    try {
      const { portfolio: p } = await portfolioApi.updateTheme(studentId, theme);
      setPortfolio(p);
      toast({ title: 'Theme updated' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/students/${studentId}/portfolio/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolio?.student?.fullName?.replace(/\s+/g, '-').toLowerCase() || 'student'}-portfolio.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: 'Export Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const content = portfolio?.content as PortfolioContent | null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-muted-foreground">AI-powered portfolio for parents and mentors</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {portfolio && (
              <Select value={portfolio.theme || 'minimalist'} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="blueprint">Blueprint</SelectItem>
                  <SelectItem value="terminal">Terminal</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating...' : content ? 'Regenerate' : 'Generate'}
            </Button>
            {content && (
              <Button variant="secondary" onClick={handleExport} className="gap-2 bg-white">
                <Download className="h-4 w-4" /> Export HTML
              </Button>
            )}
            {portfolio?.publicSlug && (
              <Link href={`/portfolio/${portfolio.publicSlug}`} target="_blank">
                <Button variant="outline" className="gap-2 bg-white">
                  <ExternalLink className="h-4 w-4" /> Preview
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isMentor && portfolio && (
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Publish to parents</p>
                <p className="text-sm text-muted-foreground">Control whether the public portfolio is visible</p>
              </div>
              <Switch checked={portfolio.published} onCheckedChange={handlePublishToggle} />
            </CardContent>
          </Card>
        )}

        {generating && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-pulse flex gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <p className="text-muted-foreground">AI is crafting your portfolio...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {content && !generating && (
          <div className={`space-y-6 p-6 rounded-2xl transition-all duration-500 ${
            portfolio?.theme === 'cyberpunk' ? 'bg-[#0b0f19] text-[#00ffcc] border border-[#ff00ff]/30 shadow-[0_0_15px_rgba(255,0,255,0.1)]' :
            portfolio?.theme === 'blueprint' ? 'bg-[#1e4b85] text-white border border-[#f2e3c6]/30 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]' :
            portfolio?.theme === 'terminal' ? 'bg-black text-[#33ff00] font-mono border border-[#33ff00]/20' :
            'bg-white border border-charcoal-100 shadow-soft'
          }`}>
            <Card className={portfolio?.theme === 'cyberpunk' ? 'bg-[#1a1b26] border-[#ff00ff]/20' : portfolio?.theme === 'blueprint' ? 'bg-white/10 border-white/20' : portfolio?.theme === 'terminal' ? 'bg-[#0a0a0a] border-[#33ff00]/30' : ''}>
              <CardHeader><CardTitle className={portfolio?.theme === 'cyberpunk' ? 'text-[#ff00ff]' : portfolio?.theme === 'blueprint' ? 'text-[#f2e3c6]' : portfolio?.theme === 'terminal' ? 'text-white' : ''}>About</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed">{content.about}</p></CardContent>
            </Card>

            <Card className={portfolio?.theme === 'cyberpunk' ? 'bg-[#1a1b26] border-[#ff00ff]/20' : portfolio?.theme === 'blueprint' ? 'bg-white/10 border-white/20' : portfolio?.theme === 'terminal' ? 'bg-[#0a0a0a] border-[#33ff00]/30' : ''}>
              <CardHeader><CardTitle className={portfolio?.theme === 'cyberpunk' ? 'text-[#ff00ff]' : portfolio?.theme === 'blueprint' ? 'text-[#f2e3c6]' : portfolio?.theme === 'terminal' ? 'text-white' : ''}>Project Highlights</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {content.projects.map((p, i) => (
                  <div key={i} className={`border-l-2 pl-4 ${portfolio?.theme === 'cyberpunk' ? 'border-[#00ffcc]' : portfolio?.theme === 'blueprint' ? 'border-[#f2e3c6]' : portfolio?.theme === 'terminal' ? 'border-white' : 'border-primary/30'}`}>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="mt-2 text-sm list-disc list-inside">
                        {p.highlights.map((h: string, j: number) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className={portfolio?.theme === 'cyberpunk' ? 'bg-[#1a1b26] border-[#ff00ff]/20' : portfolio?.theme === 'blueprint' ? 'bg-white/10 border-white/20' : portfolio?.theme === 'terminal' ? 'bg-[#0a0a0a] border-[#33ff00]/30' : ''}>
                <CardHeader><CardTitle className={portfolio?.theme === 'cyberpunk' ? 'text-[#ff00ff]' : portfolio?.theme === 'blueprint' ? 'text-[#f2e3c6]' : portfolio?.theme === 'terminal' ? 'text-white' : ''}>Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {content.skills.map((s) => (
                      <span key={s} className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        portfolio?.theme === 'cyberpunk' ? 'bg-[#ff00ff] text-[#0b0f19]' :
                        portfolio?.theme === 'blueprint' ? 'bg-[#f2e3c6] text-[#1e4b85]' :
                        portfolio?.theme === 'terminal' ? 'bg-white text-black' :
                        'bg-primary/10 text-primary'
                      }`}>{s}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className={portfolio?.theme === 'cyberpunk' ? 'bg-[#1a1b26] border-[#ff00ff]/20' : portfolio?.theme === 'blueprint' ? 'bg-white/10 border-white/20' : portfolio?.theme === 'terminal' ? 'bg-[#0a0a0a] border-[#33ff00]/30' : ''}>
                <CardHeader><CardTitle className={portfolio?.theme === 'cyberpunk' ? 'text-[#ff00ff]' : portfolio?.theme === 'blueprint' ? 'text-[#f2e3c6]' : portfolio?.theme === 'terminal' ? 'text-white' : ''}>Highlights</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {content.highlights.map((h, i) => <li key={i}>✦ {h}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!content && !generating && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Click &quot;Generate Portfolio&quot; to create your AI-powered portfolio from your projects and badges.
            </CardContent>
          </Card>
        )}

        {content && (
          <Card>
            <CardHeader><CardTitle>Refine with AI</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="e.g. Make the tone more enthusiastic, add emphasis on teamwork..."
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                />
                <Button onClick={handleChat} disabled={chatting}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
