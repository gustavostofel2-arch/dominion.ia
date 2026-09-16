import type {Metadata} from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';

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
    <html lang="pt-BR" className={`dark ${geist.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-surface-container-lowest text-on-surface antialiased font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all">
          <TopNav />
          <main className="w-full flex-1 pt-20 px-4 md:px-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
