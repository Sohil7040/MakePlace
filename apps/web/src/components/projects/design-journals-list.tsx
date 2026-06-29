'use client';

import { useState, useEffect } from 'react';
import { Plus, LayoutTemplate, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { journalsApi } from '@/lib/api';
import { DesignJournal } from './design-journal';

interface Journal {
  id: string;
  title: string;
  canvasData: any;
  updatedAt: string;
}

export function DesignJournalsList({ projectId, studentId }: { projectId?: string; studentId: string }) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);

  useEffect(() => {
    fetchJournals();
  }, [projectId, studentId]);

  const fetchJournals = async () => {
    try {
      const data = await journalsApi.listByStudent(studentId, projectId);
      setJournals(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const journal = await journalsApi.create(studentId, {
        projectId,
        title: 'Untitled Journal',
      });
      setJournals([journal, ...journals]);
      setActiveJournal(journal);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this journal?')) return;
    try {
      await journalsApi.delete(id);
      setJournals(journals.filter((j) => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (activeJournal && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-charcoal-100 bg-white">
          <div className="flex items-center gap-3 text-charcoal-900">
            <div className="w-8 h-8 rounded-lg bg-charcoal-900 flex items-center justify-center">
              <LayoutTemplate className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-semibold text-title-lg">Design Journal</span>
          </div>
          <button 
            className="p-2 text-charcoal-400 hover:text-charcoal-900 transition-colors hover:bg-charcoal-50 rounded-lg"
            onClick={() => { setActiveJournal(null); fetchJournals(); }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4 bg-charcoal-50">
          <DesignJournal 
            journalId={activeJournal.id} 
            initialTitle={activeJournal.title} 
            initialData={activeJournal.canvasData} 
          />
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-headline-lg text-charcoal-900">Design Journals</h3>
          <p className="font-sans text-body-md text-charcoal-400 mt-1">Brainstorm, sketch, and curate ideas visually.</p>
        </div>
        <button 
          onClick={handleCreate} 
          className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-sans text-label-md hover:shadow-lg transition-all accent-button-glow"
        >
          <Plus className="h-5 w-5" /> New Journal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* New Journal Button */}
        <button 
          onClick={handleCreate}
          className="aspect-[3/4] rounded-2xl border-2 border-dashed border-charcoal-200 flex flex-col items-center justify-center gap-4 hover:border-charcoal-400 hover:bg-charcoal-50/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-charcoal-50 flex items-center justify-center group-hover:bg-charcoal-900 group-hover:text-white transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-sans text-label-md text-charcoal-400">Create New Journal</span>
        </button>

        {/* Existing Journals */}
        {journals.map((journal, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            key={journal.id} 
            className="aspect-[3/4] bg-white border border-charcoal-100 rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-card-hover hover:border-charcoal-200 transition-all duration-300"
            onClick={() => setActiveJournal(journal)}
          >
            <div className="h-1/2 overflow-hidden bg-charcoal-50 flex items-center justify-center relative">
              <LayoutTemplate className="h-12 w-12 text-charcoal-200 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-sans text-label-md mb-1 text-charcoal-900 truncate pr-2 font-semibold">{journal.title}</h4>
                <p className="text-[12px] text-charcoal-300">
                  {new Date(journal.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-charcoal-100 pt-4">
                <span className="text-[11px] px-2.5 py-0.5 bg-charcoal-50 text-charcoal-500 rounded font-sans uppercase tracking-wider font-bold border border-charcoal-100">
                  Canvas
                </span>
                <button 
                  className="text-charcoal-300 hover:text-red-500 transition-colors p-1"
                  onClick={(e) => handleDelete(e, journal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
