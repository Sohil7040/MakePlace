'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { AIAssistantWidget } from '@/components/ai/AIAssistantWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-charcoal-100 mb-4"></div>
          <div className="h-4 w-32 bg-charcoal-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-charcoal-900 relative bg-white">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      {/* TopNavBar */}
      <header className={cn(
        "fixed top-0 right-0 h-16 z-40 bg-white flex justify-between items-center px-6 md:px-10 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-full md:w-[calc(100%-88px)]" : "w-full md:w-[calc(100%-280px)]"
      )}>
        <div className="flex items-center gap-4 flex-1">
          <h2 className="font-heading text-headline-md font-bold text-charcoal-900 md:hidden ml-10">Make<span className="text-accent">Place</span></h2>
          <div className={`relative w-full max-w-md hidden sm:block transition-all duration-500 ${searchFocused ? 'max-w-xl' : 'max-w-md'}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input 
              type="text" 
              className="w-full bg-charcoal-50 border border-charcoal-100 focus:bg-white focus:border-charcoal-300 rounded-lg pl-10 py-2 font-sans text-body-sm transition-all outline-none" 
              placeholder="Search workspaces, documents, or labs..." 
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-charcoal-400 hover:text-charcoal-900 transition-colors p-2 rounded-lg hover:bg-charcoal-50">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <Link href="/dashboard/settings" className="text-charcoal-400 hover:text-charcoal-900 transition-colors p-2 rounded-lg hover:bg-charcoal-50">
            <Settings className="w-[18px] h-[18px]" />
          </Link>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-charcoal-100">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-charcoal-100" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-charcoal-900 flex items-center justify-center text-white">
                <span className="font-heading font-bold text-xs">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className={cn(
          "mt-16 transition-all duration-300 ease-in-out relative flex flex-col",
          isSidebarCollapsed ? "md:ml-[88px]" : "md:ml-[280px]"
        )}
      >
        <div className="flex-1 p-2 md:p-4 pt-0 md:pt-0">
          <div className="min-h-[calc(100vh-4rem-16px)] bg-background rounded-3xl border border-charcoal-100 shadow-sm p-6 md:p-10 relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto relative z-10"
            >
              {children}
            </motion.div>
            <AIAssistantWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
