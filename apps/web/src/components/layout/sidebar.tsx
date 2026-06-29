'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Award,
  LogOut,
  Menu,
  X,
  Settings,
  BookOpen,
  HelpCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = {
  admin: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/students', label: 'Students', icon: Users },
    { href: '/dashboard/mentors', label: 'Mentors', icon: FileText },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { href: '/dashboard/gallery', label: 'Gallery', icon: Globe },
    { href: '/dashboard/badges', label: 'Badges', icon: Award },
    { href: '/dashboard/fees', label: 'Fees & Payments', icon: CreditCard },
  ],
  mentor: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/students', label: 'Students', icon: Users },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { href: '/dashboard/gallery', label: 'Gallery', icon: Globe },
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  ],
  student: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { href: '/dashboard/journals', label: 'Journals', icon: BookOpen },
    { href: '/dashboard/gallery', label: 'Gallery', icon: Globe },
    { href: '/dashboard/badges', label: 'Badges', icon: Award },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: FileText },
  ],
};

export function Sidebar({ isCollapsed, onToggleCollapse }: { isCollapsed: boolean, onToggleCollapse: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/80 backdrop-blur-sm border border-charcoal-100"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-charcoal-100 flex flex-col z-[60] transition-all duration-300 ease-in-out md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-[88px]' : 'w-[280px]'
        )}
      >
        <button 
          onClick={onToggleCollapse}
          className="absolute -right-3 top-8 bg-white border border-charcoal-100 rounded-full p-1.5 text-charcoal-400 hover:text-charcoal-900 shadow-sm hidden md:flex z-50 transition-transform hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={cn("mb-10 pt-8 transition-all overflow-hidden", isCollapsed ? "px-0 flex justify-center" : "px-6")}>
          {isCollapsed ? (
            <h1 className="font-heading text-title-lg font-bold text-charcoal-900">M<span className="text-accent">P</span></h1>
          ) : (
            <div className="whitespace-nowrap">
              <h1 className="font-heading text-headline-md font-bold text-charcoal-900">Make<span className="text-accent">Place</span></h1>
              <p className="font-sans text-label-sm text-charcoal-400 capitalize mt-1">{user.role} Dashboard</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center py-2.5 font-sans text-label-md transition-all duration-200 rounded-lg group',
                  isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4',
                  active
                    ? 'text-accent font-bold'
                    : 'text-charcoal-400 hover:text-charcoal-900'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-accent/10 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {!active && (
                  <div className="absolute inset-0 bg-charcoal-50/0 rounded-lg group-hover:bg-charcoal-50/60 transition-colors" />
                )}
                <Icon className={cn("relative z-10", isCollapsed ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]")} />
                {!isCollapsed && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-8 space-y-1 overflow-hidden">
          <Link 
            href="/dashboard/settings" 
            onClick={() => setMobileOpen(false)} 
            title={isCollapsed ? "Settings" : undefined}
            className={cn("flex items-center py-2.5 text-charcoal-400 hover:text-charcoal-900 transition-colors font-sans text-label-md rounded-lg", isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-2')}
          >
            <Settings className={isCollapsed ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]"} />
            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
          </Link>
          <button 
            className={cn("flex items-center w-full py-2.5 text-charcoal-400 hover:text-charcoal-900 transition-colors font-sans text-label-md rounded-lg", isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-2')} 
            title={isCollapsed ? "Sign Out" : undefined}
            onClick={logout}
          >
            <LogOut className={isCollapsed ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]"} />
            {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>

          {user.role === 'student' && (
            <Link href="/dashboard/projects" onClick={() => setMobileOpen(false)}>
              <button 
                title={isCollapsed ? "Launch Project" : undefined}
                className={cn("mt-6 w-full bg-accent text-white font-sans text-label-md rounded-xl accent-button-glow hover:brightness-110 transition-all flex items-center justify-center", isCollapsed ? 'py-3 px-0' : 'py-3 px-4')}
              >
                {isCollapsed ? <FolderKanban className="w-5 h-5" /> : <span className="whitespace-nowrap">Launch Project</span>}
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
