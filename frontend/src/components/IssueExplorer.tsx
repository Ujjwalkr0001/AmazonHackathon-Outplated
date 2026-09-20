import React, { useState } from 'react';
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

  return (
    <section id="issues-section" className="py-8 sm:py-12 max-w-[1300px] mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
        <h3 className="text-xl sm:text-2xl font-display font-bold text-white">Diagnostic Issues ({issues.length})</h3>
      </div>
    </section>
  );
};
