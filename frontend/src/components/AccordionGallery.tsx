import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import './AccordionGallery.css';

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  sublabel?: string;
  link?: string;
  alt?: string;
  badge?: string;
  badgeColor?: 'rose' | 'amber' | 'emerald' | 'yellow' | 'lime';
  targetScore?: string;
  langTag?: string;
  description?: string;
  tags?: string[];
  snippet?: {
    file: string;
    tag: string;
    deleted: string;
    added: string;
  };
  callflow?: {
    step1: string;
    step2: string;
  };
  terminal?: {
    comment: string;
    command: string;
    status: string;
  };
  actionText?: string;
  onAction?: () => void;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSelect?: (index: number, item: AccordionGalleryItem) => void;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: '/assets/green_blob.jpg', label: 'Vulnerable Node.js API' },
  { image: '/assets/yellow_wave.jpg', label: 'Insecure Python Microservice' },
  { image: '/assets/glass_capsules.jpg', label: 'Whole-Repo AST Callgraph' },
  { image: '/assets/yellow_torus.jpg', label: 'Git Diff Patch Synthesis' }
];

export const AccordionGallery: React.FC<AccordionGalleryProps> = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  accentColor = '#ccff00',
  overlayColor = '#090a0d',
  textColor = '#ffffff',
  height = 480,
  gap = 12,
  radius = 20,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
  style,
  onSelect
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(420);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];
        const content = contentRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }

        if (content) {
          if (isActive) {
            tl.to(content, { opacity: 1, y: 0, duration: dur, ease }, 0.04);
          } else {
            tl.to(content, { opacity: 0, y: 12, duration: dur * 0.5, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(160, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.25);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleEnter = (i: number) => {
    if (trigger === 'hover' && i !== active) {
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = window.setTimeout(() => {
        setActive(i);
        if (onSelect) onSelect(i, items[i]);
      }, 40);
    }
  };

  const handleClick = (i: number, e: React.MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
      if (onSelect) onSelect(i, items[i]);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (i + 1) % count;
      setActive(next);
      if (onSelect) onSelect(next, items[next]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (i - 1 + count) % count;
      setActive(prev);
      if (onSelect) onSelect(prev, items[prev]);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
        ...style
      } as React.CSSProperties}
      role="list"
      aria-label="Diagnostic Suites Accordion Gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const hasRichContent = !!(item.description || item.snippet || item.terminal || item.callflow);
        const Tag = item.link ? 'a' : 'div';

        return (
          <Tag
            key={i}
            ref={(el: any) => (panelRefs.current[i] = el)}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            {/* Background Media & Ambient Gradient */}
            <span className="ag-panel__frame">
              <span className="ag-panel__media" ref={(el: any) => (mediaRefs.current[i] = el)}>
                <img src={item.image} alt={item.alt || item.label || ''} draggable="false" />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>

            {/* Collapsed Vertical Title & Indicator */}
            <div className="ag-panel__collapsed-indicator" aria-hidden="true">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.badgeColor === 'rose'
                      ? 'bg-rose-500'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-500'
                      : item.badgeColor === 'emerald'
                      ? 'bg-[#10b981]'
                      : 'bg-[#ccff00]'
                  }`}
                />
              </div>
              <span className="ag-panel__vertical-title">{item.label}</span>
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                <span className="text-[10px] font-mono">0{i + 1}</span>
              </div>
            </div>

            {/* Rich Content View when Active/Expanded */}
            {hasRichContent ? (
              <div
                ref={(el: any) => (contentRefs.current[i] = el)}
                className="ag-panel__rich-content"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.badgeColor === 'rose'
                            ? 'bg-rose-500'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-500'
                            : item.badgeColor === 'emerald'
                            ? 'bg-[#10b981]'
                            : 'bg-[#ccff00]'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          item.badgeColor === 'rose'
                            ? 'text-rose-300'
                            : item.badgeColor === 'amber'
                            ? 'text-amber-300'
                            : item.badgeColor === 'emerald'
                            ? 'text-[#4ade80]'
                            : 'text-[#ccff00]'
                        }`}
                      >
                        {item.targetScore || item.badge}
                      </span>
                    </div>
                    {item.langTag && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {item.langTag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-sans font-bold text-white mb-2 leading-snug">
                    {item.label}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}

                  {/* Code Diff Snippet Preview */}
                  {item.snippet && (
                    <div className="rounded-xl bg-black/80 border border-white/[0.1] p-3 font-mono text-[11px] text-zinc-300 overflow-hidden leading-relaxed mb-4 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 pb-1.5 mb-1.5 border-b border-white/[0.08]">
                        <span>{item.snippet.file}</span>
                        <span className="text-rose-400 font-bold">{item.snippet.tag}</span>
                      </div>
                      <div className="text-rose-400 truncate">{item.snippet.deleted}</div>
                      <div className="text-[#22c55e] truncate">{item.snippet.added}</div>
                    </div>
                  )}

                  {/* Callflow AST Flow Preview */}
                  {item.callflow && (
                    <div className="rounded-xl bg-black/80 border border-white/[0.1] p-3 font-mono text-[11px] text-zinc-300 space-y-1.5 mb-4 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                        <span>{item.callflow.step1}</span>
                      </div>
                      <div className="pl-3 border-l border-zinc-700 text-zinc-400 text-[10px]">
                        ↓ passes unsanitized payload
                      </div>
                      <div className="flex items-center gap-2 text-[#4ade80]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        <span>{item.callflow.step2}</span>
                      </div>
                    </div>
                  )}

                  {/* Terminal Command Preview */}
                  {item.terminal && (
                    <div className="rounded-xl bg-black/80 border border-white/[0.1] p-3 font-mono text-[11px] text-zinc-300 space-y-1 mb-4 backdrop-blur-md">
                      <div className="text-zinc-500 text-[10px]">{item.terminal.comment}</div>
                      <div className="text-[#ccff00] truncate">{item.terminal.command}</div>
                      <div className="text-zinc-400 text-[10px]">{item.terminal.status}</div>
                    </div>
                  )}

                  {/* Issue Tags */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-200 text-[10px] font-mono border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="pt-3 border-t border-white/[0.1] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">
                    {item.actionText || '1-Click Diagnosis'}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (item.onAction) item.onAction();
                      else if (item.link) window.location.href = item.link;
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00] hover:bg-[#b8e600] text-black font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <span>Run Scan</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Label for Pure Gallery Mode */
              showLabels && (
                <span className="ag-panel__label" aria-hidden="true">
                  <span className="ag-panel__bar" ref={(el: any) => (barRefs.current[i] = el)} />
                  <span className="ag-panel__text" ref={(el: any) => (textRefs.current[i] = el)}>
                    {item.label}
                  </span>
                </span>
              )
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
