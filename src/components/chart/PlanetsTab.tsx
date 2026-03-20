'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assessAllPlanets } from '@/lib/astrology/strength';
import type {
  PlanetStrengthResult, StructuralGrade, FunctionalNature,
  FunctionalLean, ConditionGrade, DeliveryGrade, ConflictFlag,
  DignityLevel, Domain, ConfidenceGrade,
} from '@/lib/astrology/strength';
import type { PlanetData, AscendantData } from '@/types/astrology';

interface PlanetsTabProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dashaContext?: { currentMahadasha?: string; currentAntardasha?: string; currentPratyantar?: string };
}

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const GLYPH: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

// Soft planet avatar colours — light bg, dark text — works in both modes
const PLANET_AVATAR: Record<string, string> = {
  Sun:     'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Moon:    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Mars:    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Mercury: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Jupiter: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Venus:   'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  Saturn:  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Rahu:    'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Ketu:    'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// ─── Label maps ───────────────────────────────────────────────────────────────

const STR_LABELS: Record<StructuralGrade, string> = {
  very_strong:'Very strong', strong:'Strong', moderate:'Moderate',
  weak:'Weak', very_weak:'Very weak',
};
const COND_LABELS: Record<ConditionGrade, string> = {
  supported:'Supported', clean:'Clean', afflicted:'Afflicted',
  heavily_afflicted:'Heavy affliction', distorted:'Distorted',
};
const DELIV_LABELS: Record<DeliveryGrade, string> = {
  reliable:'Reliable', delayed:'Delayed', inconsistent:'Inconsistent',
  obstructed:'Obstructed', distorted_delivery:'Distorted',
};

function dignityShort(l: DignityLevel): string {
  return {
    exalted:'Exalted', moolatrikona:'Moolatrikona', own_sign:'Own sign',
    great_friend:'Gr. friend', friend:'Friendly', neutral:'Neutral',
    enemy:'Enemy', great_enemy:'Gr. enemy', debilitated:'Debilitated',
  }[l];
}

// Short functional label — no lean in the label text; lean is shown by colour
function fnShort(fn: FunctionalNature): string {
  return {
    yogakaraka:'Yogakaraka', strong_benefic:'Benefic+',
    benefic:'Benefic', mixed:'Mixed',
    neutral:'Neutral', malefic:'Challenging',
  }[fn];
}

// ─── Card summary — SHORT, human-readable, not the analyst note ───────────────
function buildCardSummary(r: PlanetStrengthResult, pd: PlanetData): string {
  const fn   = r.functionalNature;
  const lean = r.functionalLean;
  const sg   = r.structuralGrade;
  const cg   = r.conditionGrade;
  const dg   = r.deliveryGrade;
  const dig  = dignityShort(r.dignityLevel);
  const house = r.housePosition;

  // Build one clear sentence: placement + functional role + key modifier
  const placementStr = `${dig} in ${pd.sign} (${house}${ord(house)} house)`;

  const roleStr: string =
    fn === 'yogakaraka'     ? 'Yogakaraka — rules both kendra and trikona. Best planet for this chart.' :
    fn === 'strong_benefic' ? 'Primary benefic — lagna lord or trikona lord.' :
    fn === 'benefic'        ? 'Kendra lord — stabilises key life areas.' :
    fn === 'malefic'        ? 'Functional malefic — rules difficult houses for this lagna.' :
    fn === 'mixed' && lean === 'benefic_lean'  ? 'Mixed — trikona lordship dominant, leans constructive.' :
    fn === 'mixed' && lean === 'malefic_lean'  ? 'Mixed — dusthana lordship dominant, leans difficult.' :
    fn === 'mixed' && lean === 'maraka_driven' ? 'Mixed — maraka (2nd/7th) houses dominate.' :
    'Neutral — no dominant house coloring.';

  // Pick the most important modifier
  const modifiers: string[] = [];
  if (r.neechaBhanga.isApplied) modifiers.push('Neecha Bhanga applies.');
  if (r.isCombust && r.planet !== 'Sun') modifiers.push('Combust — overshadowed by Sun.');
  if (r.isRetrograde && r.planet !== 'Rahu' && r.planet !== 'Ketu') modifiers.push('Retrograde.');
  if (cg === 'heavily_afflicted' || cg === 'distorted') modifiers.push('Heavily afflicted.');
  else if (cg === 'supported') modifiers.push('Well supported.');
  if (dg === 'obstructed') modifiers.push('Delivery blocked.');
  else if (dg === 'reliable' && fn !== 'malefic') modifiers.push('Delivers reliably.');

  // Node-specific
  if ((r.planet === 'Rahu' || r.planet === 'Ketu') && r.nodeInheritance) {
    const disp = r.nodeInheritance.dispositorName;
    const dispDel = r.nodeInheritance.dispositorDeliveryGrade;
    modifiers.push(`Dispositor ${disp} ${dispDel === 'reliable' ? '(strong)' : dispDel === 'obstructed' ? '(weak)' : '(moderate)'}.`);
  }

  return `${placementStr}. ${roleStr}${modifiers.length ? ' ' + modifiers[0] : ''}`;
}

// ─── Chips ────────────────────────────────────────────────────────────────────

function StrengthChip({ grade }: { grade: StructuralGrade }) {
  const s: Record<StructuralGrade, string> = {
    very_strong: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
    strong:      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    moderate:    'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    weak:        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    very_weak:   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
  };
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border', s[grade])}>
      {STR_LABELS[grade]}
    </span>
  );
}

function FnChip({ fn, lean, isMaraka, short = false }: {
  fn: FunctionalNature; lean: FunctionalLean; isMaraka?: boolean; short?: boolean;
}) {
  // Lean only changes colour, not the label text
  const s: Record<FunctionalNature, string> = {
    yogakaraka:    'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700',
    strong_benefic:'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
    benefic:       'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    mixed:         lean === 'malefic_lean'
                     ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700'
                   : lean === 'benefic_lean'
                     ? 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700'
                   : lean === 'maraka_driven'
                     ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700'
                   : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    neutral:       'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    malefic:       'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
  };

  // Lean dot for mixed — small coloured indicator instead of verbose text
  const leanDot = fn === 'mixed' ? (
    lean === 'benefic_lean'  ? <span className="w-1.5 h-1.5 rounded-full bg-teal-500 ml-1 flex-shrink-0"/>  :
    lean === 'malefic_lean'  ? <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-1 flex-shrink-0"/> :
    lean === 'maraka_driven' ? <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-1 flex-shrink-0"/>  :
    null
  ) : null;

  return (
    <span className={cn('inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border', s[fn])}>
      {fnShort(fn)}
      {leanDot}
      {isMaraka && <span className="text-[9px] opacity-50 ml-0.5 font-normal">M</span>}
    </span>
  );
}

function CondText({ grade }: { grade: ConditionGrade }) {
  const s: Record<ConditionGrade, string> = {
    supported:        'text-blue-600 dark:text-blue-400',
    clean:            'text-green-600 dark:text-green-400',
    afflicted:        'text-amber-600 dark:text-amber-400',
    heavily_afflicted:'text-red-600 dark:text-red-400',
    distorted:        'text-red-700 dark:text-red-300',
  };
  return <span className={cn('text-[11px] font-medium', s[grade])}>{COND_LABELS[grade]}</span>;
}

function DelivText({ grade, score }: { grade: DeliveryGrade; score?: number }) {
  const s: Record<DeliveryGrade, string> = {
    reliable:          'text-green-600 dark:text-green-400',
    delayed:           'text-amber-600 dark:text-amber-400',
    inconsistent:      'text-amber-500 dark:text-amber-400',
    obstructed:        'text-red-600 dark:text-red-400',
    distorted_delivery:'text-orange-600 dark:text-orange-400',
  };
  return (
    <div>
      <span className={cn('text-[11px] font-medium', s[grade])}>{DELIV_LABELS[grade]}</span>
      {score !== undefined && <div className="text-[10px] text-muted-foreground">{score}/100</div>}
    </div>
  );
}

function ConfText({ grade }: { grade: ConfidenceGrade }) {
  const s: Record<ConfidenceGrade, string> = {
    high:'text-green-600 dark:text-green-400',
    moderate:'text-amber-500 dark:text-amber-400',
    low:'text-red-500 dark:text-red-400',
  };
  return <span className={cn('text-[10px] font-medium', s[grade])}>
    {({ high:'High', moderate:'Moderate', low:'Low' })[grade]} confidence
  </span>;
}

function ConflictBadge({ flag }: { flag: ConflictFlag }) {
  const LABELS: Record<ConflictFlag, string> = {
    strong_afflicted:'Strong+afflicted', weak_protected:'Weak+protected',
    strong_but_malefic:'Strong malefic', benefic_but_weak:'Benefic+weak',
    strong_d1_weak_d9:'D9 contradicts', weak_d1_strong_d9:'Matures later',
    strong_general_weak_domain:'Delivery issue', weak_general_strong_domain:'Domain OK',
    powerful_maraka:'Powerful maraka', node_dominated:'Node dominated',
    saturn_dominated:'Saturn dominated', mars_dominated:'Mars dominated',
    combust_but_supported:'Combust+guided', retrograde_internalized:'Retrograde',
    weak_afflicted:'Double weakness',
  };
  return (
    <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
      {LABELS[flag]}
    </span>
  );
}

function DomainTag({ domain, type }: { domain: Domain; type: 'strong'|'mixed'|'weak' }) {
  const s = {
    strong:'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    mixed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    weak:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', s[type])}>{domain}</span>;
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={cn('text-[12px] leading-none', i <= count ? 'text-amber-400' : 'text-muted-foreground/20')}>★</span>
      ))}
    </div>
  );
}

function strGradeStars(g: StructuralGrade): number {
  return { very_strong:5, strong:4, moderate:3, weak:2, very_weak:1 }[g];
}

// ─── Collapsible section ──────────────────────────────────────────────────────

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
      {open && <div className="px-3 py-3 space-y-1.5">{children}</div>}
    </div>
  );
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────

type Mode = 'explore' | 'analyst';

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1 border border-border">
      {(['explore','analyst'] as Mode[]).map(m => (
        <button key={m} onClick={() => onChange(m)}
          className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all capitalize',
            mode === m
              ? 'bg-background text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground')}>
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Explore: planet card ─────────────────────────────────────────────────────

function PlanetCard({ r, pd, isSelected, onSelect }: {
  r: PlanetStrengthResult; pd: PlanetData; isSelected: boolean; onSelect: () => void;
}) {
  const avatar = PLANET_AVATAR[r.planet] ?? 'bg-muted text-foreground';
  const isDasha = r.temporalActivation.dashaBoostApplied;

  return (
    <button type="button" onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all bg-card',
        isSelected
          ? 'border-primary/50 shadow-sm ring-1 ring-primary/20'
          : 'border-border hover:border-border/80 hover:shadow-sm',
      )}>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0', avatar)}>
          {GLYPH[r.planet] ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium">{r.planet}</span>
            {isDasha && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold border border-primary/20 leading-tight">DASHA</span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{pd.sign} {pd.degreeInSign.toFixed(1)}° · H{r.housePosition}</div>
        </div>
      </div>

      {/* Stars */}
      <StarRow count={strGradeStars(r.structuralGrade)} />

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
        <FnChip fn={r.functionalNature} lean={r.functionalLean} isMaraka={r.isMarakaCapable} />
        <StrengthChip grade={r.structuralGrade} />
      </div>

      {/* SHORT summary — not the analyst note */}
      <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
        {buildCardSummary(r, pd)}
      </p>

      {/* Conflict badges */}
      {r.conflictFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {r.conflictFlags.slice(0, 2).map(f => <ConflictBadge key={f} flag={f} />)}
          {r.conflictFlags.length > 2 && (
            <span className="text-[10px] text-muted-foreground self-center">+{r.conflictFlags.length - 2}</span>
          )}
        </div>
      )}

      {/* Top domains */}
      {r.strongDomains.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {r.strongDomains.slice(0, 3).map(d => <DomainTag key={d} domain={d} type="strong" />)}
        </div>
      )}
    </button>
  );
}

// ─── Explore: detail panel ────────────────────────────────────────────────────

function ExploreDetail({ r, pd, onClose }: {
  r: PlanetStrengthResult; pd: PlanetData; onClose: () => void;
}) {
  return (
    <div className="col-span-full border border-primary/30 rounded-xl bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-base">{r.planet}</span>
          <ConfText grade={r.assessmentConfidence} />
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
          { label:'Condition',  value:<CondText grade={r.conditionGrade}/> },
          { label:'Delivery',   value:<DelivText grade={r.deliveryGrade} score={r.deliveryScore}/> },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/40 rounded-lg border border-border p-3">
            <div className="text-[9px] text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</div>
            {value}
          </div>
        ))}
      </div>

      {/* Full analyst note */}
      <div className="bg-muted/30 rounded-lg border border-border px-4 py-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 font-medium">Full assessment</div>
        <p className="text-[12px] leading-relaxed">{r.analystNote}</p>
      </div>

      {/* Key reasons */}
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Key reasons</div>
        <div className="space-y-1.5">
          {r.keyReasons.map((kr, i) => (
            <div key={i} className="flex gap-2.5 text-[12px] leading-relaxed">
              <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                kr.sentiment === 'positive' ? 'bg-green-500' :
                kr.sentiment === 'negative' ? 'bg-red-400' : 'bg-slate-400')} />
              <span>{kr.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflicts */}
      {r.conflictFlags.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-medium">Contradictions</div>
          <div className="flex flex-wrap gap-1.5">
            {r.conflictFlags.map(f => <ConflictBadge key={f} flag={f} />)}
          </div>
        </div>
      )}

      {/* Varga + Nakshatra */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="Varga validation">
          <p className="text-[12px] text-muted-foreground">{r.vargaAssessment.note}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border',
              r.vargaAssessment.d9Confirms  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
              r.vargaAssessment.d9Contradicts ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
              'bg-muted text-muted-foreground border-border')}>
              D9: {dignityShort(r.vargaAssessment.d9DignityLevel)}
            </span>
            {r.vargaAssessment.d9SignNumber === pd.signNumber && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Vargottama ✓</span>
            )}
            {r.vargaAssessment.hasD9SecondPass && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">D9 extra weight</span>
            )}
          </div>
        </Section>

        <Section title="Nakshatra">
          <div className="text-[12px] space-y-1 text-muted-foreground">
            <div>Star lord: <span className="font-medium text-foreground">{r.nakshatraInfluence.starLordName}</span> ({r.nakshatraInfluence.starLordStructuralScore}/100)</div>
            <div>Sub lord: <span className="font-medium text-foreground">{r.nakshatraInfluence.subLordName}</span> ({r.nakshatraInfluence.subLordStructuralScore}/100)</div>
            <div className="mt-1">{r.nakshatraInfluence.nakshatraNotes}</div>
          </div>
        </Section>
      </div>

      {/* Agenda */}
      <Section title="Agenda & character">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Themes</div>
            <div className="flex flex-wrap gap-1">
              {r.agendaThemes.slice(0, 6).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{t}</span>
              ))}
            </div>
          </div>
          <div className="text-[12px] text-muted-foreground space-y-1">
            <div><span className="text-muted-foreground/70">Style: </span>{r.deliveryStyle.replace(/_/g, ' ')}</div>
            <div><span className="text-muted-foreground/70">Tone: </span>{r.psychologicalTone}</div>
          </div>
        </div>
      </Section>

      {/* Domains */}
      <Section title="Domain assessment" defaultOpen={true}>
        <div className="flex items-center gap-1.5 mb-2">
          <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Preliminary — topic-specific vargas applied where available</span>
        </div>
        <div className="space-y-2">
          {r.strongDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">Strong</span>
              {r.strongDomains.map(d => <DomainTag key={d} domain={d} type="strong" />)}
            </div>
          )}
          {r.mixedDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">Mixed</span>
              {r.mixedDomains.map(d => <DomainTag key={d} domain={d} type="mixed" />)}
            </div>
          )}
          {r.weakDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">Difficult</span>
              {r.weakDomains.map(d => <DomainTag key={d} domain={d} type="weak" />)}
            </div>
          )}
        </div>
      </Section>

      {/* Node inheritance */}
      {r.nodeInheritance && (
        <Section title="Node inheritance">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              ['Dispositor', r.nodeInheritance.dispositorName, r.nodeInheritance.dispositorStructuralScore],
              ['Nakshatra lord', r.nodeInheritance.nakshatraLordName, r.nodeInheritance.nakshatraLordScore],
              ['House context', `H${r.housePosition}`, r.nodeInheritance.houseContextScore],
              ['Inherited', 'support', r.nodeInheritance.inheritedSupportScore],
            ].map(([label, name, score]) => (
              <div key={String(label)} className="bg-muted/40 rounded-lg p-2 border border-border">
                <div className="text-[9px] text-muted-foreground mb-0.5">{label}</div>
                <div className="text-[11px] font-medium">{name}</div>
                <div className="text-[10px] text-muted-foreground">{score}/100</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dominant overrides */}
      {r.dominantOverrideApplied && r.overrideImpactNotes.length > 0 && (
        <Section title="Dominant overrides">
          {r.overrideImpactNotes.map((n, i) => (
            <div key={i} className="text-[12px] text-muted-foreground">⚑ {n}</div>
          ))}
        </Section>
      )}

      {/* Delivery breakdown */}
      <Section title="Delivery score breakdown">
        <div className="space-y-0.5 text-[11px]">
          {r.deliveryReasons.map((dr, i) => (
            <div key={i} className={cn('text-muted-foreground', i === r.deliveryReasons.length - 1 && 'font-medium text-foreground mt-1')}>
              {dr}
            </div>
          ))}
        </div>
      </Section>

      {/* Priority row */}
      <div className="flex items-center justify-between text-[11px] bg-muted/30 rounded-lg px-3 py-2 border border-border">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground">Natal rank</span>
          <span className="font-semibold">#{r.natalPriorityRank}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground">Current rank</span>
          <span className={cn('font-semibold', r.temporalActivation.dashaBoostApplied && 'text-primary')}>#{r.currentPriorityRank}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground">Importance</span>
          <span className="font-semibold">{r.importanceWeight}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground">Delivery score</span>
          <span className="font-semibold">{r.deliveryScore}/100</span>
        </div>
      </div>
    </div>
  );
}

// ─── Analyst table ────────────────────────────────────────────────────────────

function AnalystTable({ results, planets, ascendant }: {
  results: Record<string, PlanetStrengthResult>;
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (n: string) => setExpanded(p => p === n ? null : n);

  const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  return (
    <div>
      <div className="mb-3 px-3 py-2 text-[11px] text-muted-foreground bg-muted rounded-lg border border-border flex items-center gap-2">
        <Info className="h-3 w-3 flex-shrink-0" />
        <span><span className="font-medium">{ascendant.sign} lagna</span>  Click row to expand</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              {['Planet','Position','Dignity','Structural','Functional','Condition','Delivery','D9','Rank','Flags'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground text-[9px] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANET_ORDER.map(name => {
              const r  = results[name];
              const pd = planets[name] as PlanetData | undefined;
              if (!r || !pd) return null;
              const isExp   = expanded === name;
              const d9Name  = SIGN_NAMES[r.vargaAssessment.d9SignNumber - 1] ?? '?';
              const isVarg  = r.vargaAssessment.d9SignNumber === pd.signNumber;
              const isDasha = r.temporalActivation.dashaBoostApplied;
              const avatar  = PLANET_AVATAR[name] ?? 'bg-muted text-foreground';

              return [
                <tr key={name} onClick={() => toggle(name)}
                  className={cn('border-b border-border cursor-pointer transition-colors',
                    isExp ? 'bg-muted/40' : 'hover:bg-muted/20')}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0', avatar)}>
                        {GLYPH[name]}
                      </div>
                      <span className="font-medium">{name}</span>
                      {isDasha && <span className="text-[8px] w-1.5 h-1.5 rounded-full bg-primary inline-block" title="Dasha active"/>}
                      {isExp
                        ? <ChevronUp className="h-3 w-3 text-muted-foreground ml-auto"/>
                        : <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto"/>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-mono text-[10px]">{pd.sign} {pd.degreeInSign.toFixed(1)}°</div>
                    <div className="text-[9px] text-muted-foreground">{pd.kp.nakshatraName} P{pd.kp.nakshatraPada}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">{dignityShort(r.dignityLevel)}</td>
                  <td className="px-3 py-2.5"><StrengthChip grade={r.structuralGrade}/></td>
                  <td className="px-3 py-2.5"><FnChip fn={r.functionalNature} lean={r.functionalLean} isMaraka={r.isMarakaCapable}/></td>
                  <td className="px-3 py-2.5"><CondText grade={r.conditionGrade}/></td>
                  <td className="px-3 py-2.5"><DelivText grade={r.deliveryGrade} score={r.deliveryScore}/></td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    {d9Name}{isVarg ? ' ★' : ''}{r.vargaAssessment.hasD9SecondPass ? ' ✦' : ''}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-medium">
                    <span className="text-muted-foreground">#{r.natalPriorityRank}</span>
                    {isDasha && <span className="text-primary ml-1">→#{r.currentPriorityRank}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {r.conflictFlags.length > 0
                      ? <span className="text-[10px] text-amber-600 dark:text-amber-400">⚑ {r.conflictFlags.length}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>,

                isExp && (
                  <tr key={`${name}-exp`} className="bg-muted/20 border-b border-border">
                    <td colSpan={10} className="px-4 py-4">
                      {/* Analyst note */}
                      <div className="mb-3 px-3 py-2.5 bg-card rounded-lg border border-border text-[12px] leading-relaxed">
                        {r.analystNote}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Col 1: Key reasons */}
                        <div>
                          <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Key reasons</div>
                          <div className="space-y-1.5">
                            {r.keyReasons.map((kr, i) => (
                              <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                                <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                                  kr.sentiment === 'positive' ? 'bg-green-500' :
                                  kr.sentiment === 'negative' ? 'bg-red-400' : 'bg-slate-400')} />
                                <span>{kr.text}</span>
                              </div>
                            ))}
                          </div>
                          {r.conflictFlags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {r.conflictFlags.map(f => <ConflictBadge key={f} flag={f} />)}
                            </div>
                          )}
                        </div>

                        {/* Col 2: Technical */}
                        <div>
                          <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Technical</div>
                          <div className="space-y-0.5">
                            {([
                              ['Houses ruled',    r.housesRuled.join(', ')],
                              ['H from lagna',    `${r.housePosition}${ord(r.housePosition)}`],
                              ['Structural',      `${r.structuralScore}/100`],
                              ['Delivery score',  `${r.deliveryScore}/100`],
                              ['Condition score', String(r.conditionScore)],
                              ['Varga status',    r.vargaAssessment.vargaStatus],
                              ['D9 confidence',   r.vargaAssessment.vargaConfidence],
                              ['Star lord',       `${r.nakshatraInfluence.starLordName} (${r.nakshatraInfluence.starLordStructuralScore})`],
                              ['Importance',      String(r.importanceWeight)],
                              ['Retrograde',      r.isRetrograde ? 'Yes' : 'No'],
                              ['Combust',         r.isCombust ? 'Yes' : 'No'],
                              ['Maraka',          r.isMarakaCapable ? 'Yes' : 'No'],
                              ...(r.isPakshaBala !== undefined ? [['Paksha Bala', r.isPakshaBala ? 'Waxing' : 'Waning'] as [string,string]] : []),
                              ...(r.neechaBhanga.isApplied ? [['Neecha Bhanga', r.neechaBhanga.rule ?? 'Applied'] as [string,string]] : []),
                            ] as [string, string][]).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-[11px] py-0.5 border-b border-border/40 last:border-0">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-medium text-right ml-2 max-w-[140px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Col 3: Domains + node */}
                        <div>
                          <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Domains</div>
                          <div className="space-y-1.5 mb-3">
                            {r.strongDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[9px] text-muted-foreground w-10">Strong</span>
                                {r.strongDomains.map(d => <DomainTag key={d} domain={d} type="strong"/>)}
                              </div>
                            )}
                            {r.mixedDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[9px] text-muted-foreground w-10">Mixed</span>
                                {r.mixedDomains.map(d => <DomainTag key={d} domain={d} type="mixed"/>)}
                              </div>
                            )}
                            {r.weakDomains.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[9px] text-muted-foreground w-10">Hard</span>
                                {r.weakDomains.map(d => <DomainTag key={d} domain={d} type="weak"/>)}
                              </div>
                            )}
                          </div>
                          {r.nodeInheritance && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="text-[9px] text-muted-foreground mb-1">Node inheritance</div>
                              <div className="text-[11px] text-muted-foreground space-y-0.5">
                                <div>Dispositor: <span className="font-medium text-foreground">{r.nodeInheritance.dispositorName}</span> ({r.nodeInheritance.dispositorDeliveryGrade})</div>
                                <div>Inherited: <span className="font-medium text-foreground">{r.nodeInheritance.inheritedSupportScore}/100</span></div>
                                <div>House ctx: <span className="font-medium text-foreground">{r.nodeInheritance.houseContextScore}/100</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery trail */}
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
  const [selected, setSelected] = useState<string | null>(null);

  const results = useMemo(() => {
    try { return assessAllPlanets({ planets, ascendant, dashaContext }); }
    catch { return {} as Record<string, PlanetStrengthResult>; }
  }, [planets, ascendant, dashaContext]);

  // Build inline list with detail panel after selected card
  type Item = { type: 'card'; name: string } | { type: 'detail'; name: string };
  const items: Item[] = [];
  PLANET_ORDER.forEach(n => {
    items.push({ type: 'card', name: n });
    if (selected === n) items.push({ type: 'detail', name: n });
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Planetary Strength</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {ascendant.sign} lagna
          </p>
        </div>
        <ModeToggle mode={mode} onChange={m => { setMode(m); setSelected(null); }} />
      </div>

      {/* Explore */}
      {mode === 'explore' && (
        <div>
          <div className="text-[11px] text-muted-foreground mb-4 px-3 py-2 bg-muted rounded-lg border border-border flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Each planet is assessed across 14 layers. The same planet can be your strongest ally or biggest challenge depending on your lagna. Click any card to expand the full assessment.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(item => {
              if (item.type === 'detail') {
                const r  = results[item.name];
                const pd = planets[item.name] as PlanetData | undefined;
                if (!r || !pd) return null;
                return (
                  <div key={`d-${item.name}`} className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <ExploreDetail r={r} pd={pd} onClose={() => setSelected(null)} />
                  </div>
                );
              }
              const r  = results[item.name];
              const pd = planets[item.name] as PlanetData | undefined;
              if (!r || !pd) return null;
              return (
                <PlanetCard key={item.name} r={r} pd={pd}
                  isSelected={selected === item.name}
                  onSelect={() => setSelected(p => p === item.name ? null : item.name)} />
              );
            })}
          </div>
        </div>
      )}

      {/* Analyst */}
      {mode === 'analyst' && (
        <AnalystTable results={results} planets={planets} ascendant={ascendant} />
      )}
    </div>
  );
}

function ord(n: number): string {
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
}
