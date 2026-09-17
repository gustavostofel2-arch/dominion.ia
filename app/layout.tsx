import type {Metadata} from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { SidebarProvider } from '@/components/SidebarProvider';
import { ContentWrapper } from '@/components/ContentWrapper';

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
          <Sidebar />
          <ContentWrapper>
            <TopNav />
            <main className="w-full flex-1 pt-20 px-4 md:px-8 pb-20 lg:pb-8">
              {children}
            </main>
          </ContentWrapper>
        </SidebarProvider>
      </body>
    </html>
  );
}
