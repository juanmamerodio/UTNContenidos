import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UTN Contenidos | Beta',
  description: 'Plataforma institucional de asistencia didáctica con IA para docentes de la UTN Facultad Regional Delta.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}