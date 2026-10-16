import type {Metadata} from 'next';
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
  title: 'Dominion Prompt - Mastermind VIP',
  description: 'Biblioteca de prompts de IA para mentorados.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${jetbrainsMono.variable}`} style={{colorScheme: 'light'}}>
      <body suppressHydrationWarning className="text-on-surface antialiased font-sans">
        <SidebarProvider>
          <AppShell>{children}</AppShell>
        </SidebarProvider>
      </body>
    </html>
  );
}
