/**
 * Planetary Strength Engine v4.2 — Main Assembler
 *
 * Two-phase assessment:
 * Phase A (Sun–Saturn): Full assessment, stored in results.
 * Phase B (Rahu, Ketu): Node inheritance uses Phase A results directly via precomputedPlanets.
 *
 * Key wiring for all 5 corrections:
 * - housePosition now passed to computeNodeInheritance (Correction 3)
 * - precomputedPlanets carries real functionalNature, functionalLean, conditionGrade,
 *   deliveryGrade for Correction 1
 * - conditionFromNodeInheritance is the ONLY condition source for nodes (no assessCondition)
 * - domainEngine receives real karakaContext (not rough estimates)
 */

import type {
  PlanetStrengthResult, StrengthEngineInput, PlacementFlag,
  FunctionalNature, StructuralGrade,
} from './types';
import type { PlanetData } from '@/types/astrology';

import { assessDignity }                                       from './dignityEngine';
import { computeFunctionalNature, getHousesRuled, getOwnershipWeights,
         isMarakaCapable, functionalNatureToScore, getLordOfSignPublic } from './functionalNature';
import { checkNeechaBhanga }                                   from './neechaBhanga';
import { assessCondition, conditionFromNodeInheritance }       from './conditionGrade';
import { computeVargaAssessment }                              from './vargaEngine';
import { computeDominantOverrides }                            from './dominantOverride';
import { computeDelivery }                                     from './deliveryEngine';
import { computeAgenda }                                       from './agendaLayer';
import { computeNakshatraInfluence }                           from './nakshatraLayer';
import { computeNodeInheritance }                              from './nodeInheritance';
import { computeDomains, HOUSE_DOMAIN,
         type DomainKarakaContext, type PlanetDomainContext }  from './domainEngine';
import { computeTemporalActivation }                           from './temporalLayer';
import { computeAllBaseWeights, computeImportance }            from './importanceLayer';
import { computeConfidence }                                   from './confidenceLayer';
import { detectConflicts }                                     from './conflictEngine';
import { generateAnalystNote, buildKeyReasons }                from './analystNote';
import { NAVAMSA_CONFIG }                                      from '@/lib/astrology/divisionalChartBuilder';
import { getAspectInfo, getConjunctions }                      from './aspectEngine';

const NON_NODE_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const NODE_ORDER     = ['Rahu','Ketu'];
const PLANET_ORDER   = [...NON_NODE_ORDER, ...NODE_ORDER];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function houseFromLagna(planetSign: number, lagnaSign: number): number {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

function toStructuralGrade(score: number): StructuralGrade {
  if (score >= 85) return 'very_strong';
  if (score >= 65) return 'strong';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'weak';
  return 'very_weak';
}

function houseSign(house: number, lagnaSign: number): number {
  return ((lagnaSign - 1 + house - 1) % 12) + 1;
}

// ─── Build karakaContext from real Phase A results ─────────────────────────────

function buildKarakaContext(
  results: Record<string, PlanetStrengthResult>, lagnaSign: number
): DomainKarakaContext {
  function ctx(planet: string): PlanetDomainContext | undefined {
    const r = results[planet];
    if (!r) return undefined;
    return { delivery:r.deliveryGrade, condition:r.conditionGrade,
             deliveryScore:r.deliveryScore, conflictFlags:r.conflictFlags };
  }
  function lordCtx(house: number): PlanetDomainContext | undefined {
    return ctx(getLordOfSignPublic(houseSign(house, lagnaSign)));
  }
  return {
    venus: ctx('Venus'), jupiter: ctx('Jupiter'), mars: ctx('Mars'),
    mercury: ctx('Mercury'), moon: ctx('Moon'), ketu: ctx('Ketu'),
    seventhLord: lordCtx(7), tenthLord: lordCtx(10), fifthLord: lordCtx(5),
    ninthLord: lordCtx(9), secondLord: lordCtx(2), eleventhLord: lordCtx(11),
  };
}

// ─── Minimal shape for precomputedPlanets (Phase A → Phase B) ────────────────

function toPrecomputedShape(r: PlanetStrengthResult) {
  return {
    structuralScore: r.structuralScore,
    conditionScore:  r.conditionScore,
    conditionGrade:  r.conditionGrade,
    deliveryGrade:   r.deliveryGrade,
    deliveryScore:   r.deliveryScore,
    functionalNature: r.functionalNature,
    functionalLean:   r.functionalLean,
  };
}

// ─── Stub ascendant for neechaBhanga ─────────────────────────────────────────
// neechaBhanga only needs signNumber from ascendant

function stubAscendant(lagnaSign: number): import('@/types/astrology').AscendantData {
  return {
    key: 'Ascendant', longitude: (lagnaSign - 1) * 30, retrograde: false,
    combust: false, exalted: false, debilitated: false, exhausted: false,
    sign: '', signNumber: lagnaSign, degreeInSign: 0, kp: {} as any,
  };
}

// ─── Phase A: assess a single non-node planet ─────────────────────────────────

function assessNonNode(
  planetName: string,
  planets: Record<string, PlanetData>,
  lagnaSign: number,
  planetSigns: Record<string, number>,
  allBaseWeights: Record<string, number>,
  temporalMap: Record<string, ReturnType<typeof computeTemporalActivation>>,
  existingResults: Record<string, PlanetStrengthResult>
): PlanetStrengthResult {
  const pd = planets[planetName] as PlanetData;
  const { signNumber, degreeInSign, retrograde: isRetrograde,
          combust: isCombust, combustionOrbDeg, longitude } = pd;

  // L1: Structural
  const housePosition   = houseFromLagna(signNumber, lagnaSign);
  const dignityAss      = assessDignity(planetName, signNumber, degreeInSign, planetSigns, housePosition);
  const structuralScore = dignityAss.structuralScore;
  const structuralGrade = toStructuralGrade(structuralScore);

  const cleanFlags: PlacementFlag[] = dignityAss.placementFlags
    .filter(f => f !== 'digbala_hook' && f !== 'shadbala_hook');
  if (isRetrograde) cleanFlags.push('retrograde');
  if (isCombust && planetName !== 'Sun') {
    const orb = combustionOrbDeg ?? 10;
    cleanFlags.push(orb <= 3 ? 'combust_close' : orb <= 6 ? 'combust_mild' : 'combust_weak');
  }

  const neechaBhanga = checkNeechaBhanga(planetName, planets as Record<string, PlanetData>, stubAscendant(lagnaSign));
  if (neechaBhanga.isApplied) cleanFlags.push('neecha_bhanga');

  // L2: Functional
  const housesRuled      = getHousesRuled(planetName, lagnaSign);
  const ownershipWeights = getOwnershipWeights(housesRuled);
  const { nature: functionalNature, lean: functionalLean } = computeFunctionalNature(planetName, lagnaSign, housesRuled);
  const functionalScore  = functionalNatureToScore(functionalNature, functionalLean);
  const isMaraka         = isMarakaCapable(planetName, lagnaSign);

  // L3: Condition
  const sunData      = planets.Sun  as PlanetData | undefined;
  const moonData     = planets.Moon as PlanetData | undefined;
  const isVargottama = NAVAMSA_CONFIG.calculateSign(longitude) === signNumber;

  const conditionAss = assessCondition(
    planetName, signNumber, degreeInSign, dignityAss.dignityLevel,
    isCombust, combustionOrbDeg, isVargottama, housePosition,
    planets as Record<string, PlanetData>, moonData?.longitude, sunData?.longitude
  );

  // L4: Varga
  const vargaAssessment = computeVargaAssessment(
    planetName, signNumber, dignityAss.dignityLevel, longitude, lagnaSign, housesRuled
  );

  // L5: Dominant Override
  const overrideResult = computeDominantOverrides(
    planetName, longitude, signNumber, structuralGrade, structuralScore,
    conditionAss.conditionGrade, vargaAssessment, dignityAss.dignityLevel,
    neechaBhanga.isApplied, planets as Record<string, PlanetData>
  );

  // L8: Nakshatra
  const nakshatraInfluence = computeNakshatraInfluence(planetName, planets as Record<string, PlanetData>);

  // L6: Delivery
  const deliveryResult = computeDelivery({
    planet: planetName, structuralGrade, conditionGrade: conditionAss.conditionGrade,
    vargaAssessment, functionalNature, functionalLean, housePosition, isMaraka,
    isRetrograde, isCombust, combustOrb: combustionOrbDeg, isNB: neechaBhanga.isApplied,
    nakshatraDeliveryModifier: nakshatraInfluence.nakshatraDeliveryModifier,
    dominantDeliveryModifier: overrideResult.deliveryModifier,
  });

  // L7: Agenda
  const agenda = computeAgenda(planetName, conditionAss.conditionGrade, structuralGrade, functionalNature, functionalLean, undefined);

  // L14: Conflicts (needed before domain engine)
  const conj    = getConjunctions(planetName, signNumber, planets as Record<string, PlanetData>);
  const aspects = getAspectInfo(planetName, signNumber, planets as Record<string, PlanetData>);
  const conflictFlags = detectConflicts(
    planetName, structuralGrade, conditionAss.conditionGrade, functionalNature, functionalLean,
    deliveryResult.deliveryGrade, vargaAssessment, isMaraka, overrideResult.dominantFactors,
    isCombust, isRetrograde,
    conj.benefic.includes('Jupiter') || aspects.hasJupiterAspect,
    conj.nodes.length > 0, conj.malefic.includes('Saturn'), conj.malefic.includes('Mars')
  );

  // L10: Domains (karakaContext from already-computed non-nodes)
  const karakaContext = buildKarakaContext(existingResults, lagnaSign);
  const domainResult  = computeDomains(
    planetName, housesRuled, housePosition, functionalNature, functionalLean,
    conditionAss.conditionGrade, deliveryResult.deliveryGrade,
    vargaAssessment, lagnaSign, karakaContext, conflictFlags
  );

  // L11: Temporal
  const temporal = temporalMap[planetName];

  // L12: Importance
  const importanceResult = computeImportance(
    planetName, housesRuled, housePosition, functionalNature,
    lagnaSign, temporal, allBaseWeights, undefined
  );

  // L13: Confidence
  const assessmentConfidence = computeConfidence(
    structuralGrade, conditionAss.conditionGrade, vargaAssessment,
    deliveryResult.deliveryGrade, conflictFlags, overrideResult.dominantFactors,
    overrideResult.dominantOverrideApplied, overrideResult.confidenceModifier
  );

  // L15: Analyst Note
  const keyReasons = buildKeyReasons(
    planetName, dignityAss.description, dignityAss.dignityLevel, functionalNature, functionalLean,
    housesRuled, housePosition, conditionAss.afflictions, conditionAss.protections,
    neechaBhanga.isApplied, neechaBhanga.rule, vargaAssessment, isMaraka, conflictFlags
  );
  const analystNote = generateAnalystNote({
    planet: planetName, structuralGrade, dignityLevel: dignityAss.dignityLevel,
    isRetrograde, isCombust, isNB: neechaBhanga.isApplied,
    conditionGrade: conditionAss.conditionGrade,
    topAffliction: conditionAss.afflictions[0], topProtection: conditionAss.protections[0],
    functionalNature, functionalLean, housesRuled, isMarakaCapable: isMaraka,
    vargaAssessment, deliveryGrade: deliveryResult.deliveryGrade,
    deliveryScore: deliveryResult.deliveryScore, conflictFlags,
    strongDomains: domainResult.strongDomains, weakDomains: domainResult.weakDomains,
    temporalActivation: temporal, agendaThemes: agenda.agendaThemes,
    deliveryStyle: agenda.deliveryStyle, karmicStyle: agenda.karmicStyle, assessmentConfidence,
  });

  let isPakshaBala: boolean | undefined;
  if (planetName === 'Moon' && sunData) {
    isPakshaBala = ((longitude - sunData.longitude + 360) % 360) < 180;
  }

  return {
    planet: planetName,
    structuralScore, structuralGrade, dignityLevel: dignityAss.dignityLevel,
    placementFlags: cleanFlags, structuralFlags: cleanFlags,
    functionalNature, functionalLean, functionalScore, isMarakaCapable: isMaraka,
    housesRuled, ownershipWeights, housePosition,
    conditionScore: conditionAss.conditionScore, conditionGrade: conditionAss.conditionGrade,
    afflictions: conditionAss.afflictions, protections: conditionAss.protections,
    distortionFlags: conditionAss.distortionFlags,
    vargaAssessment,
    dominantFactors: overrideResult.dominantFactors,
    dominantOverrideApplied: overrideResult.dominantOverrideApplied,
    overrideImpactNotes: overrideResult.overrideImpactNotes,
    deliveryScore: deliveryResult.deliveryScore, deliveryGrade: deliveryResult.deliveryGrade,
    deliveryReasons: deliveryResult.deliveryReasons,
    agendaThemes: agenda.agendaThemes, deliveryStyle: agenda.deliveryStyle,
    psychologicalTone: agenda.psychologicalTone, karmicStyle: agenda.karmicStyle,
    nakshatraInfluence,
    nodeInheritance: undefined, inheritedSupportScore: undefined,
    inheritedCondition: undefined, inheritedReliability: undefined,
    strongDomains: domainResult.strongDomains, mixedDomains: domainResult.mixedDomains,
    weakDomains: domainResult.weakDomains, domainConfidence: domainResult.domainConfidenceMap,
    temporalActivation: temporal,
    importanceWeight: importanceResult.importanceWeight,
    domainImportanceWeights: importanceResult.domainImportanceWeights,
    natalPriorityRank: importanceResult.natalPriorityRank,
    currentPriorityRank: importanceResult.currentPriorityRank,
    assessmentConfidence, conflictFlags, keyReasons, analystNote,
    neechaBhanga, isRetrograde, isCombust, isPakshaBala,
  };
}

// ─── Phase B: assess a node planet ───────────────────────────────────────────

function assessNode(
  planetName: string,
  planets: Record<string, PlanetData>,
  lagnaSign: number,
  planetSigns: Record<string, number>,
  allBaseWeights: Record<string, number>,
  temporalMap: Record<string, ReturnType<typeof computeTemporalActivation>>,
  nonNodeResults: Record<string, PlanetStrengthResult>
): PlanetStrengthResult {
  const pd = planets[planetName] as PlanetData;
  const { signNumber, degreeInSign, retrograde: isRetrograde,
          combust: isCombust, combustionOrbDeg, longitude } = pd;

  // L1: Structural (sign-based, then overridden by inherited score)
  const housePosition = houseFromLagna(signNumber, lagnaSign);
  const dignityAss    = assessDignity(planetName, signNumber, degreeInSign, planetSigns, housePosition);
  const cleanFlags: PlacementFlag[] = dignityAss.placementFlags
    .filter(f => f !== 'digbala_hook' && f !== 'shadbala_hook');

  // L2: Functional
  const housesRuled      = getHousesRuled(planetName, lagnaSign);
  const ownershipWeights = getOwnershipWeights(housesRuled);
  const { nature: functionalNature, lean: functionalLean } = computeFunctionalNature(planetName, lagnaSign, housesRuled);
  const functionalScore  = functionalNatureToScore(functionalNature, functionalLean);
  const isMaraka         = isMarakaCapable(planetName, lagnaSign);

  // Build precomputed shapes from Phase A for node inheritance (Corrections 1, 3)
  const precomputed: Record<string, ReturnType<typeof toPrecomputedShape>> = {};
  for (const [name, r] of Object.entries(nonNodeResults)) {
    precomputed[name] = toPrecomputedShape(r);
  }

  // L9: Node Inheritance — uses real Phase A results + housePosition (Correction 3)
  const nodeInheritance = computeNodeInheritance(
    planetName, signNumber, longitude, housePosition,
    planets as Record<string, PlanetData>, precomputed
  );

  // L3: Condition — ONLY from nodeInheritance (single source)
  const conditionAss = conditionFromNodeInheritance(
    planetName, signNumber, longitude, housePosition,
    nodeInheritance, planets as Record<string, PlanetData>
  );

  // L4: Varga
  const vargaAssessment = computeVargaAssessment(
    planetName, signNumber, dignityAss.dignityLevel, longitude, lagnaSign, housesRuled
  );

  // L5: Dominant Override (uses inherited structural grade)
  const nodeStructuralGrade = toStructuralGrade(nodeInheritance.inheritedSupportScore);
  const overrideResult = computeDominantOverrides(
    planetName, longitude, signNumber,
    nodeStructuralGrade, nodeInheritance.inheritedSupportScore,
    conditionAss.conditionGrade, vargaAssessment, dignityAss.dignityLevel,
    false, planets as Record<string, PlanetData>
  );

  // L8: Nakshatra
  const nakshatraInfluence = computeNakshatraInfluence(planetName, planets as Record<string, PlanetData>);

  // L6: Delivery (inherited reliability + weighted components)
  const deliveryResult = computeDelivery({
    planet: planetName, structuralGrade: nodeStructuralGrade,
    conditionGrade: nodeInheritance.inheritedCondition,
    vargaAssessment, functionalNature, functionalLean, housePosition, isMaraka,
    isRetrograde: false, isCombust: false, isNB: false,
    nakshatraDeliveryModifier: nakshatraInfluence.nakshatraDeliveryModifier,
    dominantDeliveryModifier: overrideResult.deliveryModifier,
  });

  // L7: Agenda (node-specific — uses nodeInheritance for style modulation)
  const agenda = computeAgenda(
    planetName, conditionAss.conditionGrade, nodeStructuralGrade,
    functionalNature, functionalLean, nodeInheritance
  );

  // L14: Conflicts
  const conj    = getConjunctions(planetName, signNumber, planets as Record<string, PlanetData>);
  const aspects = getAspectInfo(planetName, signNumber, planets as Record<string, PlanetData>);
  const conflictFlags = detectConflicts(
    planetName, nodeStructuralGrade, conditionAss.conditionGrade,
    functionalNature, functionalLean, deliveryResult.deliveryGrade,
    vargaAssessment, isMaraka, overrideResult.dominantFactors,
    isCombust, isRetrograde,
    conj.benefic.includes('Jupiter') || aspects.hasJupiterAspect,
    conj.nodes.length > 0, conj.malefic.includes('Saturn'), conj.malefic.includes('Mars')
  );

  // L10: Domains (full Phase A context via karakaContext)
  const karakaContext = buildKarakaContext(nonNodeResults, lagnaSign);
  const domainResult  = computeDomains(
    planetName, housesRuled, housePosition, functionalNature, functionalLean,
    conditionAss.conditionGrade, deliveryResult.deliveryGrade,
    vargaAssessment, lagnaSign, karakaContext, conflictFlags
  );

  // L11: Temporal
  const temporal = temporalMap[planetName];

  // L12: Importance
  const importanceResult = computeImportance(
    planetName, housesRuled, housePosition, functionalNature,
    lagnaSign, temporal, allBaseWeights, undefined
  );

  // L13: Confidence
  const assessmentConfidence = computeConfidence(
    nodeStructuralGrade, conditionAss.conditionGrade, vargaAssessment,
    deliveryResult.deliveryGrade, conflictFlags, overrideResult.dominantFactors,
    overrideResult.dominantOverrideApplied, overrideResult.confidenceModifier
  );

  // L15: Analyst Note
  const keyReasons = buildKeyReasons(
    planetName, dignityAss.description, dignityAss.dignityLevel,
    functionalNature, functionalLean, housesRuled, housePosition,
    conditionAss.afflictions, conditionAss.protections,
    false, undefined, vargaAssessment, isMaraka, conflictFlags
  );
  const analystNote = generateAnalystNote({
    planet: planetName, structuralGrade: nodeStructuralGrade,
    dignityLevel: dignityAss.dignityLevel, isRetrograde: false, isCombust: false, isNB: false,
    conditionGrade: conditionAss.conditionGrade,
    topAffliction: conditionAss.afflictions[0], topProtection: conditionAss.protections[0],
    functionalNature, functionalLean, housesRuled, isMarakaCapable: isMaraka,
    vargaAssessment, deliveryGrade: deliveryResult.deliveryGrade,
    deliveryScore: deliveryResult.deliveryScore, conflictFlags,
    strongDomains: domainResult.strongDomains, weakDomains: domainResult.weakDomains,
    temporalActivation: temporal, agendaThemes: agenda.agendaThemes,
    deliveryStyle: agenda.deliveryStyle, karmicStyle: agenda.karmicStyle, assessmentConfidence,
  });

  return {
    planet: planetName,
    structuralScore: nodeInheritance.inheritedSupportScore,
    structuralGrade: nodeStructuralGrade,
    dignityLevel: dignityAss.dignityLevel,
    placementFlags: cleanFlags, structuralFlags: cleanFlags,
    functionalNature, functionalLean, functionalScore, isMarakaCapable: isMaraka,
    housesRuled, ownershipWeights, housePosition,
    conditionScore: conditionAss.conditionScore, conditionGrade: conditionAss.conditionGrade,
    afflictions: conditionAss.afflictions, protections: conditionAss.protections,
    distortionFlags: conditionAss.distortionFlags,
    vargaAssessment,
    dominantFactors: overrideResult.dominantFactors,
    dominantOverrideApplied: overrideResult.dominantOverrideApplied,
    overrideImpactNotes: overrideResult.overrideImpactNotes,
    deliveryScore: deliveryResult.deliveryScore, deliveryGrade: deliveryResult.deliveryGrade,
    deliveryReasons: deliveryResult.deliveryReasons,
    agendaThemes: agenda.agendaThemes, deliveryStyle: agenda.deliveryStyle,
    psychologicalTone: agenda.psychologicalTone, karmicStyle: agenda.karmicStyle,
    nakshatraInfluence,
    nodeInheritance,
    inheritedSupportScore: nodeInheritance.inheritedSupportScore,
    inheritedCondition:    nodeInheritance.inheritedCondition,
    inheritedReliability:  nodeInheritance.inheritedReliability,
    strongDomains: domainResult.strongDomains, mixedDomains: domainResult.mixedDomains,
    weakDomains: domainResult.weakDomains, domainConfidence: domainResult.domainConfidenceMap,
    temporalActivation: temporal,
    importanceWeight: importanceResult.importanceWeight,
    domainImportanceWeights: importanceResult.domainImportanceWeights,
    natalPriorityRank: importanceResult.natalPriorityRank,
    currentPriorityRank: importanceResult.currentPriorityRank,
    assessmentConfidence, conflictFlags, keyReasons, analystNote,
    neechaBhanga: { isApplied: false }, isRetrograde, isCombust,
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function assessAllPlanets(input: StrengthEngineInput): Record<string, PlanetStrengthResult> {
  const { planets, ascendant, dashaContext } = input;
  const lagnaSign = ascendant.signNumber;

  const planetSigns: Record<string, number> = {};
  for (const [name, data] of Object.entries(planets)) {
    if (name !== 'Ascendant') planetSigns[name] = (data as PlanetData).signNumber;
  }

  // Pre-compute temporal activation
  const temporalMap: Record<string, ReturnType<typeof computeTemporalActivation>> = {};
  for (const pn of PLANET_ORDER) temporalMap[pn] = computeTemporalActivation(pn, dashaContext);

  // Pre-compute functional natures + base importance weights
  const fnMap: Record<string, { nature: FunctionalNature; housesRuled: number[]; housePosition: number }> = {};
  for (const pn of PLANET_ORDER) {
    const pd = planets[pn] as PlanetData | undefined;
    if (!pd) continue;
    const hp = houseFromLagna(pd.signNumber, lagnaSign);
    const hr = getHousesRuled(pn, lagnaSign);
    const { nature } = computeFunctionalNature(pn, lagnaSign, hr);
    fnMap[pn] = { nature, housesRuled: hr, housePosition: hp };
  }

  const baseWeightInputs: Record<string, Parameters<typeof computeAllBaseWeights>[0][string]> = {};
  for (const pn of PLANET_ORDER) {
    if (!fnMap[pn]) continue;
    baseWeightInputs[pn] = {
      housesRuled: fnMap[pn].housesRuled,
      housePosition: fnMap[pn].housePosition,
      functionalNature: fnMap[pn].nature,
      temporalActivation: temporalMap[pn],
    };
  }
  const allBaseWeights = computeAllBaseWeights(baseWeightInputs);

  const results: Record<string, PlanetStrengthResult> = {};

  // Phase A: non-nodes
  for (const pn of NON_NODE_ORDER) {
    if (!planets[pn]) continue;
    results[pn] = assessNonNode(pn, planets as Record<string, PlanetData>,
      lagnaSign, planetSigns, allBaseWeights, temporalMap, results);
  }

  // Phase B: nodes (use Phase A results for real inheritance)
  for (const pn of NODE_ORDER) {
    if (!planets[pn]) continue;
    results[pn] = assessNode(pn, planets as Record<string, PlanetData>,
      lagnaSign, planetSigns, allBaseWeights, temporalMap, results);
  }

  return results;
}
