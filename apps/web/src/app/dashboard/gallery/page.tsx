'use client';

import { useState, useEffect } from 'react';
import { projectsApi, Project } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/auth-context';

type ExploredProject = Project & { _count: { sparks: number } };

export default function GalleryPage() {
  const [projects, setProjects] = useState<ExploredProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    projectsApi.explore()
      .then((res) => {
        setProjects(res.projects);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSpark = async (projectId: string) => {
    try {
      const { sparked } = await projectsApi.spark(projectId);
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            _count: { sparks: p._count.sparks + (sparked ? 1 : -1) }
          };
        }
        return p;
      }));
    } catch (err: any) {
      console.error('Failed to spark project', err);
      toast({
        title: 'Cannot add Spark',
        description: err.message || 'Only students can give sparks to projects!',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex gap-3">
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 rounded-full bg-charcoal-900" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-charcoal-900" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-charcoal-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-20 bg-white min-h-screen relative selection:bg-accent/20">
      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="absolute top-8 left-4 md:top-12 md:left-8 z-50"
      >
        <Link 
          href="/dashboard"
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white border border-charcoal-100 rounded-full font-sans text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 hover:border-charcoal-200 hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>
      </motion.div>

      <header className="text-center max-w-3xl mx-auto space-y-6 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-charcoal-50 to-white border border-charcoal-100 shadow-sm rounded-[2rem] mb-8">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-charcoal-900 leading-[1.1]">
            Hall of Fame
          </h1>
          <p className="text-lg md:text-2xl text-charcoal-400 mt-8 font-sans font-light leading-relaxed">
            A curated exhibition of the most brilliant and innovative projects crafted by the MakePlace community.
          </p>
        </motion.div>
      </header>

      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
          <p className="text-charcoal-400 font-sans text-xl">The gallery is waiting for its first masterpiece.</p>
        </motion.div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-10 space-y-10">
          <AnimatePresence>
            {projects.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="break-inside-avoid"
              >
                <ProjectCard project={project} onSpark={() => handleSpark(project.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onSpark }: { project: ExploredProject, onSpark: () => void }) {
  const thumbnail = project.media?.find(m => m.type === 'image')?.url;
  const isSparked = project._count.sparks > 0;

  return (
    <div className="group relative flex flex-col gap-5">
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-charcoal-50">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={project.title} 
            className="w-full h-auto object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-charcoal-200">
            <span className="font-heading opacity-20 text-8xl">{project.title.substring(0, 1)}</span>
          </div>
        )}

        {/* Floating Glass Spark Button */}
        <div className="absolute top-5 right-5 z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onSpark();
            }}
            className="flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-xl border border-white/50 text-charcoal-900 rounded-full font-sans text-sm font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow"
          >
            <Heart 
              size={18} 
              className={`transition-colors duration-300 ${isSparked ? "fill-accent text-accent" : "text-charcoal-300"}`} 
            />
            <span className={isSparked ? "text-accent" : "text-charcoal-500"}>{project._count.sparks}</span>
          </motion.button>
        </div>
      </div>
      
      <div className="px-2 space-y-3">
        <h3 className="font-heading font-extrabold text-2xl text-charcoal-900 leading-tight group-hover:text-accent transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-base text-charcoal-400 font-sans">
          by <span className="font-semibold text-charcoal-800">{project.student?.fullName || 'Anonymous Maker'}</span>
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[11px] uppercase tracking-wider px-3.5 py-1.5 bg-charcoal-50 text-charcoal-500 rounded-full font-sans font-bold">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
