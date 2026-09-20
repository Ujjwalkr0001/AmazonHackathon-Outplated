import React, { useState } from 'react';
import { Terminal, RefreshCw, ArrowUpRight, Menu, X, Shield, FolderGit2, Home } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isReportActive: boolean;
  onNavigateToSection?: (sectionId: string) => void;
  onFocusInput?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onReset, 
  isReportActive, 
  onNavigateToSection,
  onFocusInput 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    if (!sectionId || sectionId === 'top') {
      onReset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleRunDoctor = () => {
    setMobileMenuOpen(false);
    if (isReportActive) {
      onReset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onFocusInput) {
      onFocusInput();
    } else {
      const input = document.getElementById('repo-search-input');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#090a0d]/90 backdrop-blur-xl transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => handleNavClick('top')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#141720] border border-white/10 flex items-center justify-center text-[#ccff00] group-hover:border-[#ccff00]/40 group-hover:bg-[#1a1f2c] transition-all">
            <span className="font-mono text-xs font-bold tracking-tight">::+</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-[#ccff00] transition-colors uppercase">
              Codebase<span className="text-[#ccff00]">.</span>Doctor
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-white/5 border border-white/10 rounded text-zinc-400">
              1M CONTEXT
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono uppercase tracking-[0.16em] text-zinc-400">
          <button 
            onClick={() => handleNavClick('top')}
            className="hover:text-[#ccff00] text-zinc-200 transition-colors cursor-pointer py-1"
          >
            Auditor
          </button>
          <button 
            onClick={() => handleNavClick('pillars')} 
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            6 Pillars
          </button>
          <button 
            onClick={() => handleNavClick('demos')} 
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Preloaded Demos
          </button>
        </nav>

        {/* Right: Desktop CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main Action Button (Desktop & Tablet) */}
          {isReportActive ? (
            <button
              onClick={handleRunDoctor}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white text-black hover:bg-[#ccff00] text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-md active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Audit</span>
              <span className="sm:hidden">Reset</span>
            </button>
          ) : (
            <button
              onClick={handleRunDoctor}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-black text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-md hover:shadow-[#ccff00]/30 active:scale-95 group"
            >
              <Terminal className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Run Doctor</span>
              <ArrowUpRight className="hidden sm:inline-block w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.2]" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0c0e14]/95 backdrop-blur-2xl px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => handleNavClick('top')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-zinc-300 hover:text-[#ccff00] transition-colors text-left"
            >
              <Home className="w-4 h-4 text-[#ccff00]" />
              <span>Auditor Home</span>
            </button>
            <button
              onClick={() => handleNavClick('pillars')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-zinc-300 hover:text-white transition-colors text-left"
            >
              <Shield className="w-4 h-4 text-zinc-400" />
              <span>6 Diagnostic Pillars</span>
            </button>
            <button
              onClick={() => handleNavClick('demos')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-zinc-300 hover:text-white transition-colors text-left"
            >
              <FolderGit2 className="w-4 h-4 text-zinc-400" />
              <span>Preloaded Demos</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">Codebase Doctor Engine</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
              AST Active
            </span>
          </div>
        </div>
      )}
    </header>
  );
};


