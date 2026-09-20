import React, { useState, useRef } from 'react';
import { Search, ArrowUpRight, Upload, Shield, Zap, FolderGit2 } from 'lucide-react';
import { DemoRepo } from '../types';

interface IntakeHeroProps {
  onScanGitHub: (url: string) => void;
  onUploadZip: (file: File) => void;
  onSelectDemo: (demoId: string) => void;
  demos: DemoRepo[];
  isLoading: boolean;
}

export const IntakeHero: React.FC<IntakeHeroProps> = ({
  onScanGitHub,
  onUploadZip,
  onSelectDemo,
  demos,
  isLoading,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onScanGitHub(urlInput.trim());
  };

  return (
    <div className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white mb-6">
          Whole-Repo Diagnostics & Git Diff Healing
        </h1>
        <form onSubmit={handleSubmitUrl} className="max-w-2xl mx-auto mb-8 flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]"
          />
          <button type="submit" disabled={isLoading} className="px-6 py-3 rounded-xl bg-[#ccff00] text-black font-semibold hover:bg-[#b8e600] transition-colors">
            Diagnose
          </button>
        </form>
      </div>
    </div>
  );
};
