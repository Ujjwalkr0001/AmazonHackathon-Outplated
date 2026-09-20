import React from 'react';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { ScanStatus } from '../types';

interface ScanProgressProps {
  status: ScanStatus;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ status }) => {
  const steps = [
    { num: '01', key: 'unpacking', label: 'Unpack Repository Archive & AST', minProgress: 20 },
    { num: '02', key: 'filtering', label: 'Filter Node Modules & Manifests', minProgress: 40 },
    { num: '03', key: 'analyzing', label: 'Whole-Repo Callgraph Audit', minProgress: 70 },
    { num: '04', key: 'synthesizing_patches', label: 'Synthesize Unified Git Diff Patches', minProgress: 90 },
    { num: '05', key: 'completed', label: 'Calculate Project Health Scorecard', minProgress: 100 },
  ];

  return (
    <div className="py-8 sm:py-16 px-3 sm:px-4 max-w-4xl mx-auto">
      {/* Scanner Container */}
      <div className="p-6 sm:p-12 rounded-[28px] bg-[#0d0f16] border border-white/[0.1] shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping"></span>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ccff00] font-bold">
                AUDIT PIPELINE ACTIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight break-all">
              Diagnosing <span className="text-zinc-400 font-mono font-medium">{status.repoName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-display font-bold text-[#ccff00] tracking-tight">
              {Math.round(status.progress)}%
            </span>
          </div>
        </div>

        {/* Main Progress Track */}
        <div className="mb-10">
          <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-[#ccff00] via-[#22c55e] to-[#ffd600] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(204,255,0,0.5)]"
              style={{ width: `${Math.max(6, status.progress)}%` }}
            ></div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-zinc-400 mt-2.5 gap-1">
            <span>CURRENT STEP: {status.currentStep || 'Analyzing cross-file call chains...'}</span>
            <span>ENGINE: 1M CONTEXT AST ANALYZER</span>
          </div>
        </div>

        {/* Modular Step Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {steps.map((step) => {
            const isDone = status.progress >= step.minProgress;
            const isCurrent = status.progress < step.minProgress && status.progress >= (step.minProgress - 25);

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-[#ccff00]/5 border-[#ccff00]/30 text-white'
                    : isCurrent
                    ? 'bg-white/[0.05] border-white/20 text-white ring-1 ring-[#ccff00]/40'
                    : 'bg-white/[0.02] border-white/[0.05] text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold ${isDone ? 'text-[#ccff00]' : isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                    {step.num}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#ccff00] animate-spin" />
                  ) : null}
                </div>
                <p className="text-xs font-sans font-medium leading-tight line-clamp-2">
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Telemetry Output */}
        <div className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[10px] text-zinc-500">
            <span>AWS_LAMBDA_TELEMETRY</span>
            <span className="text-[#ccff00]">LIVE PASS</span>
          </div>
          <div className="space-y-1 text-zinc-400">
            <p className="text-white">&gt; repoPacker: Structured multi-file context ingested into buffer</p>
            <p>&gt; astFilter: Stripped node_modules, binaries, build dist, and test mocks</p>
            <p className="text-[#ccff00]">&gt; diagnosticsEngine: Whole-repo evaluation across 6 diagnostic pillars (1M context)...</p>
            {status.progress >= 70 && (
              <p className="text-[#22c55e]">&gt; patcherService: Synthesizing unified git diff format with context headers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

