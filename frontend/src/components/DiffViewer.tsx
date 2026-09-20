import React, { useState } from 'react';
import { X, Copy, Check, Download, GitPullRequest, Terminal, ArrowUpRight } from 'lucide-react';
import { IssueItem } from '../types';

interface DiffViewerProps {
  issue: IssueItem | null;
  onClose: () => void;
  scanId: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ issue, onClose, scanId }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!issue || !issue.patch) return null;

  const patch = issue.patch;
  const diffLines = patch.diff.split('\n');

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(patch.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([patch.diff], { type: 'text/x-diff' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${issue.id}_fix.patch`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyCommand = `git apply ${issue.id}_fix.patch`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(applyCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0e1017] border border-white/15 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-[#12151f]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 tracking-widest uppercase">
                UNIFIED DIFF PATCH
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {issue.id} • {issue.category.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              {issue.title}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Target File: <span className="text-[#ccff00]">{patch.affectedFile || issue.file}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patch Rationale & Explanation */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] text-xs font-sans text-zinc-300">
          <p className="leading-relaxed">
            <strong className="text-white font-mono text-[11px] uppercase tracking-wider block mb-1">PATCH RATIONALE:</strong>
            {patch.explanation}
          </p>
        </div>

        {/* Diff Code View */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs bg-black leading-relaxed">
          <div className="rounded-xl overflow-hidden border border-white/[0.08]">
            {diffLines.map((line, idx) => {
              let lineStyle = 'diff-context';
              if (line.startsWith('+') && !line.startsWith('+++')) lineStyle = 'diff-added';
              else if (line.startsWith('-') && !line.startsWith('---')) lineStyle = 'diff-deleted';
              else if (line.startsWith('@@')) lineStyle = 'diff-hunk';

              return (
                <div
                  key={idx}
                  className={`px-4 py-1 flex items-start text-[12px] ${lineStyle}`}
                >
                  <span className="w-8 shrink-0 text-right pr-4 select-none opacity-40 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre overflow-x-auto flex-1">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-5 sm:p-6 border-t border-white/[0.08] bg-[#12151f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Git Apply Command Quick Copy */}
          <div className="flex items-center gap-2 bg-black/60 px-3.5 py-2 rounded-full border border-white/10 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="text-zinc-300">{applyCommand}</span>
            <button
              onClick={handleCopyCommand}
              className="ml-2 text-zinc-400 hover:text-white cursor-pointer"
              title="Copy terminal command"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyDiff}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono uppercase tracking-wider text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Diff'}</span>
            </button>

            <button
              onClick={handleDownloadPatch}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#ccff00] hover:bg-[#ffd600] text-black text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shadow-md hover:shadow-[#ccff00]/30 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download .patch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

