/**
 * Planet Agenda Layer — Layer 7 (Spec §7)
 *
 * Defines WHAT a planet is naturally trying to deliver:
 * agendaThemes, deliveryStyle, psychologicalTone, karmicStyle
 *
 * This distinguishes "can deliver" from "what it will deliver."
 * Agenda is modulated by condition and functional nature — a Saturn
 * that is yogakaraka still delivers Saturn's agenda (discipline,
 * structure, karma) but toward constructive domains.
 */

import type {
  DeliveryStyle, FunctionalNature, FunctionalLean,
  ConditionGrade, StructuralGrade,
} from './types';
import type { NodeInheritance } from './types';

interface AgendaResult {
  agendaThemes: string[];
  deliveryStyle: DeliveryStyle;
  psychologicalTone: string;
  karmicStyle: string;
}

// ─── Base agenda per planet ───────────────────────────────────────────────────

const BASE_AGENDA: Record<string, Omit<AgendaResult, 'agendaThemes'> & { themes: string[] }> = {
  Sun: {
    themes: ['authority', 'identity', 'visibility', 'dignity', 'purpose', 'centrality', 'vitality'],
    deliveryStyle: 'direct_commanding',
    psychologicalTone: 'proud, sovereign, self-referential, commanding',
    karmicStyle: 'self-realization and rightful assertion — lessons of ego, authority, and authentic expression',
  },
  Moon: {
    themes: ['mind', 'emotion', 'adaptability', 'belonging', 'care', 'responsiveness', 'memory'],
    deliveryStyle: 'fluctuating_sensitive',
    psychologicalTone: 'receptive, nourishing, emotionally driven, changeable',
    karmicStyle: 'emotional growth and belonging — lessons of attachment, comfort, and inner stability',
  },
  Mars: {
    themes: ['action', 'conflict', 'courage', 'assertion', 'force', 'competition', 'ambition'],
    deliveryStyle: 'fast_decisive',
    psychologicalTone: 'aggressive, direct, impulsive, driven, bold',
    karmicStyle: 'assertion and right effort — lessons of boundaries, courage without recklessness',
  },
  Mercury: {
    themes: ['communication', 'trade', 'logic', 'adaptability', 'skill', 'analysis', 'discrimination'],
    deliveryStyle: 'agile_nervous',
    psychologicalTone: 'analytical, curious, versatile, restless, detail-oriented',
    karmicStyle: 'discernment and clear communication — lessons of honesty, intellectual humility',
  },
  Jupiter: {
    themes: ['wisdom', 'growth', 'grace', 'values', 'expansion', 'teaching', 'abundance', 'dharma'],
    deliveryStyle: 'expanding_guiding',
    psychologicalTone: 'optimistic, generous, principled, philosophical, expansive',
    karmicStyle: 'grace and righteous expansion — lessons of wisdom, excess, and genuine growth',
  },
  Venus: {
    themes: ['relationship', 'comfort', 'art', 'pleasure', 'attraction', 'agreement', 'refinement'],
    deliveryStyle: 'harmonizing_desirous',
    psychologicalTone: 'desirous, harmonizing, aesthetic, sensual, relational',
    karmicStyle: 'right relationship and beauty — lessons of attachment, genuine love vs desire',
  },
  Saturn: {
    themes: ['discipline', 'karma', 'delay', 'responsibility', 'realism', 'endurance', 'structure'],
    deliveryStyle: 'slow_consolidating',
    psychologicalTone: 'serious, cautious, restrictive, enduring, realistic',
    karmicStyle: 'karmic settlement and right effort — lessons of patience, discipline, facing consequences',
  },
  Rahu: {
    themes: ['amplification', 'obsession', 'unconventionality', 'desire', 'disruption', 'foreignness', 'hunger'],
    deliveryStyle: 'extreme_hungry',
    psychologicalTone: 'insatiable, innovative, destabilizing, compulsive, worldly',
    karmicStyle: 'karmic hunger and worldly obsession — lessons of attachment, excess, and material illusion',
  },
  Ketu: {
    themes: ['detachment', 'severance', 'internalization', 'renunciation', 'dissociation', 'subtlety', 'moksha'],
    deliveryStyle: 'withdrawing_cutting',
    psychologicalTone: 'detached, spiritual, dissociative, cutting, inwardly focused',
    karmicStyle: 'karmic release and spiritual dissolution — lessons of letting go, past-life completion',
  },
};

/**
 * Modulate delivery style for nodes based on inheritance.
 * A node with a strong benefic dispositor softens its style.
 */
function modulateNodeStyle(
  planet: string,
  base: Omit<AgendaResult, 'agendaThemes'> & { themes: string[] },
  nodeInheritance?: NodeInheritance
): DeliveryStyle {
  if (!nodeInheritance) return 'extreme_hungry';
  const score = nodeInheritance.inheritedSupportScore;
  // Well-supported nodes: still extreme/withdrawing but less destructive
  if (score >= 65) return planet === 'Rahu' ? 'extreme_hungry' : 'withdrawing_cutting';
  // Weakly supported nodes: more distorted
  return planet === 'Rahu' ? 'extreme_hungry' : 'withdrawing_cutting';
}

/**
 * Modulate psychological tone based on condition.
 * An afflicted Saturn becomes paranoid; a supported Saturn becomes structured.
 */
function modulateTone(
  planet: string,
  baseTone: string,
  conditionGrade: ConditionGrade,
  functionalNature: FunctionalNature
): string {
  const isAfflicted = conditionGrade === 'afflicted' || conditionGrade === 'heavily_afflicted' || conditionGrade === 'distorted';
  const isSupported = conditionGrade === 'supported';

  if (!isAfflicted && !isSupported) return baseTone;

  const toneModulations: Partial<Record<string, { afflicted: string; supported: string }>> = {
    Sun:     { afflicted: 'arrogant, defensive, ego-driven, visibility-seeking at cost', supported: 'radiant, purposeful, dignified, natural authority' },
    Moon:    { afflicted: 'anxious, emotionally volatile, oversensitive, dependent', supported: 'nurturing, emotionally stable, intuitive, caring' },
    Mars:    { afflicted: 'aggressive, volatile, combative, reckless, inflammatory', supported: 'courageous, driven, decisive, protective, energetic' },
    Mercury: { afflicted: 'scattered, deceptive, manipulative, anxious, overthinking', supported: 'clear-minded, skillful, communicative, perceptive' },
    Jupiter: { afflicted: 'overindulgent, dogmatic, falsely optimistic, excessive', supported: 'wise, expansive, principled, genuinely generous' },
    Venus:   { afflicted: 'possessive, deceptive in relationships, hedonistic, unstable', supported: 'graceful, loving, artistic, harmonizing, refined' },
    Saturn:  { afflicted: 'fearful, paranoid, suppressive, punishing, rigid, bitter', supported: 'disciplined, structured, enduring, realistic, trustworthy' },
    Rahu:    { afflicted: 'obsessive, destructive, deceptive, manipulative, addictive', supported: 'innovative, unconventional, driven, worldly but organized' },
    Ketu:    { afflicted: 'dissociative, nihilistic, self-destructive, isolating', supported: 'spiritually inclined, detached peacefully, insightful' },
  };

  const mod = toneModulations[planet];
  if (!mod) return baseTone;
  return isAfflicted ? mod.afflicted : mod.supported;
}

/**
 * Modulate karmic style for functional nature.
 */
function modulateKarmic(
  baseMstyle: string,
  functionalNature: FunctionalNature,
  functionalLean: FunctionalLean
): string {
  if (functionalNature === 'yogakaraka')
    return baseMstyle + ' — yogakaraka: dharmic alignment amplifies karmic fruition';
  if (functionalNature === 'malefic')
    return baseMstyle + ' — functional malefic: karmic delivery involves difficulty and testing';
  if (functionalNature === 'mixed' && functionalLean === 'maraka_driven')
    return baseMstyle + ' — maraka capability: karmic completion themes may surface in its dasha';
  return baseMstyle;
}

/**
 * Add condition-context to agenda themes.
 * A strongly supported planet gets its positive themes emphasized.
 * A distorted planet gets cautionary themes added.
 */
function buildContextualThemes(
  planet: string,
  baseThemes: string[],
  conditionGrade: ConditionGrade,
  structuralGrade: StructuralGrade,
  functionalNature: FunctionalNature,
  functionalLean: FunctionalLean
): string[] {
  const themes = [...baseThemes];

  // Add strength context
  if (['very_strong', 'strong'].includes(structuralGrade))
    themes.push('force available for its domains');

  if (['weak', 'very_weak'].includes(structuralGrade))
    themes.push('limited force — subdued expression');

  // Add condition context
  if (conditionGrade === 'distorted' || conditionGrade === 'heavily_afflicted')
    themes.push('distorted expression — themes come with damage or excess');
  else if (conditionGrade === 'supported')
    themes.push('protected expression — themes delivered constructively');

  // Add functional role context
  if (functionalNature === 'yogakaraka')
    themes.push('chart-aligned agenda — yogakaraka direction');
  if (functionalNature === 'malefic')
    themes.push('difficult domains — agenda challenges these life areas');
  if (functionalLean === 'maraka_driven')
    themes.push('maraka sensitivity — endings and transformation in relevant dashas');

  return themes;
}

export function computeAgenda(
  planet: string,
  conditionGrade: ConditionGrade,
  structuralGrade: StructuralGrade,
  functionalNature: FunctionalNature,
  functionalLean: FunctionalLean,
  nodeInheritance?: NodeInheritance
): AgendaResult {
  const base = BASE_AGENDA[planet];
  if (!base) {
    return {
      agendaThemes: ['unknown agenda'],
      deliveryStyle: 'inherited',
      psychologicalTone: 'unknown',
      karmicStyle: 'unknown',
    };
  }

  const deliveryStyle = (planet === 'Rahu' || planet === 'Ketu')
    ? modulateNodeStyle(planet, base, nodeInheritance)
    : base.deliveryStyle;

  const psychologicalTone = modulateTone(planet, base.psychologicalTone, conditionGrade, functionalNature);
  const karmicStyle = modulateKarmic(base.karmicStyle, functionalNature, functionalLean);
  const agendaThemes = buildContextualThemes(
    planet, base.themes, conditionGrade, structuralGrade, functionalNature, functionalLean
  );

  return { agendaThemes, deliveryStyle, psychologicalTone, karmicStyle };
}
