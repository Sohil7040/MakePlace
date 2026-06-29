'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.reveal-card');
      cards.forEach(card => {
        card.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(card);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="text-charcoal-900 antialiased overflow-x-hidden bg-white min-h-screen" ref={containerRef}>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-panel border-b border-charcoal-100/60 px-6 md:px-container-margin flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-heading text-headline-md font-bold text-charcoal-900">Make<span className="text-accent">Place</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-sans text-label-md text-charcoal-900 font-bold" href="#">Overview</Link>
          <Link className="font-sans text-label-md text-charcoal-400 hover:text-charcoal-900 transition-colors" href="/login">Platform</Link>
          <Link className="font-sans text-label-md text-charcoal-400 hover:text-charcoal-900 transition-colors" href="#">Curriculum</Link>
          <Link className="font-sans text-label-md text-charcoal-400 hover:text-charcoal-900 transition-colors" href="#">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="bg-charcoal-900 text-white px-6 py-2 rounded-lg font-sans text-label-md glow-button transition-all active:scale-95">
            Log In
          </Link>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 md:px-container-margin overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-50/50 via-white to-white pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-charcoal-50 text-charcoal-500 font-sans text-label-md border border-charcoal-100">
              Elite Robotics STEM Workspace
            </span>
            <h1 className="font-heading text-display-lg text-charcoal-900 tracking-tighter">
              Engineering the Future,<br/>
              <span className="text-accent">One Project at a Time.</span>
            </h1>
            <p className="font-sans text-body-lg text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              An elite workspace for robotics students to build, brainstorm, and automatically generate stunning digital portfolios. Calibrated for high-precision innovation.
            </p>
            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-accent text-white px-10 py-4 rounded-xl font-heading text-headline-md font-bold accent-button-glow transition-all hover:scale-105 active:scale-95">
                Launch Your Workspace
              </Link>
              <button className="bg-white border border-charcoal-200 px-10 py-4 rounded-xl font-heading text-headline-md font-bold text-charcoal-900 hover:bg-charcoal-50 transition-all">
                View Sample Portfolios
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 w-full max-w-6xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-charcoal-200/30 to-charcoal-100/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
            <div className="relative bg-white border border-charcoal-100 rounded-2xl shadow-card-elevated overflow-hidden aspect-video">
              <img 
                className="w-full h-full object-cover" 
                alt="Dashboard Preview" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0m0yWxLEYlcbDHDHtK0bVOQsezYGy1pZwYqLpSnmb-862O_hHjyImvuvZISKm5ZDry1NYj1X9LZqH1QQBvIfDAXP6DemtNNaz6q4b1-bMQzLEg-8352Lxnfs1S2dWCqB_BSPkOoS7_-yczO04sFGIWzzk58XKRbK6zUyGq5AdPhdqKYYEblLAIMy-dRsWXZy0zeYAaOlQD4K7BQG7sHnoFlYqy4-TYxaLSD2DFowSozk2k9JGRv0aZ4QAoHeGPb2BPKwM90ScwSFt"
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-charcoal-300"></div>
                <div className="w-3 h-3 rounded-full bg-charcoal-200"></div>
                <div className="w-3 h-3 rounded-full bg-charcoal-100"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 border-y border-charcoal-100">
          <div className="px-6 md:px-container-margin max-w-7xl mx-auto">
            <p className="text-center font-sans text-label-sm text-charcoal-400 uppercase tracking-[0.2em] mb-10">Trusted by the World&apos;s Leading STEM Institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
              <img className="h-8 w-auto" alt="Logo 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4yFmzExN7pmlAuP1ahw74QhbI9mpRziYmNZDQfpp_pFUzrXkPzLH1YesyOfKECrtZNOZNleTcZdkMHjxkbflqcRBT6-xHE_tpeK4tqWGs0lXmit5cx5x6NjyebikMy_eG3ZGQZgJncry0IXhwYfH2BNQ3pq7INL7OjQu1iZtkDsES-mZDx5Pfi2GNC11X0OeIYfjJ3nrPvNKsZvsjP5DTytp4pVy_BIOLWEpSTrKUbGfC7veD6BCH0IYHUluO9Xar4c_1XdPlV0MG"/>
              <img className="h-10 w-auto" alt="Logo 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPMkpvmHq41SdMWU1jI-EP4popqCJK1k4jNgRKAmCjs8laoEpY0Q6c5tTYu0ZJnp5AUrVf3S6Bgu4aM1pRXYmIfdlyIDcFrhnb_MFGZdp3RaAEEAvRLzLPBr1fu4qShfilayOJ8dOfDsaz3O7pSFUusvkAZOXwmCg9mWtmaz5y41m06rfWzPFmv_4EdW6IGDgn6hj45jIIIajJYb2L_rRbDWILECKCYyH6vA_fdxO1hQeQsBBVZZfLf4DBlRT4gMusBxQ3HcfshkdX"/>
              <img className="h-7 w-auto" alt="Logo 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGd18T3V5qhsXTUPuJiD11I7XigYtac0h6jeRywDda3kwJoDKiXrRXkuPKNfgeyMRP1_Kv5e5wJMxOjEvCE3qpHVfBzt13ae6StS1D_elom6mPOVaceeeNVW-uYgGMMKKUInL8jfdOfC2C8D9PeDvhRZ-PmHBcWiAwbQ4Y6OE6k09bML5p1-vqPki0dqV6K2r3Uxb4yx1_3LRdvnDCQrx8TOvlAYo8_oc8P6KM_YTl0nRf3xeiRz7tq27xYhbbEvL5Z5Q-AdaDSMQZ"/>
              <img className="h-9 w-auto" alt="Logo 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC42DP7Aez2DUOp__VpWrPY5UxvsWpTMNVHp95uHMFJDC62Q9SPy3r6FLHHFpkaPH9JXfJsihx6JXB-lrDJhvlLeodhXaqUpmisezJrf8wO8KaGey9EtfCiNwN6iEUQlywXjx-83IRrb2eriCacljcrshjlPYfDrgn9AjdX9E-1abnIlCMOhEe9UdbUHCultyAbvYoq8iuR5ZkccXDx31SWiacuRt2MFthQhPRZCjddrmoSYjJ1JMr-bOhbpU8CdF-1p4yX7abY1BFm"/>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-6 md:px-container-margin max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-heading text-headline-lg text-charcoal-900 mb-4">Precision-Engineered Features</h2>
            <p className="font-sans text-body-md text-charcoal-400 max-w-xl">Every tool is designed to mimic the workflow of professional engineers, from initial ideation to global showcase.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {/* AI-Powered Portfolios */}
            <div className="md:col-span-8 md:row-span-2 reveal-card bento-card rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="font-heading text-headline-md text-charcoal-900 mb-2">AI-Powered Portfolios</h3>
                <p className="font-sans text-body-md text-charcoal-400 max-w-md">Transform raw technical data and code into industry-standard digital portfolios automatically. Optimized for recruiter attention.</p>
              </div>
              <div className="mt-8 relative h-full">
                <img className="absolute top-0 left-0 w-full h-full object-cover rounded-xl border border-charcoal-100 transform group-hover:scale-105 transition-transform duration-500" alt="Portfolios" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbv2dkdhRBJm-kYqGjSDnTNJ-fS9ZIXWLGz_BIRwcFwR-3Xddmhn9c5l42HmQSNjf5Iye97JFYXejChQyK2ufYmF_CcRp8BkHCd85YVMjLZil2caHRXUokBQ68ZVdRbGLtOjvX5rF2WFvCafC1JKQrLBMR6BSN8omSfwxGhZR9IJEKmeMQi0v12DkEMwRowh5DAYZf4lr9WuSbV-ccfBDYbX_V4oWM9Ykz02sMVRzM8rSMiMimhehpiscX2fXROnZJJZNW2_XTvWfZ"/>
              </div>
            </div>
            {/* Interactive Kanban Boards */}
            <div className="md:col-span-4 md:row-span-1 reveal-card bento-card rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-headline-md text-charcoal-900">Interactive Kanban</h3>
              </div>
              <p className="font-sans text-label-sm text-charcoal-400">Agile project management tailored for complex hardware development cycles.</p>
            </div>
            {/* Mentor Collaboration */}
            <div className="md:col-span-4 md:row-span-1 reveal-card bento-card rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-headline-md text-accent">Mentor Sync</h3>
              </div>
              <p className="font-sans text-label-sm text-charcoal-400">Direct feedback loops with world-class robotics engineers and academics.</p>
            </div>
            {/* Canva-Style Design Journals */}
            <div className="md:col-span-12 md:row-span-1 reveal-card bento-card rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="font-heading text-headline-md mb-2 text-charcoal-900">Canva-Style Design Journals</h3>
                <p className="font-sans text-body-md text-charcoal-400">Document your thought process with an intuitive, visual drag-and-drop interface for sketching and brainstorming.</p>
              </div>
              <div className="flex-1 h-full w-full bg-charcoal-50 rounded-xl flex items-center justify-center border border-dashed border-charcoal-200 overflow-hidden">
                <div className="text-charcoal-400 font-sans text-label-md">Infinite Canvas Layouts</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-container-margin">
          <div className="max-w-5xl mx-auto rounded-3xl bg-charcoal-900 p-12 md:p-20 text-center text-white relative overflow-hidden">
            {/* Subtle accent gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-heading text-headline-lg-mobile md:text-headline-lg mb-6">Ready to launch your legacy?</h2>
              <p className="font-sans text-body-md mb-10 text-charcoal-300 max-w-2xl mx-auto">Join the next generation of elite engineers. Secure your spot in the MakePlace workspace today.</p>
              <Link href="/login" className="bg-accent text-white px-12 py-5 rounded-xl font-heading text-headline-md font-bold shadow-xl hover:scale-105 active:scale-95 transition-all inline-block accent-button-glow">
                Launch Project Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-50 py-20 border-t border-charcoal-100 px-6 md:px-container-margin">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-label-sm text-charcoal-400">© 2026 MakePlace Robotics Academy. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="font-sans text-label-sm text-charcoal-400">Built for Elite STEM Innovation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
