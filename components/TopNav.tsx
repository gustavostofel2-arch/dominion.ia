import { Search, Bell, Bookmark } from 'lucide-react';

export function TopNav() {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl z-40 px-4 md:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-center gap-4 w-full max-w-lg">
        <div className="relative w-full flex items-center hidden sm:flex">
          <Search size={18} className="absolute left-3 text-on-surface-variant pointer-events-none" />
          <input 
            type="text" 
            placeholder="Explorar matriz de prompts, modelos..." 
            className="w-full pl-10 pr-12 py-2 bg-surface-container-low/90 text-on-surface text-sm rounded-lg placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
          />
          <div className="absolute right-2 flex items-center pointer-events-none">
            <kbd className="font-mono text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded shadow-sm border border-outline-variant/30">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button type="button" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors relative" title="Notificações">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(255,95,216,0.7)]"></span>
        </button>
        <button type="button" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-2 rounded-lg transition-colors" title="Coleções salvas">
          <Bookmark size={20} />
        </button>
        
        <div className="h-6 w-[1px] bg-surface-container-high mx-2"></div>
        
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-primary/40 flex items-center justify-center shrink-0 overflow-hidden">
             <span className="text-xs font-bold text-on-surface">M</span>
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-medium text-on-surface leading-tight">Mastermind AI</span>
            <span className="text-[10px] font-mono text-secondary leading-tight uppercase tracking-wider">Criador Elite</span>
          </div>
        </div>
      </div>
    </header>
  );
}
