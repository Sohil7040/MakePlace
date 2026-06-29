'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toaster';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-charcoal-50 font-sans selection:bg-accent selection:text-white">
      {/* Floating Split-Screen Card */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-card-elevated overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Left Panel - Brand Experience */}
        <div className="relative hidden md:flex md:w-1/2 bg-accent p-12 flex-col justify-between overflow-hidden">
          {/* Subtle Abstract Wave / Circle Pattern */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-black/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-accent font-heading font-bold text-xl">M</span>
              </div>
              <span className="font-heading text-xl font-bold text-white tracking-tight">MakePlace</span>
            </div>
            
            <h1 className="font-heading text-[3.5rem] text-white leading-[1.1] mb-6 tracking-tight font-bold">
              Simplify<br />learning with<br />our platform.
            </h1>
            <p className="font-sans text-lg text-white/90 max-w-md mt-4">
              Step into the premier robotics and engineering academy. Build, document, and showcase your best work effortlessly.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-auto">
             {/* Abstract Floating UI Elements Placeholder (simulating the 3D dashboard cards from Image 3) */}
             <div className="flex gap-4 opacity-90">
               <div className="w-32 h-24 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 transform rotate-[-5deg] shadow-lg flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full bg-white/30" />
               </div>
               <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transform rotate-[5deg] translate-y-4 shadow-lg p-4 flex flex-col gap-2">
                 <div className="w-full h-3 bg-white/30 rounded-full" />
                 <div className="w-2/3 h-3 bg-white/20 rounded-full" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-[380px] w-full mx-auto">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">M</span>
              </div>
              <span className="font-heading font-bold text-charcoal-900">MakePlace</span>
            </div>

            <div className="mb-8">
              <h2 className="font-heading text-4xl font-bold text-charcoal-900 mb-2">Welcome Back</h2>
              <p className="font-sans text-charcoal-400">Please login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-charcoal-50 hover:bg-charcoal-100/50 focus:bg-white border-2 border-transparent focus:border-accent font-sans text-charcoal-900 placeholder:text-charcoal-400 rounded-xl px-5 py-3.5 transition-all outline-none"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-charcoal-50 hover:bg-charcoal-100/50 focus:bg-white border-2 border-transparent focus:border-accent font-sans text-charcoal-900 placeholder:text-charcoal-400 rounded-xl px-5 py-3.5 pr-12 transition-all outline-none"
                  placeholder="Password"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-end pt-1 pb-4">
                <Link href="#" className="font-sans text-sm text-charcoal-400 hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent hover:bg-[#e63e00] text-white font-sans text-lg font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(255,69,0,0.39)]"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="my-8 flex items-center justify-center gap-4">
              <div className="h-px bg-charcoal-100 flex-1" />
              <span className="font-sans text-sm text-charcoal-300">Or Login with</span>
              <div className="h-px bg-charcoal-100 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 transition-colors font-sans text-sm font-semibold text-charcoal-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 transition-colors font-sans text-sm font-semibold text-charcoal-900">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.84 3.73-.78 1.57.06 2.84.72 3.66 1.93-3.18 1.91-2.64 6.2.53 7.46-.77 1.4-1.74 2.76-3 3.56zm-4.32-13.8c-.28-2.09 1.44-3.9 3.41-4.24.45 2.23-1.63 3.96-3.41 4.24z"/>
                </svg>
                Apple
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="font-sans text-sm text-charcoal-500">
                Don't have an account?{' '}
                <Link href="#" className="text-accent font-semibold hover:underline decoration-2 underline-offset-4">
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
