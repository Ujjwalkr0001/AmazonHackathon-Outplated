import React, { useState } from 'react';
import { Shield, Zap, Package, CheckCircle2, Box, HelpCircle, FileCode, GitPullRequest, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { IssueItem, PillarCategory, IssueSeverity } from '../types';

interface IssueExplorerProps {
  issues: IssueItem[];
  activeCategory: PillarCategory | 'all';
  onCategoryChange: (category: PillarCategory | 'all') => void;
  onOpenPatch: (issue: IssueItem) => void;
}

export const IssueExplorer: React.FC<IssueExplorerProps> = ({
  issues,
  activeCategory,
  onCategoryChange,
  onOpenPatch,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | 'all'>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  const categories: Array<{ key: PillarCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All Issues' },
    { key: 'security', label: 'Security' },
    { key: 'performance', label: 'Performance' },
    { key: 'dependencies', label: 'Dependencies' },
    { key: 'codeQuality', label: 'Code Quality' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'missingTests', label: 'Missing Tests' },
  ];

  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = activeCategory === 'all' || issue.category === activeCategory;
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    return matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 uppercase">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-500/20 text-zinc-300 border border-zinc-500/40 uppercase">LOW</span>;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Category Pills & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const count = cat.key === 'all' ? issues.length : issues.filter(i => i.category === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] mr-1">SEVERITY:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-mono transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-[#ccff00] text-black font-bold'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Ledger */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 rounded-[28px] bg-[#12141c] border border-white/[0.08] text-center">
          <p className="text-sm font-mono text-zinc-400">
            No diagnosed issues matching current filter parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                className="rounded-[24px] bg-[#0e1017] border border-white/[0.08] hover:border-white/[0.18] transition-all overflow-hidden"
              >
                {/* Header row */}
                <div 
                  onClick={() => toggleExpand(issue.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01]"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs font-black text-[#ccff00] px-2.5 py-1 rounded bg-[#ccff00]/10 border border-[#ccff00]/25">
                      {issue.id}
                    </span>
                    {getSeverityBadge(issue.severity)}
                    <h4 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                      {issue.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {issue.file && (
                      <span className="text-xs font-mono text-zinc-400 truncate max-w-[200px]">
                        {issue.file}{issue.lineStart ? `:${issue.lineStart}` : ''}
                      </span>
                    )}

                    {issue.patch && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPatch(issue);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#ccff00] hover:bg-[#ffd600] text-black text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[#ccff00]/20 active:scale-95"
                      >
                        <GitPullRequest className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Patch</span>
                      </button>
                    )}

                    <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/[0.06] space-y-4 bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block mb-1">
                          VULNERABILITY DESCRIPTION
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block mb-1">
                          SECURITY &amp; SYSTEM IMPACT
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {issue.impact}
                        </p>
                      </div>
                    </div>

                    {/* Code Snippet if present */}
                    {issue.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                        <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>AFFECTED CODE SNIPPET</span>
                          <span>{issue.file}</span>
                        </div>
                        <pre className="p-4 font-mono text-xs text-rose-300 overflow-x-auto whitespace-pre">
                          {issue.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Recommendation and Remediation */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ccff00] font-bold block mb-1">
                          REMEDIATION RECOMMENDATION
                        </span>
                        <p className="text-xs text-zinc-200">
                          {issue.recommendation}
                        </p>
                      </div>

                      {issue.patch && (
                        <button
                          onClick={() => onOpenPatch(issue)}
                          className="px-4 py-2 rounded-full bg-[#ccff00] hover:bg-[#ffd600] text-black text-xs font-mono uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <GitPullRequest className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Review Unified Diff</span>
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
