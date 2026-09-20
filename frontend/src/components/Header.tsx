import React from 'react';
import { Terminal, RefreshCw, ArrowUpRight, Shield } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isReportActive: boolean;
  onNavigateToSection?: (sectionId: string) => void;
  onFocusInput?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onReset, 
  isReportActive 
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#090a0d]/90 backdrop-blur-xl transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        <div 
          onClick={() => { onReset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-300">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white">
            AI Codebase Doctor
          </span>
        </div>
      </div>
    </header>
  );
};
