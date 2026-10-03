import type { Metadata } from 'next';
import { Outfit, Montserrat, Inter } from 'next/font/google';
import AmbientGlow from '@/components/layout/AmbientGlow';
import AppFooter from '@/components/layout/AppFooter';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UTN Contenidos | Asistente Pedagógico IA — Facultad Regional Delta',
  description: 'Plataforma institucional de asistencia didáctica y generación inteligente de diapositivas y clases universitarias con IA para docentes UTN FRD.',
  icons: {
    icon: '/UTN.jpg',
    apple: '/UTN.jpg',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${outfit.variable} ${montserrat.variable} ${inter.variable}`}>
      <body>
        <AmbientGlow />
        <div className="app-shell-container">
          <main role="main" className="app-main-content">
            {children}
          </main>
          <AppFooter />
        </div>
      </body>
    </html>
  );
}