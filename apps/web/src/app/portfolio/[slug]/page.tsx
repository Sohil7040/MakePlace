'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { portfolioApi, type Portfolio, type PortfolioContent } from '@/lib/api';
import { portfolioMessages, type Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Rocket } from 'lucide-react';

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
      <div className="portfolio-theme portfolio-shell">
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="portfolio-theme portfolio-shell flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Portfolio not found</h1>
          <p className="text-muted-foreground mt-2">This portfolio may not be published yet.</p>
        </div>
      </div>
    );
  }

  const student = portfolio.student!;
  const content = portfolio.content as PortfolioContent | null;

  return (
    <div className="portfolio-theme portfolio-shell text-foreground">
      <header className="border-b border-cream-offset bg-cream/90 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm text-muted-foreground">{t.poweredBy}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocale(locale === 'en' ? 'gu' : 'en')} className="gap-2">
            <Globe className="h-4 w-4" />
            {t.language}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          {student.photo ? (
            <img src={student.photo} alt={student.fullName} className="h-32 w-32 rounded-full object-cover mx-auto border-4 border-primary/20 shadow-lg" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-4xl font-bold text-primary">
              {student.fullName.charAt(0)}
            </div>
          )}
          <h1 className="text-4xl font-heading font-bold mt-6">{student.fullName}</h1>
          <p className="text-muted-foreground mt-1">{student.program?.name} · Age {student.age}</p>
        </div>

        {content ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4 text-primary">{t.about}</h2>
              <p className="text-lg leading-relaxed text-foreground/80 font-body">{content.about}</p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-6 text-primary">{t.projects}</h2>
              <div className="grid gap-6">
                {content.projects.map((project, i) => {
                  const studentProject = student.projects?.find((p) => p.title === project.title);
                  const thumb = studentProject?.media?.find((m) => m.type === 'image');
                  return (
                    <div key={i} className="portfolio-panel p-6">
                      {thumb && (
                        <img src={thumb.url} alt={project.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                      )}
                      <h3 className="text-xl font-heading font-semibold">{project.title}</h3>
                      <p className="text-muted-foreground mt-2">{project.description}</p>
                      {project.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm">
                          {project.highlights.map((h, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-primary">✦</span> {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4 text-primary">{t.skills}</h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill) => (
                  <span key={skill} className="bg-vermillion/10 text-primary px-4 py-2 rounded-full text-sm font-medium font-body">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4 text-primary">{t.highlights}</h2>
              <ul className="space-y-2">
                {content.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/80">
                    <span className="text-primary font-bold">★</span> {h}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t.noContent}</p>
        )}

        {student.badgeAwards && student.badgeAwards.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-heading font-bold mb-6 text-primary">{t.badges}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {student.badgeAwards.map((award) => (
                <div key={award.id} className="text-center p-4 portfolio-panel min-w-[120px]">
                  <span className="text-3xl">{award.badge?.icon}</span>
                  <p className="font-medium text-sm mt-2">{award.badge?.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 text-center border-t pt-8">
          <p className="text-sm text-muted-foreground mb-4">Scan to share this portfolio</p>
          <div className="inline-block p-4 portfolio-panel">
            <QRCodeSVG value={portfolioUrl} size={160} />
          </div>
          <p className="text-xs text-muted-foreground mt-3 break-all">{portfolioUrl}</p>
        </div>
      </main>
    </div>
  );
}
