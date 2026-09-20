import React from 'react';
import { X } from 'lucide-react';
import { IssueItem } from '../types';

interface DiffViewerProps {
  issue: IssueItem | null;
  onClose: () => void;
  scanId: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ issue, onClose }) => {
  if (!issue || !issue.patch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-[24px] bg-[#0c0e14] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-bold text-white font-mono">{issue.patch.affectedFile}</h4>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
