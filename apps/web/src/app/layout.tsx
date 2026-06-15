import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'MakerSpace — STEM Portfolio Academy',
  description: 'Student portfolio and management platform for robotics makerspace academies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster>{children}</Toaster>
        </AuthProvider>
      </body>
    </html>
  );
}
