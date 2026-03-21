'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  assessAllPlanets, getNaturalRelationship,
  getWeightedConjunctionScore, getWeightedAspectScore,
} from '@/lib/astrology/strength';
import type {
  PlanetStrengthResult, StructuralGrade, DeliveryGrade,
  Domain, FunctionalNature, FunctionalLean, DignityLevel,
} from '@/lib/astrology/strength';
import type { WeightedInfluence } from '@/lib/astrology/strength/aspectEngine';
import type { PlanetData, AscendantData, ChartDashaData } from '@/types/astrology';
import {
  calculateAntardashas, calculatePratyantars,
  calculateSookshmas, vimshottariDasha,
} from '@/lib/astrology/kp/dasa';
import { HOUSE_MEANINGS, getHouseTypeLabel } from '@/lib/astrology/constants/houseMeanings';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanetsTabProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dashaInfo?: ChartDashaData;
  birthDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const GLYPH: Record<string,string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const DOMAIN_LABELS: Record<Domain, string> = {
  self:'Self & identity', wealth:'Wealth', siblings:'Siblings',
  home:'Home & family', children:'Children', health:'Health',
  marriage:'Relationships', longevity:'Longevity', fortune:'Fortune',
  career:'Career', gains:'Income & gains', liberation:'Spirituality',
  father:'Father', mother:'Mother', intellect:'Intellect',
  spirituality:'Spiritual life', communication:'Communication', foreign:'Foreign & travel',
};

const DOMAIN_ICONS: Record<Domain, string> = {
  self:'✦', wealth:'◈', siblings:'◉', home:'⌂', children:'❋',
  health:'♥', marriage:'◎', longevity:'◇', fortune:'★',
  career:'▲', gains:'◆', liberation:'☽', father:'☀', mother:'◑',
  intellect:'✧', spirituality:'☸', communication:'◐', foreign:'◈',
};

// ─── Grade helpers ────────────────────────────────────────────────────────────

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
  if (g === 'very_strong' || g === 'strong') return '#059669';
  if (g === 'moderate') return '#d97706';
  return '#dc2626';
}
function delivGradeToColor(g: DeliveryGrade, sg?: StructuralGrade): string {
  if (g === 'reliable') return '#059669';
  if (g === 'delayed') return (sg === 'very_strong' || sg === 'strong') ? '#059669' : '#d97706';
  if (g === 'inconsistent') return '#d97706';
  return '#dc2626';
}

function fnToGroupKey(r: PlanetStrengthResult): 'working'|'mixed'|'struggling' {
  const dg = r.deliveryGrade;
  const sg = r.structuralGrade;
  if (dg === 'reliable') return 'working';
  if (dg === 'delayed') return (sg === 'very_strong' || sg === 'strong') ? 'working' : 'mixed';
  if (dg === 'inconsistent') return 'mixed';
  return 'struggling';
}

// ─── Beat types ───────────────────────────────────────────────────────────────

interface ConjItem {
  planet: string;
  orb: number;
  label: 'very_tight' | 'tight' | 'mild' | 'weak';
  isBenefic: boolean;
  isNode: boolean;
  effect: string;
}

interface AspectItem {
  planet: string;
  orb: number;
  isBenefic: boolean;
  aspectType: string;
  effect: string;
}

interface RulerItem {
  house: number;
  houseName: string;
  houseTypeLabel: string;
  desc: string;
  isSwaPlacement: boolean;
}

interface ActiveDashaChain {
  maha?: { planet: string; startUtc: string; endUtc: string };
  antar?: { planet: string; startUtc: string; endUtc: string };
  pratyantar?: { planet: string; startUtc: string; endUtc: string };
}

interface Beat {
  id: 'placement' | 'conjunctions' | 'aspects' | 'rulership' | 'synthesis';
  tagLabel: string;
  dotColor: string;
  text?: string;
  conjCluster?: { items: ConjItem[]; netVerdict: string };
  rulerItems?: RulerItem[];
}

// ─── Conjunction effect sentences ────────────────────────────────────────────

function getConjunctionEffect(
  conjPlanet: string, targetPlanet: string,
  label: 'very_tight'|'tight'|'mild'|'weak', isBenefic: boolean, isNode: boolean
): string {
  const intensity = label === 'very_tight' ? 'dominant' : label === 'tight' ? 'strong' : 'moderate';
  const orbNote   = label === 'very_tight' ? 'This is close enough to be the defining influence on the conjunction.'
                  : label === 'mild'       ? 'A background influence — present but not overwhelming.'
                  : label === 'weak'       ? 'Wide orb — a mild background colouring only.'
                  : '';

  const EFFECTS: Record<string, string> = {
    // Rahu as conjunctor
    'Rahu':    `Rahu amplifies and intensifies whatever it touches — often to the point of obsession or restlessness. Its ${intensity} influence on ${targetPlanet} creates heightened energy in the areas ${targetPlanet} governs, but the expression can feel scattered or driven rather than calm. ${orbNote}`,
    'Ketu':    `Ketu brings withdrawal, past-karma, and spiritual detachment to ${targetPlanet}. Its ${intensity} influence creates a quality of dissociation — the areas ${targetPlanet} governs may feel less personally attached, sometimes elusive, sometimes spiritually charged. ${orbNote}`,
    'Saturn':  `Saturn's ${intensity} conjunction brings discipline, delay, and karmic weight to ${targetPlanet}. Results in ${targetPlanet}'s domains come with more effort, more patience required, and sometimes a sense of restriction before release. ${orbNote}`,
    'Mars':    `Mars brings energy, aggression, and drive to ${targetPlanet}. Its ${intensity} influence can be empowering (adding initiative and force) or destabilising (adding heat, conflict, and impulsiveness). The result depends on how Mars is otherwise placed. ${orbNote}`,
    'Sun':     `The Sun's conjunction creates combustion when within 6°, overshadowing ${targetPlanet}'s independent expression. The Sun lends authority and visibility, but ${targetPlanet} may operate more in service of ego and recognition than its own nature. ${orbNote}`,
    'Jupiter': `Jupiter's ${intensity} conjunction is generally protective and expansive. It brings wisdom, grace, and a broadening quality to ${targetPlanet}'s expression. Even when ${targetPlanet} is otherwise compromised, Jupiter's presence softens and guides. ${orbNote}`,
    'Venus':   `Venus brings pleasure, beauty, and relationship themes to ${targetPlanet}. Its ${intensity} conjunction adds a quality of refinement and social ease — though Venus can also soften planets that need their edge, making them more diplomatic than decisive. ${orbNote}`,
    'Mercury': `Mercury's ${intensity} conjunction brings intellect, analysis, and communication themes to ${targetPlanet}. The two planets often reinforce each other's rational and communicative qualities. ${orbNote}`,
    'Moon':    `Moon brings emotional sensitivity, fluctuation, and intuition to ${targetPlanet}. Its ${intensity} conjunction can deepen emotional attunement but also add instability or mood-driven expression to ${targetPlanet}'s areas. ${orbNote}`,
  };

  return EFFECTS[conjPlanet] ?? `${conjPlanet}'s ${intensity} conjunction influences ${targetPlanet}'s expression — its presence adds its own themes and energy to how ${targetPlanet} operates. ${orbNote}`;
}

// ─── Aspect effect sentences ──────────────────────────────────────────────────

function getAspectEffect(
  aspectingPlanet: string, targetPlanet: string, isBenefic: boolean, orb: number
): string {
  const orbQuality = orb < 3 ? 'tight' : orb < 7 ? 'moderate' : 'wide';
  const ASPECTS: Record<string, string> = {
    'Jupiter': `Jupiter is casting its ${orbQuality} aspect onto ${targetPlanet} — a positive influence. Jupiter's presence through aspect brings wisdom, grace, and protection. Even when ${targetPlanet} is challenged, Jupiter's aspect gives it a philosophical buffer and reduces the harshest effects.`,
    'Saturn':  `Saturn casts a ${orbQuality} aspect onto ${targetPlanet}, bringing pressure, delay, and disciplinary force. Saturn doesn't destroy — but it demands that ${targetPlanet}'s affairs be approached with patience and seriousness rather than ease.`,
    'Mars':    `Mars aspects ${targetPlanet} with ${orbQuality} force, adding aggression, energy, and friction. Mars aspects tend to activate and heat up the areas ${targetPlanet} governs — useful for initiative, difficult for peace.`,
    'Rahu':    `Rahu's ${orbQuality} aspect casts an amplifying, distorting influence on ${targetPlanet} from a distance. Like conjunction, Rahu aspects intensify themes but can make them obsessive or unpredictable.`,
    'Ketu':    `Ketu's ${orbQuality} aspect brings a dissociating, spiritualising quality to ${targetPlanet} — a detachment from the areas ${targetPlanet} governs, which can manifest as withdrawal, insight, or past-karma themes.`,
  };
  return ASPECTS[aspectingPlanet] ?? `${aspectingPlanet}'s ${orbQuality} aspect influences ${targetPlanet} — its themes and energy reach ${targetPlanet} from across the chart.`;
}

// ─── Net verdict for conjunction cluster ─────────────────────────────────────

function buildConjNetVerdict(
  targetPlanet: string, items: ConjItem[], conditionGrade: string
): string {
  const maleficNodes = items.filter(i => !i.isBenefic || i.isNode);
  const benefics     = items.filter(i => i.isBenefic && !i.isNode);
  const dominant     = items.find(i => i.label === 'very_tight') ?? items[0];

  if (items.length === 1) {
    const item = items[0];
    if (item.isNode) {
      return item.label === 'very_tight' || item.label === 'tight'
        ? `${item.planet}'s tight conjunction is the most significant external influence on ${targetPlanet}. The nodal distortion is dominant — ${targetPlanet}'s natural expression gets amplified and destabilised.`
        : `${item.planet}'s mild conjunction adds a background nodal colouring to ${targetPlanet}. Not dominant, but present as a pattern.`;
    }
    if (!item.isBenefic) {
      return `${item.planet}'s ${item.label.replace('_',' ')} conjunction is the primary external pressure on ${targetPlanet}. Results in ${targetPlanet}'s domains carry ${item.planet}'s characteristics — ${item.planet === 'Saturn' ? 'delay and discipline' : item.planet === 'Mars' ? 'heat and aggression' : 'difficulty'}.`;
    }
    return `${item.planet}'s ${item.label.replace('_',' ')} conjunction supports ${targetPlanet}. ${item.planet === 'Jupiter' ? 'This is one of the most valuable conjunctions in astrology — Jupiter brings grace and protection.' : `${item.planet}'s positive qualities blend constructively with ${targetPlanet}.`}`;
  }

  // Multiple conjunctions
  const dominantNote = dominant
    ? `${dominant.planet} is the closest (${dominant.orb.toFixed(1)}°) and therefore the most influential.`
    : '';

  if (maleficNodes.length > 0 && benefics.length > 0) {
    const protector = benefics.find(b => b.planet === 'Jupiter') ?? benefics[0];
    return `This is a mixed conjunction cluster — malefic and benefic influences together. ${dominantNote} ${protector?.planet}'s presence offers some protection, but the overall condition is under competing pressures. The net effect depends on which of these planets is stronger in your chart overall.`;
  }
  if (maleficNodes.length === items.length) {
    return `All conjunctions here are challenging — ${maleficNodes.map(i => i.planet).join(', ')} together create compounded pressure on ${targetPlanet}. ${dominantNote} This is a difficult conjunction cluster that significantly affects how ${targetPlanet} can express itself.`;
  }
  return `Multiple supportive influences are conjunct ${targetPlanet} — ${benefics.map(i => i.planet).join(', ')}. ${dominantNote} The combined benefic presence is a notable strength in this placement.`;
}

// ─── Parse conjunction data ───────────────────────────────────────────────────

function parseConjunctions(
  planet: string, pd: PlanetData, allPlanets: Record<string, PlanetData>
): ConjItem[] {
  const result = getWeightedConjunctionScore(planet, pd.longitude, allPlanets);
  const influences = (result as any).influences as WeightedInfluence[] ?? [];
  return influences
    .sort((a, b) => a.orb - b.orb)
    .map(inf => ({
      planet:    inf.planet,
      orb:       inf.orb,
      label:     inf.label,
      isBenefic: inf.isBenefic,
      isNode:    inf.planet === 'Rahu' || inf.planet === 'Ketu',
      effect:    getConjunctionEffect(inf.planet, planet, inf.label, inf.isBenefic, inf.planet === 'Rahu' || inf.planet === 'Ketu'),
    }));
}

// ─── Parse aspect data ────────────────────────────────────────────────────────

function parseAspects(
  planet: string, pd: PlanetData, allPlanets: Record<string, PlanetData>
): AspectItem[] {
  const result = getWeightedAspectScore(planet, pd.signNumber, pd.longitude, allPlanets);
  const items: AspectItem[] = [];

  // Parse planet name and orb from strings like "Aspected by Jupiter (6.2°)"
  const RE = /Aspected by (\w+)(?:\s*\(([0-9.]+)°\))?/;
  for (const str of [...result.afflictions, ...result.protections]) {
    const m = str.match(RE);
    if (!m) continue;
    const asp   = m[1];
    const orb   = m[2] ? parseFloat(m[2]) : 5;
    const isBen = ['Jupiter','Venus','Mercury'].includes(asp);
    items.push({
      planet:     asp,
      orb,
      isBenefic:  isBen,
      aspectType: isBen ? 'benefic aspect' : 'malefic aspect',
      effect:     getAspectEffect(asp, planet, isBen, orb),
    });
  }
  return items.sort((a, b) => a.orb - b.orb);
}

// ─── Beat builders ────────────────────────────────────────────────────────────

function buildPlacementBeat(r: PlanetStrengthResult, pd: PlanetData): Beat {
  const p     = r.planet;
  const sign  = pd.sign;
  const house = r.housePosition;
  const deg   = pd.degreeInSign;
  const isNode = p === 'Rahu' || p === 'Ketu';

  // Degree quality note
  const isSandhi = deg < 1 || deg > 29;
  const isDeepExalt = (p === 'Sun' && pd.signNumber === 1 && Math.abs(deg - 10) < 3) ||
                      (p === 'Moon' && pd.signNumber === 2 && Math.abs(deg - 3) < 3)  ||
                      (p === 'Mars' && pd.signNumber === 10 && Math.abs(deg - 28) < 3) ||
                      (p === 'Mercury' && pd.signNumber === 6 && Math.abs(deg - 15) < 3) ||
                      (p === 'Jupiter' && pd.signNumber === 4 && Math.abs(deg - 5) < 3) ||
                      (p === 'Venus' && pd.signNumber === 12 && Math.abs(deg - 27) < 3) ||
                      (p === 'Saturn' && pd.signNumber === 7 && Math.abs(deg - 20) < 3);

  const degNote = isSandhi
    ? ` At ${deg.toFixed(1)}°, it sits near the sign boundary (called sandhi) — a sensitive position where the planet's energy is transitional and sometimes unstable.`
    : isDeepExalt
    ? ` At ${deg.toFixed(1)}°, it is near its point of deep exaltation — close to maximum strength in this sign.`
    : '';

  const signDesc: Record<string, string> = {
    exalted:      `exalted in ${sign} — one of the strongest possible positions in the zodiac`,
    moolatrikona: `in its moolatrikona portion of ${sign} — very close to its own territory, with extra authority`,
    own_sign:     `in its own sign ${sign} — completely at home, operating with full control and authority`,
    great_friend: `in a great friend's sign (${sign}) — warmly received and well supported`,
    friend:       `in a friendly sign (${sign}) — comfortable and functional`,
    neutral:      `in a neutral sign (${sign}) — neither strongly helped nor hindered`,
    enemy:        `in an enemy sign (${sign}) — somewhat uncomfortable, has to work harder for results`,
    great_enemy:  `in a great enemy's sign (${sign}) — very uncomfortable, significantly constrained`,
    debilitated:  `debilitated in ${sign} — the sign where ${p} is at its structural weakest`,
  };

  const houseData = HOUSE_MEANINGS[house];
  const houseDesc = houseData
    ? `placed in the ${house}${ord(house)} house (${houseData.shortLabel}). ${houseData.placementTheme}.`
    : `placed in the ${house}${ord(house)} house.`;

  let text = `${p} sits at ${deg.toFixed(1)}° ${sign}, ${signDesc[r.dignityLevel] ?? `in ${sign}`}. It is ${houseDesc}${degNote}`;

  if (r.isRetrograde && !isNode) {
    text += ` ${p} is retrograde — moving backward from Earth's perspective. Its energy turns inward: results tend to come through internal processing, revisiting, or unconventional routes rather than straight-line expression.`;
  }
  if (r.isCombust && p !== 'Sun') {
    // Extract orb from afflictions string if available
    const combustStr = r.afflictions.find(a => a.toLowerCase().includes('combust'));
    const orbMatch   = combustStr?.match(/\(([0-9.]+)°\)/);
    const orbNote    = orbMatch ? ` (${orbMatch[1]}° from the Sun)` : '';
    text += ` ${p} is also combust${orbNote} — too close to the Sun's glare, which overshadows its independent expression. ${p} operates more in service of the Sun's themes than its own nature during this period.`;
  }
  if (r.neechaBhanga.isApplied) {
    text += ` However, Neecha Bhanga applies — a classical cancellation of debility. ${r.neechaBhanga.rule ? `Rule: ${r.neechaBhanga.rule}.` : ''} This gives ${p} partial recovery capacity it would not otherwise have.`;
  }

  return { id:'placement', tagLabel:'Where it sits', dotColor:'#d97706', text };
}

function buildConjunctionBeat(
  r: PlanetStrengthResult, pd: PlanetData, allPlanets: Record<string, PlanetData>
): Beat | null {
  const items = parseConjunctions(r.planet, pd, allPlanets);
  if (items.length === 0) return null;

  const tagLabel   = items.length === 1
    ? `Conjunct ${items[0].planet} — ${items[0].label.replace('_', ' ')} influence`
    : `${items.length} planets conjunct — conjunction cluster`;

  const netVerdict = buildConjNetVerdict(r.planet, items, r.conditionGrade);

  const introText = items.length === 1
    ? `${items[0].planet} is in the same sign as ${r.planet}, ${items[0].orb.toFixed(1)}° away.`
    : `${r.planet} is not alone in its sign — ${items.length} other planets share this position. Their combined influence shapes how ${r.planet} expresses itself.`;

  return {
    id: 'conjunctions',
    tagLabel,
    dotColor: items.every(i => i.isBenefic && !i.isNode) ? '#059669'
            : items.some(i => i.isBenefic && !i.isNode) ? '#d97706'
            : '#dc2626',
    text: introText,
    conjCluster: { items, netVerdict },
  };
}

function buildAspectBeat(
  r: PlanetStrengthResult, pd: PlanetData, allPlanets: Record<string, PlanetData>
): Beat | null {
  const items = parseAspects(r.planet, pd, allPlanets);
  if (items.length === 0) return null;

  const text = items.length === 1
    ? `From across the chart, ${items[0].planet} is casting its aspect onto ${r.planet} (${items[0].orb.toFixed(1)}° orb).`
    : `${items.length} planets are casting aspects onto ${r.planet} from across the chart, each adding their influence from a distance.`;

  return {
    id: 'aspects',
    tagLabel: 'Aspects received',
    dotColor: items.some(i => i.planet === 'Jupiter') ? '#059669'
            : items.every(i => !i.isBenefic) ? '#dc2626' : '#d97706',
    text,
    conjCluster: {
      items: items.map(i => ({
        planet: i.planet, orb: i.orb,
        label: i.orb < 3 ? 'very_tight' : i.orb < 7 ? 'tight' : 'mild',
        isBenefic: i.isBenefic, isNode: i.planet === 'Rahu' || i.planet === 'Ketu',
        effect: i.effect,
      })),
      netVerdict: items.length === 1
        ? `${items[0].planet}'s ${items[0].aspectType} is the external influence shaping ${r.planet} from a distance — it does not touch directly but reaches across the chart.`
        : `Multiple planetary aspects reach ${r.planet} — the combined effect depends on which aspects are tighter and which planets are stronger in your chart overall.`,
    },
  };
}

function buildRulershipBeat(r: PlanetStrengthResult, pd: PlanetData): Beat {
  const p          = r.planet;
  const isNode     = p === 'Rahu' || p === 'Ketu';

  if (isNode && r.nodeInheritance) {
    const disp    = r.nodeInheritance.dispositorName;
    const dispDel = r.nodeInheritance.dispositorDeliveryGrade;
    const quality = dispDel === 'reliable' ? 'strong and reliable'
                  : dispDel === 'obstructed' || dispDel === 'distorted_delivery' ? 'weak and compromised'
                  : 'moderate';
    const text = `${p} doesn't rule houses directly — unlike the other planets, it inherits its character from its dispositor (the lord of the sign it occupies). In your chart, ${p} sits in ${pd.sign}, which is ruled by ${disp} (${quality} in your chart). ${dispDel === 'reliable' || dispDel === 'delayed' ? `${disp} gives ${p} a relatively organised channel to work through — ${p} amplifies ${disp}'s themes.` : `Because ${disp} is ${quality}, ${p} amplifies those themes but without strong direction — its energy intensifies without clear purpose.`}`;
    return { id:'rulership', tagLabel:'How it inherits its character', dotColor:'#7c3aed', text };
  }

  if (r.housesRuled.length === 0) {
    return {
      id:'rulership', tagLabel:'What it rules', dotColor:'#185FA5',
      text:`${p} does not have strong house lordship for your lagna — its influence comes primarily from its placement and the planets it associates with rather than from ruling specific houses.`,
    };
  }

  const rulerItems: RulerItem[] = r.housesRuled.map(house => {
    const hData       = HOUSE_MEANINGS[house];
    const isSwa       = r.housePosition === house;
    const hTypeLabel  = getHouseTypeLabel(house);
    const typeSuffix  = hTypeLabel ? ` (${hTypeLabel})` : '';
    const swaNote     = isSwa
      ? ` Notably, ${p} is also placed in this very house — ruling and occupying the same house gives it direct, concentrated expression of these themes. This is a powerful self-referential placement.`
      : '';

    const desc = hData
      ? `${p} rules your ${house}${ord(house)} house${typeSuffix} — ${hData.shortLabel.toLowerCase()}. ${hData.rulerTheme}.${swaNote}`
      : `${p} rules your ${house}${ord(house)} house${typeSuffix}. Its condition shapes how well these areas express in your life.${swaNote}`;

    return {
      house, houseName: hData?.shortLabel ?? `${house}${ord(house)} house`,
      houseTypeLabel: hTypeLabel, desc, isSwaPlacement: isSwa,
    };
  });

  return { id:'rulership', tagLabel:'What it rules in your chart', dotColor:'#185FA5', rulerItems };
}

function buildSynthesisBeat(
  r: PlanetStrengthResult,
  beats: Beat[],
  activeDashaChain: ActiveDashaChain
): Beat {
  const p    = r.planet;
  const sg   = r.structuralGrade;
  const dg   = r.deliveryGrade;
  const isNode = p === 'Rahu' || p === 'Ketu';

  // Structural summary (1 sentence — no repetition of details already in placement beat)
  const strSummary = sg === 'very_strong' || sg === 'strong'
    ? `${p} has genuine structural strength in your chart`
    : sg === 'moderate' ? `${p} has moderate structural strength`
    : `${p} is structurally challenged in your chart`;

  // Conjunction summary (only if conjunction beat exists)
  const conjBeat   = beats.find(b => b.id === 'conjunctions');
  const conjItems  = conjBeat?.conjCluster?.items ?? [];
  const conjSummary = conjItems.length > 0
    ? `, and its ${conjItems.length === 1 ? `${conjItems[0].label.replace('_',' ')} conjunction with ${conjItems[0].planet}` : `${conjItems.length}-planet conjunction cluster`} is the most significant external modifier of its expression`
    : '';

  // Rulership synthesis (brief — details are in the rulership beat)
  const rulerItems = beats.find(b => b.id === 'rulership')?.rulerItems ?? [];
  const rulerSummary = rulerItems.length > 0
    ? `. Its rulership of the ${rulerItems.map(ri => `${ri.house}${ord(ri.house)}`).join(' and ')} house${rulerItems.length > 1 ? 's' : ''} means ${r.functionalNature === 'yogakaraka' ? 'it combines fortune and action into one' : r.functionalNature === 'strong_benefic' ? 'its well-being directly shapes your own' : r.functionalNature === 'malefic' ? 'its activation tends to bring friction alongside any gains' : 'it has mixed responsibilities that need to be read in context'}`
    : '';

  // Delivery sentence
  const delivSummary = dg === 'reliable' ? `. It delivers its results reliably.`
    : dg === 'delayed' ? `. Results come, but with characteristic patience required.`
    : dg === 'inconsistent' ? `. Delivery is inconsistent — good periods alternate with quieter ones.`
    : `. Its ability to deliver is significantly compromised — the energy is present but blocked or distorted in expression.`;

  // Current dasha synthesis — this is the personal, now-relevant part
  let dashaSummary = '';
  const { maha, antar, pratyantar } = activeDashaChain;
  const now = new Date();

  if (maha?.planet === p) {
    // This planet IS the running Mahadasha
    dashaSummary = ` ${p}'s own major period (Mahadasha) is running right now — this means everything described above is your current lived experience, not just astrological background. The full 17-year weight of ${p}'s character is active in your life at this moment.`;
  } else if (antar?.planet === p && maha) {
    // Planet is running as Antardasha
    dashaSummary = ` ${p} is currently active as a sub-period (Antardasha) within ${maha.planet}'s major period. You may be feeling ${p}'s themes — ${r.strongDomains.slice(0,2).map(d => DOMAIN_LABELS[d]?.toLowerCase()).filter(Boolean).join(' and ') || 'its key life areas'} — distinctly during this window.`;
  } else if (pratyantar?.planet === p && maha && antar) {
    // Planet is running as Pratyantar
    dashaSummary = ` ${p}'s minor sub-period (Pratyantar) is running right now within ${maha.planet} › ${antar.planet}'s period chain. This is a shorter window — weeks to months — where ${p}'s energy surfaces briefly within the larger ${maha.planet} cycle. You may feel a brief intensification of ${p}'s themes during this time.`;
  } else if (r.temporalActivation.dashaBoostApplied) {
    dashaSummary = ` ${p} is currently activated somewhere in your running dasha chain, bringing its themes into the foreground at this time.`;
  }

  const text = `${strSummary}${conjSummary}${rulerSummary}${delivSummary}${dashaSummary}`;

  return { id:'synthesis', tagLabel:'The full picture', dotColor:'#7c3aed', text };
}

// ─── Get active dasha chain for a planet ─────────────────────────────────────

function getCurrentDashaChain(
  allMahas: MahaPeriod[]
): ActiveDashaChain {
  const now    = new Date();
  const chain: ActiveDashaChain = {};

  const activeMaha = allMahas.find(m =>
    now >= new Date(m.startUtc) && now <= new Date(m.endUtc)
  );
  if (!activeMaha) return chain;
  chain.maha = activeMaha;

  try {
    const antars = calculateAntardashas(activeMaha.planet as any, activeMaha.startUtc, activeMaha.endUtc);
    const activeAntar = antars.find(a =>
      now >= new Date(a.startUtc) && now <= new Date(a.endUtc)
    );
    if (!activeAntar) return chain;
    chain.antar = { planet: activeAntar.lord, startUtc: activeAntar.startUtc, endUtc: activeAntar.endUtc };

    try {
      const pratys = calculatePratyantars(activeMaha.planet as any, activeAntar.lord as any, activeAntar.startUtc, activeAntar.endUtc);
      const activePraty = pratys.find(p =>
        now >= new Date(p.startUtc) && now <= new Date(p.endUtc)
      );
      if (activePraty) {
        chain.pratyantar = { planet: activePraty.lord, startUtc: activePraty.startUtc, endUtc: activePraty.endUtc };
      }
    } catch { /* ok */ }
  } catch { /* ok */ }

  return chain;
}

// ─── Build all beats for a planet ────────────────────────────────────────────

function buildStoryBeats(
  r: PlanetStrengthResult,
  pd: PlanetData,
  allPlanets: Record<string, PlanetData>,
  allMahas: MahaPeriod[]
): Beat[] {
  const beats: Beat[] = [];

  beats.push(buildPlacementBeat(r, pd));

  const conjBeat = buildConjunctionBeat(r, pd, allPlanets);
  if (conjBeat) beats.push(conjBeat);

  const aspectBeat = buildAspectBeat(r, pd, allPlanets);
  if (aspectBeat) beats.push(aspectBeat);

  beats.push(buildRulershipBeat(r, pd));

  const dashaChain = getCurrentDashaChain(allMahas);
  beats.push(buildSynthesisBeat(r, beats, dashaChain));

  return beats;
}

// ─── "What this means" — per life area ───────────────────────────────────────

interface AreaMeaning {
  area: string; icon: string; signal: string;
  signalType: 'good'|'mixed'|'hard'; what: string; why: string;
}

function buildWhatThisMeans(r: PlanetStrengthResult, pd: PlanetData): AreaMeaning[] {
  const result: AreaMeaning[] = [];
  const seen = new Set<string>();

  const pickedDomains = [
    ...r.strongDomains.slice(0,2).map(d => ({d, type:'strong' as const})),
    ...r.mixedDomains.slice(0,2).map(d => ({d, type:'mixed' as const})),
    ...r.weakDomains.slice(0,1).map(d => ({d, type:'weak' as const})),
  ].filter(({d}) => { if (seen.has(d)) return false; seen.add(d); return true; }).slice(0,4);

  for (const {d, type} of pickedDomains) {
    const label  = DOMAIN_LABELS[d] ?? d;
    const icon   = DOMAIN_ICONS[d] ?? '◎';
    const signal = type === 'strong' ? 'Works in your favour' : type === 'mixed' ? 'Mixed' : 'Needs attention';
    const signalType: AreaMeaning['signalType'] = type === 'strong' ? 'good' : type === 'mixed' ? 'mixed' : 'hard';
    result.push({
      area: label, icon, signal, signalType,
      what: buildDomainWhat(r.planet, d, type, r),
      why:  buildDomainWhy(r.planet, d, type, r, pd),
    });
  }
  return result;
}

function buildDomainWhat(
  planet: string, domain: Domain, type: 'strong'|'mixed'|'weak', r: PlanetStrengthResult
): string {
  const DESC: Partial<Record<Domain, [string, string, string]>> = {
    self:          ['Your sense of identity tends to flow naturally — you show up clearly and with confidence.','Your self-expression is a work in progress — confidence can be built but takes consistent effort.','A clear, confident sense of self can be harder to maintain — this area deserves conscious cultivation.'],
    wealth:        ['Financial matters tend to work in your favour — income and resources accumulate with effort.','Finances are up and down — not in crisis, but not consistently stable.','Wealth requires more effort than it does for most — there may be instability or unexpected changes.'],
    career:        ['Career tends to reward your efforts — recognition and advancement are likely with consistency.','Career has its moments — good periods followed by plateaus or shifts in direction.','Career can feel like pushing against resistance — success is possible but slower and harder.'],
    marriage:      ['Long-term partnership tends to be fulfilling and supportive — this area is genuinely helped.','Relationships are meaningful but complex — they bring both deep connection and real challenges.','Close partnerships carry weight in your chart — this area deserves conscious attention and patience.'],
    children:      ['Children and creativity tend to bring genuine joy and fulfilment.','Children and creative expression are rewarding but not without complexity.','This area requires patience — timing and circumstances can be challenging.'],
    health:        ['Physical vitality and resilience are supported — the body tends to hold up well.','Health is generally okay but benefits from consistent attention.','Health deserves ongoing care — there may be recurring vulnerabilities that need to be managed.'],
    home:          ['Home and domestic life tend to feel stable and nourishing.','Home life is meaningful but can require repeated effort to maintain peace.','Home and family matters may carry recurring friction — domestic peace takes conscious work.'],
    fortune:       ['Fortune and good timing are genuine features of your chart — opportunity tends to arrive.','Fortune is present but comes through effort rather than luck alone.','Fortune comes through depth and patience — it arrives, but usually not without a journey.'],
    intellect:     ['Your mind is sharp and works well — learning and analysis come naturally.','Intellectually capable but inconsistent — some areas sharp, others foggy.','Mental clarity can be challenging — the mind works hard but output is harder to access.'],
    spirituality:  ['Spiritual practice and inner life are genuinely supported.','Spirituality is meaningful but the path involves real questioning.','Deep spiritual themes run through your chart — they demand attention.'],
    gains:         ['Income, networks, and gains from effort tend to come through reliably.','Gains are possible but require significant effort and sometimes competition.','Gains face resistance — what you earn may come with strings or feel inconsistent.'],
    longevity:     ['Physical resilience and longevity are real strengths.','Physical health needs ongoing attention.','The body may carry more demands than usual — pacing and rest matter.'],
    foreign:       ['Foreign connections and cross-cultural experiences tend to bring opportunity.','Foreign matters are a mixed chapter — opportunity exists but the path has obstacles.','Foreign matters are a source of disruption or complication in this chart.'],
    communication: ['Communication is a strength — words and ideas reach people effectively.','Communication is functional but can be inconsistent or misread.','Communication is an area of real effort — what you mean and what\'s received don\'t always match.'],
    liberation:    ['Spiritual liberation and depth are supported — a genuine strength.','Liberation themes run through your life but the path is complex.','Liberation-related themes are intense — they require conscious engagement.'],
    siblings:      ['Sibling relationships and close networks tend to be supportive.','Sibling relationships are meaningful but complex.','Sibling dynamics carry friction in this chart.'],
    father:        ['The father figure and authority relationships tend to be positive.','The father relationship is meaningful but complicated.','Authority figures and the father relationship carry weight and complexity.'],
    mother:        ['The mother figure and home base tend to be nourishing.','The mother relationship is meaningful but carries some complexity.','The mother and domestic roots may carry emotional complexity.'],
  };

  const [good, mid, hard] = DESC[domain] ?? [
    `${domain} tends to work in your favour.`,
    `${domain} is a mixed area.`,
    `${domain} requires extra attention and patience.`,
  ];
  if (type === 'strong') {
    if (r.deliveryGrade === 'delayed') return good + ' Results come — but usually after patience rather than quickly.';
    if (r.deliveryGrade === 'inconsistent') return good + ' The timing can be inconsistent — good periods followed by quieter spells.';
    return good;
  }
  return type === 'mixed' ? mid : hard;
}

function buildDomainWhy(
  planet: string, domain: Domain, type: 'strong'|'mixed'|'weak',
  r: PlanetStrengthResult, pd: PlanetData
): string {
  const houseForDomain: Partial<Record<Domain,number>> = {
    self:1, wealth:2, siblings:3, home:4, children:5, health:6,
    marriage:7, longevity:8, fortune:9, career:10, gains:11, liberation:12,
  };
  const dHouse = houseForDomain[domain];
  const fn     = r.functionalNature;
  const dg     = r.deliveryGrade;
  const cg     = r.conditionGrade;
  const sign   = pd.sign;

  // Build a specific why — ownership first, then the most relevant modifier for THIS domain
  const parts: string[] = [];

  // 1. Ownership / placement
  if (dHouse && r.housesRuled.includes(dHouse)) {
    parts.push(`${planet} directly rules your ${dHouse}${ord(dHouse)} house — ${(DOMAIN_LABELS[domain] ?? domain).toLowerCase()} is its responsibility in your chart`);
  } else if (dHouse && r.housePosition === dHouse) {
    parts.push(`${planet} is placed in the ${dHouse}${ord(dHouse)} house, activating ${(DOMAIN_LABELS[domain] ?? domain).toLowerCase()} themes directly`);
  } else {
    // Karakatwa (natural signification)
    const KARAKAS: Partial<Record<string, string>> = {
      Sun:     'father, authority, and vitality',
      Moon:    'mind, mother, and emotional wellbeing',
      Mars:    'siblings, energy, and property',
      Mercury: 'intellect and communication',
      Jupiter: 'children, wisdom, and fortune',
      Venus:   'relationships, pleasure, and comfort',
      Saturn:  'longevity, discipline, and karma',
      Rahu:    'foreign matters, ambition, and disruption',
      Ketu:    'spirituality, detachment, and past karma',
    };
    const karaka = KARAKAS[planet];
    if (karaka && karaka.toLowerCase().includes(domain.replace('_',' '))) {
      parts.push(`${planet} is the natural significator of ${karaka}`);
    } else {
      parts.push(`${planet}'s placement in ${sign} connects it to ${(DOMAIN_LABELS[domain] ?? domain).toLowerCase()} themes`);
    }
  }

  // 2. The most relevant modifier — specific to this domain's quality
  if (type === 'strong') {
    if (dg === 'reliable') parts.push(`it delivers here reliably — good results tend to come`);
    else if (dg === 'delayed') parts.push(`results come, but patience is needed — not quick wins`);
    else if (fn === 'yogakaraka' || fn === 'strong_benefic') parts.push(`as your chart's primary benefic, its positive themes tend to reach this area`);
    else parts.push(`despite delivery challenges, the ownership gives it direct relevance here`);
  } else if (type === 'mixed') {
    if (cg === 'afflicted' || cg === 'heavily_afflicted') parts.push(`affliction in the chart creates interference — good periods mix with difficult ones`);
    else if (dg === 'inconsistent') parts.push(`delivery is inconsistent — this area has good periods followed by quieter ones`);
    else if (fn === 'mixed') parts.push(`its mixed house lordship means this area gets both support and friction`);
    else parts.push(`competing influences create a mixed experience here`);
  } else {
    // type === 'weak'
    if (cg === 'distorted' || cg === 'heavily_afflicted') parts.push(`its distorted condition means energy in this area arrives in an amplified or irregular form`);
    else if (dg === 'obstructed' || dg === 'distorted_delivery') parts.push(`delivery is obstructed — this area faces the most direct impact of ${planet}'s challenges`);
    else if (fn === 'malefic') parts.push(`as a functional malefic for your lagna, its activation tends to bring friction to this house`);
    else parts.push(`the combination of its placement and condition makes this the most difficult area`);
  }

  // 3. D9 note for marriage only
  if (domain === 'marriage' && r.vargaAssessment.hasD9SecondPass && r.vargaAssessment.d9Contradicts) {
    parts.push(`the Navamsa (D9) specifically contradicts — inner reliability for relationships is low`);
  }

  return parts.map((p, i) => i === 0 ? cap(p) : p).join('. ') + '.';
}

// ─── Dasha Timeline ───────────────────────────────────────────────────────────

interface MahaPeriod { planet: string; startUtc: string; endUtc: string; }

interface DashaWindowItem {
  mahaLord: string; antarLord: string | null; pratyLord: string | null; sookshmaLord: string | null;
  level: 'maha'|'antar'|'pratyantar'|'sookshma';
  dateRange: string; startUtcRaw: string; isActive: boolean;
  quality: 'great'|'good'|'moderate'|'difficult';
  reason: string;
}

function dashaQuality(planet: string, r: PlanetStrengthResult, lords: string[]): DashaWindowItem['quality'] {
  const deliveryCeiling: DashaWindowItem['quality'] =
    r.deliveryGrade === 'reliable'    ? 'great'
    : r.deliveryGrade === 'delayed'   ? 'good'
    : r.deliveryGrade === 'inconsistent' ? 'moderate'
    : 'difficult';

  let friendCount = 0, enemyCount = 0;
  for (const lord of lords) {
    if (lord === planet) continue;
    const rel = getNaturalRelationship(lord, planet);
    if (rel === 'friend') friendCount++;
    if (rel === 'enemy')  enemyCount++;
  }

  const relScore: DashaWindowItem['quality'] =
    enemyCount > 0     ? 'difficult'
    : friendCount >= 2 ? 'great'
    : friendCount === 1 ? 'good'
    : 'moderate';

  const ORDER = { great:0, good:1, moderate:2, difficult:3 };
  return ORDER[deliveryCeiling] >= ORDER[relScore] ? deliveryCeiling : relScore;
}

function dashaReason(
  planet: string, level: DashaWindowItem['level'],
  mahaLord: string, antarLord: string|null, pratyLord: string|null, sookshmaLord: string|null,
  quality: DashaWindowItem['quality'], r: PlanetStrengthResult
): string {
  const enclosing = [mahaLord, antarLord, pratyLord, sookshmaLord].filter(Boolean) as string[];
  const otherLords = enclosing.filter(l => l !== planet);

  if (level === 'maha') {
    if (quality === 'great') return `${planet}'s own major period — its themes fully dominate. It delivers well in your chart, making this a genuinely productive stretch.`;
    if (quality === 'good')  return `${planet}'s own major period. Results arrive, though with characteristic delay or non-linear path.`;
    if (quality === 'moderate') return `${planet}'s own major period. Its results are inconsistent — some things work, others follow unexpected patterns.`;
    return `${planet}'s own major period. Because ${planet} faces real challenges in your chart, this period is intense and can feel demanding.`;
  }

  const levelLabel = level === 'antar' ? 'sub-period' : level === 'pratyantar' ? 'minor sub-period' : 'fine-grain window';
  const enclosingStr = otherLords.length > 1
    ? `${otherLords.slice(0,-1).join(' › ')} › ${otherLords[otherLords.length-1]}`
    : otherLords[0] ?? mahaLord;

  const rels = otherLords.map(l => {
    const rel = getNaturalRelationship(l, planet);
    return rel === 'friend' ? `${l} is a natural friend` : rel === 'enemy' ? `${l} is a natural enemy` : null;
  }).filter(Boolean);
  const relNote = rels.length > 0 ? ' ' + rels.join('; ') + '.' : '';

  const topDomain = r.strongDomains[0] ? (DOMAIN_LABELS[r.strongDomains[0]] ?? r.strongDomains[0]).toLowerCase() : 'your key areas';
  if (quality === 'great' || quality === 'good') {
    return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period.${relNote} Watch for movement in ${topDomain} during this window.`;
  }
  if (quality === 'difficult') {
    return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period.${relNote} This combination creates friction — ${planet}'s areas may feel pressured during this window.`;
  }
  return `${planet} activates as a ${levelLabel} within ${enclosingStr}'s period.${relNote} Mixed results — some things move, others stall.`;
}
function buildDashaTimeline(
  planet: string, r: PlanetStrengthResult, allMahas: MahaPeriod[]
): DashaWindowItem[] {
  const items: DashaWindowItem[] = [];
  if (!allMahas.length) return items;

  const now         = new Date();
  const tenYearsOut = new Date(now.getTime() + 10 * 365.25 * 24 * 60 * 60 * 1000);

  function push(
    startDate: Date, endDate: Date,
    mahaLord: string, antarLord: string|null, pratyLord: string|null, sookshmaLord: string|null,
    level: DashaWindowItem["level"], quality: DashaWindowItem["quality"]
  ) {
    const isActive = now >= startDate && now <= endDate;
    if (!isActive && startDate > tenYearsOut) return;
    if (endDate <= now) return;
    items.push({
      mahaLord, antarLord, pratyLord, sookshmaLord,
      level, dateRange: fmtRange(startDate, endDate),
      startUtcRaw: startDate.toISOString(),
      isActive, quality,
      reason: dashaReason(planet, level, mahaLord, antarLord, pratyLord, sookshmaLord, quality, r),
    });
  }

  const futureMahas = allMahas.filter(m => new Date(m.endUtc) > now);

  for (const maha of futureMahas) {
    const mahaStart = new Date(maha.startUtc);
    const mahaEnd   = new Date(maha.endUtc);

    if (maha.planet === planet) {
      const quality = dashaQuality(planet, r, [planet]);
      push(mahaStart, mahaEnd, planet, null, null, null, "maha", quality);
      try {
        const antars = calculateAntardashas(maha.planet as any, maha.startUtc, maha.endUtc);
        for (const antar of antars) {
          const aS = new Date(antar.startUtc), aE = new Date(antar.endUtc);
          const aQ = dashaQuality(planet, r, [maha.planet, antar.lord]);
          const aActive = now >= aS && now <= aE;
          if (aActive || aQ === "great" || aQ === "good") push(aS, aE, maha.planet, antar.lord, null, null, "antar", aQ);
        }
      } catch { /* skip */ }
      continue;
    }

    try {
      const antars = calculateAntardashas(maha.planet as any, maha.startUtc, maha.endUtc);
      for (const antar of antars) {
        if (antar.lord !== planet) continue;
        const aS = new Date(antar.startUtc), aE = new Date(antar.endUtc);
        if (aE <= now || aS > tenYearsOut) continue;
        const aQ = dashaQuality(planet, r, [maha.planet, planet]);
        push(aS, aE, maha.planet, planet, null, null, "antar", aQ);
        try {
          const pratys = calculatePratyantars(maha.planet as any, antar.lord as any, antar.startUtc, antar.endUtc);
          for (const praty of pratys) {
            if (praty.lord !== planet) continue;
            const pS = new Date(praty.startUtc), pE = new Date(praty.endUtc);
            const pActive = now >= pS && now <= pE;
            const pQ = dashaQuality(planet, r, [maha.planet, antar.lord, planet]);
            if (pActive || (pS <= tenYearsOut && pE > now)) push(pS, pE, maha.planet, antar.lord, planet, null, "pratyantar", pQ);
          }
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }

  return items
    .sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(a.startUtcRaw).getTime() - new Date(b.startUtcRaw).getTime();
    })
    .slice(0, 8);
}


function fmtRange(start: Date, end: Date): string {
  const y = (d: Date) => d.getFullYear().toString();
  const m = (d: Date) => d.toLocaleString('en',{month:'short'});
  return end.getFullYear() - start.getFullYear() <= 2
    ? `${m(start)} ${y(start)} – ${m(end)} ${y(end)}`
    : `${y(start)} – ${y(end)}`;
}

// ─── UI components ────────────────────────────────────────────────────────────

// ─── Collapsible section ─────────────────────────────────────────────────────

function CollapsibleSection({ title, children, defaultOpen = false, count }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden mt-3">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-foreground">{title}</span>
          {count !== undefined && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{count}</span>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-200 ease-in-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalBadge({ type, label }: { type: 'good'|'mixed'|'hard'; label: string }) {
  const s = {
    good:  'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    mixed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    hard:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', s[type])}>{label}</span>;
}

function AreaTag({ domain, type }: { domain: Domain; type: 'strong'|'mixed'|'weak' }) {
  const s = {
    strong:'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    mixed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    weak:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', s[type])}>{DOMAIN_LABELS[domain] ?? domain}</span>;
}

/** Renders the conjunction / aspect cluster rows */
function ConjClusterBlock({ items, netVerdict, isAspect = false }: {
  items: ConjItem[]; netVerdict: string; isAspect?: boolean;
}) {
  return (
    <div className="mt-3 bg-muted/30 rounded-xl border border-border overflow-hidden">
      {/* Per-planet rows */}
      <div className="divide-y divide-border">
        {items.map((item, i) => {
          const chipColor = item.isNode
            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
            : item.isBenefic
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
          const orbLabel = item.label === 'very_tight' ? 'dominant' : item.label === 'tight' ? 'strong' : item.label === 'mild' ? 'moderate' : 'background';
          return (
            <div key={i} className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border', chipColor)}>
                  {GLYPH[item.planet] ?? '○'} {item.planet}
                </span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                  {item.orb.toFixed(1)}°
                </span>
                <span className="text-[9px] text-muted-foreground">{orbLabel}</span>
              </div>
              <p className="text-[12px] text-foreground leading-relaxed">{item.effect}</p>
            </div>
          );
        })}
      </div>
      {/* Net verdict */}
      <div className="border-t border-border bg-muted/50 px-3 py-2.5">
        <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {isAspect ? 'Overall aspect influence' : 'Net effect of this cluster'}
        </div>
        <p className="text-[12px] text-foreground leading-relaxed">{netVerdict}</p>
      </div>
    </div>
  );
}

/** Renders the house ruler strip */
function RulerStripBlock({ items }: { items: RulerItem[] }) {
  return (
    <div className="mt-3 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-muted/30 rounded-xl border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium border border-border flex-shrink-0">
              {item.house}
            </div>
            <div>
              <span className="text-[12px] font-medium">{item.houseName}</span>
              {item.houseTypeLabel && (
                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">{item.houseTypeLabel}</span>
              )}
              {item.isSwaPlacement && (
                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">own placement</span>
              )}
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

/** Renders the full "In your chart" story as beats */
function StorySection({ beats }: { beats: Beat[] }) {
  return (
    <div className="space-y-4">
      {beats.map((beat, i) => {
        const isLast = beat.id === 'synthesis';
        return (
          <div key={i} className="mb-4 last:mb-0">
            {/* Tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: beat.dotColor }} />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{beat.tagLabel}</span>
            </div>
            {/* Text paragraph */}
            {beat.text && (
              <p className="text-[14px] leading-relaxed text-foreground">{beat.text}</p>
            )}
            {/* Conjunction/aspect cluster */}
            {beat.conjCluster && (
              <ConjClusterBlock
                items={beat.conjCluster.items}
                netVerdict={beat.conjCluster.netVerdict}
                isAspect={beat.id === 'aspects'}
              />
            )}
            {/* Ruler strip */}
            {beat.rulerItems && <RulerStripBlock items={beat.rulerItems} />}
          </div>
        );
      })}
    </div>
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
    maha:'Mahadasha — major period', antar:'Antardasha — sub-period',
    pratyantar:'Pratyantar — minor period', sookshma:'Sookshma — fine-grain window',
  };
  const chain = [item.mahaLord, item.antarLord, item.pratyLord, item.sookshmaLord].filter(Boolean).join(' › ');

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
            {item.isActive && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-semibold align-middle">NOW</span>}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">{LEVEL_LABELS[item.level]}</div>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{item.dateRange}</span>
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">{item.reason}</p>
    </div>
  );
}

// ─── Planet Card ──────────────────────────────────────────────────────────────

function PlanetCard({ r, pd, isSelected, onSelect }: {
  r: PlanetStrengthResult; pd: PlanetData; isSelected: boolean; onSelect: () => void;
}) {
  const strColor  = strGradeToColor(r.structuralGrade);
  const strWidth  = strGradeToWidth(r.structuralGrade);
  const isDasha   = r.temporalActivation.dashaBoostApplied;

  const fn   = r.functionalNature;
  const lean = r.functionalLean;
  const isNode = r.planet === 'Rahu' || r.planet === 'Ketu';

  let cardLine: string;
  const housesStr = r.housesRuled.map(h => `${h}${ord(h)}`).join(' and ');
  const topDomain = r.strongDomains[0] ? DOMAIN_LABELS[r.strongDomains[0]] : r.mixedDomains[0] ? DOMAIN_LABELS[r.mixedDomains[0]] : null;

  if (fn === 'yogakaraka') {
    cardLine = 'Yogakaraka — rules both kendra and trikona. Your most constructive planet.';
  } else if (fn === 'strong_benefic' && r.housesRuled.includes(1)) {
    cardLine = 'Your chart ruler — its condition shapes your overall self-expression.';
  } else if (fn === 'strong_benefic') {
    cardLine = `Primary benefic — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}.`;
  } else if (fn === 'benefic') {
    cardLine = `Kendra lord — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}. Stabilising role.`;
  } else if (fn === 'malefic') {
    const topWeak = r.weakDomains[0] ? DOMAIN_LABELS[r.weakDomains[0]] : null;
    cardLine = `Rules the ${housesStr} — dusthana houses. Creates friction${topWeak ? ` in ${topWeak.toLowerCase()}` : ''}.`;
  } else if (fn === 'mixed' && lean === 'benefic_lean') {
    cardLine = `Mixed — leans constructive.${topDomain ? ` ${topDomain} is the strongest area.` : ''}`;
  } else if (fn === 'mixed' && lean === 'malefic_lean') {
    const topWeak = r.weakDomains[0] ? DOMAIN_LABELS[r.weakDomains[0]] : null;
    cardLine = `Mixed — leans challenging.${topWeak ? ` ${topWeak} needs the most attention.` : ''}`;
  } else if (fn === 'mixed' && lean === 'maraka_driven') {
    cardLine = 'Maraka planet — rules the 2nd and 7th. Life-sensitive in its own dasha.';
  } else if (fn === 'mixed') {
    cardLine = `Mixed role — rules the ${housesStr} house${r.housesRuled.length > 1 ? 's' : ''}.${topDomain ? ` Best for ${topDomain.toLowerCase()}.` : ''}`;
  } else if (isNode && r.nodeInheritance) {
    const houseNote = r.housePosition === 7 ? 'relationships' : r.housePosition === 1 ? 'your identity' : r.housePosition === 10 ? 'career' : r.housePosition === 4 ? 'home' : `the ${r.housePosition}${ord(r.housePosition)} house`;
    cardLine = `In ${houseNote} — amplifies those themes. Inherits character from ${r.nodeInheritance.dispositorName}.`;
  } else {
    cardLine = `In the ${r.housePosition}${ord(r.housePosition)} house.${topDomain ? ` Most relevant for ${topDomain.toLowerCase()}.` : ''}`;
  }

  const cardAreas = [
    ...r.strongDomains.slice(0,2).map(d => ({d, t: 'strong' as const})),
    ...r.mixedDomains.slice(0,1).map(d => ({d, t: 'mixed' as const})),
  ].slice(0, 3);

  return (
    <button type="button" onClick={onSelect}
      className={cn('w-full text-left rounded-xl border overflow-hidden bg-card transition-all',
        isSelected ? 'border-blue-400 shadow-sm ring-1 ring-blue-400/20 dark:border-blue-600'
                   : 'border-border hover:border-border/80 hover:shadow-sm')}>
      <div className="p-4">
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
        <div className="mb-3">
          <div className="h-1 rounded-full bg-muted overflow-hidden mb-1.5">
            <div className="h-full rounded-full" style={{ width: `${strWidth}%`, background: strColor }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: strColor }}>{strGradeToWord(r.structuralGrade)}</span>
            <span className="text-[11px] text-muted-foreground">{delivGradeToWord(r.deliveryGrade)}</span>
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{cardLine}</p>
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

function DrawerPanel({ r, pd, moonData, birthDateUtc, allPlanets, onClose }: {
  r: PlanetStrengthResult; pd: PlanetData;
  moonData?: PlanetData; birthDateUtc?: string;
  allPlanets: Record<string, PlanetData>;
  onClose: () => void;
}) {
  const allMahas = useMemo((): MahaPeriod[] => {
    if (!moonData?.kp || !birthDateUtc) return [];
    try {
      const result = vimshottariDasha(
        moonData.longitude, new Date(birthDateUtc),
        moonData.kp.elapsedFractionOfNakshatra, moonData.kp.nakshatraLord as any
      );
      return (result.allMahadashas ?? []).map((m: any) => ({
        planet: m.lord, startUtc: m.startUtc, endUtc: m.endUtc,
      }));
    } catch { return []; }
  }, [moonData, birthDateUtc]);

  const beats    = useMemo(() => buildStoryBeats(r, pd, allPlanets, allMahas), [r, pd, allPlanets, allMahas]);
  const meanings = useMemo(() => buildWhatThisMeans(r, pd), [r, pd]);
  const timeline = useMemo(() => buildDashaTimeline(r.planet, r, allMahas), [r, allMahas]);

  const strColor = strGradeToColor(r.structuralGrade);
  const isDasha  = r.temporalActivation.dashaBoostApplied;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — starts below the site navbar, outer div is the scroll container */}
      <div className={cn(
        'fixed top-16 right-0 z-50',
        'h-[calc(100vh-4rem)]',
        'w-full sm:w-[42%] sm:min-w-[420px] sm:max-w-[600px]',
        'bg-background border-l border-border shadow-2xl',
        'overflow-y-auto', // THIS is the scroll container
      )}>

        {/* Header — sticky top-0 relative to the scroll container above */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl leading-none">{GLYPH[r.planet]}</span>
              <span className="font-semibold text-[22px] tracking-tight">{r.planet}</span>
              {isDasha && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Active now
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* 3-block summary */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">Strength</div>
              <div className="text-[12px] font-medium" style={{ color: strColor }}>{strGradeToWord(r.structuralGrade)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{dignityShort(r.dignityLevel)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">Delivery</div>
              <div className="text-[12px] font-medium" style={{ color: delivGradeToColor(r.deliveryGrade, r.structuralGrade) }}>{delivGradeToWord(r.deliveryGrade)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{pd.kp?.nakshatraName ?? pd.sign}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">Top areas</div>
              <div className="text-[11px] font-medium leading-tight">
                {[...r.strongDomains, ...r.mixedDomains].slice(0, 2).map(d => DOMAIN_LABELS[d]).join(', ') || 'General'}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-2">

          {/* Active dasha banner */}
          {isDasha && (
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-lg px-4 py-3 my-4">
              <div className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Shaping your life right now</div>
              <p className="text-[12px] text-blue-900 dark:text-blue-200 leading-relaxed">
                {r.planet}'s period is active. The reading below describes what is happening in your life at this moment — not just in theory.
              </p>
            </div>
          )}

          {/* In your chart — open by default */}
          <CollapsibleSection title="In your chart" defaultOpen={true}>
            <StorySection beats={beats} />
          </CollapsibleSection>

          {/* What this means — open by default */}
          <CollapsibleSection title="What this means for you" defaultOpen={true} count={meanings.length}>
            <div className="space-y-2.5 pt-1">
              {meanings.map((m, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 bg-muted/30">
                    <span className="text-sm leading-none">{m.icon}</span>
                    <span className="text-[12px] font-medium flex-1">{m.area}</span>
                    <SignalBadge type={m.signalType} label={m.signal} />
                  </div>
                  <div className="px-3.5 py-2.5 border-t border-border">
                    <p className="text-[14px] leading-relaxed font-medium mb-1.5">{m.what}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{m.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Dasha — collapsed by default */}
          {timeline.length > 0 && (
            <CollapsibleSection title={`When does ${r.planet} give results?`} defaultOpen={false} count={timeline.length}>
              <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed pt-1">
                Current and upcoming periods only — past periods not shown.
              </p>
              <div className="space-y-2">
                {timeline.map((item, i) => <DashaPill key={i} item={item} />)}
              </div>
            </CollapsibleSection>
          )}

          {/* All life areas — collapsed by default */}
          <CollapsibleSection
            title="All life areas"
            defaultOpen={false}
            count={r.strongDomains.length + r.mixedDomains.length + r.weakDomains.length}
          >
            <div className="space-y-2 pt-1">
              {r.strongDomains.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-muted-foreground min-w-[48px]">Works well</span>
                  {r.strongDomains.map(d => <AreaTag key={d} domain={d} type="strong" />)}
                </div>
              )}
              {r.mixedDomains.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-muted-foreground min-w-[48px]">Mixed</span>
                  {r.mixedDomains.map(d => <AreaTag key={d} domain={d} type="mixed" />)}
                </div>
              )}
              {r.weakDomains.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-muted-foreground min-w-[48px]">Difficult</span>
                  {r.weakDomains.map(d => <AreaTag key={d} domain={d} type="weak" />)}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* For astrologers — collapsed by default */}
          <CollapsibleSection title="For astrologers — technical details" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2 pt-1 mb-3">
              {([
                ['Dignity',    dignityShort(r.dignityLevel)],
                ['House',      `${r.housePosition}${ord(r.housePosition)}`],
                ['Functional', r.functionalNature.replace(/_/g,' ')],
                ['Condition',  r.conditionGrade.replace(/_/g,' ')],
                ['D9',         dignityShort(r.vargaAssessment.d9DignityLevel)],
                ['Delivery',   r.deliveryGrade.replace(/_/g,' ')],
                ['Natal rank', `#${r.natalPriorityRank}`],
                ['Confidence', r.assessmentConfidence],
              ] as [string,string][]).map(([k, v]) => (
                <div key={k} className="bg-muted/40 rounded-lg px-3 py-2">
                  <div className="text-[9px] text-muted-foreground mb-0.5">{k}</div>
                  <div className="text-[11px] font-medium">{v}</div>
                </div>
              ))}
            </div>
            {r.analystNote && (
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">{r.analystNote}</p>
            )}
          </CollapsibleSection>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}


// ─── Main ─────────────────────────────────────────────────────────────────────

export function PlanetsTab({ planets, ascendant, dashaInfo, birthDate }: PlanetsTabProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const dashaContext = useMemo(() => ({
    currentMahadasha: dashaInfo?.currentMahadasha,
  }), [dashaInfo]);

  const results = useMemo(() => {
    try { return assessAllPlanets({ planets, ascendant, dashaContext }); }
    catch { return {} as Record<string, PlanetStrengthResult>; }
  }, [planets, ascendant, dashaContext]);

  const groups = useMemo(() => {
    const g: Record<'working'|'mixed'|'struggling', string[]> = { working:[], mixed:[], struggling:[] };
    for (const name of PLANET_ORDER) {
      const r = results[name]; if (!r) continue;
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
      <div>
        <h2 className="text-base font-medium">Your planets</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {ascendant.sign} lagna · How each planet works in your chart
        </p>
      </div>

      {(['working','mixed','struggling'] as const).map(gk => {
        const planetNames = groups[gk]; if (!planetNames.length) return null;
        const { label, dot } = GROUP_LABELS[gk];
        return (
          <div key={gk}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {planetNames.map(name => {
                const r  = results[name];
                const pd = planets[name] as PlanetData | undefined;
                if (!r || !pd) return null;
                return (
                  <PlanetCard key={name} r={r} pd={pd}
                    isSelected={selected === name}
                    onSelect={() => setSelected(p => p === name ? null : name)} />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Drawer — rendered outside the grid so it floats over the page */}
      {selected && (() => {
        const r  = results[selected];
        const pd = planets[selected] as PlanetData | undefined;
        if (!r || !pd) return null;
        return (
          <DrawerPanel
            r={r} pd={pd}
            moonData={planets['Moon'] as PlanetData | undefined}
            birthDateUtc={birthDate}
            allPlanets={planets}
            onClose={() => setSelected(null)}
          />
        );
      })()}
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function ord(n: number): string { return n===1?'st':n===2?'nd':n===3?'rd':'th'; }
function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function dignityShort(l: DignityLevel): string {
  return { exalted:'Exalted', moolatrikona:'Moolatrikona', own_sign:'Own sign',
           great_friend:'Great friend', friend:'Friendly', neutral:'Neutral',
           enemy:'Enemy', great_enemy:'Great enemy', debilitated:'Debilitated' }[l] ?? l;
}
