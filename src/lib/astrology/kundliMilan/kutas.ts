import type { PersonMilanData, KutaResult } from './types'
import {
  VARNA_BY_SIGN,
  YONI_SEX,
  YONI_ENEMIES,
  PLANET_RELATIONS,
  SIGN_LORD,
} from './tables'

// ── 1. Varna (1 pt) ────────────────────────────────────────────────────────────
export function scoreVarna(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const b = VARNA_BY_SIGN[boy.moonSignNumber]
  const g = VARNA_BY_SIGN[girl.moonSignNumber]
  const score = b.rank >= g.rank ? 1 : 0

  const VARNA_MEANING: Record<string, string> = {
    Brahmin: 'Brahmin is associated with learning, wisdom, and spiritual inclination.',
    Kshatriya: 'Kshatriya is associated with courage, protection, and leadership.',
    Vaishya: 'Vaishya is associated with commerce, resourcefulness, and material pursuits.',
    Shudra: 'Shudra is associated with service, dedication, and practical groundedness.',
  }

  return {
    name: 'Varna',
    score,
    max: 1,
    description:
      score === 1
        ? `${b.name} (${boy.name}) ≥ ${g.name} (${girl.name}) — compatible`
        : `${b.name} (${boy.name}) < ${g.name} (${girl.name}) — not compatible`,
    detail: {
      about:
        'Varna is the first and simplest of the eight kutas, carrying 1 point. It compares the spiritual orientation of each person\'s Moon sign using the traditional four-tier framework: Brahmin, Kshatriya, Vaishya, and Shudra. These represent different soul qualities — from the wisdom-seeker to the protector to the merchant to the servant. Traditional texts require the male partner\'s varna to equal or exceed the female\'s. While it carries the least weight, Varna speaks to whether both partners share a broadly compatible worldview and sense of purpose.',
      person1:
        `${boy.name}'s Moon is in ${boy.moonSign}, which places them in the ${b.name} varna. ${VARNA_MEANING[b.name] ?? ''}`,
      person2:
        `${girl.name}'s Moon is in ${girl.moonSign}, which places them in the ${g.name} varna. ${VARNA_MEANING[g.name] ?? ''}`,
      meaning:
        score === 1
          ? `${boy.name}'s ${b.name} varna meets or exceeds ${girl.name}'s ${g.name} varna, so this kuta is satisfied. It suggests both partners share a compatible spiritual orientation — there is no fundamental mismatch in how they each see their role in the world.`
          : `${boy.name}'s ${b.name} varna falls below ${girl.name}'s ${g.name} varna. Traditionally this kuta is not satisfied, though it carries only 1 point. Many couples with this combination live very happily when other kutas — especially Nadi, Bhakoot, and Gana — are strong.`,
    },
  }
}

// ── 2. Vashya (2 pts) ──────────────────────────────────────────────────────────
export function scoreVashya(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const bv = boy.vashya
  const gv = girl.vashya

  const VASHYA_MEANING: Record<string, string> = {
    Human: 'Human (Nara) types are intellectually driven, social, and seek mental rapport in relationships.',
    Quadruped: 'Quadruped (Chatushpada) types are steady, loyal, and value security and routine.',
    Water: 'Water (Jalchar) types are emotionally sensitive, adaptable, and thrive on deep bonds.',
    Wild: 'Wild (Vanchar) types are independent, authoritative, and need space and respect.',
    Insect: 'Insect (Keeta) types are intense, perceptive, and operate on deep instinct.',
  }

  let score: number
  if (bv === gv) {
    score = 2
  } else if (
    (bv === 'Human' && gv === 'Quadruped') ||
    (bv === 'Quadruped' && gv === 'Human') ||
    (bv === 'Human' && gv === 'Water') ||
    (bv === 'Water' && gv === 'Human') ||
    (bv === 'Quadruped' && gv === 'Water') ||
    (bv === 'Water' && gv === 'Quadruped')
  ) {
    score = 1
  } else {
    score = 0
  }

  return {
    name: 'Vashya',
    score,
    max: 2,
    description:
      score === 2
        ? `Same group (${bv}) — fully compatible`
        : score === 1
        ? `${bv} × ${gv} — partial compatibility`
        : `${bv} (${boy.name}) × ${gv} (${girl.name}) — incompatible`,
    detail: {
      about:
        'Vashya (meaning "control" or "attraction") assesses the natural power balance and magnetic pull between partners. Each Moon sign is classified into one of five groups: Human (Nara), Quadruped (Chatushpada), Water (Jalchar), Wild (Vanchar), or Insect (Keeta). Partners in the same group enjoy full Vashya — a natural, balanced attraction where neither dominates the other unfairly. Certain cross-group pairings score partial points, while others suggest a fundamentally different relationship with power and authority.',
      person1:
        `${boy.name}'s Moon is in ${boy.moonSign}, which belongs to the ${bv} group. ${VASHYA_MEANING[bv] ?? ''}`,
      person2:
        `${girl.name}'s Moon is in ${girl.moonSign}, which belongs to the ${gv} group. ${VASHYA_MEANING[gv] ?? ''}`,
      meaning:
        score === 2
          ? `Both ${boy.name} and ${girl.name} belong to the same ${bv} group, awarding full Vashya compatibility. This indicates a natural, symmetrical attraction and mutual respect — neither partner tends to dominate the other unfairly.`
          : score === 1
          ? `${bv} and ${gv} are considered partially compatible groups. There is some natural attraction and workable balance, but occasional differences in approach to authority or decision-making may need conscious attention.`
          : `${bv} and ${gv} are considered incompatible groups in this kuta. This may show up as differing ideas about control, autonomy, or relationship roles. It's worth being mindful of power dynamics, though many other factors in the chart can compensate.`,
    },
  }
}

// ── 3. Tara (3 pts) ────────────────────────────────────────────────────────────
const TARA_NAMES = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Vadha', 'Mitra', 'Param Mitra']
const AUSPICIOUS_TARAS = new Set([2, 4, 6, 8, 9]) // 1-based positions

const TARA_MEANINGS: Record<string, string> = {
  Janma: 'Janma (birth) — considered inauspicious, associated with health concerns.',
  Sampat: 'Sampat (wealth) — highly auspicious, brings prosperity and abundance.',
  Vipat: 'Vipat (danger) — inauspicious, associated with obstacles and hardship.',
  Kshema: 'Kshema (well-being) — auspicious, brings comfort and stability.',
  Pratyak: 'Pratyak (obstacle) — inauspicious, associated with friction and delays.',
  Sadhaka: 'Sadhaka (achievement) — auspicious, supports goals and growth.',
  Vadha: 'Vadha (obstruction) — inauspicious, associated with serious difficulties.',
  Mitra: 'Mitra (friend) — auspicious, brings harmony and mutual support.',
  'Param Mitra': 'Param Mitra (great friend) — the most auspicious Tara, exceptional harmony.',
}

export function scoreTara(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const dist1 = (boy.nakshatraIndex - girl.nakshatraIndex + 27) % 27
  const dist2 = (girl.nakshatraIndex - boy.nakshatraIndex + 27) % 27

  const tara1 = (dist1 % 9) + 1
  const tara2 = (dist2 % 9) + 1

  const a1 = AUSPICIOUS_TARAS.has(tara1)
  const a2 = AUSPICIOUS_TARAS.has(tara2)

  const score = a1 && a2 ? 3 : a1 || a2 ? 1.5 : 0
  const tara1Name = TARA_NAMES[tara1 - 1]
  const tara2Name = TARA_NAMES[tara2 - 1]

  return {
    name: 'Tara',
    score,
    max: 3,
    description: `${boy.name}: ${tara1Name} (${a1 ? 'auspicious' : 'inauspicious'}), ${girl.name}: ${tara2Name} (${a2 ? 'auspicious' : 'inauspicious'})`,
    detail: {
      about:
        'Tara (star) examines destiny compatibility by counting the nakshatra distance from one person\'s birth star to the other\'s. The resulting position (1–9) maps to one of nine named Taras, alternating between auspicious and inauspicious: Janma, Sampat, Vipat, Kshema, Pratyak, Sadhaka, Vadha, Mitra, and Param Mitra. Even-numbered positions (Sampat, Kshema, Sadhaka, Mitra, Param Mitra) are auspicious — indicating harmony, shared fortune, and mutual support. Odd positions (Janma, Vipat, Pratyak, Vadha) are inauspicious. Both partners\' Tara positions are evaluated, and full points require both to be auspicious.',
      person1:
        `${boy.name}'s birth nakshatra is ${boy.nakshatraName}. Counting from ${girl.name}'s nakshatra (${girl.nakshatraName}), this lands on position ${tara1} — ${tara1Name}. ${TARA_MEANINGS[tara1Name] ?? ''}`,
      person2:
        `${girl.name}'s birth nakshatra is ${girl.nakshatraName}. Counting from ${boy.name}'s nakshatra (${boy.nakshatraName}), this lands on position ${tara2} — ${tara2Name}. ${TARA_MEANINGS[tara2Name] ?? ''}`,
      meaning:
        score === 3
          ? `Both ${boy.name} (${tara1Name}) and ${girl.name} (${tara2Name}) fall on auspicious Tara positions, earning the full 3 points. This is a very positive sign for shared destiny — both partners tend to bring good fortune into each other's lives.`
          : score === 1.5
          ? `One partner has an auspicious Tara position and the other does not. This mixed result suggests the relationship brings good fortune to one partner more than the other, or that the balance of benefit shifts across different life phases. It's a moderate result — not alarming on its own.`
          : `Both ${boy.name} (${tara1Name}) and ${girl.name} (${tara2Name}) fall on inauspicious Tara positions. This traditionally suggests potential obstacles in the couple's shared journey. Other strong kutas, especially Nadi and Bhakoot, can provide meaningful balance.`,
    },
  }
}

// ── 4. Yoni (4 pts) ────────────────────────────────────────────────────────────
const YONI_SEX_LABEL: Record<string, string> = { M: 'male', F: 'female' }

export function scoreYoni(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const byoni = boy.yoni
  const gyoni = girl.yoni
  const bsex = YONI_SEX[boy.nakshatraIndex]
  const gsex = YONI_SEX[girl.nakshatraIndex]

  let score: number
  let description: string

  if (byoni === gyoni) {
    if (bsex !== gsex) {
      score = 4
      description = `Both ${byoni} — natural pair (opposite sex)`
    } else {
      score = 3
      description = `Both ${byoni} — same animal, same sex`
    }
  } else if (YONI_ENEMIES.has(`${byoni}-${gyoni}`)) {
    score = 0
    description = `${byoni} (${boy.name}) and ${gyoni} (${girl.name}) are enemy animals`
  } else {
    score = 2
    description = `${byoni} (${boy.name}) and ${gyoni} (${girl.name}) — neutral`
  }

  const isEnemy = YONI_ENEMIES.has(`${byoni}-${gyoni}`)
  const isSameAnimal = byoni === gyoni

  return {
    name: 'Yoni',
    score,
    max: 4,
    description,
    detail: {
      about:
        'Yoni assesses physical and intimate compatibility by assigning each of the 27 nakshatras an animal symbol — either male or female. There are 14 animals: Horse, Elephant, Sheep, Serpent, Dog, Cat, Rat, Cow, Buffalo, Tiger, Hare, Deer, Monkey, and Mongoose. The ideal combination is an opposite-sex pair of the same animal, representing natural, complementary attraction. Same animals of the same sex score slightly less but are still good. Certain animal pairs are considered enemies — such as Serpent and Mongoose — and score zero. All other combinations score a neutral 2 points.',
      person1:
        `${boy.name}'s nakshatra is ${boy.nakshatraName}, which is symbolised by the ${byoni} (${YONI_SEX_LABEL[bsex] ?? bsex}).`,
      person2:
        `${girl.name}'s nakshatra is ${girl.nakshatraName}, which is symbolised by the ${gyoni} (${YONI_SEX_LABEL[gsex] ?? gsex}).`,
      meaning:
        score === 4
          ? `${boy.name} (${byoni}, ${YONI_SEX_LABEL[bsex]}) and ${girl.name} (${gyoni}, ${YONI_SEX_LABEL[gsex]}) are an opposite-sex pair of the same animal — the ideal Yoni match. This traditionally indicates deep physical compatibility and natural attraction.`
          : score === 3
          ? `Both share the ${byoni} animal, which is good compatibility. Being the same sex of the same animal is considered harmonious — close in nature, though not the most dynamically complementary pairing.`
          : isEnemy
          ? `${byoni} and ${gyoni} are considered enemy animals in this system. This traditionally suggests physical incompatibility or friction in the intimate sphere. It's worth noting that this is one of 8 kutas and other strong alignments — particularly Nadi, Gana, and Graha Maitri — can provide significant balance.`
          : `${byoni} and ${gyoni} are a neutral animal pairing, awarding 2 of 4 points. This represents a workable, if not exceptionally strong, physical compatibility. The couple can develop a good physical relationship with understanding and communication.`,
    },
  }
}

// ── 5. Graha Maitri (5 pts) ────────────────────────────────────────────────────
function getRelation(from: string, to: string): 'friend' | 'neutral' | 'enemy' {
  if (from === to) return 'friend'
  return PLANET_RELATIONS[from]?.[to] ?? 'neutral'
}

export function scoreGrahaMaitri(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const bLord = SIGN_LORD[boy.moonSign] ?? 'Moon'
  const gLord = SIGN_LORD[girl.moonSign] ?? 'Moon'

  const bToG = getRelation(bLord, gLord)
  const gToB = getRelation(gLord, bLord)

  let score: number
  if (bToG === 'friend' && gToB === 'friend') score = 5
  else if (bToG === 'friend' && gToB === 'neutral') score = 4
  else if (bToG === 'neutral' && gToB === 'friend') score = 4
  else if (bToG === 'neutral' && gToB === 'neutral') score = 3
  else if ((bToG === 'friend' && gToB === 'enemy') || (bToG === 'enemy' && gToB === 'friend')) score = 2
  else if ((bToG === 'neutral' && gToB === 'enemy') || (bToG === 'enemy' && gToB === 'neutral')) score = 1
  else score = 0

  const RELATION_LABEL: Record<string, string> = {
    friend: 'a friend',
    neutral: 'neutral',
    enemy: 'an enemy',
  }

  return {
    name: 'Graha Maitri',
    score,
    max: 5,
    description: `${bLord} (${boy.name}) is ${bToG} to ${gLord}; ${gLord} (${girl.name}) is ${gToB} to ${bLord}`,
    detail: {
      about:
        'Graha Maitri (planetary friendship) measures mental and intellectual compatibility by examining the relationship between the ruling planets of each person\'s Moon sign. The Moon sign lord is the planet that governs how you think, communicate, and process emotions. When the two lords are natural friends, the couple tends to understand each other intuitively, share similar values, and feel mentally at ease together. Neutral or enemy relationships can indicate occasional friction in communication, differing mental frameworks, or the need for more conscious effort to see eye to eye.',
      person1:
        `${boy.name}'s Moon is in ${boy.moonSign}, which is ruled by ${bLord}. This planet shapes ${boy.name}'s thought patterns, emotional style, and way of expressing ideas. In relation to ${gLord} (${girl.name}'s Moon lord), ${bLord} is ${RELATION_LABEL[bToG]}.`,
      person2:
        `${girl.name}'s Moon is in ${girl.moonSign}, which is ruled by ${gLord}. This planet shapes ${girl.name}'s inner world, reasoning, and emotional expression. In relation to ${bLord} (${boy.name}'s Moon lord), ${gLord} is ${RELATION_LABEL[gToB]}.`,
      meaning:
        score === 5
          ? `Both Moon lords are mutual friends — ${bLord} and ${gLord} get along naturally in both directions. This is one of the strongest possible Graha Maitri results, suggesting the two minds will complement and support each other with genuine ease.`
          : score >= 3
          ? `The planetary friendship is positive but not perfectly mutual. One lord may be more drawn to the other than vice versa. This generally works well in practice — the couple shares enough mental common ground to communicate effectively and grow together.`
          : score === 2
          ? `One lord is friendly while the other views it as an enemy. This creates an asymmetric dynamic — one partner may feel more understood than the other. Being aware of this tendency and consciously validating each other's perspectives can make a meaningful difference.`
          : `${bLord} and ${gLord} are neutral-to-enemy or both enemies in this framework. Mental and communicative differences may be more noticeable. With patience and genuine curiosity about each other's thinking styles, these differences can become complementary rather than divisive.`,
    },
  }
}

// ── 6. Gana (6 pts) ────────────────────────────────────────────────────────────
export function scoreGana(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const bg = boy.gana
  const gg = girl.gana

  let score: number
  if (bg === gg) {
    score = 6
  } else if (
    (bg === 'Deva' && gg === 'Manushya') ||
    (bg === 'Manushya' && gg === 'Deva')
  ) {
    score = 5
  } else if (
    (bg === 'Deva' && gg === 'Rakshasa') ||
    (bg === 'Rakshasa' && gg === 'Deva')
  ) {
    score = 1
  } else {
    score = 0
  }

  const GANA_MEANING: Record<string, string> = {
    Deva: 'Deva Gana individuals are generally gentle, idealistic, spiritually inclined, and tend to approach life with openness and compassion.',
    Manushya: 'Manushya Gana individuals are balanced, practical, and grounded — they value both worldly success and personal relationships.',
    Rakshasa: 'Rakshasa Gana individuals are intense, independent, driven, and tend to be assertive and ambitious in how they pursue their goals.',
  }

  return {
    name: 'Gana',
    score,
    max: 6,
    description: `${boy.name}: ${bg}, ${girl.name}: ${gg}${score === 0 ? ' — Gana Dosha' : ''}`,
    note: score === 0 ? 'Gana Dosha' : undefined,
    detail: {
      about:
        'Gana examines the fundamental temperament and nature of each person through three divine archetypes derived from their birth nakshatra: Deva (godly), Manushya (human), and Rakshasa (fierce). This kuta carries 6 points — making it the third-highest weighted assessment. Temperamental compatibility is significant because it affects everyday life: how you handle conflict, set priorities, express affection, and structure your day. Partners of the same Gana understand each other\'s instincts almost without explanation. Deva and Manushya are considered compatible. Rakshasa with either of the others can require more conscious adjustment.',
      person1:
        `${boy.name}'s nakshatra ${boy.nakshatraName} belongs to ${bg} Gana. ${GANA_MEANING[bg] ?? ''}`,
      person2:
        `${girl.name}'s nakshatra ${girl.nakshatraName} belongs to ${gg} Gana. ${GANA_MEANING[gg] ?? ''}`,
      meaning:
        score === 6
          ? `Both ${boy.name} and ${girl.name} share the ${bg} Gana — the strongest possible Gana compatibility. Shared temperament means fewer friction points in daily life; both partners naturally understand each other's instincts, pace, and emotional needs.`
          : score === 5
          ? `Deva and Manushya are considered compatible ganas, awarding nearly full points. While not identical in temperament, these two natures complement each other well — the idealism of Deva balances nicely with the practicality of Manushya in a relationship.`
          : score === 1
          ? `Deva and Rakshasa ganas are considered quite different in nature. The gentleness of Deva can sometimes feel at odds with the intensity of Rakshasa. This pairing scores just 1 point, but it doesn't mean the relationship can't work — shared goals and mutual respect can bridge temperamental differences.`
          : `Manushya and Rakshasa together constitute Gana Dosha — a significant mismatch in fundamental temperament. The practical, balanced Manushya approach can clash with the fierce, independent Rakshasa energy. This is one of the more significant kuta concerns, but it is also one that many couples navigate successfully with self-awareness and strong communication.`,
    },
  }
}

// ── 7. Bhakoot (7 pts) ─────────────────────────────────────────────────────────
export function scoreBhakoot(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const bs = boy.moonSignNumber
  const gs = girl.moonSignNumber

  const posB = ((bs - gs + 12) % 12) + 1
  const posG = ((gs - bs + 12) % 12) + 1

  const pair = new Set([posB, posG])
  const inauspicious =
    (pair.has(2) && pair.has(12)) ||
    (pair.has(6) && pair.has(8))

  const score = inauspicious ? 0 : 7

  return {
    name: 'Bhakoot',
    score,
    max: 7,
    description: inauspicious
      ? `${posB}-${posG} relationship — Bhakoot Dosha`
      : `${boy.moonSign} × ${girl.moonSign} — compatible`,
    note: inauspicious ? 'Bhakoot Dosha' : undefined,
    detail: {
      about:
        'Bhakoot is the second most heavily weighted kuta (7 points) and examines the positional relationship between the two Moon signs in the zodiac. Specifically, it counts each sign\'s position from the other\'s and checks for two inauspicious patterns: the 2-12 relationship (which affects financial stability and family harmony) and the 6-8 relationship (associated with health challenges and emotional friction). These two configurations form "Bhakoot Dosha." All other inter-sign positions are considered compatible and award the full 7 points. A strong Bhakoot is considered important for long-term stability.',
      person1:
        `${boy.name}'s Moon sign is ${boy.moonSign} (sign number ${bs} in the zodiac). Counted from ${girl.name}'s ${girl.moonSign}, ${boy.name}'s sign falls at position ${posB}.`,
      person2:
        `${girl.name}'s Moon sign is ${girl.moonSign} (sign number ${gs} in the zodiac). Counted from ${boy.name}'s ${boy.moonSign}, ${girl.name}'s sign falls at position ${posG}.`,
      meaning:
        score === 7
          ? `The ${posB}-${posG} Moon sign relationship between ${boy.name} and ${girl.name} does not fall into either of the inauspicious Bhakoot patterns, awarding the full 7 points. This is a positive indicator for long-term emotional harmony, family life, and shared material stability.`
          : pair.has(2) && pair.has(12)
          ? `The 2-12 Bhakoot Dosha is present. This traditionally indicates potential challenges around finances, family expectations, or one partner feeling the other gains more from the relationship. It's one of the more significant kutas to pay attention to, though many couples with this combination build strong, lasting marriages through clear communication about money and family roles.`
          : `The 6-8 Bhakoot Dosha is present. This traditionally indicates potential health challenges or emotional distance developing over time. It does not predict a specific outcome — many couples with this pattern live happily together — but it's worth building strong emotional communication habits and attending to each other's wellbeing proactively.`,
    },
  }
}

// ── 8. Nadi (8 pts) ────────────────────────────────────────────────────────────
export function scoreNadi(boy: PersonMilanData, girl: PersonMilanData): KutaResult {
  const same = boy.nadi === girl.nadi
  const score = same ? 0 : 8

  const NADI_MEANING: Record<string, string> = {
    Adi: 'Adi (first) Nadi is associated with the Vata constitution — active, airy energy.',
    Madhya: 'Madhya (middle) Nadi is associated with the Pitta constitution — sharp, fiery energy.',
    Antya: 'Antya (last) Nadi is associated with the Kapha constitution — steady, earthy energy.',
  }

  return {
    name: 'Nadi',
    score,
    max: 8,
    description: same
      ? `Both ${boy.nadi} Nadi — Nadi Dosha`
      : `${boy.name}: ${boy.nadi} Nadi, ${girl.name}: ${girl.nadi} Nadi — compatible`,
    note: same ? 'Nadi Dosha' : undefined,
    detail: {
      about:
        'Nadi is the most heavily weighted kuta, carrying 8 out of 36 points. It relates to health, physiological constitution, and the genetic compatibility needed for a healthy family. The 27 nakshatras are divided into three Nadi channels — Adi (first), Madhya (middle), and Antya (last) — which correspond to the Ayurvedic tridosha framework of Vata, Pitta, and Kapha. When both partners share the same Nadi, it is called Nadi Dosha, and is traditionally considered the most serious compatibility concern — associated with health difficulties and challenges with progeny. Complementary Nadis (different from each other) score the full 8 points.',
      person1:
        `${boy.name}'s birth nakshatra is ${boy.nakshatraName}, which belongs to ${boy.nadi} Nadi. ${NADI_MEANING[boy.nadi] ?? ''}`,
      person2:
        `${girl.name}'s birth nakshatra is ${girl.nakshatraName}, which belongs to ${girl.nadi} Nadi. ${NADI_MEANING[girl.nadi] ?? ''}`,
      meaning:
        score === 8
          ? `${boy.name} (${boy.nadi} Nadi) and ${girl.name} (${girl.nadi} Nadi) have complementary Nadi channels — the single most important compatibility indicator scores a full 8 points. Different Nadis indicate complementary constitutions, which traditional texts associate with better health outcomes and natural harmony in family life.`
          : `Both ${boy.name} and ${girl.name} share the ${boy.nadi} Nadi, resulting in Nadi Dosha. This is the most significant of the three major doshas (along with Bhakoot and Gana Dosha). Traditional texts associate it with health challenges and difficulties with progeny. In practice, many couples with Nadi Dosha have healthy families — and astrological remedies, strong other kutas, and a proactive approach to health can all provide meaningful mitigation.`,
    },
  }
}
