import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DemoRepo, ScanStatus, ProjectHealthReport, PillarCategory, IssueItem } from './types';

export const App: React.FC = () => {
  const [demos, setDemos] = useState<DemoRepo[]>([]);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [report, setReport] = useState<ProjectHealthReport | null>(null);
  const [activeCategory, setActiveCategory] = useState<PillarCategory | 'all'>('all');
  const [selectedIssueForPatch, setSelectedIssueForPatch] = useState<IssueItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/demos')
      .then((res) => res.json())
      .then((data) => setDemos(data))
      .catch((err) => console.warn('Could not load demos:', err));
  }, []);

  useEffect(() => {
    if (!activeScanId || report) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(/api/status/\);
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

  return (
    <div className="min-h-screen bg-[#090a0d] text-white">
      <Header onReset={() => { setReport(null); setActiveScanId(null); }} isReportActive={!!report} />
    </div>
  );
};
export default App;
