// ─── Lo Shu Grid Compatibility Meanings ──────────────────────────────────────
// LP compatibility matrix and pair descriptions
// Groups: 1/5/7 (Fire/Independent), 2/4/8 (Earth/Practical), 3/6/9 (Creative/Spiritual)

export interface LPPairMeaning {
  score: number
  label: string   // "Harmonious" | "Compatible" | "Neutral" | "Challenging"
  description: string
  strengths: string[]
  challenges: string[]
}

// ─── LP Compatibility Matrix (symmetric) ─────────────────────────────────────
// Key format: "min-max" (always lower number first)

export const LP_PAIR_MEANINGS: Record<string, LPPairMeaning> = {
  "1-1": {
    score: 85,
    label: "Harmonious",
    description: "Two independent leaders who deeply understand each other's drive for autonomy and ambition. This pairing thrives when both channel their competitive natures toward shared goals rather than against each other.",
    strengths: ["Mutual respect for independence", "Shared drive to succeed", "Neither needs to dominate the other's identity"],
    challenges: ["Both can be stubborn and insist on being right", "May struggle to compromise", "Competition can overshadow collaboration"],
  },
  "1-2": {
    score: 50,
    label: "Neutral",
    description: "The pioneer and the peacemaker must consciously bridge their differences. Number 1 leads boldly while Number 2 seeks harmony — they can balance each other beautifully if both feel heard.",
    strengths: ["1's decisiveness balances 2's hesitation", "2 brings diplomacy to 1's directness", "Strong support dynamic when roles are clear"],
    challenges: ["1 may find 2 too passive; 2 may find 1 too dominant", "Different conflict styles create friction", "1 needs to slow down; 2 needs to speak up"],
  },
  "1-3": {
    score: 65,
    label: "Compatible",
    description: "A naturally energetic pairing where Number 1's ambition sparks Number 3's creativity. Both are outgoing, optimistic forces who can inspire each other — as long as ego stays in check.",
    strengths: ["High energy and enthusiasm", "3's creativity fuels 1's vision", "Shared love of achievement and expression"],
    challenges: ["Both can be self-centred", "3's scattered focus can frustrate 1's need for results", "Need to celebrate each other, not compete for attention"],
  },
  "1-4": {
    score: 45,
    label: "Challenging",
    description: "The free-spirited pioneer clashes with the methodical builder. Number 1 chafes under structure; Number 4 needs it. Both are strong-willed, making compromise essential and often difficult.",
    strengths: ["4 provides stability 1 often lacks", "1's boldness can push 4 out of safe patterns", "Complementary skill sets in practical matters"],
    challenges: ["Frequent power struggles", "1 feels constrained; 4 feels disrespected", "Fundamentally different approaches to risk and change"],
  },
  "1-5": {
    score: 90,
    label: "Harmonious",
    description: "One of the most dynamic and exciting pairings in Lo Shu numerology. Both numbers crave freedom, adventure, and leadership. They fuel each other's spark and rarely bore one another.",
    strengths: ["Unstoppable when aligned on a goal", "Shared love of freedom keeps the energy alive", "Deep mutual understanding of each other's independence"],
    challenges: ["Both resist routine — practical life can suffer", "Neither wants to compromise on direction", "Must consciously build stability together"],
  },
  "1-6": {
    score: 55,
    label: "Neutral",
    description: "Number 1 values independence while Number 6 is drawn to nurturing and responsibility. There is affection and respect here, but tension arises when 6's attachment conflicts with 1's need for space.",
    strengths: ["6 brings warmth and grounding", "1 brings excitement and direction", "Mutual admiration if roles are respected"],
    challenges: ["6 may feel neglected by 1's independence", "1 may feel weighed down by 6's expectations", "Balancing freedom and commitment is the core work"],
  },
  "1-7": {
    score: 88,
    label: "Harmonious",
    description: "A deeply compatible intellectual and spiritual pairing. Number 1's outer drive meets Number 7's inner wisdom. They give each other space and stimulate each other in ways few other pairings can.",
    strengths: ["Both honour independence and solitude", "7's depth enriches 1's vision", "Mutual respect without suffocation"],
    challenges: ["Both can be emotionally distant", "Neither may initiate emotional vulnerability easily", "7's introspection may frustrate 1's action-bias"],
  },
  "1-8": {
    score: 40,
    label: "Challenging",
    description: "Two powerful, ambitious numbers on a collision course. Both are natural leaders who want control, and neither yields easily. Success requires one willingness to support rather than compete.",
    strengths: ["Massive combined ambition and capacity", "Can build empires together if egos align", "Deep respect for each other's power"],
    challenges: ["Classic clash of wills", "Both want to be the dominant force", "Resentment builds when neither leads gracefully"],
  },
  "1-9": {
    score: 60,
    label: "Compatible",
    description: "Number 1's personal ambition meets Number 9's universal vision. There is genuine respect and complementary energy, but their motivations can feel divergent — one works for self, the other for the world.",
    strengths: ["9's wisdom tempers 1's ego", "1's drive gives 9's idealism practical fuel", "Shared leadership qualities"],
    challenges: ["9 can feel 1 is too self-focused", "1 may find 9's idealism impractical", "Differing sense of purpose requires active bridging"],
  },
  "2-2": {
    score: 85,
    label: "Harmonious",
    description: "Two empaths who understand each other's sensitivity and need for harmony. This pairing is gentle, deeply connected, and emotionally rich — as long as both develop the courage to take initiative.",
    strengths: ["Deep emotional attunement", "Natural cooperation and diplomacy", "Shared values of peace and partnership"],
    challenges: ["Both may avoid conflict too long", "Decisions can stall without a natural leader", "Both need emotional security — can create co-dependency"],
  },
  "2-3": {
    score: 60,
    label: "Compatible",
    description: "The sensitive diplomat and the expressive creator can complement each other well. Number 2 provides emotional grounding while Number 3 brings joy and spontaneity into the partnership.",
    strengths: ["3's optimism lifts 2's tendency toward worry", "2's sensitivity helps 3 communicate with more depth", "Good creative and emotional balance"],
    challenges: ["3's scattered energy can unsettle 2's need for stability", "2 may feel overshadowed by 3's extroversion", "Both need emotional validation in different ways"],
  },
  "2-4": {
    score: 88,
    label: "Harmonious",
    description: "A beautifully stable and supportive pairing. Number 2 brings emotional intelligence and Number 4 brings structure and dependability. Together they build partnerships that endure.",
    strengths: ["Strong foundation of trust and reliability", "2's empathy softens 4's rigidity", "4's stability gives 2 the security it craves"],
    challenges: ["Can become too comfortable and stop growing", "4 may dismiss 2's emotional needs as irrational", "Both need to consciously embrace spontaneity"],
  },
  "2-5": {
    score: 55,
    label: "Neutral",
    description: "Number 2 longs for stability and closeness while Number 5 craves freedom and constant change. They are attracted to each other's differences, but those same differences become the source of friction.",
    strengths: ["5 expands 2's world beyond its comfort zone", "2 offers 5 a safe emotional anchor", "Dynamic chemistry when things are good"],
    challenges: ["5's restlessness makes 2 feel insecure", "2's attachment can feel suffocating to 5", "Fundamentally different needs for closeness vs. freedom"],
  },
  "2-6": {
    score: 75,
    label: "Compatible",
    description: "Two nurturing, harmony-seeking numbers with much in common. Both value love, family, and security. This is a warm, caring pairing that naturally supports emotional well-being for both.",
    strengths: ["Deep emotional resonance", "Both are givers — relationship feels safe and loving", "Shared values around home and connection"],
    challenges: ["Both can be overly accommodating and avoid hard truths", "Neither may push the other toward growth", "Risk of over-dependence"],
  },
  "2-7": {
    score: 45,
    label: "Challenging",
    description: "Number 2 needs emotional closeness while Number 7 values solitude and intellectual independence. This pairing requires significant adjustment — 2 must not take 7's distance personally.",
    strengths: ["7's depth and wisdom can ground 2", "2's empathy can draw 7 out of isolation", "Spiritual growth potential for both"],
    challenges: ["7's need for space can feel like rejection to 2", "2 may try to emotionally connect in ways 7 finds intrusive", "Requires ongoing, patient communication"],
  },
  "2-8": {
    score: 90,
    label: "Harmonious",
    description: "One of the most naturally balanced pairings — Number 2's emotional intelligence perfectly complements Number 8's material ambition. Together they build something substantial without losing the human warmth.",
    strengths: ["8's strength protects 2's sensitivity", "2's intuition guides 8's strategic decisions", "Excellent balance of heart and ambition"],
    challenges: ["8 may unintentionally dominate; 2 must not shrink", "8's focus on achievement can feel cold to 2", "2 needs verbal affirmation 8 often forgets to give"],
  },
  "2-9": {
    score: 65,
    label: "Compatible",
    description: "A compassionate pairing where both are oriented toward others — Number 2 through intimate bonds, Number 9 through universal love. They share empathy and idealism, though their scale of caring differs.",
    strengths: ["Deep mutual compassion", "9's wisdom expands 2's emotional world", "Shared orientation toward harmony and healing"],
    challenges: ["9's detachment can feel like abandonment to 2", "2 wants closeness; 9 prefers universality", "9 may feel 2 is too focused on personal rather than collective"],
  },
  "3-3": {
    score: 85,
    label: "Harmonious",
    description: "Two creatives who inspire, entertain, and enliven each other. This pairing is vibrant, expressive, and full of laughter — but both need to develop follow-through and avoid mutual distraction.",
    strengths: ["Endless creativity and fun", "Neither judges the other's artistic impulses", "Shared joy in self-expression"],
    challenges: ["Both tend toward scattered energy", "Practical matters may be perpetually deferred", "Competition for the spotlight can emerge"],
  },
  "3-4": {
    score: 45,
    label: "Challenging",
    description: "The free-spirited artist meets the methodical builder. Number 3 finds Number 4 rigid; Number 4 finds Number 3 unreliable. Genuine respect and clear division of roles can bridge this gap.",
    strengths: ["4 provides the structure 3 needs to actualise creative ideas", "3 introduces colour and joy into 4's sometimes grey world", "Great complementary skill sets if ego is set aside"],
    challenges: ["4 sees 3 as irresponsible; 3 sees 4 as joyless", "Frequent friction over planning vs. spontaneity", "Both must consciously appreciate the other's approach"],
  },
  "3-5": {
    score: 70,
    label: "Compatible",
    description: "Two freedom-lovers who spark each other's curiosity and zest for life. Both are expressive, adaptable, and sociable — this pairing rarely feels dull, though it can lack grounding.",
    strengths: ["High mutual energy and enthusiasm", "Both value experience over routine", "Shared love of communication and adventure"],
    challenges: ["Neither naturally provides stability", "Both need to consciously build roots", "Scattered priorities can lead to stagnation disguised as motion"],
  },
  "3-6": {
    score: 90,
    label: "Harmonious",
    description: "A wonderful creative and nurturing combination. Number 3's expressive brilliance is anchored by Number 6's warmth and responsibility. They bring out the best in each other naturally.",
    strengths: ["3's creativity flourishes in 6's supportive environment", "6's devotion is energised by 3's enthusiasm", "Shared love of beauty, art, and connection"],
    challenges: ["3 may find 6 over-responsible; 6 may find 3 flighty", "6 can become resentful of carrying the practical load", "3 needs to match 6's commitment"],
  },
  "3-7": {
    score: 60,
    label: "Compatible",
    description: "The expressive communicator meets the introspective seeker. Number 3 draws Number 7 out of isolation; Number 7 adds philosophical depth to Number 3's ideas. An intriguing but effortful pairing.",
    strengths: ["7's depth gives 3's expression meaning", "3's social ease reduces 7's isolation", "Mutual stimulation through ideas and conversation"],
    challenges: ["7's need for silence clashes with 3's verbal expressiveness", "3 may find 7 cold; 7 may find 3 superficial", "Consistent effort needed to bridge these very different natures"],
  },
  "3-8": {
    score: 50,
    label: "Neutral",
    description: "Number 3 lives for creative expression while Number 8 is driven by material achievement. These priorities often compete. Respect and defined roles allow this pairing to work.",
    strengths: ["8's ambition can direct 3's talent productively", "3's charisma opens doors 8's authority builds", "Strong professional partnership potential"],
    challenges: ["8 may see 3 as insufficiently serious", "3 may feel 8 is mercenary or controlling", "Different definitions of success create ongoing friction"],
  },
  "3-9": {
    score: 88,
    label: "Harmonious",
    description: "A deeply aligned pairing of creative and humanitarian energies. Both are idealistic, expressive, and concerned with leaving a meaningful mark on the world. Their combined vision is powerful.",
    strengths: ["Shared idealism and love of ideas", "9's wisdom gives direction to 3's creativity", "Both inspire and are inspired by each other"],
    challenges: ["Both can be impractical about material matters", "9 may feel 3 lacks sufficient depth", "Need grounding influences from outside the pairing"],
  },
  "4-4": {
    score: 85,
    label: "Harmonious",
    description: "Two builders who speak the same language of discipline, reliability, and long-term thinking. This is a rock-solid pairing that creates exceptional stability — if both allow space for joy.",
    strengths: ["Unmatched reliability and mutual trust", "Shared long-term vision and work ethic", "Neither surprises the other with chaos"],
    challenges: ["Can become overly serious and rigid", "Both resist change — stagnation risk", "Neither may push the other toward growth or adventure"],
  },
  "4-5": {
    score: 45,
    label: "Challenging",
    description: "Number 4 needs stability; Number 5 creates it. This fundamental tension runs through every aspect of the pairing. 5's need for constant change threatens everything 4 works to build.",
    strengths: ["5 can teach 4 the value of flexibility", "4 can offer 5 the anchor it secretly needs", "Genuine attraction of opposites"],
    challenges: ["5's restlessness is deeply unsettling to 4", "4's rigidity frustrates 5 profoundly", "One of the harder pairings without mature self-awareness on both sides"],
  },
  "4-6": {
    score: 75,
    label: "Compatible",
    description: "A reliable, responsible pairing that builds something lasting. Number 4's discipline and Number 6's devotion create a stable home and partnership. Both value commitment deeply.",
    strengths: ["Strong shared values around responsibility and loyalty", "6's warmth softens 4's seriousness", "Excellent for building family and long-term security"],
    challenges: ["Can become overly duty-focused, losing spontaneity", "6 may feel emotionally undernourished", "Both need to schedule joy, not just obligations"],
  },
  "4-7": {
    score: 60,
    label: "Compatible",
    description: "The practical builder and the spiritual seeker have more in common than first appears — both are introverted, deliberate, and quality-focused. They can build a quiet, meaningful life together.",
    strengths: ["Shared preference for depth over breadth", "4's practicality grounds 7's abstractions", "7's insight gives 4's work philosophical meaning"],
    challenges: ["Both can be emotionally withholding", "4 may dismiss 7's spiritual interests as impractical", "Needs conscious effort to maintain emotional warmth"],
  },
  "4-8": {
    score: 90,
    label: "Harmonious",
    description: "One of the most powerful pairings for worldly achievement. Number 4's methodical discipline and Number 8's strategic ambition combine to create exceptional success. Both understand hard work deeply.",
    strengths: ["Formidable combined capacity to achieve", "Mutual respect for effort and results", "Long-term thinking on both sides"],
    challenges: ["Can prioritise achievement over emotional connection", "Both may neglect personal needs in pursuit of goals", "Need to consciously nurture the relationship, not just build with it"],
  },
  "4-9": {
    score: 55,
    label: "Neutral",
    description: "Number 4's grounded pragmatism meets Number 9's broad idealism. 4 works within systems; 9 wants to transcend them. Mutual respect is possible but their fundamental orientations differ.",
    strengths: ["9's vision gives 4's discipline a larger purpose", "4's practicality makes 9's dreams achievable", "Each fills a genuine gap in the other"],
    challenges: ["9 may find 4 too narrow in perspective", "4 may find 9 impractically idealistic", "Philosophical differences require active bridging"],
  },
  "5-5": {
    score: 85,
    label: "Harmonious",
    description: "Two free spirits who truly get each other's hunger for experience, change, and freedom. This pairing is electrifying and never boring — but both must consciously choose to build roots together.",
    strengths: ["Total understanding of each other's need for space", "Adventure, excitement, and mutual inspiration", "No one feels trapped or judged"],
    challenges: ["Both may avoid commitment and routine indefinitely", "Practical life can be chronically neglected", "Without conscious effort, the relationship may never deepen beyond excitement"],
  },
  "5-6": {
    score: 65,
    label: "Compatible",
    description: "Number 5's desire for freedom and Number 6's orientation toward home create a productive tension. Attraction is strong, but long-term success requires negotiating space and commitment honestly.",
    strengths: ["6 provides the stable centre 5 secretly needs", "5 brings adventure into 6's sometimes predictable world", "Deep mutual attraction of complementary energies"],
    challenges: ["6's attachment can feel like a cage to 5", "5's freedom-seeking can make 6 insecure", "Requires the most honest communication of all the cross-group pairings"],
  },
  "5-7": {
    score: 88,
    label: "Harmonious",
    description: "Two independent, deeply curious minds who honour each other's need for space. Number 5 explores the outer world while Number 7 explores the inner — together they cover the full spectrum.",
    strengths: ["Mutual respect for independence and individuality", "7's depth enriches 5's experiences", "5's vitality draws 7 into the world"],
    challenges: ["Both can be emotionally unavailable", "Neither naturally initiates emotional intimacy", "Relationship may remain intellectually strong but emotionally surface-level"],
  },
  "5-8": {
    score: 55,
    label: "Neutral",
    description: "Number 5 wants freedom and experiences; Number 8 wants to build something lasting. Both are strong personalities but pull in different directions — 5 outward, 8 upward.",
    strengths: ["8's strength grounds 5's scattered energy", "5's adaptability keeps 8 from becoming too rigid", "Strong mutual attraction to each other's confidence"],
    challenges: ["8's control-orientation clashes with 5's freedom-need", "5 may find 8 too serious and domineering", "Consistent tension between security-building and freedom-seeking"],
  },
  "5-9": {
    score: 70,
    label: "Compatible",
    description: "Both love freedom, ideas, and meaningful engagement with the world. Number 5's experiential approach and Number 9's philosophical one create a rich and stimulating pairing.",
    strengths: ["Shared love of freedom and expanded thinking", "9's wisdom channels 5's energy meaningfully", "Dynamic intellectual and spiritual connection"],
    challenges: ["Neither is naturally stable or grounded", "Both may drift without anchoring each other", "9 may find 5 lacks depth; 5 may find 9 too serious"],
  },
  "6-6": {
    score: 85,
    label: "Harmonious",
    description: "Two devoted, nurturing souls who create a home filled with warmth and care. Both understand the language of service and love deeply. The main risk is losing individual identity in service to the partnership.",
    strengths: ["Exceptional warmth, loyalty, and mutual devotion", "Shared values around family, beauty, and harmony", "Deep, abiding affection"],
    challenges: ["Both can sacrifice personal needs excessively", "Neither may address conflict directly", "Over-involvement in each other's wellbeing can create enmeshment"],
  },
  "6-7": {
    score: 65,
    label: "Compatible",
    description: "Number 6's warm earthly devotion meets Number 7's cool spiritual independence. This can be a deeply enriching pairing — 6 provides love, 7 provides wisdom — if 7 can open emotionally.",
    strengths: ["6's warmth gradually draws 7 into connection", "7's insight helps 6 find deeper meaning in relationships", "Mutual spiritual and emotional depth"],
    challenges: ["7's need for solitude can wound 6", "6 may feel it gives more than it receives", "7 must learn to express appreciation; 6 must not demand what 7 cannot yet give"],
  },
  "6-8": {
    score: 70,
    label: "Compatible",
    description: "A productive and grounded pairing. Number 6's nurturing orientation and Number 8's ambitious drive create a powerful domestic-professional balance. Both are responsible and committed.",
    strengths: ["8's ambition is anchored by 6's values", "6's warmth makes 8's hard work feel meaningful", "Excellent for building a stable, successful shared life"],
    challenges: ["8's work focus can leave 6 feeling undervalued", "6's emotional needs may feel like a burden to 8", "8 needs to actively invest in the relationship, not just the goal"],
  },
  "6-9": {
    score: 88,
    label: "Harmonious",
    description: "A beautifully aligned pairing of love and wisdom. Both are oriented toward others — 6 through personal devotion, 9 through universal compassion. Together they create something genuinely meaningful.",
    strengths: ["Deep shared values of service, beauty, and love", "9's spiritual breadth expands 6's personal devotion", "Both are generous, compassionate, and long-sighted"],
    challenges: ["Both can over-give and deplete themselves", "9's detachment may frustrate 6's desire for personal closeness", "Must ensure the relationship itself receives the care they give to everyone else"],
  },
  "7-7": {
    score: 85,
    label: "Harmonious",
    description: "Two seekers on parallel inner journeys who offer each other the rarest gift: genuine understanding without judgment. This is a deeply spiritual, intellectually rich pairing — if both can bridge the emotional gap.",
    strengths: ["Total mutual understanding of solitude needs", "Rare depth of intellectual and spiritual connection", "Neither suffocates the other"],
    challenges: ["Both can retreat into isolation together", "Emotional expression may be perpetually deferred", "The relationship needs warmth deliberately cultivated, not assumed"],
  },
  "7-8": {
    score: 50,
    label: "Neutral",
    description: "Number 7's spiritual, inner-focused world is at odds with Number 8's material, outer-focused ambitions. Both are serious and capable, but their priorities occupy entirely different planes.",
    strengths: ["7's insight adds depth to 8's strategic thinking", "8's groundedness keeps 7 connected to practical reality", "Mutual respect for each other's competence"],
    challenges: ["7 finds 8 too materialistic; 8 finds 7 impractical", "Very different definitions of success and meaning", "Requires conscious bridging across two very different worldviews"],
  },
  "7-9": {
    score: 75,
    label: "Compatible",
    description: "A profoundly spiritual and philosophical pairing. Both seek truth, meaning, and understanding beyond the surface. Number 7's introspective depth complements Number 9's broad humanitarian vision.",
    strengths: ["Shared love of wisdom and spiritual inquiry", "9's universal perspective expands 7's often narrow focus", "7's depth gives 9's vision grounded insight"],
    challenges: ["Both may neglect practical matters", "9 can feel 7 is too withdrawn", "Neither is naturally emotionally expressive — warmth needs cultivation"],
  },
  "8-8": {
    score: 85,
    label: "Harmonious",
    description: "Two powerhouses who respect each other's ambition and capacity. When they align their considerable strength toward a shared vision, the results are extraordinary. But two 8s can become a zero-sum competition.",
    strengths: ["Unmatched combined ambition, discipline, and capacity", "Deep mutual respect — neither is intimidated by the other", "Powerful achievement potential"],
    challenges: ["Power dynamics must be explicitly and fairly negotiated", "Both can be inflexible and domineering", "The relationship needs warmth and softness consciously injected"],
  },
  "8-9": {
    score: 55,
    label: "Neutral",
    description: "Number 8 builds systems of power; Number 9 transcends them. 8 is focused on accumulation; 9 on release and universal good. There is genuine respect here, but fundamentally different orientations.",
    strengths: ["9's wisdom tempers 8's sometimes ruthless ambition", "8's strength gives form to 9's broad ideals", "Each has something real to teach the other"],
    challenges: ["9 may judge 8 as materialistic and controlling", "8 may find 9 impractical and evasive", "Long-term alignment requires both to stretch significantly"],
  },
  "9-9": {
    score: 85,
    label: "Harmonious",
    description: "Two old souls committed to wisdom, service, and a better world. They understand each other's compassion and universal orientation intuitively. The greatest risk is losing personal connection in the pursuit of larger ideals.",
    strengths: ["Deep spiritual and philosophical resonance", "Shared commitment to meaning and service", "Neither judges the other's vision or idealism"],
    challenges: ["Both may neglect the personal, immediate relationship", "Neither is naturally detail or stability-oriented", "Can become so outwardly focused they lose emotional intimacy"],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLPPairMeaning(lp1: number, lp2: number): LPPairMeaning {
  const min = Math.min(lp1, lp2)
  const max = Math.max(lp1, lp2)
  // For master numbers, reduce to single digit for lookup
  const k1 = min > 9 ? String(min).split('').map(Number).reduce((a, b) => a + b, 0) : min
  const k2 = max > 9 ? String(max).split('').map(Number).reduce((a, b) => a + b, 0) : max
  const key = `${Math.min(k1, k2)}-${Math.max(k1, k2)}`
  return LP_PAIR_MEANINGS[key] ?? {
    score: 60,
    label: "Neutral",
    description: "An interesting combination with unique growth potential.",
    strengths: ["Complementary perspectives"],
    challenges: ["Different core orientations require active bridging"],
  }
}

export function getCompatibilityLabel(score: number): string {
  if (score >= 80) return "Harmonious"
  if (score >= 65) return "Compatible"
  if (score >= 50) return "Neutral"
  return "Challenging"
}
