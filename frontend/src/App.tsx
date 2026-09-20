import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IntakeHero } from './components/IntakeHero';
import { ScanProgress } from './components/ScanProgress';
import { HealthScorecard } from './components/HealthScorecard';
import { IssueExplorer } from './components/IssueExplorer';
import { DiffViewer } from './components/DiffViewer';
import { ProjectHealthReport, ScanStatus, DemoRepo, PillarCategory, IssueItem } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [demos, setDemos] = useState<DemoRepo[]>([]);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [report, setReport] = useState<ProjectHealthReport | null>(null);
  const [activeCategory, setActiveCategory] = useState<PillarCategory | 'all'>('all');
  const [selectedIssueForPatch, setSelectedIssueForPatch] = useState<IssueItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch demo repositories on mount
  useEffect(() => {
    fetch('/api/demos')
      .then((res) => res.json())
      .then((data) => setDemos(data))
      .catch((err) => console.warn('Could not load demos:', err));
  }, []);

  // Poll scan status while active
  useEffect(() => {
    if (!activeScanId || report) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${activeScanId}`);
        if (!res.ok) throw new Error('Status check failed');
        const data: ScanStatus = await res.json();
        setScanStatus(data);

        if (data.status === 'completed' && data.report) {
          setReport(data.report);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setError(data.error || 'Scan failed to complete');
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeScanId, report]);

  const handleScanGitHub = async (url: string) => {
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'github', url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start GitHub scan');

      setActiveScanId(data.scanId);
      setScanStatus({
        scanId: data.scanId,
        status: 'queued',
        progress: 5,
        currentStep: 'Connecting to GitHub repository...',
        repoName: data.repoName,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUploadZip = async (file: File) => {
    setError(null);
    setReport(null);
    const formData = new FormData();
    formData.append('repoZip', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload project ZIP');

      setActiveScanId(data.scanId);
      setScanStatus({
        scanId: data.scanId,
        status: 'queued',
        progress: 5,
        currentStep: 'Uploaded ZIP. Queuing repository analysis...',
        repoName: data.repoName,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectDemo = async (demoId: string) => {
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'demo', demoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger demo scan');

      setActiveScanId(data.scanId);
      setScanStatus({
        scanId: data.scanId,
        status: 'queued',
        progress: 5,
        currentStep: `Ingesting prepackaged demo repository...`,
        repoName: data.repoName,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setActiveScanId(null);
    setScanStatus(null);
    setReport(null);
    setError(null);
    setActiveCategory('all');
    setSelectedIssueForPatch(null);
  };

  const handleJumpToCritical = () => {
    if (!report) return;
    const criticalIssue = report.issues.find((i) => i.severity === 'critical' && i.patch) || report.issues.find((i) => i.patch);
    if (criticalIssue) {
      setSelectedIssueForPatch(criticalIssue);
    }
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const md = `# PROJECT HEALTH REPORT: ${report.repoName}
Overall Score: ${report.overallScore}/100 (Grade: ${report.grade})
Timestamp: ${report.timestamp}

## Diagnostic Pillars
- Security: ${report.categories.security.badgeLabel} (${report.categories.security.rating})
- Performance: ${report.categories.performance.badgeLabel} (${report.categories.performance.rating})
- Dependencies: ${report.categories.dependencies.badgeLabel} (${report.categories.dependencies.rating})
- Code Quality: ${report.categories.codeQuality.badgeLabel} (${report.categories.codeQuality.rating})
- Architecture: ${report.categories.architecture.badgeLabel} (${report.categories.architecture.rating})
- Missing Tests: ${report.categories.missingTests.badgeLabel} (${report.categories.missingTests.rating})

## Executive Summary
${report.summary}

## Diagnosed Issues (${report.issues.length})
${report.issues.map((i) => `### [${i.severity.toUpperCase()}] ${i.title} (${i.file || 'Global'})\n- **Category**: ${i.category}\n- **Description**: ${i.description}\n- **Impact**: ${i.impact}\n- **Remedy**: ${i.recommendation}\n`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJECT_HEALTH_${report.repoName.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (sectionId === 'demos') {
      if (report || activeScanId) {
        handleReset();
        setTimeout(() => {
          const el = document.getElementById('demos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFocusInput = () => {
    const input = document.getElementById('repo-search-input') as HTMLInputElement | null;
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
      input.classList.add('ring-2', 'ring-[#ccff00]');
      setTimeout(() => {
        input.classList.remove('ring-2', 'ring-[#ccff00]');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#ccff00] selection:text-black bg-[#0a0b0e] text-[#f4f5f8]">
      <Header 
        onReset={handleReset} 
        isReportActive={!!report} 
        onNavigateToSection={handleNavigateToSection}
        onFocusInput={handleFocusInput}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-6">
        {/* Error Alert in Studio Style */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-200 shadow-xl">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-full bg-rose-900/80 hover:bg-rose-800 text-xs font-mono uppercase font-bold tracking-wider cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* View State: Initial Intake Screen */}
        {!activeScanId && (
          <IntakeHero
            onScanGitHub={handleScanGitHub}
            onUploadZip={handleUploadZip}
            onSelectDemo={handleSelectDemo}
            demos={demos}
            isLoading={false}
          />
        )}

        {/* View State: Active Scanning Animation */}
        {activeScanId && !report && scanStatus && (
          <ScanProgress status={scanStatus} />
        )}

        {/* View State: Diagnostic Report & Patches */}
        {report && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <HealthScorecard
              report={report}
              onSelectCategoryFilter={(cat) => setActiveCategory(cat)}
              onJumpToCritical={handleJumpToCritical}
              onOpenDiffModal={(issueId) => {
                const issue = report.issues.find((i) => i.id === issueId);
                if (issue) setSelectedIssueForPatch(issue);
              }}
              onExportMarkdown={handleExportMarkdown}
            />

            <IssueExplorer
              issues={report.issues}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onOpenPatch={(issue) => setSelectedIssueForPatch(issue)}
            />
          </div>
        )}
      </main>

      {/* Diff Modal Viewer */}
      {selectedIssueForPatch && (
        <DiffViewer
          issue={selectedIssueForPatch}
          onClose={() => setSelectedIssueForPatch(null)}
          scanId={report?.scanId || ''}
        />
      )}

      {/* Minimal Studio Footer */}
      <footer className="border-t border-white/[0.06] bg-[#08090c] py-8 text-center text-xs text-zinc-500 font-mono tracking-wider">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"></span>
            <span>AI Codebase Doctor • Autonomous Repository Health &amp; Git Diff Synthesis</span>
          </div>
          <div className="text-[11px] text-zinc-600">
            1M+ Context Whole-Repo Engine • AWS Serverless • MIT License
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

