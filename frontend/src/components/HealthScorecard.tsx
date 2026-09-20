import React, { useState } from 'react';
import { Shield, Zap, Package, CheckCircle2, Box, HelpCircle, AlertTriangle, Terminal, Download, ArrowUpRight, GitPullRequest } from 'lucide-react';
import { ProjectHealthReport, PillarCategory } from '../types';

interface HealthScorecardProps {
  report: ProjectHealthReport;
  onSelectCategoryFilter: (category: PillarCategory | 'all') => void;
  onJumpToCritical: () => void;
  onOpenDiffModal: (issueId: string) => void;
  onExportMarkdown: () => void;
}

export const HealthScorecard: React.FC<HealthScorecardProps> = ({
  report,
  onSelectCategoryFilter,
  onJumpToCritical,
  onOpenDiffModal,
  onExportMarkdown,
}) => {
  const [showTerminalView, setShowTerminalView] = useState(false);

  const pillarConfigs: Array<{
    key: PillarCategory;
    title: string;
    icon: any;
    data: typeof report.categories.security;
  }> = [
    { key: 'security', title: 'Security', icon: Shield, data: report.categories.security },
    { key: 'performance', title: 'Performance', icon: Zap, data: report.categories.performance },
    { key: 'dependencies', title: 'Dependencies', icon: Package, data: report.categories.dependencies },
    { key: 'codeQuality', title: 'Code Quality', icon: CheckCircle2, data: report.categories.codeQuality },
    { key: 'architecture', title: 'Architecture', icon: Box, data: report.categories.architecture },
    { key: 'missingTests', title: 'Missing Tests', icon: HelpCircle, data: report.categories.missingTests },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { bg: 'bg-[#22c55e]', text: 'text-black', label: 'OPTIMAL' };
    if (score >= 60) return { bg: 'bg-[#ffd600]', text: 'text-black', label: 'MODERATE' };
    return { bg: 'bg-rose-500', text: 'text-white', label: 'CRITICAL RISK' };
  };

  const badge = getScoreBadge(report.overallScore);

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ccff00] font-bold">
              PROJECT HEALTH AUDIT
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className="text-xs font-mono text-zinc-400">
              SCAN_ID: {report.scanId}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
            {report.repoName}
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Scanned {report.metrics.totalFilesScanned} source files • {report.metrics.linesOfCode.toLocaleString()} lines of code • 1M+ Whole-Repo Context Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTerminalView(!showTerminalView)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>{showTerminalView ? 'Visual View' : 'ASCII View'}</span>
          </button>

          <button
            onClick={onExportMarkdown}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#ffd600] text-black text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-md hover:shadow-[#ccff00]/30 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* ASCII View Toggle */}
      {showTerminalView && (
        <div className="p-6 rounded-2xl bg-black border border-[#ccff00]/40 font-mono text-xs text-[#ccff00] shadow-2xl relative overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ccff00]/20 text-[11px] text-zinc-400">
            <span>PROJECT_HEALTH_TERMINAL_CARD</span>
            <span>UTF-8 MONO</span>
          </div>
          <pre className="overflow-x-auto leading-relaxed whitespace-pre font-mono text-[13px]">
{`PROJECT HEALTH SCORECARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Repository:   ${report.repoName}
Overall Score: ${report.overallScore}/100 [Grade: ${report.grade}]
Diagnostics:
  Security:      ${report.categories.security.rating === 'critical' ? '🔴' : '🟢'} ${report.categories.security.badgeLabel}
  Performance:   ${report.categories.performance.rating === 'critical' ? '🔴' : '🟠'} ${report.categories.performance.badgeLabel}
  Dependencies:  ${report.categories.dependencies.rating === 'critical' ? '🔴' : '🟠'} ${report.categories.dependencies.badgeLabel}
  Code Quality:  ${report.categories.codeQuality.rating === 'critical' ? '🔴' : '🟢'} ${report.categories.codeQuality.badgeLabel}
  Architecture:  ${report.categories.architecture.rating === 'critical' ? '🔴' : '🟠'} ${report.categories.architecture.badgeLabel}
  Missing Tests: ${report.categories.missingTests.rating === 'critical' ? '🔴' : '🟢'} ${report.categories.missingTests.badgeLabel}

Summary:
${report.summary}`}
          </pre>
        </div>
      )}

      {/* Hero Metric Section: Clean Balanced Overall Score & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Overall Score Card */}
        <div className="lg:col-span-4 p-8 rounded-[24px] bg-[#0e1017] border border-white/[0.08] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-bold">
              OVERALL HEALTH SCORE
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>

          <div className="my-6">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-display font-bold text-white tracking-tight leading-none">
                {report.overallScore}
              </span>
              <span className="text-xl font-display font-medium text-zinc-500">/ 100</span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-2">
              Grade Evaluation: <strong className="text-white text-base font-display font-semibold ml-1">{report.grade}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>ISSUES DETECTED</span>
            <span className="text-white font-bold">{report.issues.length} Identified</span>
          </div>
        </div>

        {/* Executive Summary & Critical Banner */}
        <div className="lg:col-span-8 p-8 rounded-[24px] bg-[#0e1017] border border-white/[0.08] flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ccff00] font-bold">
                DIAGNOSTIC EXECUTIVE SUMMARY
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed mb-6">
              {report.summary}
            </p>
          </div>

          {/* Critical Vulnerability Strip */}
          {report.criticalVulnerabilityBanner && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-300 block">
                    CRITICAL ZERO-DAY DETECTED
                  </span>
                  <p className="text-xs text-rose-200 mt-0.5 leading-snug">
                    {report.criticalVulnerabilityBanner}
                  </p>
                </div>
              </div>

              <button
                onClick={onJumpToCritical}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Apply Patch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* The 6 Pillars Breakdown */}
      <div className="space-y-4" id="pillars">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">
            Diagnostic Pillars Breakdown
          </h3>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Click pillar to filter issues
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillarConfigs.map((pillar) => {
            const isCritical = pillar.data.rating === 'critical';
            const isWarning = pillar.data.rating === 'warning';

            return (
              <div
                key={pillar.key}
                onClick={() => onSelectCategoryFilter(pillar.key)}
                className="group p-6 rounded-[20px] bg-[#10131c] hover:bg-[#161a26] border border-white/[0.08] hover:border-white/[0.2] transition-all cursor-pointer flex flex-col justify-between min-h-[160px] editorial-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">
                      {pillar.title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {pillar.data.badgeLabel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                    {pillar.data.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">
                    {pillar.data.issuesCount} {pillar.data.issuesCount === 1 ? 'issue' : 'issues'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.2]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
