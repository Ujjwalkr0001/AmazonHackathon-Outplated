import React from 'react';
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
  onExportMarkdown,
}) => {
  return (
    <section className="py-8 sm:py-12 max-w-[1300px] mx-auto px-4 sm:px-6">
      <div className="p-6 sm:p-10 rounded-[32px] bg-[#0e111a] border border-white/10 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#ccff00] font-bold">PROJECT SCORECARD</span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">{report.repoName}</h2>
            <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-2xl">{report.summary}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl sm:text-5xl font-extrabold font-display text-[#ccff00]">{report.overallScore}</div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider mt-1">GRADE {report.grade}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
