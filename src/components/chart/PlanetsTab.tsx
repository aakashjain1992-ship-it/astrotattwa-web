'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assessAllPlanets } from '@/lib/astrology/strength';
import type {
  PlanetStrengthResult, StructuralGrade, FunctionalNature,
  FunctionalLean, ConditionGrade, DeliveryGrade, ConflictFlag,
  DignityLevel, Domain, ConfidenceGrade,
} from '@/lib/astrology/strength';
import type { PlanetData, AscendantData } from '@/types/astrology';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanetsTabProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dashaContext?: { currentMahadasha?: string; currentAntardasha?: string; currentPratyantar?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const GLYPH: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const PLANET_HUE: Record<string, string> = {
  Sun:'amber', Moon:'blue', Mars:'red', Mercury:'green',
  Jupiter:'orange', Venus:'pink', Saturn:'purple', Rahu:'slate', Ketu:'slate',
};

// ─── Label helpers ────────────────────────────────────────────────────────────

const STR_LABELS: Record<StructuralGrade, string> = {
  very_strong:'Very strong', strong:'Strong', moderate:'Moderate',
  weak:'Weak', very_weak:'Very weak',
};
const FN_LABELS: Record<FunctionalNature, string> = {
  yogakaraka:'Yogakaraka', strong_benefic:'Strong benefic', benefic:'Benefic',
  mixed:'Mixed', neutral:'Neutral', malefic:'Challenging',
};
const COND_LABELS: Record<ConditionGrade, string> = {
  supported:'Supported', clean:'Clean', afflicted:'Afflicted',
  heavily_afflicted:'Heavy affliction', distorted:'Distorted',
};
const DELIV_LABELS: Record<DeliveryGrade, string> = {
  reliable:'Reliable', delayed:'Delayed', inconsistent:'Inconsistent',
  obstructed:'Obstructed', distorted_delivery:'Distorted',
};
const CONF_LABELS: Record<ConfidenceGrade, string> = { high:'High', moderate:'Moderate', low:'Low' };

function dignityShort(l: DignityLevel): string {
  return { exalted:'Exalted', moolatrikona:'Moolatrikona', own_sign:'Own sign',
           great_friend:'Gr.friend', friend:'Friendly', neutral:'Neutral',
           enemy:'Enemy', great_enemy:'Gr.enemy', debilitated:'Debilitated' }[l];
}

function fnLabelWithLean(fn: FunctionalNature, lean: FunctionalLean): string {
  if (fn !== 'mixed') return FN_LABELS[fn];
  const lean_labels: Record<FunctionalLean, string> = {
    benefic_lean:'Mixed (benefic lean)', neutral_lean:'Mixed (neutral)',
    malefic_lean:'Mixed (malefic lean)', maraka_driven:'Mixed (maraka)',
    protective_with_complication:'Mixed (protective)',
  };
  return lean_labels[lean];
}

// ─── Chips & Badges ──────────────────────────────────────────────────────────

function StrengthChip({ grade }: { grade: StructuralGrade }) {
  const s: Record<StructuralGrade, string> = {
    very_strong:'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    strong:     'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    moderate:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    weak:       'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    very_weak:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };
  return <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border',s[grade])}>{STR_LABELS[grade]}</span>;
}

function FnChip({ fn, lean, isMaraka }: { fn: FunctionalNature; lean: FunctionalLean; isMaraka?: boolean }) {
  const s: Record<FunctionalNature, string> = {
    yogakaraka:   'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
    strong_benefic:'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    benefic:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
    mixed:        lean === 'malefic_lean' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300'
                : lean === 'benefic_lean' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    neutral:      'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
    malefic:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };
  return (
    <span className={cn('inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border',s[fn])}>
      {fnLabelWithLean(fn, lean)}{isMaraka && <span className="opacity-50 text-[9px] ml-0.5">M</span>}
    </span>
  );
}

function CondBadge({ grade }: { grade: ConditionGrade }) {
  const s: Record<ConditionGrade, string> = {
    supported:'text-blue-600 dark:text-blue-400', clean:'text-green-600 dark:text-green-400',
    afflicted:'text-amber-600 dark:text-amber-400', heavily_afflicted:'text-red-600 dark:text-red-400',
    distorted:'text-red-700 font-semibold dark:text-red-300',
  };
  return <span className={cn('text-[11px] font-medium',s[grade])}>{COND_LABELS[grade]}</span>;
}

function DelivBadge({ grade }: { grade: DeliveryGrade }) {
  const s: Record<DeliveryGrade, string> = {
    reliable:'text-green-600 dark:text-green-400', delayed:'text-amber-600 dark:text-amber-400',
    inconsistent:'text-amber-500 dark:text-amber-400', obstructed:'text-red-600 dark:text-red-400',
    distorted_delivery:'text-orange-700 dark:text-orange-400',
  };
  return <span className={cn('text-[11px]',s[grade])}>{DELIV_LABELS[grade]}</span>;
}

function ConfBadge({ grade }: { grade: ConfidenceGrade }) {
  const s: Record<ConfidenceGrade, string> = {
    high:'text-green-600 dark:text-green-400', moderate:'text-amber-500 dark:text-amber-400',
    low:'text-red-500 dark:text-red-400',
  };
  return <span className={cn('text-[10px] font-medium', s[grade])}>{CONF_LABELS[grade]} confidence</span>;
}

function ConflictBadge({ flag }: { flag: ConflictFlag }) {
  const labels: Record<ConflictFlag, string> = {
    strong_afflicted:'Strong but afflicted', weak_protected:'Weak but protected',
    strong_but_malefic:'Strong malefic', benefic_but_weak:'Benefic but weak',
    strong_d1_weak_d9:'D9 contradicts', weak_d1_strong_d9:'Matures over time',
    strong_general_weak_domain:'Delivery issue', weak_general_strong_domain:'Domain strength',
    powerful_maraka:'Powerful maraka', node_dominated:'Node dominated',
    saturn_dominated:'Saturn dominated', mars_dominated:'Mars dominated',
    combust_but_supported:'Combust+supported', retrograde_internalized:'Retrograde',
    weak_afflicted:'Double weakness',
  };
  return (
    <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800">
      {labels[flag]}
    </span>
  );
}

function DomainTag({ domain, type }: { domain: Domain; type: 'strong'|'mixed'|'weak' }) {
  const s = { strong:'bg-green-50 text-green-700 border-green-200', mixed:'bg-amber-50 text-amber-700 border-amber-200', weak:'bg-red-50 text-red-700 border-red-200' };
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full border',s[type])}>{domain}</span>;
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <span key={i} className={cn('text-[11px]', i<=count?'text-amber-500':'text-muted/40')}>★</span>)}
    </div>
  );
}

function strGradeStars(g: StructuralGrade): number {
  return { very_strong:5, strong:4, moderate:3, weak:2, very_weak:1 }[g];
}

// ─── Section collapsible ─────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40 hover:bg-muted/60 transition-colors">
        {title}
        {open ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
      </button>
      {open && <div className="px-3 py-3 text-[12px] space-y-1.5">{children}</div>}
    </div>
  );
}

// ─── Mode toggle ─────────────────────────────────────────────────────────────

type Mode = 'explore' | 'analyst';

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1 border border-border">
      {(['explore','analyst'] as Mode[]).map(m => (
        <button key={m} onClick={() => onChange(m)}
          className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all capitalize',
            mode===m ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground')}>
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Explore Mode: Planet Card ────────────────────────────────────────────────

function PlanetCard({ r, pd, isSelected, onSelect }: {
  r: PlanetStrengthResult; pd: PlanetData; isSelected: boolean; onSelect: () => void;
}) {
  const hue = PLANET_HUE[r.planet] ?? 'slate';
  const isDasha = r.temporalActivation.dashaBoostApplied;
  return (
    <button type="button" onClick={onSelect}
      className={cn('w-full text-left p-4 rounded-xl border transition-all bg-card',
        isSelected ? 'border-primary/60 shadow ring-1 ring-primary/20' : 'border-border hover:border-primary/30')}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0',
          `bg-${hue}-50 dark:bg-${hue}-950/40 text-${hue}-700 dark:text-${hue}-300`)}>
          {GLYPH[r.planet]??'?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{r.planet}</span>
            {isDasha && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">DASHA</span>}
          </div>
          <div className="text-[11px] text-muted-foreground">{pd.sign} {pd.degreeInSign.toFixed(1)}° · H{r.housePosition}</div>
        </div>
      </div>
      <div className="space-y-1.5 mb-3">
        <StarRow count={strGradeStars(r.structuralGrade)} />
        <FnChip fn={r.functionalNature} lean={r.functionalLean} isMaraka={r.isMarakaCapable} />
      </div>
      <div className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
        {/* First sentence of analyst note */}
        {r.analystNote.split('.')[0]}.
      </div>
      {r.conflictFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {r.conflictFlags.slice(0,2).map(f => <ConflictBadge key={f} flag={f}/>)}
          {r.conflictFlags.length > 2 && <span className="text-[10px] text-muted-foreground">+{r.conflictFlags.length-2}</span>}
        </div>
      )}
    </button>
  );
}

// ─── Explore Mode: Full Detail Panel ─────────────────────────────────────────

function ExploreDetail({ r, onClose }: { r: PlanetStrengthResult; onClose: () => void }) {
  return (
    <div className="col-span-full border border-primary/30 rounded-xl bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold">{r.planet}</span>
          <ConfBadge grade={r.assessmentConfidence}/>
          {r.temporalActivation.dashaBoostApplied && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">DASHA ACTIVE</span>
          )}
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">close ×</button>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label:'Structural', value:<StrengthChip grade={r.structuralGrade}/> },
          { label:'Functional', value:<FnChip fn={r.functionalNature} lean={r.functionalLean} isMaraka={r.isMarakaCapable}/> },
          { label:'Condition', value:<CondBadge grade={r.conditionGrade}/> },
          { label:'Delivery', value:<DelivBadge grade={r.deliveryGrade}/> },
        ].map(({label, value}) => (
          <div key={label} className="bg-muted/40 rounded-lg border border-border p-2.5">
            <div className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>
            {value}
          </div>
        ))}
      </div>

      {/* Analyst note */}
      <div className="bg-muted/30 rounded-lg border border-border px-4 py-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Assessment</div>
        <p className="text-[12px] leading-relaxed text-foreground">{r.analystNote}</p>
      </div>

      {/* Key reasons */}
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Key reasons</div>
        <div className="space-y-1.5">
          {r.keyReasons.map((kr,i) => (
            <div key={i} className="flex gap-2.5 text-[12px] leading-relaxed">
              <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                kr.sentiment==='positive'?'bg-green-500':kr.sentiment==='negative'?'bg-red-500':'bg-slate-400')}/>
              <span>{kr.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict flags */}
      {r.conflictFlags.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Contradictions</div>
          <div className="flex flex-wrap gap-1.5">
            {r.conflictFlags.map(f => <ConflictBadge key={f} flag={f}/>)}
          </div>
        </div>
      )}

      {/* Varga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="Varga Validation">
          <div className="text-muted-foreground">{r.vargaAssessment.note}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border',
              r.vargaAssessment.d9Confirms ? 'bg-green-50 text-green-700 border-green-200' :
              r.vargaAssessment.d9Contradicts ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-muted text-muted-foreground border-border')}>
              D9: {dignityShort(r.vargaAssessment.d9DignityLevel)}
            </span>
            {r.vargaAssessment.hasD9SecondPass && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">D9 extra weight</span>
            )}
          </div>
        </Section>
        <Section title="Nakshatra">
          <div>Star lord: <span className="font-medium">{r.nakshatraInfluence.starLordName}</span> ({r.nakshatraInfluence.starLordStructuralScore}/100)</div>
          <div>Sub lord: <span className="font-medium">{r.nakshatraInfluence.subLordName}</span> ({r.nakshatraInfluence.subLordStructuralScore}/100)</div>
          <div className="text-muted-foreground mt-1">{r.nakshatraInfluence.nakshatraNotes}</div>
        </Section>
      </div>

      {/* Agenda */}
      <Section title="Agenda & Style">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Themes</div>
            <div className="flex flex-wrap gap-1">
              {r.agendaThemes.slice(0,6).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{t}</span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div><span className="text-[10px] text-muted-foreground">Style: </span><span className="text-[11px]">{r.deliveryStyle.replace(/_/g,' ')}</span></div>
            <div><span className="text-[10px] text-muted-foreground">Tone: </span><span className="text-[11px]">{r.psychologicalTone}</span></div>
          </div>
        </div>
      </Section>

      {/* Domains */}
      <Section title="Domain Assessment" defaultOpen={true}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-3 w-3 text-amber-500"/>
          <span className="text-[10px] text-amber-600">Preliminary — topic-specific vargas (D10, D7, D4) applied where available</span>
        </div>
        <div className="space-y-2">
          {r.strongDomains.length > 0 && (
            <div><span className="text-[10px] text-muted-foreground mr-2">Strong:</span>
              {r.strongDomains.map(d => <DomainTag key={d} domain={d} type="strong"/>)}</div>
          )}
          {r.mixedDomains.length > 0 && (
            <div><span className="text-[10px] text-muted-foreground mr-2">Mixed:</span>
              {r.mixedDomains.map(d => <DomainTag key={d} domain={d} type="mixed"/>)}</div>
          )}
          {r.weakDomains.length > 0 && (
            <div><span className="text-[10px] text-muted-foreground mr-2">Difficult:</span>
              {r.weakDomains.map(d => <DomainTag key={d} domain={d} type="weak"/>)}</div>
          )}
        </div>
      </Section>

      {/* Node inheritance (Rahu/Ketu only) */}
      {r.nodeInheritance && (
        <Section title="Node Inheritance Model">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Dispositor', r.nodeInheritance.dispositorName, r.nodeInheritance.dispositorStructuralScore],
              ['Nakshatra lord', r.nodeInheritance.nakshatraLordName, r.nodeInheritance.nakshatraLordScore],
              ...(r.nodeInheritance.conjunctionPartner ? [['Conjunction', r.nodeInheritance.conjunctionPartner, r.nodeInheritance.conjunctionPartnerScore ?? 45]] : []),
              ['Inherited support', '', r.nodeInheritance.inheritedSupportScore],
            ].map(([label, name, score]) => (
              <div key={String(label)} className="flex justify-between text-[11px] border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{label}{name ? ` (${name})` : ''}</span>
                <span className="font-medium">{score}/100</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 flex-wrap">
            {[
              ['Amplification', r.nodeInheritance.amplificationTendency],
              ['Distortion', r.nodeInheritance.distortionTendency],
              ['Obsession', r.nodeInheritance.obsessionTendency],
              ['Spiritualization', r.nodeInheritance.spiritualizationTendency],
            ].map(([label, val]) => (
              <div key={String(label)} className="text-[10px]">
                <span className="text-muted-foreground">{label}: </span>
                <span className="font-medium">{Math.round(Number(val)*100)}%</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dominant overrides */}
      {r.dominantOverrideApplied && r.overrideImpactNotes.length > 0 && (
        <Section title="Dominant Overrides">
          {r.overrideImpactNotes.map((n,i) => <div key={i} className="text-muted-foreground">⚑ {n}</div>)}
        </Section>
      )}

      {/* Delivery breakdown */}
      <Section title="Delivery Score Breakdown">
        <div className="space-y-1">
          {r.deliveryReasons.map((dr,i) => (
            <div key={i} className={cn('text-muted-foreground', i===r.deliveryReasons.length-1 && 'font-semibold text-foreground')}>{dr}</div>
          ))}
        </div>
      </Section>

      {/* Importance */}
      <div className="flex items-center justify-between text-[11px] bg-muted/30 rounded-lg px-3 py-2 border border-border">
        <span className="text-muted-foreground">Natal priority rank</span>
        <span className="font-semibold">#{r.natalPriorityRank}</span>
        <span className="text-muted-foreground">Current rank</span>
        <span className="font-semibold">#{r.currentPriorityRank}</span>
        <span className="text-muted-foreground">Importance weight</span>
        <span className="font-semibold">{r.importanceWeight}</span>
      </div>
    </div>
  );
}

// ─── Analyst Mode: Table ──────────────────────────────────────────────────────

function AnalystTable({ results, planets, ascendant }: {
  results: Record<string, PlanetStrengthResult>;
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
}) {
  const [expanded, setExpanded] = useState<string|null>(null);
  const toggle = (n: string) => setExpanded(p => p === n ? null : n);
  const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  return (
    <div>
      <div className="mb-3 px-3 py-2 text-[11px] text-muted-foreground bg-muted rounded-md border border-border flex items-center gap-2">
        <Info className="h-3 w-3 flex-shrink-0"/>
        <span><span className="font-medium">{ascendant.sign} lagna</span> · Lahiri · Swiss Ephemeris · 14-layer spec-compliant engine · Click row to expand</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              {['Planet','Position','Dignity','Structural','Functional','Condition','Delivery','D9','Rank','Conflicts'].map(h => (
                <th key={h} className="text-left px-2.5 py-2 font-medium text-muted-foreground uppercase tracking-wide text-[9px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANET_ORDER.map(name => {
              const r = results[name]; const pd = planets[name] as PlanetData|undefined;
              if (!r||!pd) return null;
              const isExp = expanded === name;
              const d9Name = SIGN_NAMES[r.vargaAssessment.d9SignNumber - 1] ?? '?';
              const isVarg = r.vargaAssessment.d9SignNumber === pd.signNumber;
              const isDasha = r.temporalActivation.dashaBoostApplied;
              return [
                <tr key={name} onClick={() => toggle(name)}
                  className={cn('border-b border-border cursor-pointer transition-colors',
                    isExp ? 'bg-muted/50' : 'hover:bg-muted/30')}>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{GLYPH[name]}</span>
                      <span className="font-semibold">{name}</span>
                      {isDasha && <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary font-bold">●</span>}
                      {isExp ? <ChevronUp className="h-3 w-3 text-muted-foreground ml-auto"/> : <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto"/>}
                    </div>
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="font-mono text-[10px]">{pd.sign} {pd.degreeInSign.toFixed(1)}°</div>
                    <div className="text-[9px] text-muted-foreground">{pd.kp.nakshatraName} P{pd.kp.nakshatraPada}</div>
                  </td>
                  <td className="px-2.5 py-2 text-[10px] text-muted-foreground">{dignityShort(r.dignityLevel)}</td>
                  <td className="px-2.5 py-2"><StrengthChip grade={r.structuralGrade}/></td>
                  <td className="px-2.5 py-2"><FnChip fn={r.functionalNature} lean={r.functionalLean} isMaraka={r.isMarakaCapable}/></td>
                  <td className="px-2.5 py-2"><CondBadge grade={r.conditionGrade}/></td>
                  <td className="px-2.5 py-2">
                    <DelivBadge grade={r.deliveryGrade}/>
                    <div className="text-[9px] text-muted-foreground">{r.deliveryScore}/100</div>
                  </td>
                  <td className="px-2.5 py-2 text-[10px] text-muted-foreground">
                    {d9Name}{isVarg?' ★':''}{r.vargaAssessment.hasD9SecondPass?' ✦':''}
                  </td>
                  <td className="px-2.5 py-2 text-[10px] font-medium">
                    <span className="text-muted-foreground">#{r.natalPriorityRank}</span>
                    {isDasha && <span className="text-primary ml-1">→#{r.currentPriorityRank}</span>}
                  </td>
                  <td className="px-2.5 py-2">
                    {r.conflictFlags.length > 0
                      ? <span className="text-[10px] text-orange-600">⚑ {r.conflictFlags.length}</span>
                      : <span className="text-muted-foreground text-[10px]">—</span>}
                  </td>
                </tr>,

                isExp && (
                  <tr key={`${name}-exp`} className="bg-muted/20 border-b border-border">
                    <td colSpan={10} className="px-3 py-4">
                      {/* Analyst note */}
                      <div className="mb-3 px-3 py-2.5 bg-card rounded-lg border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 font-medium">Full Assessment</div>
                        <p className="text-[11px] leading-relaxed">{r.analystNote}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Column 1: Technical */}
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Technical Factors</div>
                          <div className="space-y-0.5">
                            {([
                              ['Houses ruled', r.housesRuled.join(', ')],
                              ['House position', `${r.housePosition}${ord(r.housePosition)} from lagna`],
                              ['Structural score', `${r.structuralScore}/100`],
                              ['Delivery score', `${r.deliveryScore}/100`],
                              ['Condition score', String(r.conditionScore)],
                              ['Varga status', r.vargaAssessment.vargaStatus],
                              ['D9 confidence', r.vargaAssessment.vargaConfidence],
                              ['Star lord', `${r.nakshatraInfluence.starLordName} (${r.nakshatraInfluence.starLordStructuralScore})`],
                              ['Sub lord', `${r.nakshatraInfluence.subLordName} (${r.nakshatraInfluence.subLordStructuralScore})`],
                              ['Nakshatra mod', `${r.nakshatraInfluence.nakshatraDeliveryModifier > 0 ? '+' : ''}${r.nakshatraInfluence.nakshatraDeliveryModifier}`],
                              ['Retrograde', r.isRetrograde ? 'Yes' : 'No'],
                              ['Combust', r.isCombust ? 'Yes' : 'No'],
                              ['Maraka', r.isMarakaCapable ? 'Yes' : 'No'],
                              ['Importance weight', String(r.importanceWeight)],
                              ...(r.isPakshaBala !== undefined ? [['Paksha Bala', r.isPakshaBala ? 'Waxing' : 'Waning']] : []),
                              ...(r.neechaBhanga.isApplied ? [['Neecha Bhanga', r.neechaBhanga.rule ?? 'Applied']] : []),
                              ...(r.temporalActivation.dashaBoostApplied ? [['Dasha activation', r.temporalActivation.currentActivationReason.split(' — ')[0]]] : []),
                            ] as [string,string][]).map(([k,v]) => (
                              <div key={k} className="flex justify-between text-[11px] py-0.5 border-b border-border/40 last:border-0">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-medium text-right ml-2 max-w-[120px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Reasons & Flags */}
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Key Reasons</div>
                          <div className="space-y-1.5 mb-3">
                            {r.keyReasons.map((kr,i) => (
                              <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                                <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                                  kr.sentiment==='positive'?'bg-green-500':kr.sentiment==='negative'?'bg-red-400':'bg-slate-400')}/>
                                <span>{kr.text}</span>
                              </div>
                            ))}
                          </div>
                          {r.conflictFlags.length > 0 && (
                            <>
                              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Conflict Flags</div>
                              <div className="flex flex-wrap gap-1">
                                {r.conflictFlags.map(f => <ConflictBadge key={f} flag={f}/>)}
                              </div>
                            </>
                          )}
                          {r.dominantOverrideApplied && (
                            <div className="mt-2">
                              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Dominant Overrides</div>
                              {r.overrideImpactNotes.map((n,i) => <div key={i} className="text-[11px] text-muted-foreground">⚑ {n}</div>)}
                            </div>
                          )}
                        </div>

                        {/* Column 3: Domains & Agenda */}
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Domains</div>
                          <div className="space-y-1.5 mb-3">
                            {r.strongDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] text-muted-foreground self-center">Strong:</span>
                                {r.strongDomains.map(d => <DomainTag key={d} domain={d} type="strong"/>)}
                              </div>
                            )}
                            {r.mixedDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] text-muted-foreground self-center">Mixed:</span>
                                {r.mixedDomains.map(d => <DomainTag key={d} domain={d} type="mixed"/>)}
                              </div>
                            )}
                            {r.weakDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] text-muted-foreground self-center">Difficult:</span>
                                {r.weakDomains.map(d => <DomainTag key={d} domain={d} type="weak"/>)}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Agenda</div>
                          <div className="text-[11px] text-muted-foreground">{r.psychologicalTone}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{r.deliveryStyle.replace(/_/g,' ')}</div>
                          {r.nodeInheritance && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="text-[10px] font-medium text-muted-foreground mb-1">Node: {r.nodeInheritance.dispositorName} → {r.nodeInheritance.inheritedSupportScore}/100</div>
                              <div className="text-[10px] text-muted-foreground">Amp: {Math.round(r.nodeInheritance.amplificationTendency*100)}% · Distortion: {Math.round(r.nodeInheritance.distortionTendency*100)}%</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery breakdown */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mr-2">Delivery:</span>
                        <span className="text-[11px] text-muted-foreground">{r.deliveryReasons.join(' · ')}</span>
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PlanetsTab({ planets, ascendant, dashaContext }: PlanetsTabProps) {
  const [mode, setMode] = useState<Mode>('explore');
  const [selected, setSelected] = useState<string|null>(null);

  const results = useMemo(() => {
    try { return assessAllPlanets({ planets, ascendant, dashaContext }); }
    catch { return {} as Record<string, PlanetStrengthResult>; }
  }, [planets, ascendant, dashaContext]);

  // Build inline list with detail panels interspersed
  type Item = { type: 'card'; name: string } | { type: 'detail'; name: string };
  const items: Item[] = [];
  PLANET_ORDER.forEach(n => {
    items.push({ type:'card', name:n });
    if (selected === n) items.push({ type:'detail', name:n });
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Planetary Strength</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {ascendant.sign} lagna · 14-layer practitioner-grade assessment
          </p>
        </div>
        <ModeToggle mode={mode} onChange={m => { setMode(m); setSelected(null); }}/>
      </div>

      {mode === 'explore' && (
        <div>
          <div className="text-[11px] text-muted-foreground mb-4 px-3 py-2 bg-muted rounded-md border border-border flex items-start gap-2">
            <Activity className="h-3 w-3 mt-0.5 flex-shrink-0"/>
            <span>Each planet is assessed across 14 layers. The same planet can be your strongest ally or biggest challenge depending on your lagna. Click any card to expand the full assessment.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(item => {
              if (item.type === 'detail') {
                const r = results[item.name];
                if (!r) return null;
                return (
                  <div key={`d-${item.name}`} className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <ExploreDetail r={r} onClose={() => setSelected(null)}/>
                  </div>
                );
              }
              const r = results[item.name];
              const pd = planets[item.name] as PlanetData | undefined;
              if (!r || !pd) return null;
              return (
                <PlanetCard key={item.name} r={r} pd={pd}
                  isSelected={selected === item.name}
                  onSelect={() => setSelected(p => p === item.name ? null : item.name)}/>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'analyst' && (
        <AnalystTable results={results} planets={planets} ascendant={ascendant}/>
      )}
    </div>
  );
}

function ord(n: number): string { return n===1?'st':n===2?'nd':n===3?'rd':'th'; }
