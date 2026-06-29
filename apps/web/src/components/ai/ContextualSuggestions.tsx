'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ContextualSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function ContextualSuggestions({ suggestions, onSelect }: ContextualSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(suggestion)}
          className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container hover:bg-primary/5 border border-outline-variant/30 hover:border-primary/50 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-sans text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
            {suggestion}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
