import React from 'react';
import { ScanStatus } from '../types';

interface ScanProgressProps {
  status: ScanStatus;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ status }) => {
  return (
    <div className="py-8 sm:py-16 px-3 sm:px-4 max-w-4xl mx-auto">
      <div className="p-6 sm:p-12 rounded-[28px] bg-[#0d0f16] border border-white/[0.1] shadow-2xl relative overflow-hidden">
        <h2 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight mb-4">
          Diagnosing {status.repoName}
        </h2>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
          <div 
            className="bg-gradient-to-r from-[#ccff00] to-[#22c55e] h-full transition-all duration-500"
            style={{ width: ${Math.min(100, Math.max(5, status.progress))}% }}
          />
        </div>
        <p className="mt-4 text-sm text-zinc-400 font-mono">{status.currentStep}</p>
      </div>
    </div>
  );
};
