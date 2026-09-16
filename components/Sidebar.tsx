'use client';

import { useState } from 'react';
import { Menu, X, LayoutGrid, Image as ImageIcon, Film, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutGrid },
    { label: 'Prompts de Imagem', href: '/prompts/imagem', icon: ImageIcon },
    { label: 'Prompts de Vídeo', href: '/prompts/video', icon: Film },
  ];

  return (
    <>
      {/* Mobile Toggle Overlay (Optional for better mobile UX, but let's stick to simple fixed for now or hidden on mobile) */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-full bg-surface-container-low/95 backdrop-blur-xl z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          "hidden lg:flex" // Hide on small screens for simplicity, or handle with a hamburger menu
        )}
      >
        <div className="flex flex-col w-full">
          <div className="h-16 px-4 flex items-center justify-between gap-2">
            {!isCollapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary text-xl">D</span>
                </div>
                <span className="font-semibold text-lg tracking-tight text-on-surface truncate">Dominion</span>
              </div>
            )}
            {isCollapsed && (
               <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0 mx-auto">
                 <span className="font-bold text-primary text-xl">D</span>
               </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1.5 rounded transition-colors shrink-0"
              title="Recolher barra lateral"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

          <div className={clsx("px-4 pt-4 pb-2 transition-opacity duration-200", isCollapsed ? "opacity-0" : "opacity-100")}>
            {!isCollapsed && <span className="text-[11px] font-medium text-outline uppercase tracking-wider">Biblioteca</span>}
          </div>

          <nav className="flex flex-col gap-1 px-3 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm w-full",
                    isActive
                      ? "bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(160,120,255,0.25)]"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 flex flex-col gap-2 w-full">
          {!isCollapsed && (
             <div className="px-1 pt-1">
               <span className="text-[11px] font-medium text-outline uppercase tracking-wider">Gestão</span>
             </div>
          )}
          <nav className="flex flex-col gap-1 w-full">
            <Link
              href="/admin"
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full",
                pathname.startsWith('/admin')
                  ? "bg-surface-container-high text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                 isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? "Área Admin" : undefined}
            >
              <ShieldAlert size={18} className="shrink-0" />
              {!isCollapsed && <span>Área Admin</span>}
            </Link>
          </nav>
          {!isCollapsed && (
            <div className="pt-2 flex items-center justify-between px-1 mt-2 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(123,208,255,0.8)]"></span>
                <span className="text-[11px] text-outline uppercase font-medium tracking-wider">v2.4 Pro</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav (Simple alternative for mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-surface-container-high z-50 flex items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 p-2",
                isActive ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
           href="/admin"
           className={clsx(
             "flex flex-col items-center gap-1 p-2",
             pathname.startsWith('/admin') ? "text-primary" : "text-on-surface-variant"
           )}
         >
           <ShieldAlert size={20} />
           <span className="text-[10px] font-medium">Admin</span>
         </Link>
      </div>
    </>
  );
}
