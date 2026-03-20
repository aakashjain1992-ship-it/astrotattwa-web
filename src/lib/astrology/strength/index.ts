/**
 * Planetary Strength Engine — Public API v4.2
 */

export { assessAllPlanets } from './strengthEngine';

export type {
  PlanetStrengthResult, StrengthEngineInput, DashaContext,
  StructuralGrade, DignityLevel, PlacementFlag,
  FunctionalNature, FunctionalLean,
  ConditionGrade, DistortionFlag,
  VargaStatus, VargaAssessment,
  DominantFactor,
  DeliveryGrade, DeliveryStyle,
  NakshatraInfluence, NodeInheritance,
  Domain, TemporalActivation, PlanetImportance,
  ConfidenceGrade, ConflictFlag,
  KeyReason, NeechaBhangaResult,
} from './types';

export type { DomainKarakaContext, PlanetDomainContext } from './domainEngine';

export { getDignityLabel, getPositionalScore, getSimpleDignity } from './dignityEngine';
export { computeFunctionalNature, getHousesRuled, isMarakaCapable, getLordOfSignPublic } from './functionalNature';
export { checkNeechaBhanga } from './neechaBhanga';
export { getAspectInfo, getAspectedSigns, getConjunctions, degreeDiff } from './aspectEngine';
export { computeNodeInheritance } from './nodeInheritance';
export { computeNakshatraInfluence } from './nakshatraLayer';
export { conditionFromNodeInheritance } from './conditionGrade';
export { HOUSE_DOMAIN } from './domainEngine';
