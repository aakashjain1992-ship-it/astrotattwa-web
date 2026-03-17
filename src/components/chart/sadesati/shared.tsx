'use client';

/**
 * Sade Sati — Shared Components & Helpers
 *
 * Extracted from SadeSatiTableView.tsx so both SadeSatiTableView
 * and PeriodDetailView can import without duplication.
 *
 * @file shared.tsx
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StrengthAssessment } from '@/lib/astrology/sadesati/strengthAnalyzer';

// ─── Date helpers ──────────────────────────────────────────────────────────────

export const toDate = (d: any): Date => (d instanceof Date ? d : new Date(d));

/** "Jan 2046" */
export const fmt = (d: any) =>
  toDate(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

/** "Dec 8, 2046" */
export const fmtFull = (d: any) =>
  toDate(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

/** "Dec 8, 2046" (alias kept for compatibility) */
export const fmtDMY = fmtFull;

/** "Dec 8, 2046 – Mar 6, 2049" */
export function fmtPass(
  pass: { start: Date | string; end: Date | string } | undefined,
): string {
  if (!pass) return '—';
  return `${fmtDMY(pass.start)} – ${fmtDMY(pass.end)}`;
}

/** Integer age in years at date d relative to birthDate */
export const age = (d: any, birth: Date) =>
  Math.floor((toDate(d).getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

// ─── Date reviver ──────────────────────────────────────────────────────────────

const DATE_KEYS = new Set([
  'startDate', 'endDate', 'calculatedAt',
  'start', 'end', 'exitDate', 'entryDate',
]);

/**
 * Recursively convert ISO date strings back to Date objects.
 * Used after JSON.parse on API responses.
 */
export function convertDates(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(convertDates);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (DATE_KEYS.has(key)) {
        result[key] = typeof value === 'string' ? new Date(value) : value;
      } else if (typeof value === 'object') {
        result[key] = convertDates(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Result text and color class per event type — used in timeline table */
export const TRANSIT_RESULTS: Record<string, {
  result: string;
  resultClass: string;
  area: string;
}> = {
  ss_rising:  { result: 'Mixed',       resultClass: 'text-amber-600',   area: 'Expenses & enemies' },
  ss_peak:    { result: 'Challenging', resultClass: 'text-red-600',     area: 'Health & finances' },
  ss_setting: { result: 'Fair',        resultClass: 'text-amber-600',   area: 'Family & stability' },
  dhaiya_4th: { result: 'Good',        resultClass: 'text-emerald-600', area: 'Career & profession' },
  dhaiya_8th: { result: 'Difficult',   resultClass: 'text-red-600',     area: 'Wealth & obstacles' },
};

export const CYCLE_LABELS: Record<number, string> = {
  1: 'First Cycle:',
  2: 'Second Cycle:',
  3: 'Third Cycle:',
};

/** Intensity string → Tailwind classes for the inline text label */
export const INTENSITY_TEXT_CLASS: Record<string, string> = {
  very_intense: 'text-destructive',
  intense:      'text-destructive',
  moderate:     'text-amber-600 dark:text-amber-400',
  mild:         'text-muted-foreground',
  very_mild:    'text-muted-foreground',
};

const STRENGTH_TEXT_CLASS: Record<string, string> = {
  strong:   'text-emerald-600 dark:text-emerald-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  weak:     'text-destructive',
};

const DIGNITY_LABEL: Record<string, string> = {
  exalted:     'Exalted ↑',
  own_sign:    'Own sign',
  friendly:    'Friendly',
  neutral:     'Neutral',
  enemy:       'Enemy',
  debilitated: 'Debilitated ↓',
};

// ─── Section (collapsible) ─────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Section({ title, subtitle, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {subtitle && (
            <span className="ml-2 text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ─── InfoRow ───────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

export function InfoRow({ label, value, valueClass }: InfoRowProps) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn('text-sm font-medium text-right', valueClass)}>{value}</span>
    </div>
  );
}

// ─── StrengthCard ──────────────────────────────────────────────────────────────

export function StrengthCard({ data }: { data: StrengthAssessment }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card mb-2">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground">
              {data.planet === 'Moon' ? '☽' : '♄'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{data.planet}</span>
              <span className={cn('text-xs font-semibold capitalize', STRENGTH_TEXT_CLASS[data.overallStrength])}>
                {data.overallStrength}
              </span>
              {data.isYogakaraka && (
                <span className="text-xs px-1.5 py-0 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium">
                  Yogakaraka
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {DIGNITY_LABEL[data.dignity] ?? data.dignity}
              {' · '}House {data.housePosition}
              {data.planet === 'Moon' && ` · ${data.isPakshaBala ? 'Waxing' : 'Waning'}`}
            </p>
          </div>
        </div>
        {data.recommendations.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="text-xs text-primary hover:underline flex-shrink-0"
          >
            {open ? 'Less' : 'Details'}
          </button>
        )}
      </div>
      {open && data.recommendations.length > 0 && (
        <div className="px-3 pb-3 border-t border-border pt-2">
          <ul className="space-y-1">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
