'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Search, PenTool, Hammer, CheckCircle2, Flag } from 'lucide-react';
import { projectsApi, type Project } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';

const PHASES = [
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'design', label: 'Design', icon: PenTool },
  { id: 'build', label: 'Build', icon: Hammer },
  { id: 'testing', label: 'Testing', icon: CheckCircle2 },
  { id: 'completed', label: 'Completed', icon: Flag },
] as const;

export type ProjectPhase = typeof PHASES[number]['id'];

interface ProjectJourneyProps {
  project: Project;
  onUpdate: (project: Project) => void;
  canEdit: boolean;
}

export function ProjectJourney({ project, onUpdate, canEdit }: ProjectJourneyProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const currentPhaseId = project.phase || 'idea';
  const currentIndex = PHASES.findIndex(p => p.id === currentPhaseId);

  const handlePhaseChange = async (phaseId: ProjectPhase) => {
    if (!canEdit || updating || phaseId === currentPhaseId) return;
    setUpdating(true);
    try {
      const { project: updated } = await projectsApi.update(project.id, { phase: phaseId });
      onUpdate(updated);
      toast({ title: 'Phase updated' });
    } catch (err) {
      toast({ title: 'Failed to update phase', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-charcoal-100 overflow-hidden relative mb-8">
      <h3 className="font-heading text-title-lg text-charcoal-900 mb-8">Project Journey</h3>
      
      <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto z-10 px-4">
        {/* Progress Line Background */}
        <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-charcoal-100 -translate-y-1/2 rounded-full -z-10" />
        {/* Progress Line Fill */}
        <motion.div 
          className="absolute top-1/2 left-[5%] h-1 bg-charcoal-900 -translate-y-1/2 rounded-full -z-10 origin-left"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (PHASES.length - 1)) * 90}%` }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
        />

        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isPast = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={phase.id} className="flex flex-col items-center gap-3 relative group">
              <button
                disabled={!canEdit || updating}
                onClick={() => handlePhaseChange(phase.id)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative
                  ${isCurrent ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-110' : ''}
                  ${isPast ? 'bg-charcoal-900 text-white' : ''}
                  ${isFuture ? 'bg-charcoal-50 text-charcoal-300 border border-charcoal-200 group-hover:border-charcoal-400' : ''}
                  ${!canEdit ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <Icon className={`w-5 h-5 ${isCurrent ? '' : ''}`} />
              </button>
              
              <span className={`
                font-sans text-label-sm absolute -bottom-7 whitespace-nowrap transition-colors duration-300
                ${isCurrent ? 'text-accent font-bold' : 'text-charcoal-400 group-hover:text-charcoal-600'}
              `}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-10" /> {/* Bottom padding for absolute labels */}
    </div>
  );
}
