'use client';

import * as React from 'react';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

type ToastMessage = { title: string; description?: string; variant?: 'default' | 'destructive' };

const ToastContext = React.createContext<{
  toast: (message: ToastMessage) => void;
}>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<(ToastMessage & { id: number })[]>([]);

  const toast = React.useCallback((message: ToastMessage) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { ...message, id }]);
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastProvider>
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`rounded-xl border p-4 shadow-medium animate-in slide-in-from-bottom-3 duration-300 backdrop-blur-sm ${
                m.variant === 'destructive' 
                  ? 'border-red-200 bg-red-50 text-red-900' 
                  : 'bg-white border-charcoal-100 text-charcoal-900'
              }`}
            >
              <p className="font-semibold text-sm font-sans">{m.title}</p>
              {m.description && <p className="text-sm opacity-70 mt-1 font-sans">{m.description}</p>}
            </div>
          ))}
        </div>
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
