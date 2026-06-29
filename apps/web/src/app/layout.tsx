import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MakePlace — STEM Portfolio Academy',
  description: 'Student portfolio and management platform for robotics makeplace academies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className="font-body">
        <NextTopLoader color="#1C1C1E" showSpinner={false} shadow="0 0 10px rgba(28,28,30,0.3),0 0 5px rgba(28,28,30,0.2)" />
        <AuthProvider>
          <Toaster>{children}</Toaster>
        </AuthProvider>
      </body>
    </html>
  );
}
