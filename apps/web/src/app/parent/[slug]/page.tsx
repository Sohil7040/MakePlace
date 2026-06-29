'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { portfolioApi, type Portfolio, type PortfolioContent } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Sparkles, TrendingUp, CheckCircle2, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ParentExperiencePage() {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfolioApi
      .getPublic(slug)
      .then(({ portfolio: p }) => setPortfolio(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-6 flex flex-col gap-6 items-center justify-center">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-full max-w-lg h-64 rounded-[32px]" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-on-surface-variant">
        Portfolio not available.
      </div>
    );
  }

  const student = portfolio.student!;
  const content = portfolio.content as PortfolioContent | null;
  const firstName = student.fullName.split(' ')[0];

  return (
    <div className="min-h-screen bg-surface-container-lowest font-sans selection:bg-primary/20 pb-24">
      {/* Gentle Header */}
      <nav className="h-20 flex items-center justify-center border-b border-outline-variant/30 bg-white">
        <div className="flex items-center gap-2 text-primary">
          <Heart className="w-5 h-5 fill-primary/20" />
          <span className="font-heading font-bold text-label-lg tracking-wide">MakePlace Family Portal</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-12 space-y-12">
        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 overflow-hidden border-[6px] border-white shadow-xl">
            {student.photo ? (
              <img src={student.photo} alt={firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-heading text-primary">{firstName.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-3xl font-heading text-on-surface mb-3">
            {firstName} is doing <span className="text-primary italic">amazing</span> things.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed">
            Here's a glimpse into what your child has been learning, building, and discovering this month.
          </p>
        </motion.section>

        {/* Growth Summary */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 border border-outline-variant/30 shadow-sm"
        >
          <h2 className="flex items-center gap-2 font-heading text-xl mb-6 text-on-surface">
            <TrendingUp className="w-6 h-6 text-primary" /> What {firstName} is learning
          </h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {content?.skills.slice(0, 5).map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-surface-container rounded-full text-sm font-medium text-on-surface-variant">
                {skill}
              </span>
            ))}
          </div>
          
          <div className="bg-primary/5 p-6 rounded-2xl">
            <p className="text-on-surface-variant italic leading-relaxed">
              "{content?.about || `${firstName} has shown great enthusiasm in learning new engineering skills and applying them creatively.`}"
            </p>
            {student.mentor && (
              <p className="mt-4 text-sm font-bold text-primary">— {student.mentor.name}, Lead Mentor</p>
            )}
          </div>
        </motion.section>

        {/* Recent Project */}
        {content?.projects && content.projects.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-[32px] p-8 border border-outline-variant/30 shadow-sm"
          >
            <h2 className="flex items-center gap-2 font-heading text-xl mb-6 text-on-surface">
              <Sparkles className="w-6 h-6 text-primary" /> Latest Creation
            </h2>
            <div className="aspect-video bg-surface-container rounded-2xl overflow-hidden mb-6 relative">
               {content.projects[0].mediaUrls?.[0] && (
                 <img src={content.projects[0].mediaUrls[0]} alt="Project preview" className="w-full h-full object-cover" />
               )}
            </div>
            <h3 className="font-bold text-lg mb-2">{content.projects[0].title}</h3>
            <p className="text-on-surface-variant leading-relaxed mb-6">{content.projects[0].description}</p>
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Completed successfully
            </div>
          </motion.section>
        )}

        {/* Celebrations */}
        {student.badgeAwards && student.badgeAwards.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center bg-gradient-to-br from-primary/10 to-transparent rounded-[32px] p-8 border border-primary/20"
          >
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-xl mb-2 text-on-surface">Moments of Pride</h2>
            <p className="text-on-surface-variant mb-6">
              {firstName} earned {student.badgeAwards.length} new achievement{student.badgeAwards.length > 1 ? 's' : ''}!
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {student.badgeAwards.slice(0, 3).map((award, i) => (
                <div key={i} className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium flex items-center gap-2">
                  <span>{award.badge?.icon || '⭐'}</span>
                  {award.badge?.name}
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </main>
    </div>
  );
}
