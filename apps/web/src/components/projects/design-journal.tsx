'use client';

import { useState, useCallback, useRef } from 'react';
import { Tldraw, type Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { journalsApi } from '@/lib/api';
import { DesignJournalUI } from './journal-ui';
import { ThreeDShapeUtil } from './ThreeDShapeUtil';

const customShapeUtils = [ThreeDShapeUtil];

interface DesignJournalProps {
  journalId: string;
  projectId?: string;
  initialTitle: string;
  initialData?: any;
  isReadOnly?: boolean;
}

export function DesignJournal({ journalId, initialTitle, initialData, isReadOnly = false }: DesignJournalProps) {
  const [title, setTitle] = useState(initialTitle);
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = useCallback(async (editor: Editor) => {
    try {
      const snapshot = editor.store.getSnapshot();
      await journalsApi.update(journalId, {
        canvasData: snapshot,
      });
    } catch (error) {
      console.error('Failed to save journal', error);
    }
  }, [journalId]);

  const handleTitleSave = useCallback(async (newTitle: string) => {
    try {
      await journalsApi.update(journalId, { title: newTitle });
    } catch (error) {
      console.error('Failed to save title', error);
    }
  }, [journalId]);

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    if (isReadOnly) {
      editor.updateInstanceState({ isReadonly: true });
    }

    // Load initial data if available
    if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
      try {
        editor.store.loadSnapshot(initialData);
      } catch (error) {
        console.error('Failed to load tldraw snapshot, starting fresh', error);
      }
    } else {
      // Initialize default pages if empty (new journal)
      const pages = editor.getPages();
      if (pages.length > 0) {
        editor.renamePage(pages[0].id, "My Idea");
        editor.createPage({ name: "Research" });
        editor.createPage({ name: "Prototype" });
        editor.createPage({ name: "Challenges" });
        editor.createPage({ name: "What I Learned" });
        editor.setCurrentPage(pages[0].id);
      }
    }

    // Auto-save logic — debounced
    if (!isReadOnly) {
      editor.store.listen(() => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          handleSave(editor);
        }, 2000); // Save after 2s of inactivity
      }, { source: 'user', scope: 'document' });
    }
  }, [initialData, isReadOnly, handleSave]);

  return (
    <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden bg-white relative border border-charcoal-100">
      <div className="flex items-center justify-between px-5 py-3 border-b border-charcoal-100 bg-white">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleTitleSave(title)}
          className="bg-transparent border-none text-lg font-heading text-charcoal-900 focus:outline-none focus:ring-0 px-1 flex-1"
          placeholder="Journal Title"
          disabled={isReadOnly}
        />
        <div className="text-xs text-charcoal-400 ml-4 font-sans">
          {isReadOnly ? 'Read Only' : 'Auto-saving'}
        </div>
      </div>
      <div className="flex-1 relative">
        <Tldraw
          hideUi={true}
          onMount={handleMount}
          shapeUtils={customShapeUtils}
        >
          <DesignJournalUI />
        </Tldraw>
      </div>
    </div>
  );
}
