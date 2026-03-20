/**
 * Deterministic Analyst Note Generator — Layer 15 (Spec §18)
 *
 * Mandatory format per spec:
 * 1. Structural verdict
 * 2. Condition verdict
 * 3. Functional verdict
 * 4. Varga verdict
 * 5. Delivery verdict
 * 6. Strongest domain
 * 7. Weakest domain
 * 8. Current importance if activated
 * 9. Agenda summary
 *
 * Must be: contradiction-aware, specific, not generic, deterministic
 */

import type {
  StructuralGrade, ConditionGrade, FunctionalNature, FunctionalLean,
  DeliveryGrade, Domain, ConflictFlag, ConfidenceGrade,
  VargaAssessment, TemporalActivation, DignityLevel,
} from './types';
import { getDignityLabel } from './dignityEngine';

// ─── Structural verdict phrases ───────────────────────────────────────────────

function structuralVerdict(
  planet: string, grade: StructuralGrade, dignity: DignityLevel,
  isRetrograde: boolean, isCombust: boolean, isNB: boolean
): string {
  const dLabel = getDignityLabel(dignity);
  const retro  = isRetrograde ? ', retrograde' : '';
  const comb   = isCombust   ? ', combust (eclipsed by Sun)' : '';
  const nb     = isNB        ? ' with Neecha Bhanga cancellation' : '';

  const gradePhrase = {
    very_strong: `very strongly placed — ${dLabel}${retro}${comb}`,
    strong:      `strongly placed — ${dLabel}${retro}${comb}`,
    moderate:    `moderately placed — ${dLabel}${retro}${comb}`,
    weak:        `weakly placed — ${dLabel}${nb}${retro}${comb}`,
    very_weak:   `very weakly placed — ${dLabel}${nb}${retro}${comb}`,
  }[grade];

  return `${planet} is ${gradePhrase}`;
}

// ─── Condition verdict ────────────────────────────────────────────────────────

function conditionVerdict(grade: ConditionGrade, topAffliction?: string, topProtection?: string): string {
  const base = {
    supported:        'Its condition is supported',
    clean:            'Its condition is clean',
    afflicted:        'Its condition is afflicted',
    heavily_afflicted:'Its condition is heavily afflicted',
    distorted:        'Its condition is severely distorted',
  }[grade];

  if (grade === 'supported' && topProtection) return `${base} (${topProtection})`;
  if ((grade === 'afflicted' || grade === 'heavily_afflicted' || grade === 'distorted') && topAffliction)
    return `${base} — ${topAffliction}`;
  return base;
}

// ─── Functional verdict ───────────────────────────────────────────────────────

function functionalVerdict(
  fn: FunctionalNature, lean: FunctionalLean,
  housesRuled: number[], isMaraka: boolean
): string {
  const hl = housesRuled.map(h => `${h}${ord(h)}`).join('+');
  const marakaNote = isMaraka ? ' with maraka capability (2nd/7th)' : '';

  const fnPhrase: Record<FunctionalNature, string> = {
    yogakaraka:    `functionally it is a yogakaraka (rules kendra and trikona: ${hl}) — the most auspicious planetary role`,
    strong_benefic:`functionally a primary benefic (${hl}) for this lagna`,
    benefic:       `functionally a kendra lord (${hl}) — stabilizing role`,
    mixed:         `functionally mixed (${hl}${buildLeanNote(lean)})`,
    neutral:       `functionally neutral (${hl}) — no dominant house coloring`,
    malefic:       `functionally a malefic for this lagna (${hl}) — dusthana lordship`,
  };

  return `${fnPhrase[fn]}${marakaNote}`;
}

function buildLeanNote(lean: FunctionalLean): string {
  return {
    benefic_lean:               ' — trikona ownership dominant, leans benefic',
    neutral_lean:               ' — roughly balanced ownership',
    malefic_lean:               ' — dusthana ownership dominant, leans challenging',
    maraka_driven:              ' — maraka houses dominate, situation-dependent',
    protective_with_complication:' — lagna lord with difficult co-lordship',
  }[lean] ?? '';
}

// ─── Varga verdict ────────────────────────────────────────────────────────────

function vargaVerdict(varga: VargaAssessment): string {
  const vargaLabel = getDignityLabel(varga.d9DignityLevel);
  if (varga.vargaStatus === 'confirmed')
    return `D9 confirms this planet's promise (${vargaLabel} in Navamsa) — reliable across layers`;
  if (varga.vargaStatus === 'contradicted') {
    return varga.hasD9SecondPass
      ? `D9 critically contradicts (${vargaLabel} in Navamsa) — this is a marriage/dharma-sensitive planet, and inner instability is significant`
      : `D9 contradicts (${vargaLabel} in Navamsa) — external strength may not translate to lasting reliability`;
  }
  return `D9 gives partial support (${vargaLabel} in Navamsa) — moderate validation`;
}

// ─── Delivery verdict ─────────────────────────────────────────────────────────

function deliveryVerdict(grade: DeliveryGrade, score: number, conflictFlags: ConflictFlag[]): string {
  const base: Record<DeliveryGrade, string> = {
    reliable:          'It can deliver results reliably',
    delayed:           'It can deliver, but results come slowly or after delay',
    inconsistent:      'Its delivery is inconsistent — results arrive irregularly',
    distorted_delivery:'It delivers, but with distortion — results are corrupted or overpowered',
    obstructed:        'Its delivery is obstructed — results are blocked or severely constrained',
  };

  const specific = conflictFlags.includes('strong_afflicted')
    ? ' (strong force but afflicted expression — delivers with pressure)'
    : conflictFlags.includes('retrograde_internalized')
    ? ' (retrograde: unconventional, internalized, or karmically revisited delivery)'
    : conflictFlags.includes('combust_but_supported')
    ? ' (combust but supported — dependent on Sun\'s direction, partially guided by Jupiter)'
    : conflictFlags.includes('strong_d1_weak_d9')
    ? ' (external strength exists, but D9 reduces inner consistency)'
    : conflictFlags.includes('weak_d1_strong_d9')
    ? ' (weak now but inner depth exists — matures with time and dasha activation)'
    : '';

  return `${base[grade]}${specific} (delivery score: ${score}/100)`;
}

// ─── Domain summary ───────────────────────────────────────────────────────────

function domainSummary(strongDomains: Domain[], weakDomains: Domain[]): string {
  const strongStr = strongDomains.length > 0
    ? `It supports ${strongDomains.slice(0, 3).join(', ')} best`
    : 'No strongly supported domains';
  const weakStr = weakDomains.length > 0
    ? `most difficult for ${weakDomains.slice(0, 2).join(', ')}`
    : '';
  return weakStr ? `${strongStr}; ${weakStr}` : strongStr;
}

// ─── Temporal significance ────────────────────────────────────────────────────

function temporalNote(temporal: TemporalActivation): string {
  if (temporal.isMahadasha)
    return 'Currently in its Mahadasha — major temporal prominence; all natal patterns are now active and heightened';
  if (temporal.isAntardasha)
    return 'Currently in its Antardasha — moderate temporal activation; its themes are presently significant';
  if (temporal.isPratyantar)
    return 'Active in current Pratyantar — minor but live activation';
  return '';
}

// ─── Agenda summary ──────────────────────────────────────────────────────────

function agendaSummary(planet: string, themes: string[], style: string, karmic: string): string {
  const topThemes = themes.filter(t => !t.includes('force available') && !t.includes('limited force') && !t.includes('distorted')).slice(0, 4);
  return `${planet}'s agenda: ${topThemes.join(', ')}. Style: ${style}. ${karmic.split(' — lessons')[0]}.`;
}

// ─── Confidence note ──────────────────────────────────────────────────────────

function confidenceNote(grade: ConfidenceGrade, conflictFlags: ConflictFlag[]): string {
  if (grade === 'high')     return 'Confidence in this assessment is high — layers align consistently.';
  if (grade === 'low') {
    const reason = conflictFlags.includes('strong_d1_weak_d9')
      ? 'D9 contradiction creates significant uncertainty'
      : conflictFlags.includes('node_dominated')
      ? 'Node dominance creates interpretive complexity'
      : 'Multiple contradictory signals reduce certainty';
    return `Confidence is low — ${reason}.`;
  }
  return 'Confidence is moderate — some contradictions present but verdict is directionally clear.';
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateAnalystNote(params: {
  planet: string;
  structuralGrade: StructuralGrade;
  dignityLevel: DignityLevel;
  isRetrograde: boolean;
  isCombust: boolean;
  isNB: boolean;
  conditionGrade: ConditionGrade;
  topAffliction?: string;
  topProtection?: string;
  functionalNature: FunctionalNature;
  functionalLean: FunctionalLean;
  housesRuled: number[];
  isMarakaCapable: boolean;
  vargaAssessment: VargaAssessment;
  deliveryGrade: DeliveryGrade;
  deliveryScore: number;
  conflictFlags: ConflictFlag[];
  strongDomains: Domain[];
  weakDomains: Domain[];
  temporalActivation: TemporalActivation;
  agendaThemes: string[];
  deliveryStyle: string;
  karmicStyle: string;
  assessmentConfidence: ConfidenceGrade;
}): string {
  const {
    planet, structuralGrade, dignityLevel, isRetrograde, isCombust, isNB,
    conditionGrade, topAffliction, topProtection, functionalNature, functionalLean,
    housesRuled, isMarakaCapable, vargaAssessment, deliveryGrade, deliveryScore,
    conflictFlags, strongDomains, weakDomains, temporalActivation,
    agendaThemes, deliveryStyle, karmicStyle, assessmentConfidence,
  } = params;

  const parts: string[] = [
    // 1. Structural
    structuralVerdict(planet, structuralGrade, dignityLevel, isRetrograde, isCombust, isNB),
    // 2. Condition
    conditionVerdict(conditionGrade, topAffliction, topProtection),
    // 3. Functional
    `Functionally, it is ${functionalVerdict(functionalNature, functionalLean, housesRuled, isMarakaCapable)}.`,
    // 4. Varga
    vargaVerdict(vargaAssessment),
    // 5. Delivery
    deliveryVerdict(deliveryGrade, deliveryScore, conflictFlags),
    // 6+7. Domains
    domainSummary(strongDomains, weakDomains) + '.',
    // 9. Agenda
    agendaSummary(planet, agendaThemes, deliveryStyle, karmicStyle),
    // 13. Confidence
    confidenceNote(assessmentConfidence, conflictFlags),
  ];

  // 8. Temporal (only if activated)
  const temporal = temporalNote(temporalActivation);
  if (temporal) parts.splice(7, 0, temporal + '.');

  return parts.join(' ');
}

// ─── Key reasons ─────────────────────────────────────────────────────────────

export function buildKeyReasons(
  planet: string,
  dignityDesc: string, dignityLevel: DignityLevel,
  functionalNature: FunctionalNature, functionalLean: FunctionalLean,
  housesRuled: number[], housePosition: number,
  afflictions: string[], protections: string[],
  isNB: boolean, nbRule: string | undefined,
  vargaAssessment: VargaAssessment,
  isMaraka: boolean,
  conflictFlags: ConflictFlag[]
): Array<{ sentiment: 'positive' | 'negative' | 'neutral'; text: string }> {
  const reasons: Array<{ sentiment: 'positive' | 'negative' | 'neutral'; text: string }> = [];

  // 1. Dignity
  const dPos = ['exalted','moolatrikona','own_sign','great_friend','friend'].includes(dignityLevel);
  const dNeg = ['enemy','great_enemy','debilitated'].includes(dignityLevel);
  reasons.push({ sentiment: dPos ? 'positive' : dNeg ? 'negative' : 'neutral', text: dignityDesc });

  // 2. Functional
  const hl = housesRuled.map(h => `${h}${ord(h)}`).join('+');
  const leanNote = buildLeanNote(functionalLean);
  if (functionalNature === 'yogakaraka')
    reasons.push({ sentiment:'positive', text:`Yogakaraka — rules kendra + trikona (${hl})` });
  else if (functionalNature === 'strong_benefic')
    reasons.push({ sentiment:'positive', text:`Primary benefic (${hl}) for this lagna` });
  else if (functionalNature === 'benefic')
    reasons.push({ sentiment:'positive', text:`Kendra lord (${hl})` });
  else if (functionalNature === 'malefic')
    reasons.push({ sentiment:'negative', text:`Functional malefic (${hl}) — dusthana lordship` });
  else if (functionalNature === 'mixed')
    reasons.push({ sentiment:'neutral', text:`Mixed ownership (${hl})${leanNote}` });

  if (isMaraka)
    reasons.push({ sentiment:'neutral', text:'Maraka capable — life/health themes in its dasha' });

  // 3. Top affliction
  if (afflictions[0]) reasons.push({ sentiment:'negative', text: afflictions[0] });

  // 4. Top protection
  if (protections[0]) reasons.push({ sentiment:'positive', text: protections[0] });

  // 5. NB or varga
  if (isNB && nbRule)
    reasons.push({ sentiment:'positive', text:`Neecha Bhanga: ${nbRule}` });
  else if (vargaAssessment.d9Contradicts)
    reasons.push({ sentiment:'negative', text: vargaAssessment.note });
  else if (vargaAssessment.d9Confirms && !reasons.some(r => r.text.includes('D9')))
    reasons.push({ sentiment:'positive', text: vargaAssessment.note });

  return reasons.slice(0, 6);
}

function ord(n: number): string { return n===1?'st':n===2?'nd':n===3?'rd':'th'; }
