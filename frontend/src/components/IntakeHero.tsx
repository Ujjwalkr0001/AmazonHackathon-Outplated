import React, { useState, useRef } from 'react';
import { Search, ArrowUpRight, Upload, Shield, Zap, FolderGit2, Check, GitPullRequest, Database, FileCode2, Terminal, AlertTriangle, Sparkles, Layers, Cpu, Code2, ArrowRight } from 'lucide-react';
import { DemoRepo } from '../types';
import { ThreeHeroNetwork } from './ThreeHeroNetwork';
import { ParticleText } from './ParticleText';
import { AccordionGallery, AccordionGalleryItem } from './AccordionGallery';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onScanGitHub(urlInput.trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadZip(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        onUploadZip(file);
      } else {
        alert('Please upload a zipped repository archive (.zip)');
      }
    }
  };

  const suiteItems: AccordionGalleryItem[] = [
    {
      image: '/assets/green_blob.jpg',
      label: 'Vulnerable Node.js Express API',
      badge: 'TARGET: ~35 / 100 [GRADE F]',
      badgeColor: 'rose',
      langTag: 'Express / JS',
      description: 'Contains SQL injection via raw string interpolation, hardcoded JWT secrets, and N+1 query loops.',
      snippet: {
        file: 'routes/users.js',
        tag: 'CRITICAL',
        deleted: "- const q = `SELECT * FROM users WHERE q = '${req.query.q}'`;",
        added: "+ const q = 'SELECT * FROM users WHERE q = $1';"
      },
      tags: ['SQLi', 'JWT Hardcoding', 'N+1 Loop'],
      actionText: '1-Click Diagnosis',
      onAction: () => onSelectDemo('vulnerable-node-api')
    },
    {
      image: '/assets/yellow_wave.jpg',
      label: 'Insecure Python Microservice',
      badge: 'TARGET: ~40 / 100 [GRADE D]',
      badgeColor: 'rose',
      langTag: 'Flask / Python',
      description: 'Remote Command Execution (RCE) via shell ping utility, directory traversal in log viewer, and debug=True.',
      snippet: {
        file: 'app.py',
        tag: 'RCE FLAW',
        deleted: '- os.system(f"ping -c 1 {host}")',
        added: "+ subprocess.run(['ping', '-c', '1', host])"
      },
      tags: ['Command Injection', 'Path Traversal', 'Zero Tests'],
      actionText: '1-Click Diagnosis',
      onAction: () => onSelectDemo('insecure-python-app')
    },
    {
      image: '/assets/glass_capsules.jpg',
      label: 'Whole-Repository Callgraph Traversal',
      badge: '1,000,000+ TOKENS',
      badgeColor: 'emerald',
      langTag: 'AST Engine',
      description: 'Traditional static analyzers fail because chunking breaks cross-file data flows. The Doctor ingests entire repos in a single pass.',
      callflow: {
        step1: 'HTTP Route: /api/orders',
        step2: 'Database Layer: N+1 Loop'
      },
      tags: ['Zero Chunking', 'AST Traversal'],
      actionText: 'Inspect Callgraph',
      onAction: () => onSelectDemo('vulnerable-node-api')
    },
    {
      image: '/assets/yellow_torus.jpg',
      label: 'Unified Git Diff Patch Synthesis',
      badge: 'AUTONOMOUS REMEDIATION',
      badgeColor: 'yellow',
      langTag: 'git apply',
      description: 'Generates standard, production-ready .patch diff files. Apply fixes immediately using standard git tooling.',
      terminal: {
        comment: '# Apply verified patch',
        command: '$ git apply SEC-001_fix.patch',
        status: '✓ Patch applied with 0 errors'
      },
      tags: ['Standard Diffs', 'Zero Hallucinations'],
      actionText: 'Review Diffs',
      onAction: () => onSelectDemo('vulnerable-node-api')
    }
  ];

  return (
    <div className="w-full relative pb-20">
      {/* Hidden file input for ZIP uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* HERO SECTION: ReactBits-inspired with Interactive Three.js 3D Background */}
      <section className="relative pt-8 sm:pt-14 pb-20 overflow-hidden">
        {/* Three.js 3D Interactive AST Particle Canvas */}
        <ThreeHeroNetwork />

        {/* Ambient Radial Gradient Overlays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-[#ccff00]/10 via-[#22c55e]/8 to-[#10b981]/10 blur-[130px] pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* React Bits Interactive ParticleText Headline */}
          <div className="relative w-full max-w-4xl mx-auto -mt-2 mb-4 select-none">
            <div className="w-full h-[180px] sm:h-[220px] md:h-[250px] relative flex items-center justify-center">
              <ParticleText
                text="Codebase Doctor"
                particleSize={2.4}
                density={3}
                color="#ffffff"
                highlightColor="#ccff00"
                scatter={140}
                gatherDuration={1200}
                stagger={300}
                pointerRepel={25}
                repelRadius={80}
                idleDrift={0.5}
                trigger="mount"
                fontSize="clamp(2.8rem, 8vw, 5.8rem)"
                fontWeight={800}
                fontFamily="'Space Grotesk', -apple-system, sans-serif"
                glow={true}
              />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed mb-8 sm:mb-10 px-2">
            Automated whole-repo diagnostics &amp; unified git diff healing. Ingest multi-file repositories in a single pass without breaking call chains, trace zero-day vulnerabilities across 6 diagnostic pillars, and generate ready-to-apply <code className="text-zinc-200 font-mono text-xs sm:text-sm bg-white/5 px-1.5 py-0.5 rounded border border-white/10">.patch</code> diff files.
          </p>

          {/* Clean Dedicated Search & Action Container */}
          <div className="max-w-2xl mx-auto space-y-4">
            <form
              onSubmit={handleSubmitUrl}
              className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0d0f17]/90 backdrop-blur-xl rounded-2xl p-2 border border-white/15 focus-within:border-[#ccff00]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all gap-2 sm:gap-0"
            >
              <div className="flex-1 flex items-center pl-3 pr-2 text-zinc-400 min-w-0">
                <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-2" />
                <input
                  id="repo-search-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter public GitHub repo URL (e.g. expressjs/express)..."
                  className="w-full bg-transparent text-white placeholder:text-zinc-500 text-xs sm:text-sm font-sans focus:outline-none py-2"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-md hover:shadow-[#ccff00]/30 active:scale-95 shrink-0"
              >
                <span>Diagnose Repo</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>

            {/* Sub-actions: Upload ZIP & Preloaded Demos */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs font-mono">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 text-[11px] sm:text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>Upload .ZIP Archive</span>
              </button>

              <button
                onClick={() => onSelectDemo('vulnerable-node-api')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#ccff00]/15 hover:border-[#ccff00]/40 border border-white/10 text-zinc-300 hover:text-[#ccff00] transition-all cursor-pointer active:scale-95 text-[11px] sm:text-xs"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Demo 1: Node API</span>
              </button>

              <button
                onClick={() => onSelectDemo('insecure-python-app')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#ffd600]/15 hover:border-[#ffd600]/40 border border-white/10 text-zinc-300 hover:text-[#ffd600] transition-all cursor-pointer active:scale-95 text-[11px] sm:text-xs"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Demo 2: Python App</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Drag & Drop Target Overlay */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-xl ${
          isDragging ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
      >
        <div className="w-full max-w-xl p-8 sm:p-12 rounded-3xl border-2 border-dashed border-[#ccff00] bg-[#11131a] text-center shadow-2xl">
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-[#ccff00] mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl sm:text-2xl font-sans font-bold text-white mb-2 tracking-tight">
            Drop Repository ZIP Archive
          </h3>
          <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
            AI Codebase Doctor will unpack the archive, strip vendor files, and stream the AST to the diagnostic engine.
          </p>
        </div>
      </div>

      {/* REACT BITS ACCORDION GALLERY: Real Code Previews & Interactive Diagnostic Suites */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16" id="demos">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-3 border-b border-white/[0.08] gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
              Prepackaged Diagnostic Suites
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 font-semibold">
              Live Hackathon Codebases
            </span>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('pillars');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-[#ccff00] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>The 6 Pillars</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Interactive React Bits AccordionGallery */}
        <AccordionGallery
          items={suiteItems}
          defaultIndex={0}
          expandRatio={0.52}
          trigger="hover"
          accentColor="#ccff00"
          overlayColor="#090a0d"
          textColor="#ffffff"
          height={490}
          gap={14}
          radius={20}
          tilt={6}
          parallax={0.4}
        />
      </section>

      {/* THE 6 DIAGNOSTIC PILLARS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12" id="pillars">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0d14] border border-white/[0.08] relative overflow-hidden">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ccff00] font-bold block mb-2">
              AUDIT CRITERIA &amp; ARCHITECTURAL BENCHMARKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight mb-2">
              The 6 Diagnostic Pillars of Codebase Health
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              Unlike narrow linting tools that operate on isolated files, the Whole-Repo Engine ingests entire multi-file codebases in a single pass to evaluate deep architectural dependencies and security cross-flows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                title: 'Security Vulnerabilities',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Detects SQL injection, Remote Code Execution (RCE), XSS, hardcoded JWT secrets, and prototype pollution.',
                color: 'text-rose-400',
              },
              {
                icon: Zap,
                title: 'Performance Anti-Patterns',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Uncovers N+1 database queries, blocking synchronous I/O in async event loops, and quadratic memory leaks.',
                color: 'text-amber-400',
              },
              {
                icon: Database,
                title: 'Dependencies & CVEs',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Audits dependency manifests against known CVE disclosures, deprecated packages, and unpinned wildcard versions.',
                color: 'text-orange-400',
              },
              {
                icon: FileCode2,
                title: 'Code Quality & Hygiene',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Identifies silent error swallowing (empty catch blocks), unhandled rejections, dead code paths, and missing type safety.',
                color: 'text-emerald-400',
              },
              {
                icon: FolderGit2,
                title: 'Architecture & Design',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Discovers God classes, circular imports, tight coupling, and business logic mixed into HTTP controller handlers.',
                color: 'text-cyan-400',
              },
              {
                icon: GitPullRequest,
                title: 'Missing Critical Tests',
                badge: '🔴 🟠 🟢 Indicator',
                desc: 'Flags untested business-critical execution paths, missing integration test suites, and absent mock strategies.',
                color: 'text-purple-400',
              },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-sans font-bold text-white mb-1.5">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

