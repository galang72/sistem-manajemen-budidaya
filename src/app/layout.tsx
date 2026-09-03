import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Papapfishfarm-management - Sistem Budidaya & Keuangan Lele',
  description: 'Aplikasi manajemen dan pencatatan budidaya ikan lele, keuangan, panen, kematian ikan, analisis FCR, ROI, dan laba rugi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased text-slate-800 bg-slate-50">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
