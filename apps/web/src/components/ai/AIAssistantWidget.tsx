'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Minimize2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I\'m your MakePlace AI assistant. How can I help you with your projects today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Contextual suggestions based on route
  const getSuggestions = () => {
    if (pathname.includes('/projects/')) {
      return ["Help me describe my project", "Suggest next steps for testing"];
    }
    if (pathname.includes('/portfolio')) {
      return ["Help me write my About section", "How should I structure my skills?"];
    }
    if (pathname.includes('/journals')) {
      return ["What should I document?", "Help me reflect on my progress"];
    }
    return ["What should I build next?", "Help me reflect on my learning"];
  };

  const getContext = () => {
    if (pathname.includes('/projects/')) return 'User is viewing a project workspace';
    if (pathname.includes('/portfolio')) return 'User is working on their portfolio';
    if (pathname.includes('/journals')) return 'User is in the design journals section';
    if (pathname.includes('/dashboard')) return 'User is on the main dashboard';
    return 'User is browsing the platform';
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);
    
    const userMessage: Message = { role: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: getContext(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Sorry, I couldn\'t process that right now. Please try again in a moment.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="mb-4 w-[380px] h-[520px] max-h-[80vh] bg-white border border-charcoal-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-charcoal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-heading font-semibold text-sm block leading-tight">MakePlace AI</span>
                  <span className="text-[11px] text-charcoal-400 font-sans">Powered by Gemini</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-charcoal-50/50">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] px-4 py-2.5 font-sans text-[13px] leading-relaxed
                    ${m.role === 'user' 
                      ? 'bg-charcoal-900 text-white rounded-2xl rounded-br-md' 
                      : 'bg-white text-charcoal-700 rounded-2xl rounded-bl-md border border-charcoal-100 shadow-sm'
                    }
                  `}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-charcoal-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-charcoal-300 rounded-full animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-charcoal-300 rounded-full animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                      <div className="w-2 h-2 bg-charcoal-300 rounded-full animate-pulse-dot" style={{ animationDelay: '600ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Contextual Suggestions */}
              {messages.length === 1 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="flex flex-col gap-2 mt-4"
                >
                  <p className="text-charcoal-400 text-[11px] px-1 font-sans font-semibold uppercase tracking-wider">Suggested</p>
                  {getSuggestions().map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(s)}
                      className="text-left px-3.5 py-2.5 rounded-xl border border-charcoal-100 bg-white hover:bg-charcoal-50 hover:border-charcoal-200 transition-all font-sans text-[13px] text-charcoal-600 flex items-center gap-2 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-charcoal-100">
              <div className="relative flex items-center">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask for help, ideas, or feedback..."
                  disabled={isLoading}
                  className="w-full bg-charcoal-50 rounded-xl pl-4 pr-12 py-3 font-sans text-[13px] focus:outline-none focus:ring-1 focus:ring-charcoal-300 transition-all border border-charcoal-100 text-charcoal-900 placeholder:text-charcoal-300 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-charcoal-900 text-white rounded-lg hover:bg-charcoal-800 transition-all disabled:opacity-30 disabled:hover:bg-charcoal-900"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={`
          relative flex items-center justify-center p-3.5 rounded-2xl shadow-medium transition-all
          ${isOpen && !isMinimized 
            ? 'bg-charcoal-50 text-charcoal-900 border border-charcoal-100' 
            : 'bg-charcoal-900 text-white hover:shadow-lg'
          }
        `}
      >
        <Sparkles className={`w-5 h-5 ${isOpen && !isMinimized ? 'text-charcoal-900' : ''}`} />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
