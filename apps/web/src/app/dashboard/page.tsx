'use client';

import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Users, FolderKanban, Award, FileText, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Wrench } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, badges: 0 });
  const [scrapParts, setScrapParts] = useState('');
  const [scrapIdeas, setScrapIdeas] = useState('');
  const [isGeneratingScrap, setIsGeneratingScrap] = useState(false);

  useEffect(() => {
    if (user?.role === 'student') {
      // Mock stats fetch or actual API calls
      setStats({ projects: 3, badges: 12 });
    }
  }, [user]);

  const handleScrapYard = async () => {
    if (!scrapParts.trim()) return;
    setIsGeneratingScrap(true);
    try {
      const res = await aiApi.scrapYard(scrapParts);
      setScrapIdeas(res.ideas);
    } catch (err) {
      console.error('Scrap-Yard Error:', err);
    } finally {
      setIsGeneratingScrap(false);
    }
  };

  if (!user) return null;

  if (user.role === 'admin' || user.role === 'mentor') {
    const adminCards = [
      { title: 'Students', desc: 'Manage student profiles', href: '/dashboard/students', icon: Users },
      { title: 'Projects', desc: 'View all student projects', href: '/dashboard/projects', icon: FolderKanban },
      { title: 'Badges', desc: 'Manage achievement badges', href: '/dashboard/badges', icon: Award },
    ];
    const mentorCards = [
      { title: 'Students', desc: 'View and mentor students', href: '/dashboard/students', icon: Users },
      { title: 'Projects', desc: 'Review student projects', href: '/dashboard/projects', icon: FolderKanban },
      { title: 'Reports', desc: 'Write weekly reports', href: '/dashboard/reports', icon: FileText },
    ];
    const cards = user.role === 'admin' ? adminCards : mentorCards;

    return (
      <DashboardLayout>
        <div className="mb-10">
          <h1 className="font-heading text-headline-lg text-charcoal-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="font-sans text-body-lg text-charcoal-400 mt-1">Here is your academy overview.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white border border-charcoal-100 p-8 rounded-xl h-full flex flex-col justify-between group cursor-pointer hover:shadow-card-hover hover:border-charcoal-200 transition-all duration-300">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-charcoal-50 mb-6 group-hover:bg-charcoal-900 group-hover:text-white transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-headline-md text-charcoal-900 mb-2">{item.title}</h3>
                    <p className="font-sans text-body-md text-charcoal-400">{item.desc}</p>
                  </div>
                  <div className="mt-8 flex items-center text-charcoal-400 font-sans text-label-md font-semibold group-hover:text-accent transition-colors">
                    Access <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardLayout>
    );
  }

  // Student Dashboard
  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="font-heading text-headline-lg text-charcoal-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="font-sans text-body-lg text-charcoal-400 mt-1">Here is your technical progress for the academy.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Summary Card (Span 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-charcoal-100 p-8 rounded-xl flex flex-col items-center text-center">
          <div className="relative w-36 h-36 mb-6">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-charcoal-50" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-charcoal-900 transition-all duration-1000 ease-out" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeDasharray="402" strokeDashoffset="100" strokeWidth="6" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-headline-lg text-charcoal-900 leading-none">75%</span>
              <span className="font-sans text-label-sm text-charcoal-400 uppercase tracking-widest mt-1">Ready</span>
            </div>
          </div>
          <h3 className="font-heading text-headline-md text-charcoal-900">{user.name}</h3>
          <p className="font-sans text-body-md text-charcoal-400 mb-4">Level 4 | Senior Technologist</p>
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            <span className="bg-charcoal-50 text-charcoal-600 px-3 py-1 rounded-full font-sans text-label-sm border border-charcoal-100">Robotics Studio</span>
            <span className="bg-charcoal-50 text-charcoal-600 px-3 py-1 rounded-full font-sans text-label-sm border border-charcoal-100">Class of &apos;26</span>
          </div>
          <Link href={`/portfolio/me`} className="w-full">
            <button className="w-full py-3 border border-charcoal-200 text-charcoal-900 font-sans text-label-md rounded-lg hover:bg-charcoal-50 transition-colors">
              View Public Portfolio
            </button>
          </Link>
        </div>

        {/* Metrics Column (Span 8) */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hours Logged */}
          <div className="bg-white border border-charcoal-100 p-8 rounded-xl flex flex-col justify-between h-48">
            <div>
              <Clock className="w-5 h-5 text-charcoal-400 mb-2" />
              <p className="font-sans text-label-md text-charcoal-400">Hours Logged</p>
            </div>
            <div>
              <h4 className="font-heading text-display-lg text-charcoal-900 leading-none">128</h4>
              <p className="font-sans text-label-sm text-accent font-semibold mt-1">+12h this week</p>
            </div>
          </div>
          
          {/* Projects Built */}
          <div className="bg-white border border-charcoal-100 p-8 rounded-xl flex flex-col justify-between h-48">
            <div>
              <FolderKanban className="w-5 h-5 text-charcoal-400 mb-2" />
              <p className="font-sans text-label-md text-charcoal-400">Projects Built</p>
            </div>
            <div>
              <h4 className="font-heading text-display-lg text-charcoal-900 leading-none">{stats.projects}</h4>
              <p className="font-sans text-label-sm text-accent font-semibold mt-1">Active development</p>
            </div>
          </div>
          
          {/* Badges Earned */}
          <div className="bg-white border border-charcoal-100 p-8 rounded-xl flex flex-col justify-between h-48">
            <div>
              <Award className="w-5 h-5 text-charcoal-400 mb-2" />
              <p className="font-sans text-label-md text-charcoal-400">Badges Earned</p>
            </div>
            <div>
              <h4 className="font-heading text-display-lg text-charcoal-900 leading-none">{stats.badges}</h4>
              <p className="font-sans text-label-sm text-accent font-semibold mt-1">Master status soon</p>
            </div>
          </div>

          {/* Featured Activity */}
          <div className="md:col-span-3 bg-charcoal-900 p-8 rounded-xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-heading text-headline-md text-white">Active Portfolio Generation</h3>
              <Link href="/dashboard/portfolio" className="font-sans text-label-md text-charcoal-300 flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                View Blueprint <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Subtle accent gradient */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/15 to-transparent pointer-events-none" />
            
            <div className="mt-12 flex items-center justify-between relative z-10">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-sans text-label-sm text-white border-2 border-charcoal-900">AI</div>
              </div>
              <p className="font-sans text-label-md text-charcoal-500 italic">Next Sync: Auto</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrap-Yard AI Widget */}
      <div className="mt-6">
        <Card className="bg-white border-charcoal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" /> Scrap-Yard Idea Generator
            </CardTitle>
            <p className="text-sm text-charcoal-400">Got some random parts lying around? Tell our AI what you have, and get 3 wacky project ideas!</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={scrapParts}
                onChange={(e) => setScrapParts(e.target.value)}
                placeholder="e.g., cardboard box, 2 servos, rubber bands, Arduino..."
                onKeyDown={(e) => e.key === 'Enter' && handleScrapYard()}
              />
              <Button onClick={handleScrapYard} disabled={isGeneratingScrap || !scrapParts.trim()} className="bg-accent hover:bg-accent-dark text-white">
                {isGeneratingScrap ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Brainstorm!'}
              </Button>
            </div>
            
            {scrapIdeas && (
              <div className="p-4 bg-charcoal-50 rounded-lg border border-charcoal-100">
                <div className="whitespace-pre-wrap font-sans text-charcoal-900 leading-relaxed text-sm">
                  {scrapIdeas}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
