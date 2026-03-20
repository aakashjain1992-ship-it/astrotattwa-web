/**
 * Planetary Strength Engine — Type Definitions v4.2
 */

// ─── Layer 1 ──────────────────────────────────────────────────────────────────

export type StructuralGrade = 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';

export type DignityLevel =
  | 'exalted' | 'moolatrikona' | 'own_sign'
  | 'great_friend' | 'friend' | 'neutral'
  | 'enemy' | 'great_enemy' | 'debilitated';

export type PlacementFlag =
  | 'exalted' | 'moolatrikona' | 'debilitated'
  | 'combust_close' | 'combust_mild' | 'combust_weak'
  | 'retrograde' | 'sandhi' | 'gandanta_hook'
  | 'kendra_placement' | 'trikona_placement'
  | 'dusthana_placement' | 'upachaya_placement'
  | 'neecha_bhanga' | 'digbala_hook' | 'shadbala_hook';

// ─── Layer 2 ──────────────────────────────────────────────────────────────────

export type FunctionalNature =
  | 'yogakaraka' | 'strong_benefic' | 'benefic'
  | 'mixed' | 'neutral' | 'malefic';

export type FunctionalLean =
  | 'benefic_lean'
  | 'neutral_lean'
  | 'malefic_lean'
  | 'maraka_driven'
  | 'protective_with_complication';

// ─── Layer 3 ──────────────────────────────────────────────────────────────────

export type ConditionGrade =
  | 'supported' | 'clean' | 'afflicted' | 'heavily_afflicted' | 'distorted';

export type DistortionFlag =
  | 'combustion_distortion' | 'nodal_distortion'
  | 'martian_pressure' | 'saturnine_delay'
  | 'emotional_volatility' | 'hidden_expression'
  | 'dependent_on_sun' | 'overshadowed';

// ─── Layer 4 ──────────────────────────────────────────────────────────────────

export type VargaStatus =
  | 'confirmed' | 'mixed' | 'contradicted'
  | 'domain_confirmed' | 'domain_contradicted';

export interface VargaAssessment {
  d9SignNumber: number;
  d9DignityLevel: DignityLevel;
  d9Confirms: boolean;
  d9Contradicts: boolean;
  vargaStatus: VargaStatus;
  vargaSupportScore: number;
  vargaConfidence: 'high' | 'moderate' | 'low';
  note: string;
  domainVargaScores: Partial<Record<string, number>>;
  domainVargaNotes: Partial<Record<string, string>>;
  hasD9SecondPass: boolean;
}

// ─── Layer 5 ──────────────────────────────────────────────────────────────────

export type DominantFactor =
  | 'tight_rahu_conjunction'  | 'tight_ketu_conjunction'
  | 'tight_saturn_conjunction'| 'tight_mars_conjunction'
  | 'tight_saturn_aspect'     | 'tight_mars_aspect'
  | 'deep_debility'           | 'strong_exaltation_kendra'
  | 'd1_d9_extreme_mismatch'  | 'neecha_bhanga_override'
  | 'combust_dominated';

// ─── Layer 6 ──────────────────────────────────────────────────────────────────

export type DeliveryGrade =
  | 'reliable' | 'delayed' | 'inconsistent' | 'distorted_delivery' | 'obstructed';

// ─── Layer 7 ──────────────────────────────────────────────────────────────────

export type DeliveryStyle =
  | 'slow_consolidating' | 'fast_decisive' | 'fluctuating_sensitive'
  | 'direct_commanding' | 'harmonizing_desirous' | 'agile_nervous'
  | 'expanding_guiding' | 'extreme_hungry' | 'withdrawing_cutting'
  | 'inherited';

// ─── Layer 8 ──────────────────────────────────────────────────────────────────

export interface NakshatraInfluence {
  starLordName: string;
  starLordStructuralScore: number;
  starLordSupportEffect: number;
  subLordName: string;
  subLordStructuralScore: number;
  subLordRefinementEffect: number;
  nakshatraDeliveryModifier: number;
  nakshatraNotes: string;
}

// ─── Layer 10 ─────────────────────────────────────────────────────────────────

export type Domain =
  | 'self' | 'wealth' | 'siblings' | 'home' | 'children'
  | 'health' | 'marriage' | 'longevity' | 'fortune' | 'career'
  | 'gains' | 'liberation' | 'father' | 'mother' | 'intellect'
  | 'spirituality' | 'communication' | 'foreign';

export type DomainStrength = 'strong' | 'mixed' | 'weak';

// ─── Layer 11 ─────────────────────────────────────────────────────────────────

export interface TemporalActivation {
  isMahadasha: boolean;
  isAntardasha: boolean;
  isPratyantar: boolean;
  currentActivationScore: number;
  currentActivationReason: string;
  dashaBoostApplied: boolean;
}

// ─── Layer 12 ─────────────────────────────────────────────────────────────────

export interface PlanetImportance {
  importanceWeight: number;
  domainImportanceWeights: Partial<Record<Domain, number>>;
  natalPriorityRank: number;
  currentPriorityRank: number;
}

// ─── Layer 13 ─────────────────────────────────────────────────────────────────

export type ConfidenceGrade = 'high' | 'moderate' | 'low';

// ─── Layer 14 ─────────────────────────────────────────────────────────────────

export type ConflictFlag =
  | 'strong_afflicted'    | 'weak_protected'
  | 'strong_but_malefic'  | 'benefic_but_weak'
  | 'strong_d1_weak_d9'   | 'weak_d1_strong_d9'
  | 'strong_general_weak_domain' | 'weak_general_strong_domain'
  | 'powerful_maraka'     | 'node_dominated'
  | 'saturn_dominated'    | 'mars_dominated'
  | 'combust_but_supported' | 'retrograde_internalized'
  | 'weak_afflicted';

// ─── Node Inheritance ─────────────────────────────────────────────────────────

export interface NodeInheritance {
  dispositorName: string;
  dispositorStructuralScore: number;
  dispositorConditionScore: number;
  dispositorConditionGrade: ConditionGrade;          // real grade from pre-computed
  dispositorFunctionalNature: FunctionalNature;
  dispositorFunctionalLean: FunctionalLean;          // NEW v4.2 — direction within mixed
  dispositorDeliveryGrade: DeliveryGrade;            // real delivery from pre-computed
  nakshatraLordName: string;
  nakshatraLordScore: number;
  conjunctionPartner?: string;
  conjunctionPartnerScore?: number;
  inheritedSupportScore: number;
  inheritedCondition: ConditionGrade;
  inheritedReliability: DeliveryGrade;
  amplificationTendency: number;
  distortionTendency: number;
  obsessionTendency: number;
  spiritualizationTendency: number;
  foreignUnconventionalTendency: number;
  // House-context quality (Correction 3)
  houseContextScore: number;                        // 0–100 for this node in this house
}

// ─── Support types ────────────────────────────────────────────────────────────

export type NaturalRelationship = 'friend' | 'neutral' | 'enemy';

export interface KeyReason {
  sentiment: 'positive' | 'negative' | 'neutral';
  text: string;
}

export interface NeechaBhangaResult {
  isApplied: boolean;
  rule?: string;
  description?: string;
}

// ─── Full Result ──────────────────────────────────────────────────────────────

export interface PlanetStrengthResult {
  planet: string;

  structuralScore: number;
  structuralGrade: StructuralGrade;
  dignityLevel: DignityLevel;
  placementFlags: PlacementFlag[];
  structuralFlags: PlacementFlag[];

  functionalNature: FunctionalNature;
  functionalLean: FunctionalLean;
  functionalScore: number;
  isMarakaCapable: boolean;
  housesRuled: number[];
  ownershipWeights: Record<number, number>;
  housePosition: number;

  conditionScore: number;
  conditionGrade: ConditionGrade;
  afflictions: string[];
  protections: string[];
  distortionFlags: DistortionFlag[];

  vargaAssessment: VargaAssessment;

  dominantFactors: DominantFactor[];
  dominantOverrideApplied: boolean;
  overrideImpactNotes: string[];

  deliveryScore: number;
  deliveryGrade: DeliveryGrade;
  deliveryReasons: string[];

  agendaThemes: string[];
  deliveryStyle: DeliveryStyle;
  psychologicalTone: string;
  karmicStyle: string;

  nakshatraInfluence: NakshatraInfluence;

  nodeInheritance?: NodeInheritance;
  inheritedSupportScore?: number;
  inheritedCondition?: ConditionGrade;
  inheritedReliability?: DeliveryGrade;

  strongDomains: Domain[];
  mixedDomains: Domain[];
  weakDomains: Domain[];
  domainConfidence: Partial<Record<Domain, ConfidenceGrade>>;

  temporalActivation: TemporalActivation;

  importanceWeight: number;
  domainImportanceWeights: Partial<Record<Domain, number>>;
  natalPriorityRank: number;
  currentPriorityRank: number;

  assessmentConfidence: ConfidenceGrade;
  conflictFlags: ConflictFlag[];

  keyReasons: KeyReason[];
  analystNote: string;

  neechaBhanga: NeechaBhangaResult;
  isRetrograde: boolean;
  isCombust: boolean;
  isPakshaBala?: boolean;
}

// ─── Engine Input ─────────────────────────────────────────────────────────────

export interface DashaContext {
  currentMahadasha?: string;
  currentAntardasha?: string;
  currentPratyantar?: string;
}

export interface StrengthEngineInput {
  planets: Record<string, import('@/types/astrology').PlanetData>;
  ascendant: import('@/types/astrology').AscendantData;
  dashaContext?: DashaContext;
}
