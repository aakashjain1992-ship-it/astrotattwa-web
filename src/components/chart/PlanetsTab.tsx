'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assessAllPlanets, getNaturalRelationship } from '@/lib/astrology/strength';
import type { PlanetStrengthResult, StructuralGrade, DeliveryGrade, Domain, FunctionalNature, FunctionalLean } from '@/lib/astrology/strength';
import type { PlanetData, AscendantData, ChartDashaData } from '@/types/astrology';
import { calculateAntardashas, calculatePratyantars, calculateSookshmas, vimshottariDasha } from '@/lib/astrology/kp/dasa';
import { DASHA_ORDER, DASHA_YEARS } from '@/lib/astrology/kp/constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanetsTabProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dashaInfo?: ChartDashaData;
  birthDate?: string; // ISO UTC
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const GLYPH: Record<string,string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

// Natural karaka domains — what each planet naturally signifies
const PLANET_KARAKAS: Record<string, string[]> = {
  Sun:     ['soul','authority','father','career','health'],
  Moon:    ['mind','emotions','mother','home','belonging'],
  Mars:    ['energy','courage','siblings','property','competition'],
  Mercury: ['intellect','communication','skills','business','adaptability'],
  Jupiter: ['wisdom','children','wealth','fortune','spirituality'],
  Venus:   ['relationships','beauty','pleasure','comfort','creativity'],
  Saturn:  ['discipline','karma','longevity','career','perseverance'],
  Rahu:    ['ambition','foreign','unconventional paths','obsession','disruption'],
  Ketu:    ['spirituality','detachment','past-life karma','moksha','insight'],
};

// Domain → readable label
const DOMAIN_LABELS: Record<Domain, string> = {
  self:'Self & identity', wealth:'Wealth', siblings:'Siblings',
  home:'Home & family', children:'Children', health:'Health',
  marriage:'Relationships', longevity:'Longevity', fortune:'Fortune',
  career:'Career', gains:'Income & gains', liberation:'Spirituality',
  father:'Father', mother:'Mother', intellect:'Intellect',
  spirituality:'Spiritual life', communication:'Communication', foreign:'Foreign & travel',
};

// Domain → emoji icon
const DOMAIN_ICONS: Record<Domain, string> = {
  self:'✦', wealth:'◈', siblings:'◉', home:'⌂', children:'❋',
  health:'♥', marriage:'◎', longevity:'◇', fortune:'★',
  career:'▲', gains:'◆', liberation:'☽', father:'☀', mother:'◑',
  intellect:'✧', spirituality:'☸', communication:'◐', foreign:'◈',
};

// ─── Language helpers ─────────────────────────────────────────────────────────

function strGradeToWord(g: StructuralGrade): string {
  return { very_strong:'Very strong', strong:'Strong', moderate:'Average',
           weak:'Struggling', very_weak:'Very weak' }[g];
}

function strGradeToWidth(g: StructuralGrade): number {
  return { very_strong:92, strong:74, moderate:55, weak:32, very_weak:14 }[g];
}

function delivGradeToWord(g: DeliveryGrade): string {
  return { reliable:'Flows well', delayed:'Steady but slow',
           inconsistent:'Comes and goes', distorted_delivery:'Hard to work with',
           obstructed:'Mostly blocked' }[g];
}

function strGradeToColor(g: StructuralGrade): string {
  // Structural bar: 3 colours only
  if (g === 'very_strong' || g === 'strong') return '#059669';
  if (g === 'moderate') return '#d97706';
  return '#dc2626';
}

// Single colour function for delivery — 3 values max
function delivGradeToColor(g: DeliveryGrade, sg?: StructuralGrade): string {
  if (g === 'reliable') return '#059669';
  if (g === 'delayed') return (sg === 'very_strong' || sg === 'strong') ? '#059669' : '#d97706';
  if (g === 'inconsistent') return '#d97706';
  return '#dc2626';
}

function fnToGroupKey(r: PlanetStrengthResult): 'working'|'mixed'|'struggling' {
  // Group by delivery grade — this is what the user actually feels in their life.
  // A strong Saturn that rules difficult houses still delivers steadily;
  // it should not appear in "Facing challenges" just because of house lordship.
  const dg = r.deliveryGrade;
  const sg = r.structuralGrade;

  if (dg === 'reliable') return 'working';
  if (dg === 'delayed') {
    // Strong + delayed = working (results come, just slower)
    // Weak + delayed = mixed
    return (sg === 'very_strong' || sg === 'strong') ? 'working' : 'mixed';
  }
  if (dg === 'inconsistent') return 'mixed';
  // obstructed or distorted_delivery
  return 'struggling';
}

// ─── "In your chart" — 2-3 paragraph human story ─────────────────────────────

function buildInYourChart(r: PlanetStrengthResult, pd: PlanetData, lagnaSign: number): string[] {
  const p = r.planet;
  const fn = r.functionalNature;
  const lean = r.functionalLean;
  const sg = r.structuralGrade;
  const cg = r.conditionGrade;
  const dg = r.deliveryGrade;
  const house = r.housePosition;
  const sign = pd.sign;
  const isRetro = r.isRetrograde;
  const isCombust = r.isCombust;
  const isNB = r.neechaBhanga.isApplied;
  const dignityLevel = r.dignityLevel;
  const isNode = p === 'Rahu' || p === 'Ketu';

  // Paragraph 1 — role in this chart
  let p1 = '';
  const housesStr = r.housesRuled.length > 0
    ? `${r.housesRuled.map(h => `${h}${ord(h)}`).join(' and ')} ${r.housesRuled.length === 1 ? 'house' : 'houses'}`
    : 'no houses specifically';

  if (fn === 'yogakaraka') {
    p1 = `${p} is the most powerful planet in your chart — a yogakaraka, meaning it rules both a kendra (angular house) and a trikona (house of fortune) simultaneously. Very few charts have this, and when they do, that planet becomes a natural ally for achievement, success, and growth.`;
  } else if (fn === 'strong_benefic') {
    if (r.housesRuled.includes(1)) {
      p1 = `${p} is your lagna lord — the ruler of your entire chart, your body, and your self-expression. Whatever house your lagna lord is placed in and how it is doing in your chart shapes how you show up in the world.`;
    } else {
      p1 = `${p} plays a primary beneficial role in your chart, ruling the ${housesStr}. This makes it one of the planets that tends to support your life.`;
    }
  } else if (fn === 'benefic') {
    p1 = `${p} rules the ${housesStr} — kendra houses that stabilise the chart. Its job is to bring structure and strength to your life areas.`;
  } else if (fn === 'malefic') {
    p1 = `${p} rules the ${housesStr} in your chart — houses that create friction, service demands, and challenges. This makes it a functional malefic for your lagna, meaning its natural energy tends to create more difficulty than ease when it is activated.`;
  } else if (fn === 'mixed') {
    const leanNote = lean === 'benefic_lean' ? 'the positive side tends to outweigh the difficult'
                   : lean === 'malefic_lean' ? 'the challenging side tends to outweigh the positive'
                   : lean === 'maraka_driven' ? 'it carries maraka (life-sensitive) responsibility through 2nd and 7th lordship'
                   : 'it has roughly balanced ownership';
    p1 = `${p} has a mixed role in your chart, ruling the ${housesStr}. In mixed planets, context matters a great deal — ${leanNote}.`;
  } else {
    p1 = `${p} has a neutral role in your chart — it doesn't carry strong positive or negative house lordship for your lagna. Its impact comes primarily from where it is placed and what it touches.`;
  }

  // Paragraph 2 — placement and structural quality
  let p2 = '';
  const signDesc = {
    exalted: `exalted in ${sign} — one of the strongest positions in the zodiac`,
    moolatrikona: `in its moolatrikona portion of ${sign} — near its own sign, with extra strength`,
    own_sign: `in its own sign ${sign} — comfortable and in full control`,
    great_friend: `in a great friend's sign (${sign}) — well received and supported`,
    friend: `in a friendly sign (${sign}) — comfortable placement`,
    neutral: `in a neutral sign (${sign}) — neither especially helped nor hindered`,
    enemy: `in an enemy sign (${sign}) — somewhat uncomfortable, works harder for results`,
    great_enemy: `in a great enemy's sign (${sign}) — very uncomfortable placement`,
    debilitated: `debilitated in ${sign} — the sign where ${p} is at its weakest structurally`,
  }[r.dignityLevel] ?? `in ${sign}`;

  const houseNote = house === 1 ? 'in your lagna itself — very visible in your personality'
    : house === 4 ? 'in the 4th house — home, mother, and inner peace'
    : house === 7 ? 'in the 7th house — relationships and partnerships'
    : house === 10 ? 'in the 10th house — career and public life'
    : house === 5 ? 'in the 5th house — creativity, children, and intelligence'
    : house === 9 ? 'in the 9th house — fortune, dharma, and father'
    : house === 8 ? 'in the 8th house — transformation, depth, and hidden matters'
    : house === 12 ? 'in the 12th house — liberation, foreign lands, and what lies beneath'
    : `in the ${house}${ord(house)} house`;

  p2 = `In your chart, ${p} is ${signDesc}, placed ${houseNote}.`;

  if (isRetro && !isNode) {
    p2 += ` It is retrograde — which means its energy turns inward. Results through ${p} tend to come through internal processing, revisiting, or unconventional paths rather than straightforward expression.`;
  }
  if (isCombust && p !== 'Sun') {
    p2 += ` It is also combust — too close to the Sun — which overshadows it and reduces its independent expression.`;
  }
  if (isNB) {
    p2 += ` Interestingly, Neecha Bhanga (a classical cancellation) applies here — the debilitation is at least partially cancelled, which gives ${p} some recovery capacity that it would not otherwise have.`;
  }

  // Paragraph 3 — condition and delivery
  let p3 = '';
  const topAffliction = r.afflictions[0];
  const topProtection = r.protections[0];

  if (cg === 'supported' || cg === 'clean') {
    if (topProtection) {
      p3 = `Its condition is ${cg === 'supported' ? 'well supported' : 'clean'} — ${topProtection.toLowerCase().replace(/\.$/, '')}. This means ${p}'s energy can express itself without major interference.`;
    } else {
      p3 = `Its condition is ${cg === 'supported' ? 'well supported' : 'clean'} — no major afflictions. ${p} can express itself relatively freely.`;
    }
  } else if (cg === 'afflicted') {
    if (topAffliction) {
      p3 = `Its condition is afflicted — ${topAffliction.toLowerCase().replace(/\.$/, '')}. This creates some disturbance in how ${p} expresses itself, though not severe enough to block it completely.`;
    } else {
      p3 = `Its condition is afflicted — there are planetary influences that create friction in how ${p} operates.`;
    }
  } else if (cg === 'heavily_afflicted' || cg === 'distorted') {
    if (topAffliction) {
      p3 = `Its condition is ${cg === 'distorted' ? 'severely distorted' : 'heavily afflicted'} — ${topAffliction.toLowerCase().replace(/\.$/, '')}. This significantly alters how ${p}'s energy comes through — results in its domains tend to arrive in a distorted or intensified form.`;
    } else {
      p3 = `Its condition is ${cg === 'distorted' ? 'severely distorted' : 'heavily afflicted'}, which significantly impacts how its energy reaches you.`;
    }
  }

  // Node-specific addendum
  if (isNode && r.nodeInheritance) {
    const disp = r.nodeInheritance.dispositorName;
    const dispDel = r.nodeInheritance.dispositorDeliveryGrade;
    const dispFn = r.nodeInheritance.dispositorFunctionalNature;
    const quality = dispDel === 'reliable' ? 'strong and reliable' : dispDel === 'obstructed' || dispDel === 'distorted_delivery' ? 'weak and compromised' : 'moderate';
    p3 += ` ${p} doesn't rule houses directly — its character is inherited from ${disp} (${quality} in your chart). ${dispDel === 'reliable' || dispDel === 'delayed' ? `This gives ${p} a relatively organised channel to work through.` : `This means ${p}'s energy has a fragile foundation — it amplifies without direction.`}`;
  }

  return [p1, p2, p3].filter(Boolean);
}

// ─── "What this means" — per life area ───────────────────────────────────────

interface AreaMeaning {
  area: string;
  icon: string;
  signal: string;
  signalType: 'good' | 'mixed' | 'hard';
  what: string;
  why: string;
}

function buildWhatThisMeans(r: PlanetStrengthResult, pd: PlanetData): AreaMeaning[] {
  const p = r.planet;
  const fn = r.functionalNature;
  const lean = r.functionalLean;
  const cg = r.conditionGrade;
  const dg = r.deliveryGrade;
  const sg = r.structuralGrade;
  const result: AreaMeaning[] = [];

  const isDeliveryGood = dg === 'reliable' || dg === 'delayed';
  const isDeliveryBad  = dg === 'obstructed' || dg === 'distorted_delivery';
  const isStrong       = sg === 'very_strong' || sg === 'strong';
  const isWeak         = sg === 'weak' || sg === 'very_weak';
  const isAfflicted    = cg === 'afflicted' || cg === 'heavily_afflicted' || cg === 'distorted';

  // Pick the 3 most relevant domains
  const dominated = [
    ...r.strongDomains.slice(0, 2),
    ...r.mixedDomains.slice(0, 1),
    ...r.weakDomains.slice(0, 1),
  ];
  // Ensure unique and capped at 3–4
  const seen = new Set<string>();
  const picked: Array<{ domain: Domain; type: 'strong'|'mixed'|'weak' }> = [];
  for (const d of r.strongDomains.slice(0,2))  { if (!seen.has(d)) { seen.add(d); picked.push({domain:d,type:'strong'}); } }
  for (const d of r.mixedDomains.slice(0,2))   { if (!seen.has(d)) { seen.add(d); picked.push({domain:d,type:'mixed'}); } }
  for (const d of r.weakDomains.slice(0,1))    { if (!seen.has(d)) { seen.add(d); picked.push({domain:d,type:'weak'}); } }

  const finalPicked = picked.slice(0, 4);

  for (const { domain, type } of finalPicked) {
    const label = DOMAIN_LABELS[domain] ?? domain;
    const icon  = DOMAIN_ICONS[domain] ?? '◎';

    const signal = type === 'strong' ? 'Works in your favour'
                 : type === 'mixed'  ? 'Mixed'
                 : 'Needs attention';
    const signalType: 'good'|'mixed'|'hard' = type === 'strong' ? 'good' : type === 'mixed' ? 'mixed' : 'hard';

    const what = buildDomainWhat(p, domain, type, fn, lean, cg, dg, sg, r);
    const why  = buildDomainWhy(p, domain, type, fn, lean, cg, dg, sg, r, pd);

    result.push({ area: label, icon, signal, signalType, what, why });
  }

  return result;
}

function buildDomainWhat(
  planet: string, domain: Domain, type: 'strong'|'mixed'|'weak',
  fn: FunctionalNature, lean: FunctionalLean, cg: ConditionGrade,
  dg: DeliveryGrade, sg: StructuralGrade, r: PlanetStrengthResult
): string {
  const isStrong = type === 'strong';
  const isMixed  = type === 'mixed';

  // Domain-specific human descriptions
  const DESC: Partial<Record<Domain, [string, string, string]>> = {
    self:         ['Your sense of identity and self-expression tend to flow naturally.', 'Your self-expression is a work in progress — confidence can be built but takes effort.', 'You may struggle with a clear sense of self or find it hard to be fully seen.'],
    wealth:       ['Financial matters tend to work in your favour — income, savings, and resources accumulate.', 'Finances are up and down — not in crisis, but not stable either.', 'Wealth requires more effort and attention than it does for most — there can be instability or unexpected losses.'],
    career:       ['Career tends to reward your efforts. Recognition and advancement are likely with consistent work.', 'Career has its moments — good periods followed by plateaus or changes of direction.', 'Career can feel like pushing against resistance — success is possible but slower and harder.'],
    marriage:     ['Long-term partnership and close relationships tend to be fulfilling and supportive.', 'Relationships are meaningful but complex — they bring both deep connection and genuine challenges.', 'Close partnerships carry weight in your chart — this is an area that deserves conscious attention and patience.'],
    children:     ['Children and creativity tend to bring joy and fulfilment — this area is supported.', 'Children and creative expression are mixed — rewarding but not without complications.', 'This area requires patience — timing and circumstances around children or creative projects can be challenging.'],
    health:       ['Your physical vitality is supported — resilience and energy tend to be present.', 'Health is generally okay but benefits from attention — there may be recurring minor issues.', 'Health deserves ongoing attention — this planet\'s influence can create recurring physical strain or vulnerability.'],
    home:         ['Home and domestic life tend to feel stable and nourishing — a genuine sanctuary.', 'Home life is meaningful but can require repeated effort to maintain peace.', 'Home and family matters may carry recurring friction — domestic peace takes conscious effort to maintain.'],
    fortune:      ['Fortune and good luck are genuine features of your chart — opportunity tends to arrive.', 'Fortune is there but comes through effort — not luck alone.', 'Fortune comes through depth and patience rather than ease — it arrives, but usually not without a journey.'],
    intellect:    ['Your mind is sharp and works in your favour — learning and analysis come naturally.', 'Intellectually capable but inconsistent — some areas sharp, others foggy.', 'Mental clarity can be challenging — the mind works hard but output is harder to access.'],
    spirituality: ['Spiritual practice and inner life are genuinely supported in your chart.', 'Spirituality is meaningful but complex — the path involves real questioning.', 'Deep spiritual themes run through your chart — they demand attention whether you seek them or not.'],
    gains:        ['Income, networks, and gains from effort tend to come through.', 'Gains are possible but require significant effort and sometimes competition.', 'Gains face resistance — what you earn may come with strings attached or feel inconsistent.'],
    longevity:    ['Longevity and physical resilience are real strengths.', 'Physical health and longevity need ongoing attention.', 'The body may carry more demands than usual — pacing and rest matter here.'],
    foreign:      ['Foreign connections, travel, and cross-cultural experiences tend to bring opportunity.', 'Foreign matters are a mixed chapter — opportunity exists but the path has obstacles.', 'Foreign matters are a source of disruption or complication in this chart.'],
    communication:['Communication is a strength — words and ideas reach people effectively.', 'Communication is functional but can be inconsistent or misread.', 'Communication is an area of real effort — what you mean and what\'s received don\'t always match.'],
    liberation:   ['Spiritual liberation and depth are supported — this is a genuine strength.', 'Liberation themes run through your life but the path is complex.', 'Liberation-related themes are intense — there is depth here, but it requires conscious engagement.'],
    siblings:     ['Sibling relationships and close networks tend to be supportive.', 'Sibling relationships are meaningful but complex.', 'Sibling and close network dynamics carry friction in this chart.'],
    father:       ['The father figure and authority relationships tend to be positive.', 'The father relationship is meaningful but complicated.', 'Authority figures and the father relationship carry weight and complexity.'],
    mother:       ['The mother figure and home base tend to be nourishing.', 'The mother relationship is meaningful but carries some complexity.', 'The mother and domestic roots may carry emotional complexity.'],
  };

  const [goodTxt, mixedTxt, hardTxt] = DESC[domain] ?? [
    `${domain} tends to work in your favour with this planet's support.`,
    `${domain} is a mixed area — sometimes supported, sometimes challenging.`,
    `${domain} requires extra attention and patience in your chart.`,
  ];

  // Adjust for delivery
  if (type === 'strong' && dg === 'delayed') {
    return goodTxt + ' Results come — but usually after patience and effort rather than quickly.';
  }
  if (type === 'strong' && (dg === 'inconsistent')) {
    return goodTxt + ' The timing can be inconsistent — good periods followed by quieter spells.';
  }
  return type === 'strong' ? goodTxt : type === 'mixed' ? mixedTxt : hardTxt;
}

function buildDomainWhy(
  planet: string, domain: Domain, type: 'strong'|'mixed'|'weak',
  fn: FunctionalNature, lean: FunctionalLean, cg: ConditionGrade,
  dg: DeliveryGrade, sg: StructuralGrade, r: PlanetStrengthResult, pd: PlanetData
): string {
  const parts: string[] = [];

  // Why based on ownership
  if (r.housesRuled.some(h => h === domainToHouse(domain))) {
    parts.push(`${planet} directly rules the house governing ${(DOMAIN_LABELS[domain] ?? domain).toLowerCase()}`);
  } else if (r.housePosition === domainToHouse(domain)) {
    parts.push(`${planet} is placed in the house of ${(DOMAIN_LABELS[domain] ?? domain).toLowerCase()}`);
  } else {
    const karaka = PLANET_KARAKAS[planet]?.find(k => k.includes(domain) || domain.includes(k));
    if (karaka) parts.push(`${planet} is the natural significator of ${karaka}`);
  }

  // Why based on condition
  if (cg === 'supported' || cg === 'clean') {
    parts.push(`it is in ${cg === 'supported' ? 'supported' : 'clean'} condition — no major planetary interference`);
  } else if (cg === 'afflicted') {
    const topAffliction = r.afflictions[0];
    if (topAffliction) parts.push(`it is afflicted (${topAffliction.split('—')[0].trim().toLowerCase().replace(/\.$/, '')})`);
  } else if (cg === 'heavily_afflicted' || cg === 'distorted') {
    parts.push(`it carries significant affliction that distorts its natural expression`);
  }

  // Why based on delivery
  if (dg === 'obstructed' || dg === 'distorted_delivery') {
    parts.push(`its delivery is blocked or distorted, limiting what it can pass through to your life`);
  } else if (dg === 'reliable') {
    parts.push(`it delivers its results reliably`);
  } else if (dg === 'delayed') {
    parts.push(`its results come with delay — patience is required`);
  }

  // D9 note for marriage-sensitive
  if (domain === 'marriage' && r.vargaAssessment.hasD9SecondPass && r.vargaAssessment.d9Contradicts) {
    parts.push(`the Navamsa (D9) specifically weakens this planet for relationship matters`);
  }

  if (parts.length === 0) return `${planet}'s placement and condition shape this area of your life.`;
  return parts.map((p, i) => i === 0 ? cap(p) : p).join(', and ') + '.';
}

function domainToHouse(domain: Domain): number {
  const map: Partial<Record<Domain, number>> = {
    self:1, wealth:2, siblings:3, home:4, children:5, health:6,
    marriage:7, longevity:8, fortune:9, career:10, gains:11, liberation:12,
  };
  return map[domain] ?? 0;
}

// ─── Dasha Timeline ───────────────────────────────────────────────────────────

interface DashaWindowItem {
  mahaLord: string;
  antarLord: string | null;
  pratyLord: string | null;
  sookshmaLord: string | null;
  level: 'maha' | 'antar' | 'pratyantar' | 'sookshma';
  dateRange: string;
  isActive: boolean;
  quality: 'great' | 'good' | 'moderate' | 'difficult';
  reason: string;
}

/**
 * Quality score for a dasha combination.
 * Weighs relationship between ALL active lords and the planet being assessed,
 * plus the planet's own delivery grade.
 */
function dashaQuality(
  planet: string,
  r: PlanetStrengthResult,
  lords: string[]            // [mahaLord, antarLord?, pratyLord?, sookshmaLord?]
): DashaWindowItem['quality'] {
  // Planet's own delivery grade sets the ceiling
  const deliveryCeiling: DashaWindowItem['quality'] =
    r.deliveryGrade === 'reliable'    ? 'great'
    : r.deliveryGrade === 'delayed'   ? 'good'
    : r.deliveryGrade === 'inconsistent' ? 'moderate'
    : 'difficult';

  // Count friendly / enemy relationships with all enclosing lords
  let friendCount = 0, enemyCount = 0;
  for (const lord of lords) {
    if (lord === planet) continue; // own period — neutral for relationship calc
    const rel = getNaturalRelationship(lord, planet);
    if (rel === 'friend') friendCount++;
    if (rel === 'enemy')  enemyCount++;
  }

  const relScore: DashaWindowItem['quality'] =
    enemyCount > 0     ? 'difficult'
    : friendCount >= 2 ? 'great'
    : friendCount === 1 ? 'good'
    : 'moderate';

  // Take the worse of delivery ceiling and relationship score
  const ORDER = { great:0, good:1, moderate:2, difficult:3 };
  return ORDER[deliveryCeiling] >= ORDER[relScore] ? deliveryCeiling : relScore;
}

function dashaReason(
  planet: string,
  level: DashaWindowItem['level'],
  mahaLord: string,
  antarLord: string | null,
  pratyLord: string | null,
  sookshmaLord: string | null,
  quality: DashaWindowItem['quality'],
  r: PlanetStrengthResult
): string {
  const enclosing = [mahaLord, antarLord, pratyLord, sookshmaLord].filter(Boolean) as string[];
  const otherLords = enclosing.filter(l => l !== planet);

  if (level === 'maha') {
    if (quality === 'great') return `${planet}'s own major period — its themes fully dominate. ${planet} delivers well in your chart, so this is a genuinely productive stretch.`;
    if (quality === 'good')  return `${planet}'s own major period. Results arrive, though with characteristic slowness or a non-linear path.`;
    if (quality === 'moderate') return `${planet}'s own major period. Its results are inconsistent — some things work, others follow unexpected patterns.`;
    return `${planet}'s own major period. Because ${planet} faces real challenges in your chart, this period is intense and can feel demanding.`;
  }

  const enclosingStr = otherLords.length > 1
    ? `${otherLords.slice(0,-1).join(', ')} and ${otherLords[otherLords.length-1]}`
    : otherLords[0] ?? mahaLord;

  const levelLabel = level === 'antar' ? 'sub-period'
                   : level === 'pratyantar' ? 'minor sub-period'
                   : 'fine-grain window';

  // Relationship notes
  const rels = otherLords.map(l => {
    const rel = getNaturalRelationship(l, planet);
    return rel === 'friend' ? `${l} is a friend` : rel === 'enemy' ? `${l} is an enemy` : null;
  }).filter(Boolean);

  let relNote = rels.length > 0 ? rels.join('; ') + '.' : '';

  if (quality === 'great' || quality === 'good') {
    return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period. ${relNote} Good window for ${planet}-related themes — watch for movement in ${(r.strongDomains[0] ? (DOMAIN_LABELS[r.strongDomains[0]] ?? r.strongDomains[0]).toLowerCase() : 'your key life areas')}.`;
  }
  if (quality === 'difficult') {
    return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period. ${relNote} This combination creates friction — ${planet}'s areas may feel more pressured or blocked during this window.`;
  }
  return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period. ${relNote} Mixed results — some things move, others stall.`;
}

interface MahaPeriod {
  planet: string;
  startUtc: string;
  endUtc: string;
}

function buildDashaTimeline(
  planet: string,
  r: PlanetStrengthResult,
  allMahas: MahaPeriod[]
): DashaWindowItem[] {
  const items: DashaWindowItem[] = [];
  if (!allMahas.length) return items;

  const now = new Date();

  for (const maha of allMahas) {
    const mahaStart  = new Date(maha.startUtc);
    const mahaEnd    = new Date(maha.endUtc);
    const mahaActive = now >= mahaStart && now <= mahaEnd;

    // ── Level 1: Planet IS the Mahadasha ─────────────────────────────────────
    if (maha.planet === planet) {
      const quality = dashaQuality(planet, r, [planet]);
      items.push({
        mahaLord: planet, antarLord: null, pratyLord: null, sookshmaLord: null,
        level: 'maha', dateRange: fmtRange(mahaStart, mahaEnd),
        isActive: mahaActive, quality,
        reason: dashaReason(planet, 'maha', planet, null, null, null, quality, r),
      });
      // Also drill into ALL antars within this Maha to find supportive sub-periods
      try {
        const antars = calculateAntardashas(maha.planet as any, maha.startUtc, maha.endUtc);
        for (const antar of antars) {
          const aStart  = new Date(antar.startUtc);
          const aEnd    = new Date(antar.endUtc);
          const aActive = now >= aStart && now <= aEnd;
          const aQual   = dashaQuality(planet, r, [maha.planet, antar.lord]);
          // Only surface notable antars inside own Maha (good/great or currently active)
          if (aActive || aQual === 'great' || aQual === 'good') {
            items.push({
              mahaLord: maha.planet, antarLord: antar.lord, pratyLord: null, sookshmaLord: null,
              level: 'antar', dateRange: fmtRange(aStart, aEnd),
              isActive: aActive, quality: aQual,
              reason: dashaReason(planet, 'antar', maha.planet, antar.lord, null, null, aQual, r),
            });
          }
        }
      } catch { /* skip */ }
      continue;
    }

    // ── Level 2: Planet appears as Antardasha ─────────────────────────────────
    try {
      const antars = calculateAntardashas(maha.planet as any, maha.startUtc, maha.endUtc);
      for (const antar of antars) {
        if (antar.lord !== planet) continue;
        const aStart  = new Date(antar.startUtc);
        const aEnd    = new Date(antar.endUtc);
        const aActive = now >= aStart && now <= aEnd;
        const aQual   = dashaQuality(planet, r, [maha.planet, planet]);

        items.push({
          mahaLord: maha.planet, antarLord: planet, pratyLord: null, sookshmaLord: null,
          level: 'antar', dateRange: fmtRange(aStart, aEnd),
          isActive: aActive, quality: aQual,
          reason: dashaReason(planet, 'antar', maha.planet, planet, null, null, aQual, r),
        });

        // ── Level 3: Planet appears as Pratyantar within this Antar ──────────
        try {
          const pratys = calculatePratyantars(
            maha.planet as any, antar.lord as any, antar.startUtc, antar.endUtc
          );
          for (const praty of pratys) {
            if (praty.lord !== planet) continue;
            const pStart  = new Date(praty.startUtc);
            const pEnd    = new Date(praty.endUtc);
            const pActive = now >= pStart && now <= pEnd;
            const pQual   = dashaQuality(planet, r, [maha.planet, antar.lord, planet]);

            items.push({
              mahaLord: maha.planet, antarLord: antar.lord, pratyLord: planet, sookshmaLord: null,
              level: 'pratyantar', dateRange: fmtRange(pStart, pEnd),
              isActive: pActive, quality: pQual,
              reason: dashaReason(planet, 'pratyantar', maha.planet, antar.lord, planet, null, pQual, r),
            });

            // ── Level 4: Planet appears as Sookshma within this Pratyantar ──
            try {
              const sooks = calculateSookshmas(
                maha.planet as any, antar.lord as any, praty.lord as any, praty.startUtc, praty.endUtc
              );
              for (const sook of sooks) {
                if (sook.lord !== planet) continue;
                const sStart  = new Date(sook.startUtc);
                const sEnd    = new Date(sook.endUtc);
                const sActive = now >= sStart && now <= sEnd;
                const sQual   = dashaQuality(planet, r, [maha.planet, antar.lord, praty.lord, planet]);

                items.push({
                  mahaLord: maha.planet, antarLord: antar.lord, pratyLord: praty.lord,
                  sookshmaLord: planet, level: 'sookshma',
                  dateRange: fmtRange(sStart, sEnd),
                  isActive: sActive, quality: sQual,
                  reason: dashaReason(planet, 'sookshma', maha.planet, antar.lord, praty.lord, planet, sQual, r),
                });
              }
            } catch { /* skip */ }
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }

  // Sort: active first → quality → level depth (broader first)
  const LEVEL_ORDER = { maha:0, antar:1, pratyantar:2, sookshma:3 };
  const QUAL_ORDER  = { great:0, good:1, moderate:2, difficult:3 };
  return items.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    const qDiff = QUAL_ORDER[a.quality] - QUAL_ORDER[b.quality];
    if (qDiff !== 0) return qDiff;
    return LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
  }).slice(0, 12); // show up to 12 windows across all 4 levels
}

function fmtRange(start: Date, end: Date): string {
  const fmtYear = (d: Date) => d.getFullYear().toString();
  const fmtMon  = (d: Date) => d.toLocaleString('en',{month:'short'});
  if (end.getFullYear() - start.getFullYear() <= 2) {
    return `${fmtMon(start)} ${fmtYear(start)} – ${fmtMon(end)} ${fmtYear(end)}`;
  }
  return `${fmtYear(start)} – ${fmtYear(end)}`;
}

// ─── UI Components ────────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border pt-4 mt-4">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors mb-1">
        {title}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function SignalBadge({ type, label }: { type: 'good'|'mixed'|'hard'; label: string }) {
  const s = {
    good:  'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    mixed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    hard:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', s[type])}>
      {label}
    </span>
  );
}

function AreaTag({ domain, type }: { domain: Domain; type: 'strong'|'mixed'|'weak' }) {
  const s = {
    strong:'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    mixed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    weak:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', s[type])}>
      {DOMAIN_LABELS[domain] ?? domain}
    </span>
  );
}

function DashaPill({ item }: { item: DashaWindowItem }) {
  const border = item.isActive
    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30'
    : item.quality === 'great' || item.quality === 'good'
    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
    : item.quality === 'difficult'
    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
    : 'border-border bg-muted/40';

  const LEVEL_LABELS: Record<DashaWindowItem['level'], string> = {
    maha:       'Mahadasha — major period',
    antar:      'Antardasha — sub-period',
    pratyantar: 'Pratyantar — minor period',
    sookshma:   'Sookshma — fine-grain window',
  };

  // Full chain: Maha › Antar › Praty › Sookshma (only non-null)
  const chain = [item.mahaLord, item.antarLord, item.pratyLord, item.sookshmaLord]
    .filter(Boolean).join(' › ');

  return (
    <div className={cn('rounded-lg border p-3', border)}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 flex-1">
          <div className={cn('text-[11px] font-medium leading-snug',
            item.isActive ? 'text-blue-700 dark:text-blue-300'
            : item.quality === 'great' || item.quality === 'good' ? 'text-green-700 dark:text-green-400'
            : item.quality === 'difficult' ? 'text-red-700 dark:text-red-400'
            : 'text-foreground')}>
            {chain}
            {item.isActive && (
              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-semibold align-middle">NOW</span>
            )}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">{LEVEL_LABELS[item.level]}</div>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{item.dateRange}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">{item.reason}</p>
    </div>
  );
}

// ─── Planet Card ──────────────────────────────────────────────────────────────

function PlanetCard({ r, pd, isSelected, onSelect }: {
  r: PlanetStrengthResult; pd: PlanetData; isSelected: boolean; onSelect: () => void;
}) {
  const strColor  = strGradeToColor(r.structuralGrade);
  const strWord   = strGradeToWord(r.structuralGrade);
  const strWidth  = strGradeToWidth(r.structuralGrade);
  const delivWord = delivGradeToWord(r.deliveryGrade);
  const isDasha   = r.temporalActivation.dashaBoostApplied;

  // Short card desc — 1 line only
  const fn = r.functionalNature;
  const lean = r.functionalLean;
  let cardLine: string;
  const housesStr = r.housesRuled.map(h => `${h}${ord(h)}`).join(' and ');
  const topDomain = r.strongDomains[0] ? DOMAIN_LABELS[r.strongDomains[0]] : r.mixedDomains[0] ? DOMAIN_LABELS[r.mixedDomains[0]] : null;
  const isNode = r.planet === 'Rahu' || r.planet === 'Ketu';

  if (fn === 'yogakaraka') {
    cardLine = `Yogakaraka — rules kendra and trikona. Your most constructive planet.`;
  } else if (fn === 'strong_benefic' && r.housesRuled.includes(1)) {
    cardLine = `Your chart ruler — its condition shapes your overall self-expression.`;
  } else if (fn === 'strong_benefic') {
    cardLine = `Primary benefic for this lagna — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}.`;
  } else if (fn === 'benefic') {
    cardLine = `Kendra lord — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}. Stabilising role.`;
  } else if (fn === 'malefic') {
    const topWeak = r.weakDomains[0] ? DOMAIN_LABELS[r.weakDomains[0]] : null;
    cardLine = `Rules the ${housesStr} — dusthana houses. Creates friction${topWeak ? ` particularly in ${topWeak.toLowerCase()}` : ''}.`;
  } else if (fn === 'mixed' && lean === 'benefic_lean') {
    cardLine = `Mixed ownership — leans positive.${topDomain ? ` ${topDomain} is the strongest area.` : ''}`;
  } else if (fn === 'mixed' && lean === 'malefic_lean') {
    const topWeak = r.weakDomains[0] ? DOMAIN_LABELS[r.weakDomains[0]] : null;
    cardLine = `Mixed ownership — leans challenging.${topWeak ? ` ${topWeak} needs the most attention.` : ''}`;
  } else if (fn === 'mixed' && lean === 'maraka_driven') {
    cardLine = `Maraka planet — rules the 2nd and 7th. Life-sensitive in its own dasha.`;
  } else if (fn === 'mixed') {
    cardLine = `Mixed role — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}.${topDomain ? ` Best for ${topDomain.toLowerCase()}.` : ''}`;
  } else if (isNode && r.nodeInheritance) {
    const disp = r.nodeInheritance.dispositorName;
    const houseNote = r.housePosition === 7 ? 'relationships' : r.housePosition === 1 ? 'your identity' : r.housePosition === 10 ? 'career' : r.housePosition === 4 ? 'home' : `the ${r.housePosition}${ord(r.housePosition)} house`;
    cardLine = `${r.planet} in ${houseNote} — amplifies those themes. Strength inherited from ${disp}.`;
  } else {
    // True neutral — show placement + best domain
    cardLine = `In the ${r.housePosition}${ord(r.housePosition)} house.${topDomain ? ` Most relevant for ${topDomain.toLowerCase()}.` : ''}`;
  }

  // Top 3 relevant areas for the card
  const cardAreas = [
    ...r.strongDomains.slice(0,2).map(d => ({d, t: 'strong' as const})),
    ...r.mixedDomains.slice(0,1).map(d => ({d, t: 'mixed' as const})),
  ].slice(0, 3);

  return (
    <button type="button" onClick={onSelect}
      className={cn('w-full text-left rounded-xl border overflow-hidden bg-card transition-all',
        isSelected ? 'border-blue-400 shadow-sm ring-1 ring-blue-400/20 dark:border-blue-600'
                   : 'border-border hover:border-border/80 hover:shadow-sm')}>

      {/* Top stripe — 3 colours only: green/amber/red */}
      <div className="h-[3px]" style={{ background: delivGradeToColor(r.deliveryGrade, r.structuralGrade) }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-base flex-shrink-0">
            {GLYPH[r.planet] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium">{r.planet}</span>
              {isDasha && (
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                  Active now
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {pd.sign} {pd.degreeInSign.toFixed(1)}° · {r.housePosition}{ord(r.housePosition)} house
            </div>
          </div>
        </div>

        {/* Strength bar */}
        <div className="mb-3">
          <div className="h-1 rounded-full bg-muted overflow-hidden mb-1.5">
            <div className="h-full rounded-full transition-all" style={{ width: `${strWidth}%`, background: strColor }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: strColor }}>{strWord}</span>
            <span className="text-[11px] text-muted-foreground">{delivWord}</span>
          </div>
        </div>

        {/* Card line */}
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{cardLine}</p>

        {/* Area tags */}
        {cardAreas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cardAreas.map(({ d, t }) => <AreaTag key={d} domain={d} type={t} />)}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ r, pd, moonData, birthDateUtc, onClose }: {
  r: PlanetStrengthResult; pd: PlanetData;
  moonData?: PlanetData; birthDateUtc?: string;
  onClose: () => void;
}) {
  const [showTech, setShowTech] = useState(false);
  const story    = useMemo(() => buildInYourChart(r, pd, pd.signNumber), [r, pd]);
  const meanings = useMemo(() => buildWhatThisMeans(r, pd), [r, pd]);

  // Compute all mahadashas client-side from Moon KP data
  const allMahas = useMemo((): MahaPeriod[] => {
    if (!moonData?.kp || !birthDateUtc) return [];
    try {
      const result = vimshottariDasha(
        moonData.longitude,
        new Date(birthDateUtc),
        moonData.kp.elapsedFractionOfNakshatra,
        moonData.kp.nakshatraLord as any
      );
      return (result.allMahadashas ?? []).map((m: any) => ({
        planet: m.lord,
        startUtc: m.startUtc,
        endUtc: m.endUtc,
      }));
    } catch { return []; }
  }, [moonData, birthDateUtc]);

  const timeline = useMemo(() => buildDashaTimeline(r.planet, r, allMahas), [r, allMahas]);

  const strColor  = strGradeToColor(r.structuralGrade);
  const isDasha   = r.temporalActivation.dashaBoostApplied;

  return (
    <div className="col-span-full border border-blue-400/40 dark:border-blue-600/40 rounded-xl bg-card p-5 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{GLYPH[r.planet]}</span>
          <span className="font-medium text-base">{r.planet}</span>
          {isDasha && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Active in your life right now
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
          Close
        </button>
      </div>

      {/* 3-block summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1.5">In your chart</div>
          <div className="text-[13px] font-medium" style={{ color: strColor }}>{strGradeToWord(r.structuralGrade)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{dignityShort(r.dignityLevel)}</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1.5">How it delivers</div>
          <div className="text-[13px] font-medium" style={{ color: delivGradeToColor(r.deliveryGrade) }}>{delivGradeToWord(r.deliveryGrade)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{pd.kp?.nakshatraName ?? pd.sign}</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1.5">Main areas</div>
          <div className="text-[12px] font-medium leading-tight">
            {[...r.strongDomains, ...r.mixedDomains].slice(0, 2).map(d => DOMAIN_LABELS[d]).join(', ') || 'General influence'}
          </div>
        </div>
      </div>

      {/* Active dasha banner */}
      {isDasha && (
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-lg px-4 py-3 mb-5">
          <div className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Currently shaping your life</div>
          <p className="text-[12px] text-blue-900 dark:text-blue-200 leading-relaxed">
            {r.planet}'s period is active right now. The themes below are not just astrological background — they are describing what is happening in your life at this moment.
          </p>
        </div>
      )}

      {/* In your chart story */}
      <div className="mb-5">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">In your chart</div>
        <div className="space-y-3">
          {story.map((para, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-foreground">{para}</p>
          ))}
        </div>
      </div>

      {/* What this means */}
      <div className="mb-5">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">What this means for you</div>
        <div className="space-y-3">
          {meanings.map((m, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                <span className="text-base leading-none">{m.icon}</span>
                <span className="text-[12px] font-medium flex-1">{m.area}</span>
                <SignalBadge type={m.signalType} label={m.signal} />
              </div>
              <div className="px-4 py-3 border-t border-border">
                <p className="text-[13px] leading-relaxed font-medium mb-1.5">{m.what}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{m.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dasha timeline */}
      {timeline.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">When does {r.planet} give results?</div>
          <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
            Planets deliver results most strongly during their own periods and sub-periods. Here are the times in your dasha sequence when {r.planet}'s themes activate most directly.
          </p>
          <div className="space-y-2">
            {timeline.map((item, i) => <DashaPill key={i} item={item} />)}
          </div>
        </div>
      )}

      {/* All life areas */}
      <Section title={`All life areas — ${r.planet}`}>
        <div className="space-y-2">
          {r.strongDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-muted-foreground min-w-[56px]">Works well</span>
              {r.strongDomains.map(d => <AreaTag key={d} domain={d} type="strong" />)}
            </div>
          )}
          {r.mixedDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-muted-foreground min-w-[56px]">Mixed</span>
              {r.mixedDomains.map(d => <AreaTag key={d} domain={d} type="mixed" />)}
            </div>
          )}
          {r.weakDomains.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-muted-foreground min-w-[56px]">Difficult</span>
              {r.weakDomains.map(d => <AreaTag key={d} domain={d} type="weak" />)}
            </div>
          )}
        </div>
      </Section>

      {/* For astrologers */}
      <div className="mt-4">
        <button type="button" onClick={() => setShowTech(p => !p)}
          className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
          {showTech ? 'Hide technical details' : 'For astrologers — technical details'}
        </button>
        {showTech && (
          <div className="mt-3 bg-muted/30 rounded-lg border border-border p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                ['Dignity', dignityShort(r.dignityLevel)],
                ['House', `${r.housePosition}${ord(r.housePosition)}`],
                ['Functional role', r.functionalNature.replace('_',' ')],
                ['Condition', r.conditionGrade.replace('_',' ')],
                ['D9', dignityShort(r.vargaAssessment.d9DignityLevel)],
                ['Delivery', r.deliveryGrade.replace('_',' ')],
                ['Natal rank', `#${r.natalPriorityRank}`],
                ['Confidence', r.assessmentConfidence],
              ] as [string,string][]).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[9px] text-muted-foreground mb-0.5">{k}</div>
                  <div className="text-[11px] font-medium">{v}</div>
                </div>
              ))}
            </div>
            {r.analystNote && (
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">
                {r.analystNote}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PlanetsTab({ planets, ascendant, dashaInfo, birthDate }: PlanetsTabProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Build dasha context for engine
  const dashaContext = useMemo(() => ({
    currentMahadasha:  dashaInfo?.currentMahadasha,
    currentAntardasha: undefined,
    currentPratyantar: undefined,
  }), [dashaInfo]);

  const results = useMemo(() => {
    try { return assessAllPlanets({ planets, ascendant, dashaContext }); }
    catch { return {} as Record<string, PlanetStrengthResult>; }
  }, [planets, ascendant, dashaContext]);

  // Group planets
  const groups = useMemo(() => {
    const g: Record<'working'|'mixed'|'struggling', string[]> = { working:[], mixed:[], struggling:[] };
    for (const name of PLANET_ORDER) {
      const r = results[name];
      if (!r) continue;
      g[fnToGroupKey(r)].push(name);
    }
    return g;
  }, [results]);

  const GROUP_LABELS = {
    working:    { label:'Delivering well for you', dot:'#059669' },
    mixed:      { label:'Mixed — results come, but not consistently', dot:'#d97706' },
    struggling: { label:'Blocked or distorted — needs awareness', dot:'#dc2626' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-medium">Your planets</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {ascendant.sign} lagna · How each planet works in your chart
        </p>
      </div>

      {/* Groups */}
      {(['working','mixed','struggling'] as const).map(gk => {
        const planetNames = groups[gk];
        if (!planetNames.length) return null;
        const { label, dot } = GROUP_LABELS[gk];

        // Build items with detail panel
        const items: Array<{ type: 'card'|'detail'; name: string }> = [];
        planetNames.forEach(name => {
          items.push({ type:'card', name });
          if (selected === name) items.push({ type:'detail', name });
        });

        return (
          <div key={gk}>
            {/* Group label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => {
                if (item.type === 'detail') {
                  const r  = results[item.name];
                  const pd = planets[item.name] as PlanetData | undefined;
                  if (!r || !pd) return null;
                  return (
                    <div key={`d-${item.name}`} className="col-span-1 sm:col-span-2 lg:col-span-3">
                      <DetailPanel r={r} pd={pd}
                        moonData={planets['Moon'] as PlanetData | undefined}
                        birthDateUtc={birthDate}
                        onClose={() => setSelected(null)} />
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
        );
      })}
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function ord(n: number): string {
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dignityShort(l: import('@/lib/astrology/strength').DignityLevel): string {
  return {
    exalted:'Exalted', moolatrikona:'Moolatrikona', own_sign:'Own sign',
    great_friend:'Great friend', friend:'Friendly', neutral:'Neutral',
    enemy:'Enemy', great_enemy:'Great enemy', debilitated:'Debilitated',
  }[l] ?? l;
}

// Re-export type for use in this file
type ConditionGrade = import('@/lib/astrology/strength').ConditionGrade;
