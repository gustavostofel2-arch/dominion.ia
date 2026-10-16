import type { Metadata, Viewport } from 'next';
import { LOGO_URL } from '@/components/Brand';
import { Atmosphere } from '@/components/Atmosphere';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/SidebarProvider';
import { AppShell } from '@/components/AppShell';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Dominion Prompt',
  description: 'Banco de prompts validados para Veo 3, Magnific e mais.',
  icons: { icon: LOGO_URL },
};

export const viewport: Viewport = {
  themeColor: '#03050b',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${jetbrainsMono.variable}`} style={{colorScheme: 'dark'}}>
      <body suppressHydrationWarning className="text-on-surface antialiased font-sans">
        <Atmosphere />
        <SidebarProvider>
          <AppShell>{children}</AppShell>
        </SidebarProvider>
      </body>
    </html>
  );
}
