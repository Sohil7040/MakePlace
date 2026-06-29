'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { portfolioApi, type Portfolio, type PortfolioContent } from '@/lib/api';
import { portfolioMessages, type Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Terminal, Frame, ArrowUpRight, Award, Zap, Brain, Hexagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');

  const t = portfolioMessages[locale];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const portfolioUrl = `${appUrl}/portfolio/${slug}`;

  useEffect(() => {
    portfolioApi
      .getPublic(slug)
      .then(({ portfolio: p }) => setPortfolio(p))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="container mx-auto px-4 py-32 max-w-7xl space-y-6">
          <Skeleton className="h-64 w-full rounded-[48px]" />
          <Skeleton className="h-96 w-full rounded-[48px]" />
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-on-surface">Portfolio not found</h1>
          <p className="text-on-surface-variant mt-2 font-sans">This portfolio may not be published yet.</p>
          <Link href="/">
            <Button className="mt-4">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const student = portfolio.student!;
  const content = portfolio.content as PortfolioContent | null;
  const nameParts = student.fullName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface selection:bg-primary/20 scroll-smooth">
      {/* Landing Navigation Shell */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-surface/70 backdrop-blur-xl h-20 flex items-center px-6 md:px-10 border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 10.9V14h3.1l3.31-6.58c.22-.44.04-1-.41-1.21-.45-.22-1.01-.04-1.22.41L14 7.6l2.59-1.02zm-7.18 8.84L6.82 14 10 7.6v3.1l-3.1 6.58c-.22.44-.04 1 .41 1.21.45.22 1.01.04 1.22-.41l.88-1.74-2-1.92z"/>
              </svg>
            </div>
            <span className="font-heading text-headline-md font-bold text-primary tracking-tighter">MakePlace</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <a href="#projects" className="font-sans text-label-md text-on-surface-variant hover:text-primary transition-colors">{t.projects}</a>
            <a href="#timeline" className="font-sans text-label-md text-on-surface-variant hover:text-primary transition-colors">{t.highlights}</a>
            <a href="#badges" className="font-sans text-label-md text-on-surface-variant hover:text-primary transition-colors">{t.badges}</a>
            <Button variant="outline" size="sm" onClick={() => setLocale(locale === 'en' ? 'gu' : 'en')} className="gap-2 bg-transparent border-outline-variant hover:bg-surface-container">
              <Globe className="h-4 w-4" />
              {t.language}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Hero Section */}
        <section className="grid grid-cols-12 gap-6 mb-24 items-center">
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full w-fit mb-6">
              <Award className="w-4 h-4" />
              <span className="font-sans text-label-sm uppercase tracking-widest">MakePlace Academy Portfolio</span>
            </div>
            <h1 className="font-heading text-display-lg text-on-surface mb-6 leading-none">
              {firstName} <span className="text-primary">{lastName}</span>
            </h1>
            <p className="font-heading text-headline-md text-on-surface-variant mb-8 max-w-2xl font-light">
              {content?.about || 'Student Engineer specializing in advanced systems and innovative technology solutions.'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {content?.skills.slice(0, 3).map((skill, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 bento-card rounded-2xl bg-white border border-outline-variant/30">
                  {i === 0 ? <Terminal className="text-primary w-8 h-8" /> : i === 1 ? <Frame className="text-primary w-8 h-8" /> : <Hexagon className="text-primary w-8 h-8" />}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Skill Area</p>
                    <p className="font-sans text-label-md">{skill}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 relative mt-12 lg:mt-0">
            <div className="aspect-square w-full rounded-[48px] overflow-hidden bento-card border-4 border-white bg-surface-container shadow-xl">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-[120px] font-heading font-bold text-primary">
                  {firstName.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -left-6 bento-card p-6 rounded-3xl flex flex-col items-center gap-1 max-w-[140px] text-center bg-white shadow-lg border border-outline-variant/30">
              <span className="font-heading text-headline-lg text-primary">{content?.projects.length || 0}+</span>
              <span className="font-sans text-label-sm text-outline uppercase">Projects Built</span>
            </div>
          </div>
        </section>

        {/* Project Showcase */}
        {content?.projects && content.projects.length > 0 && (
          <section id="projects" className="mb-32 pt-20">
            <div className="mb-12">
              <h2 className="font-heading text-headline-lg mb-2">Technical Showcase</h2>
              <p className="text-on-surface-variant font-sans text-body-lg">Core research and development projects.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.projects.map((project, i) => {
                const studentProject = student.projects?.find((p) => p.title === project.title);
                const thumb = studentProject?.media?.find((m) => m.type === 'image');
                
                return (
                  <div key={i} className="bento-card rounded-[40px] overflow-hidden group bg-white border border-outline-variant/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="h-[300px] w-full relative overflow-hidden bg-surface-container flex items-center justify-center">
                      {thumb ? (
                        <img src={thumb.url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <Terminal className="w-24 h-24 text-primary/20" />
                      )}
                    </div>
                    
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-heading text-headline-md mb-2">{project.title}</h3>
                        </div>
                        <ArrowUpRight className="text-primary w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      
                      <p className="text-on-surface-variant mb-6 font-sans text-body-md line-clamp-3">
                        {project.description}
                      </p>
                      
                      {project.story && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-outline-variant/30 pt-6">
                          {Object.entries(project.story).map(([key, value]) => value && (
                            <div key={key}>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{key}</p>
                              <p className="font-sans text-body-sm text-on-surface-variant leading-relaxed">{value as string}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!project.story && project.highlights && project.highlights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-6">
                          {project.highlights.slice(0, 2).map((highlight, j) => (
                            <div key={j}>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Highlight</p>
                              <p className="font-sans text-label-md">{highlight}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Timeline / Highlights */}
        {content?.highlights && content.highlights.length > 0 && (
          <section id="timeline" className="mb-32 pt-20">
            <h2 className="font-heading text-headline-lg mb-16 text-center">Path to Excellence</h2>
            <div className="relative max-w-4xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-primary to-transparent"></div>
              
              {content.highlights.map((highlight, i) => (
                <div key={i} className={`flex items-center justify-between mb-16 w-full group ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-5/12 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <h4 className="font-heading text-headline-md mt-2">Milestone {i + 1}</h4>
                    <p className="text-on-surface-variant mt-2 font-sans text-body-md">{highlight}</p>
                  </div>
                  
                  <div className="w-8 h-8 bg-white border-4 border-primary rounded-full z-10 shadow-lg shadow-primary/20"></div>
                  
                  <div className="w-5/12 overflow-hidden rounded-2xl bento-card aspect-video bg-surface-container border border-outline-variant/30 flex items-center justify-center p-6 text-center">
                    <span className="font-heading text-headline-md text-primary/30">MakePlace</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Badges Section */}
        {student.badgeAwards && student.badgeAwards.length > 0 && (
          <section id="badges" className="mb-32 pt-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-heading text-headline-lg mb-4">Certified Achievements</h2>
              <p className="text-on-surface-variant font-sans text-body-lg">Validated skills and honors from the academy.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {student.badgeAwards.map((award, i) => (
                <div key={award.id} className="bento-card p-8 flex flex-col items-center text-center rounded-[32px] bg-white border border-outline-variant/30 hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-24 h-24 mb-6 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-white text-4xl">{award.badge?.icon || <Award />}</span>
                    </div>
                  </div>
                  <h5 className="font-sans text-label-md mb-1">{award.badge?.name}</h5>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Certified</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentor Feedback */}
        {student.reports && student.reports.length > 0 && (
          <section className="mb-32 pt-20">
            <h2 className="font-heading text-headline-lg mb-12 text-center">Mentor Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {student.reports.slice(0, 4).map((report, i) => (
                <div key={i} className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 relative">
                  <div className="absolute top-6 right-6 text-primary/20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="font-sans text-body-lg text-on-surface-variant italic mb-6 relative z-10 leading-relaxed">
                    "{report.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {report.mentor?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <p className="font-bold font-sans text-label-md">{report.mentor?.name || 'Mentor'}</p>
                      <p className="text-xs text-on-surface-variant">MakePlace Academy</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Design Journals */}
        {student.projects?.some(p => p.journals && p.journals.length > 0) && (
          <section className="mb-32 pt-20">
            <h2 className="font-heading text-headline-lg mb-12 text-center">Design Journals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {student.projects.flatMap(p => p.journals || []).slice(0, 8).map((journal, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl border border-outline-variant/30 overflow-hidden group relative bg-surface-container-lowest">
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                    <Frame className="w-12 h-12 text-primary opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-sans text-label-md truncate">{journal.title}</p>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider mt-1">Canvas</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QR Code Contact Section */}
        <section className="bg-primary rounded-[60px] p-12 md:p-16 relative overflow-hidden text-white mb-24">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="font-heading text-headline-lg mb-6 leading-tight">Ready to collaborate?</h2>
              <p className="font-sans text-body-lg mb-8 opacity-90">Scan the QR code to share this portfolio or contact me for specialized consulting and engineering projects.</p>
              <Link href="/">
                <button className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all">
                  Return to Academy
                </button>
              </Link>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-2xl shrink-0">
              <QRCodeSVG value={portfolioUrl} size={180} fgColor="#ad2c00" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant/30 pt-16 pb-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 10.9V14h3.1l3.31-6.58c.22-.44.04-1-.41-1.21-.45-.22-1.01-.04-1.22.41L14 7.6l2.59-1.02zm-7.18 8.84L6.82 14 10 7.6v3.1l-3.1 6.58c-.22.44-.04 1 .41 1.21.45.22 1.01.04 1.22-.41l.88-1.74-2-1.92z"/>
              </svg>
            </div>
            <span className="font-heading text-headline-md font-bold text-primary tracking-tighter">MakePlace</span>
          </div>
          <p className="font-sans text-label-sm text-outline text-center md:text-left">
            © 2026 MakePlace Robotics Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
