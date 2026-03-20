/**
 * Domain Support Engine — Layer 10 (Spec §10) v3
 *
 * Correction 5:
 * - Positive bonuses added (capped at ≤22) alongside the constraint penalty system.
 * - Relevance gate: a planet cannot accumulate high positive bonuses on a domain
 *   unless it has at least ONE of: real ownership, strong karakatwa, direct placement,
 *   or confirming domain varga. Without relevance, bonuses are not applied.
 * - Domain score is now a two-sided formula: base + positive_bonus - constraint_penalty.
 * - Result: a genuinely strong planet for a domain is recognized more accurately.
 *   A tangentially related planet cannot inflate a domain it has no real connection to.
 *
 * Extra instruction: hierarchy strictly maintained inside constraints.
 * (dispositor > nakshatra > conjunction > house is enforced in nodeInheritance.ts)
 */

import type {
  Domain, ConditionGrade, DeliveryGrade, FunctionalNature,
  FunctionalLean, ConfidenceGrade, VargaAssessment, ConflictFlag,
} from './types';

// ─── House → Domain ───────────────────────────────────────────────────────────
export const HOUSE_DOMAIN: Record<number, Domain> = {
  1:'self', 2:'wealth', 3:'siblings', 4:'home', 5:'children',
  6:'health', 7:'marriage', 8:'longevity', 9:'fortune', 10:'career',
  11:'gains', 12:'liberation',
};

// ─── Natural karakatwa strengths ──────────────────────────────────────────────
const NATURAL_KARAKATWA: Record<string, Partial<Record<Domain, number>>> = {
  Sun:     { self:1.0, career:0.8, father:0.7, health:0.5 },
  Moon:    { self:0.9, health:0.9, home:0.8, mother:1.0 },
  Mars:    { siblings:1.0, career:0.7, health:0.6, home:0.5, longevity:0.4 },
  Mercury: { intellect:1.0, wealth:0.7, communication:1.0, children:0.5 },
  Jupiter: { children:1.0, fortune:1.0, wealth:0.8, spirituality:0.7, intellect:0.6, father:0.5 },
  Venus:   { marriage:1.0, wealth:0.8, home:0.5, foreign:0.4 },
  Saturn:  { career:0.9, longevity:0.8, gains:0.5, foreign:0.6, liberation:0.5 },
  Rahu:    { foreign:1.0, career:0.5, gains:0.5, communication:0.4 },
  Ketu:    { spirituality:1.0, liberation:1.0, foreign:0.6, health:0.4 },
};

// ─── Domain-varga key mapping ─────────────────────────────────────────────────
function domainToVargaKey(domain: Domain): string | null {
  const map: Partial<Record<Domain, string>> = {
    marriage:'marriage', career:'career', children:'children',
    home:'home', spirituality:'spirituality', wealth:'wealth', intellect:'learning',
  };
  return map[domain] ?? null;
}

function getDomainVargaScore(domain: Domain, varga: VargaAssessment): number {
  const key = domainToVargaKey(domain);
  if (!key) return 50; // no specific varga for this domain
  return varga.domainVargaScores[key] ?? 50;
}

// ─── Component helpers ────────────────────────────────────────────────────────
function deliveryToComponent(grade: DeliveryGrade): number {
  return { reliable:90, delayed:65, inconsistent:45, distorted_delivery:25, obstructed:10 }[grade];
}

function conditionToComponent(grade: ConditionGrade): number {
  return { supported:90, clean:75, afflicted:45, heavily_afflicted:20, distorted:10 }[grade];
}

function classifyDomainScore(score: number): 'strong' | 'mixed' | 'weak' {
  if (score >= 65) return 'strong';
  if (score >= 40) return 'mixed';
  return 'weak';
}

function domainConfidence(
  domain: Domain, score: number, varga: VargaAssessment, wasConstrained: boolean
): ConfidenceGrade {
  const hasVarga = domainToVargaKey(domain) !== null;
  if (wasConstrained) return 'high';
  if (hasVarga && varga.vargaConfidence === 'high')     return 'high';
  if (hasVarga && varga.vargaConfidence === 'moderate') return 'moderate';
  if (!hasVarga) return score >= 60 ? 'moderate' : 'low';
  return 'low';
}

// ─── Karakatwa context (from pre-computed Phase A results) ────────────────────
export interface PlanetDomainContext {
  delivery: DeliveryGrade;
  condition: ConditionGrade;
  deliveryScore: number;
  conflictFlags: ConflictFlag[];
}

export interface DomainKarakaContext {
  venus?:        PlanetDomainContext;
  jupiter?:      PlanetDomainContext;
  mars?:         PlanetDomainContext;
  mercury?:      PlanetDomainContext;
  moon?:         PlanetDomainContext;
  ketu?:         PlanetDomainContext;
  seventhLord?:  PlanetDomainContext;
  tenthLord?:    PlanetDomainContext;
  fifthLord?:    PlanetDomainContext;
  ninthLord?:    PlanetDomainContext;
  secondLord?:   PlanetDomainContext;
  eleventhLord?: PlanetDomainContext;
}

// ─── Relevance gate ───────────────────────────────────────────────────────────
/**
 * Correction 5: A planet must pass the relevance gate to receive positive bonuses.
 * Gate passes if ANY of the following is true:
 * 1. Planet owns the domain's house (direct ownership)
 * 2. Planet is placed in the domain's house (direct placement)
 * 3. Natural karakatwa for this domain is >= 0.5 (strong karaka)
 * 4. Domain varga score >= 58 (confirming varga evidence)
 *
 * Without passing, positiveBonus = 0 (the planet simply has no strong domain claim).
 * Base formula still runs normally — relevance gate only blocks the bonus layer.
 */
function passesRelevanceGate(
  planet: string,
  housesRuled: number[],
  housePosition: number,
  domainHouse: number | null,
  naturalKarakatwaStrength: number,
  domainVargaScore: number
): boolean {
  if (domainHouse !== null) {
    if (housesRuled.includes(domainHouse)) return true;
    if (housePosition === domainHouse) return true;
  }
  if (naturalKarakatwaStrength >= 0.5) return true;
  if (domainVargaScore >= 58) return true;
  return false;
}

// ─── Positive bonus calculator ────────────────────────────────────────────────
/**
 * Correction 5: Compute positive bonus (0–22 max) for enabling factors.
 * Only applied if planet passes relevanceGate.
 *
 * Sources:
 * - Yogakaraka ownership of domain house: +14
 * - Strong benefic ownership: +10
 * - Benefic/kendra ownership: +7
 * - Strong karakatwa (>=0.8) + good delivery: +8
 * - Domain varga strongly confirming (score >=70): +6
 * - Condition supported + delivery reliable: +4
 * - Well-supported house placement: +4
 *
 * Total capped at 22.
 */
function computePositiveBonus(params: {
  planet: string;
  functionalNature: FunctionalNature;
  functionalLean: FunctionalLean;
  housesRuled: number[];
  housePosition: number;
  domainHouse: number | null;
  naturalKarakatwaStrength: number;
  domainVargaScore: number;
  conditionGrade: ConditionGrade;
  deliveryGrade: DeliveryGrade;
}): number {
  const {
    functionalNature, functionalLean, housesRuled, housePosition,
    domainHouse, naturalKarakatwaStrength, domainVargaScore,
    conditionGrade, deliveryGrade,
  } = params;

  let bonus = 0;

  // Ownership quality
  if (domainHouse !== null && housesRuled.includes(domainHouse)) {
    if (functionalNature === 'yogakaraka') bonus += 14;
    else if (functionalNature === 'strong_benefic') bonus += 10;
    else if (functionalNature === 'benefic') bonus += 7;
    else if (functionalNature === 'mixed' && (functionalLean === 'benefic_lean' || functionalLean === 'protective_with_complication')) bonus += 4;
  }

  // Direct placement in domain house (non-ownership)
  if (domainHouse !== null && housePosition === domainHouse && !(domainHouse && housesRuled.includes(domainHouse))) {
    bonus += 3; // placed but not lord — smaller bonus
  }

  // Strong karakatwa + good delivery
  if (naturalKarakatwaStrength >= 0.8 && deliveryGrade !== 'obstructed' && deliveryGrade !== 'distorted_delivery') {
    bonus += 8;
  } else if (naturalKarakatwaStrength >= 0.5) {
    bonus += 4;
  }

  // Domain varga strongly confirming
  if (domainVargaScore >= 70) bonus += 6;
  else if (domainVargaScore >= 58) bonus += 3;

  // Condition and delivery quality bonus (small — condition already in base)
  if (conditionGrade === 'supported' && deliveryGrade === 'reliable') bonus += 4;
  else if (conditionGrade === 'supported' || conditionGrade === 'clean') bonus += 2;

  // Cap at 22 as specified
  return Math.min(22, bonus);
}

// ─── Constraint penalty calculator ───────────────────────────────────────────
/**
 * Returns a smooth penalty (0–35) for obstructing domain factors.
 * Derived from real karakaContext (actual delivery/condition/conflictFlags).
 */
function domainConstraintPenalty(
  domain: Domain,
  varga: VargaAssessment,
  context: DomainKarakaContext,
  selfDelivery: DeliveryGrade,
  selfCondition: ConditionGrade,
  conflictFlags: ConflictFlag[]
): { penalty: number; constrained: boolean } {
  let penalty = 0;
  let constrained = false;

  if (domain === 'marriage') {
    if (varga.d9Contradicts) {
      penalty += varga.vargaSupportScore <= 4 ? 20 : 12; constrained = true;
    }
    if (context.venus) {
      const vd = deliveryToComponent(context.venus.delivery);
      if (vd < 45) { penalty += Math.round((45 - vd) * 0.3); constrained = true; }
    }
    if (context.seventhLord) {
      const ld = deliveryToComponent(context.seventhLord.delivery);
      if (ld < 45) { penalty += Math.round((45 - ld) * 0.25); constrained = true; }
    }
    if (conflictFlags.includes('node_dominated')) { penalty += 8; constrained = true; }
    if (selfDelivery === 'obstructed' || selfDelivery === 'distorted_delivery') { penalty += 15; constrained = true; }
  }

  if (domain === 'career') {
    const d10 = varga.domainVargaScores['career'] ?? 50;
    if (d10 < 35) { penalty += Math.round((35 - d10) * 0.4); constrained = true; }
    if (context.tenthLord) {
      const ld = deliveryToComponent(context.tenthLord.delivery);
      if (ld < 45) { penalty += Math.round((45 - ld) * 0.3); constrained = true; }
    }
    if (selfDelivery === 'obstructed') { penalty += 18; constrained = true; }
  }

  if (domain === 'children') {
    const d7 = varga.domainVargaScores['children'] ?? 50;
    if (d7 < 35) { penalty += Math.round((35 - d7) * 0.4); constrained = true; }
    if (context.jupiter) {
      const jd = deliveryToComponent(context.jupiter.delivery);
      if (jd < 45) { penalty += Math.round((45 - jd) * 0.35); constrained = true; }
      if (context.jupiter.conflictFlags.includes('strong_afflicted') || context.jupiter.conflictFlags.includes('weak_afflicted')) {
        penalty += 6; constrained = true;
      }
    }
    if (context.fifthLord) {
      const ld = deliveryToComponent(context.fifthLord.delivery);
      if (ld < 45) { penalty += Math.round((45 - ld) * 0.25); constrained = true; }
    }
  }

  if (domain === 'wealth') {
    const cd = deliveryToComponent(selfDelivery);
    if (cd < 45) { penalty += Math.round((45 - cd) * 0.2); constrained = true; }
    if (context.jupiter && deliveryToComponent(context.jupiter.delivery) < 45) { penalty += 5; constrained = true; }
    if (context.secondLord) {
      const lc = conditionToComponent(context.secondLord.condition);
      if (lc < 45) { penalty += Math.round((45 - lc) * 0.15); constrained = true; }
    }
  }

  if (domain === 'spirituality') {
    if (varga.d9Contradicts) { penalty += 15; constrained = true; }
    if (selfCondition === 'heavily_afflicted' || selfCondition === 'distorted') { penalty += 12; constrained = true; }
    if (conflictFlags.includes('mars_dominated')) { penalty += 8; constrained = true; }
  }

  if (domain === 'health') {
    if (selfCondition === 'heavily_afflicted' || selfCondition === 'distorted') { penalty += 10; constrained = true; }
    if (conflictFlags.includes('node_dominated')) { penalty += 5; constrained = true; }
  }

  // General condition penalty
  if (selfCondition === 'distorted') { penalty += 8; constrained = true; }
  else if (selfCondition === 'heavily_afflicted' && penalty < 10) { penalty += 5; constrained = true; }

  return { penalty: Math.min(35, penalty), constrained };
}

// ─── Main domain computation ──────────────────────────────────────────────────

export function computeDomains(
  planet: string,
  housesRuled: number[],
  housePosition: number,
  functionalNature: FunctionalNature,
  functionalLean: FunctionalLean,
  conditionGrade: ConditionGrade,
  deliveryGrade: DeliveryGrade,
  vargaAssessment: VargaAssessment,
  lagnaSign: number,
  karakaContext: DomainKarakaContext,
  conflictFlags: ConflictFlag[]
): {
  strongDomains: Domain[];
  mixedDomains: Domain[];
  weakDomains: Domain[];
  domainConfidenceMap: Partial<Record<Domain, ConfidenceGrade>>;
} {
  const ALL_DOMAINS: Domain[] = [
    'self','wealth','siblings','home','children','health','marriage',
    'longevity','fortune','career','gains','liberation','intellect',
    'spirituality','communication','foreign',
  ];

  const strong: Domain[] = [], mixed: Domain[] = [], weak: Domain[] = [];
  const confidenceMap: Partial<Record<Domain, ConfidenceGrade>> = {};

  // Base condition/delivery scores for the 15% component
  const condDelivBase = conditionToComponent(conditionGrade) * 0.5 + deliveryToComponent(deliveryGrade) * 0.5;

  for (const domain of ALL_DOMAINS) {
    const houseForDomain = Object.entries(HOUSE_DOMAIN).find(([, d]) => d === domain)?.[0];
    const domainHouse    = houseForDomain ? parseInt(houseForDomain) : null;
    const naturalStr     = NATURAL_KARAKATWA[planet]?.[domain] ?? 0;
    const domainVargaScore = getDomainVargaScore(domain, vargaAssessment);

    // ── 1. Ownership relevance (35%) ─────────────────────────────────────────
    let ownershipScore = 45; // neutral default
    if (domainHouse !== null && housesRuled.includes(domainHouse)) {
      const fnBonus = functionalNature === 'yogakaraka' ? 30
                    : functionalNature === 'strong_benefic' ? 25
                    : functionalNature === 'benefic' ? 20
                    : functionalNature === 'mixed'
                        ? (functionalLean === 'benefic_lean' ? 10
                          : functionalLean === 'malefic_lean' ? -10
                          : functionalLean === 'maraka_driven' ? -5 : 0)
                    : functionalNature === 'malefic' ? -20 : 0;
      ownershipScore = Math.max(10, Math.min(95, 65 + fnBonus));
    } else if (housePosition === domainHouse) {
      ownershipScore = functionalNature === 'malefic' ? 35 : 55;
    } else {
      ownershipScore = 30;
    }

    // ── 2. Natural karakatwa (20%) ─────────────────────────────────────────────
    const naturalStrength = naturalStr * 100;

    // ── 3. Placement relevance (15%) ──────────────────────────────────────────
    const placementScore = domainHouse
      ? (housePosition === domainHouse ? 75
        : [1,4,7,10].includes(housePosition) ? 50
        : [5,9].includes(housePosition) ? 55 : 40)
      : 40;

    // ── 4. Condition/delivery (15%) ───────────────────────────────────────────
    const condScore = condDelivBase;

    // ── 5. Domain-varga (15%) ─────────────────────────────────────────────────
    const vargaScore = domainVargaScore;

    // ── Weighted base total ────────────────────────────────────────────────────
    let total = ownershipScore * 0.35 + naturalStrength * 0.20 +
                placementScore * 0.15 + condScore * 0.15 + vargaScore * 0.15;

    // ── Correction 5: Positive bonus (with relevance gate) ────────────────────
    const relevant = passesRelevanceGate(
      planet, housesRuled, housePosition, domainHouse, naturalStr, domainVargaScore
    );

    if (relevant) {
      const positiveBonus = computePositiveBonus({
        planet, functionalNature, functionalLean, housesRuled, housePosition,
        domainHouse, naturalKarakatwaStrength: naturalStr, domainVargaScore,
        conditionGrade, deliveryGrade,
      });
      total += positiveBonus;
    }

    // ── Constraint penalty ─────────────────────────────────────────────────────
    const { penalty, constrained } = domainConstraintPenalty(
      domain, vargaAssessment, karakaContext, deliveryGrade, conditionGrade, conflictFlags
    );
    total = Math.max(0, total - penalty);
    total = Math.round(Math.min(100, total));

    const classification = classifyDomainScore(total);
    const confidence = domainConfidence(domain, total, vargaAssessment, constrained);

    confidenceMap[domain] = confidence;
    if (classification === 'strong') strong.push(domain);
    else if (classification === 'mixed') mixed.push(domain);
    else weak.push(domain);
  }

  return {
    strongDomains: strong.slice(0, 5),
    mixedDomains:  mixed.slice(0, 4),
    weakDomains:   weak.slice(0, 4),
    domainConfidenceMap: confidenceMap,
  };
}
