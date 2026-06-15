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
        {messages.map((m) => (
          <div
            key={m.id}
            className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5 ${
              m.variant === 'destructive' ? 'border-destructive bg-destructive text-white' : 'bg-card'
            }`}
          >
            <p className="font-semibold text-sm">{m.title}</p>
            {m.description && <p className="text-sm opacity-80 mt-1">{m.description}</p>}
          </div>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
