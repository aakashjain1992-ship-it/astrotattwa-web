// ─── Numerology Meanings — Lo Shu Grid Reference Library ─────────────────────
//
// Rich interpretations for numbers 1–9, planes, arrows, raj yogas, and karmic
// lessons. Authored for use as reading material and inline component tooltips.
//
import type { NumberMeaning, ArrowMeaning, RajYogaMeaning } from '@/types/numerology'

// ─── Number Meanings (1–9) ────────────────────────────────────────────────────

export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    number: 1,
    planet: "Sun",
    element: "Fire",
    keyword: "Leadership",
    trait:
      "Number 1 is ruled by the Sun — the source of all light and life. People with strong 1 energy are natural leaders: original, independent, and driven by an unshakeable belief in their own vision. They initiate, they pioneer, and they thrive when given autonomy. The Sun's direct light gives them clarity of purpose and the courage to stand apart from the crowd.",
    strength:
      "When present in the grid, 1 brings self-confidence, originality, and the executive power to turn ideas into reality. These individuals are decisive and inspiring. Their sense of self is their greatest asset — they rarely need external validation to move forward.",
    challenge:
      "When 1 is absent, the karmic lesson is confidence. There may be a tendency to seek approval, second-guess oneself, or struggle to assert personal boundaries. The journey is to develop an inner authority that does not depend on external circumstances.",
    career:
      "Leadership, entrepreneurship, politics, creative direction, any field that rewards independent vision and bold action.",
    relationships:
      "Values independence even in close partnerships. Best paired with numbers that give space — 3, 5, and 7. Can clash with controlling energies unless both parties have strong self-awareness.",
  },
  2: {
    number: 2,
    planet: "Moon",
    element: "Water",
    keyword: "Cooperation",
    trait:
      "Number 2 is ruled by the Moon — intuitive, receptive, and deeply attuned to the emotional undercurrents around it. Where 1 divides, 2 connects. These individuals are natural diplomats: empathetic listeners who read between the lines and bridge differences. Their power lies not in force, but in patience and sensitivity.",
    strength:
      "When present, 2 bestows emotional intelligence, the ability to see multiple perspectives, and a gift for creating harmony in relationships. These people often become the glue in families, teams, and communities. Their intuition is rarely wrong.",
    challenge:
      "When 2 is missing, the lesson is emotional balance. There may be over-rationalism, difficulty expressing feelings, or a tendency to suppress sensitivity as a weakness. The journey is to honour emotional truth as valid data — not noise to be managed.",
    career:
      "Counselling, diplomacy, healthcare, teaching, creative collaboration, any role that requires emotional acuity and partnership.",
    relationships:
      "Thrives in close, nurturing partnerships. Sensitive to conflict and needs genuine emotional safety to open fully. Natural caregiver who must guard against losing identity in relationships.",
  },
  3: {
    number: 3,
    planet: "Jupiter",
    element: "Fire / Ether",
    keyword: "Expression",
    trait:
      "Number 3 is ruled by Jupiter — the great benefic, planet of wisdom, expansion, and joy. Those with strong 3 energy radiate enthusiasm and creative optimism. They are storytellers, artists, and communicators who light up every room. Jupiter's expansive energy gives them a natural gift for teaching, inspiring, and bringing people together through shared vision.",
    strength:
      "When present, 3 brings creative expression, charisma, and an optimistic worldview that attracts abundance. These individuals rarely struggle to make an impression — their presence alone uplifts others. They have a rare ability to turn complex ideas into accessible, engaging narratives.",
    challenge:
      "When 3 is missing, the lesson is communication. There may be difficulty expressing ideas clearly, reluctance to speak up, or a tendency to retreat inward when sharing feels vulnerable. The journey is to find authentic voice and trust that expression is not performance — it is connection.",
    career:
      "Writing, public speaking, teaching, arts, entertainment, marketing, spiritual guidance, philosophy.",
    relationships:
      "Warm, generous, and fun to be around. Needs a partner who appreciates creativity and humour. Can become scattered when bored — thrives with someone who stimulates mental and creative growth.",
  },
  4: {
    number: 4,
    planet: "Rahu (North Node)",
    element: "Earth",
    keyword: "Foundation",
    trait:
      "Number 4 is governed by Rahu — the planet of ambition, material world mastery, and karmic acceleration. Those with strong 4 energy are builders: methodical, reliable, and deeply committed to creating solid structures in every area of life. Where others dream, 4 executes. Where others improvise, 4 plans. Their power is in persistence and the willingness to do the unglamorous work that lasting success requires.",
    strength:
      "When present, 4 delivers exceptional discipline, organisational ability, and the stamina to see long projects through to completion. These individuals are the backbone of any enterprise — trustworthy, precise, and committed. Rahu's intensity also gives them an edge in navigating complex material challenges.",
    challenge:
      "When 4 is missing, the karmic lesson is discipline. There may be difficulty with routine, resistance to structure, or a pattern of starting strong but losing momentum. The journey is to build the internal scaffolding that supports sustained effort — not through force, but through understanding why structure is freedom, not constraint.",
    career:
      "Engineering, architecture, finance, law, project management, military, any field demanding precision and systematic thinking.",
    relationships:
      "Loyal and dependable — a rock when life becomes turbulent. Can be perceived as rigid or too serious. Needs a partner who appreciates steadiness and shares long-term values rather than seeking constant novelty.",
  },
  5: {
    number: 5,
    planet: "Mercury",
    element: "Ether / Air",
    keyword: "Freedom",
    trait:
      "Number 5 is ruled by Mercury — the quicksilver messenger, planet of intellect, communication, and adaptability. Located at the very centre of the Lo Shu Grid, 5 is the axis around which all other energies rotate. Those with strong 5 energy are versatile, curious, and alive with possibility. They adapt instantly, think on their feet, and thrive in environments of constant change and stimulation.",
    strength:
      "When present, 5 brings extraordinary adaptability, sharp wit, and the ability to communicate across any barrier. These individuals excel at synthesising diverse ideas and translating complex concepts for broad audiences. As the centrepoint of the grid, 5 often acts as the integrator — balancing the material and spiritual, the mental and physical.",
    challenge:
      "When 5 is missing, it signals a potential imbalance at the core — a tendency to be pulled to extremes without a stable anchor. When repeated multiple times, it can manifest as restlessness, difficulty with commitment, and a hunger for novelty that, if unchecked, prevents deep roots from forming.",
    career:
      "Media, travel, trade, sales, technology, journalism, languages, any field that rewards agility and breadth of knowledge over depth in a single domain.",
    relationships:
      "Exciting and stimulating as a partner — brings adventure and wit. Needs freedom and variety within the relationship. Can struggle with deep emotional commitment if not consciously cultivated. Best matched with independent partners who trust without clinging.",
  },
  6: {
    number: 6,
    planet: "Venus",
    element: "Water / Earth",
    keyword: "Harmony",
    trait:
      "Number 6 is ruled by Venus — the planet of love, beauty, and the principle of harmonious relationship. Those with strong 6 energy are natural nurturers: caring, responsible, and deeply invested in the wellbeing of those they love. They have an innate aesthetic sense and a desire to create beauty and safety in their environment. Home, family, and community are their sanctuaries.",
    strength:
      "When present, 6 bestows a natural gift for healing, caregiving, and creating environments where others feel safe and valued. These individuals often attract people in need — their warmth is magnetic. Venus's influence also gives artistic sensibility and a refined sense of what is beautiful and true.",
    challenge:
      "When 6 is missing, the karmic lesson is responsibility — particularly toward oneself. There may be difficulty accepting the weight of commitment or, conversely, a pattern of over-giving to avoid confronting personal needs. The journey is to understand that genuine care for others must begin with genuine care for oneself.",
    career:
      "Healthcare, counselling, interior design, hospitality, education, social work, arts, anything involving creating beauty or serving the emotional needs of communities.",
    relationships:
      "Devoted, loyal, and deeply loving. Can become over-protective or self-sacrificing when boundaries are unclear. Needs reciprocity — a partner who also gives. Must guard against staying in relationships past their natural expiry out of duty.",
  },
  7: {
    number: 7,
    planet: "Ketu (South Node)",
    element: "Ether / Spirit",
    keyword: "Wisdom",
    trait:
      "Number 7 is governed by Ketu — the planet of moksha, spiritual liberation, and deep inner knowing. Those with strong 7 energy are truth-seekers: introspective, analytical, and drawn to the invisible dimensions of existence. They move inward where others move outward. Their wisdom often comes not from study but from direct inner experience — a quality that can make them remarkable teachers, healers, and guides.",
    strength:
      "When present, 7 brings penetrating analytical ability, spiritual insight, and a natural gift for uncovering what lies beneath the surface. These individuals rarely accept anything at face value. Their intuition is profound, and when they trust it, they often arrive at truths that elude more conventionally-minded people.",
    challenge:
      "When 7 is missing, the karmic lesson is faith — both in the unseen dimensions of life and in one's own inner voice. There may be over-reliance on external evidence, scepticism that closes doors before they can be opened, or emotional distance used as a shield. The journey is to develop trust in what cannot always be proven.",
    career:
      "Research, philosophy, spirituality, psychology, mathematics, occult sciences, writing, investigative fields of any kind.",
    relationships:
      "Deep, intense, and rare in their quality of genuine presence. Can be emotionally withholding or lost in their inner world. Needs a partner who respects solitude and engages at an intellectual and spiritual level, not just emotionally.",
  },
  8: {
    number: 8,
    planet: "Saturn",
    element: "Earth",
    keyword: "Power",
    trait:
      "Number 8 is ruled by Saturn — the great teacher, planet of karma, discipline, and the laws of cause and effect. Those with strong 8 energy carry the energy of the executive: ambitious, authoritative, and built for the long game. Saturn strips away illusion and demands that achievement be earned through effort, patience, and integrity. Their power is not given — it is forged.",
    strength:
      "When present, 8 brings extraordinary manifestation ability, business acumen, and the resilience to endure setbacks and emerge stronger. These individuals understand that power requires both responsibility and restraint. Saturn's influence also grants an unusual quality of presence — a gravity that commands respect without demanding it.",
    challenge:
      "When 8 is missing, the karmic lesson is financial discipline and right relationship with power. There may be a pattern of mishandling resources, fear of money as a corrupting force, or discomfort with wielding authority. The journey is to understand that material power, when used with integrity, is a vehicle for serving others at scale.",
    career:
      "Business, finance, law, politics, real estate, any field that rewards strategic thinking, long-term vision, and the willingness to operate at scale.",
    relationships:
      "Intensely loyal but can be controlling or emotionally unavailable when driven by ambition. Needs a partner who is secure, independent, and understands that the drive for achievement is not rejection. Mutual respect and clear agreements about power dynamics are essential.",
  },
  9: {
    number: 9,
    planet: "Mars",
    element: "Fire",
    keyword: "Compassion",
    trait:
      "Number 9 is ruled by Mars — not the warrior Mars of conflict, but the Mars of righteous action in service of a higher purpose. Those with strong 9 energy carry the vibration of the humanitarian: expansive, generous, and devoted to ideals that transcend personal gain. They are the old souls of the grid — having, at some level, already walked the path of all the numbers before them. Their calling is to give back.",
    strength:
      "When present, 9 brings universal compassion, wisdom born of experience, and an extraordinary capacity for forgiveness and generosity. These individuals often feel drawn to causes larger than themselves. They have a natural healing quality and can hold space for others through profound difficulty without being diminished.",
    challenge:
      "When 9 is missing, the karmic lesson is compassion — both for others and for oneself. There may be difficulty forgiving, a tendency toward self-righteousness, or emotional hardening as a response to past wounds. The journey is to let go: of grievances, of idealism that becomes judgement, and of the belief that the world must earn one's generosity.",
    career:
      "Humanitarian work, healing arts, spirituality, philosophy, art, teaching, law, activism, anything in service of collective wellbeing.",
    relationships:
      "Deeply giving and idealistic in love. Can place partners on pedestals and feel disillusioned when they fall short. Must cultivate relationships with real humans rather than projections. The gift of 9 in relationship is unconditional love — its shadow is martyrdom.",
  },
}

// ─── Arrow Meanings ───────────────────────────────────────────────────────────

export const ARROW_MEANINGS: Record<string, ArrowMeaning> = {
  "1-5-9": {
    key: "1-5-9",
    label: "Arrow of Determination",
    numbers: [1, 5, 9],
    presentTitle: "Arrow of Determination — Present",
    presentDetail:
      "The diagonal from 1 (Sun) through 5 (Mercury) to 9 (Mars) is active. This is the most powerful arrow in the grid — the axis of wilful determination. You possess an exceptional ability to set a goal and pursue it with focused, sustained energy. Setbacks are processed quickly; quitting is rarely a consideration. This arrow produces leaders, athletes, and anyone who achieves through sheer tenacity of purpose.",
    missingTitle: "Arrow of Determination — Missing",
    missingDetail:
      "All three numbers (1, 5, 9) are absent from your grid. This suggests that maintaining direction over the long term may be a recurring challenge. There can be a pattern of strong starts followed by loss of momentum, or difficulty distinguishing what is truly worth pursuing from what is merely urgent. The life lesson is to build internal anchors — practices, values, and commitments — that sustain direction independent of external motivation.",
    partialDetail:
      "This arrow is partially formed. Some capacity for determination exists, but it requires conscious cultivation. Focus on strengthening the missing numbers' qualities through deliberate practice.",
  },
  "2-5-8": {
    key: "2-5-8",
    label: "Arrow of Emotional Balance",
    numbers: [2, 5, 8],
    presentTitle: "Arrow of Emotional Balance — Present",
    presentDetail:
      "The vertical axis of 2 (Moon), 5 (Mercury), and 8 (Saturn) is complete — forming the Arrow of Emotional Balance. You possess a rare and powerful combination: emotional sensitivity (2), mental agility (5), and material discipline (8). This creates an individual who can feel deeply without being destabilised, think clearly under pressure, and translate emotional intelligence into tangible outcomes. You are a natural mediator and often the steady presence others turn to in times of crisis.",
    missingTitle: "Arrow of Emotional Balance — Missing",
    missingDetail:
      "The emotional axis (2, 5, 8) is entirely absent. This can indicate difficulty finding the middle ground — oscillating between emotional overwhelm and emotional shutdown, or between impulsive action and paralysis. The life lesson is to develop the capacity to inhabit the full spectrum of feeling without being consumed by it, and to build practical structures that give emotional energy a constructive outlet.",
    partialDetail:
      "Partial emotional balance. Some regulation exists but extremes may appear in stress. Working consciously with the missing elements builds greater steadiness.",
  },
  "3-5-7": {
    key: "3-5-7",
    label: "Arrow of Spiritual Insight",
    numbers: [3, 5, 7],
    presentTitle: "Arrow of Spiritual Insight — Present",
    presentDetail:
      "The horizontal axis of 3 (Jupiter), 5 (Mercury), and 7 (Ketu) is complete — the Arrow of Spiritual Insight. You carry a natural bridge between the expressive and the interior worlds. Jupiter's expansive wisdom, Mercury's communicative brilliance, and Ketu's mystical depth combine to produce someone with genuine spiritual perception and the ability to articulate it. You may find that you attract seekers, or that your insights arrive through creative or contemplative practice.",
    missingTitle: "Arrow of Spiritual Insight — Missing",
    missingDetail:
      "All three numbers (3, 5, 7) are absent. There may be a tendency to live primarily on the surface — in the practical and material — while the interior dimensions of experience remain undeveloped. This is not a deficiency but an invitation: the life path involves gradually opening to subtler layers of perception and trusting what cannot be immediately verified.",
    partialDetail:
      "Some spiritual attunement is present. Deepening practice — meditation, creative expression, or study — can unlock the full potential of this axis.",
  },
  "4-5-6": {
    key: "4-5-6",
    label: "Arrow of Practicality",
    numbers: [4, 5, 6],
    presentTitle: "Arrow of Practicality — Present",
    presentDetail:
      "The axis of 4 (Rahu), 5 (Mercury), and 6 (Venus) is complete — the Arrow of Practicality. You have a natural gift for translating ideas into action within the real world. Where many people dream and then abandon, you have both the discipline to plan (4) and the relational warmth to execute through collaboration (6), bridged by Mercury's adaptability (5). Financial management, household stability, and professional organisation come more naturally to you than to most.",
    missingTitle: "Arrow of Practicality — Missing",
    missingDetail:
      "All three numbers (4, 5, 6) are absent. Life may feel somewhat disorganised — not from lack of intelligence or desire, but from an underdeveloped relationship with the routines, systems, and responsibilities that create worldly stability. The life lesson is to befriend structure: to see discipline not as restriction but as the scaffold that makes everything else possible.",
    partialDetail:
      "Partial practicality. Strong in some areas of execution but inconsistent. Identify which element (discipline, adaptability, or relational warmth) is missing and consciously cultivate it.",
  },
  "1-2-3": {
    key: "1-2-3",
    label: "Arrow of Planning",
    numbers: [1, 2, 3],
    presentTitle: "Arrow of Planning — Present",
    presentDetail:
      "The vertical axis of 1 (Sun), 2 (Moon), and 3 (Jupiter) is active — the Arrow of Planning and Intellect. You possess a sophisticated capacity for both logical and intuitive thinking. Where 1 provides individual clarity of purpose, 2 adds sensitivity to context and people, and 3 contributes expansive, creative thinking. The result is a natural strategist: someone who can envision, adapt, and inspire others toward a well-conceived goal.",
    missingTitle: "Arrow of Planning — Missing",
    missingDetail:
      "The mental axis (1, 2, 3) is entirely absent. Decision-making may feel reactive rather than strategic, and long-range planning can seem abstract or overwhelming. The life lesson is to develop the habit of reflection before action — to build the inner space where clear thinking, emotional awareness, and inspired creativity can work together.",
    partialDetail:
      "Partial planning capacity. Strengthen whichever element is missing — individual clarity (1), emotional attunement (2), or expansive thinking (3) — to complete this axis.",
  },
  "7-8-9": {
    key: "7-8-9",
    label: "Arrow of Action",
    numbers: [7, 8, 9],
    presentTitle: "Arrow of Action — Present",
    presentDetail:
      "The vertical axis of 7 (Ketu), 8 (Saturn), and 9 (Mars) is complete — the Arrow of Action. This is a powerful combination of spiritual depth (7), material mastery (8), and the drive to manifest (9). You are not someone who merely contemplates — you act, and your actions tend to carry weight and consequence. This arrow often appears in individuals who create lasting impact: their work endures because it combines inner knowing with outer execution.",
    missingTitle: "Arrow of Action — Missing",
    missingDetail:
      "The action axis (7, 8, 9) is absent. There may be a tendency toward analysis without follow-through, or a pattern of waiting for perfect conditions before committing to movement. The life lesson is to develop trust in imperfect action — to understand that momentum creates clarity, and that the world responds to those who move.",
    partialDetail:
      "Partial action energy. Identify the missing element — spiritual grounding (7), material discipline (8), or compassionate drive (9) — and begin cultivating it through daily practice.",
  },
}

// ─── Raj Yoga Meanings ────────────────────────────────────────────────────────

export const RAJ_YOGA_MEANINGS: Record<string, RajYogaMeaning> = {
  "1-5-9": {
    key: "1-5-9",
    name: "Willpower Raj Yoga",
    altName: "",
    numbers: [1, 5, 9],
    activeDetail:
      "The Willpower Raj Yoga (1-5-9) is active in your chart. This is the diagonal of the determined soul — combining the Sun's individuality, Mercury's agility, and Mars's drive into a single, cohesive force. People with this yoga rarely give up when others would. They recover from setbacks with unusual speed, maintain focus under pressure, and possess a natural authority that others sense and respect. Success in competitive, high-stakes, or leadership-demanding fields is strongly indicated.",
    missingDetail:
      "The Willpower Raj Yoga (1-5-9) is not formed — at least one of 1, 5, or 9 is absent from your grid. This does not prevent success, but it suggests that determination may require more conscious cultivation. Developing a strong personal mission, working on resilience practices, and building the habit of consistent follow-through will provide much of what this yoga delivers naturally.",
  },
  "2-5-8": {
    key: "2-5-8",
    name: "Silver Raj Yoga",
    altName: "Emotional Raj Yoga",
    numbers: [2, 5, 8],
    activeDetail:
      "The Silver Raj Yoga — also called the Emotional Raj Yoga (2-5-8) — is active. This yoga combines the Moon's emotional depth (2), Mercury's communicative intelligence (5), and Saturn's material mastery (8) into a formidable triad. Those with this yoga active are gifted at navigating the emotional dimensions of professional and personal life. They build trust naturally, resolve conflict effectively, and often rise to positions of influence through relationship intelligence rather than force. Financial success frequently comes through service to people.",
    missingDetail:
      "The Silver Raj Yoga (2-5-8) is not formed. Building genuine emotional intelligence — the ability to feel without being consumed, to communicate vulnerability without being fragile, and to translate relational warmth into material outcomes — will unlock capacities that this yoga provides naturally.",
  },
  "3-5-7": {
    key: "3-5-7",
    name: "Spiritual Raj Yoga",
    altName: "",
    numbers: [3, 5, 7],
    activeDetail:
      "The Spiritual Raj Yoga (3-5-7) is active in your chart. This is the horizontal axis of inner wisdom made manifest — combining Jupiter's expansive wisdom (3), Mercury's expressive bridge (5), and Ketu's mystical depth (7). People with this yoga carry a rare combination of spiritual perception and communicative ability. They often become teachers, writers, healers, or artists through whom higher wisdom flows into accessible form. Intuition runs deep, and their insights tend to arrive ahead of what rational analysis could produce.",
    missingDetail:
      "The Spiritual Raj Yoga (3-5-7) is not yet formed. The invitation is to explore inner life more deliberately — through study, contemplative practice, creative expression, or any path that develops the connection between inspired insight and grounded, communicable understanding.",
  },
  "4-5-6": {
    key: "4-5-6",
    name: "Golden Raj Yoga",
    altName: "Practical Raj Yoga",
    numbers: [4, 5, 6],
    activeDetail:
      "The Golden Raj Yoga — also called the Practical Raj Yoga (4-5-6) — is active. This is considered one of the most auspicious combinations in Lo Shu numerology for worldly success. Rahu's ambition and discipline (4), Mercury's adaptability (5), and Venus's relational warmth and creative harmony (6) form a triad that excels at building stable, prosperous, and beautiful lives. Family stability, professional success, creative productivity, and financial discipline all benefit from this yoga. Those with 4-5-6 active often create lasting legacies.",
    missingDetail:
      "The Golden Raj Yoga (4-5-6) is not yet formed. Deliberately cultivating each missing quality — structured discipline (4), adaptive thinking (5), and relational responsibility (6) — will progressively build the foundation that this yoga represents naturally. No yoga being absent is a permanent condition; it is an invitation to intentional development.",
  },
}

// ─── Karmic Lesson Meanings ───────────────────────────────────────────────────

export const KARMIC_LESSON_MEANINGS: Record<number, { lesson: string; detail: string }> = {
  1: {
    lesson: "Confidence",
    detail:
      "The absence of 1 (Sun) from your grid points to a life theme around developing authentic self-confidence — not the performance of confidence, but the deep inner knowing that you are sufficient as you are. This lesson often shows up through experiences that require you to stand alone, make unpopular choices, or step into leadership before you feel ready. The Sun's lesson is always the same: your light does not diminish others. It is safe to shine.",
  },
  2: {
    lesson: "Emotional Balance",
    detail:
      "The absence of 2 (Moon) points to the lesson of emotional intelligence — specifically, the practice of feeling fully without being destabilised by feeling. You may have learnt, often in childhood, to manage emotion through suppression, intellectualisation, or deflection. The Moon's lesson is to return to the body, honour the full spectrum of emotional experience, and allow vulnerability to become a bridge rather than a liability.",
  },
  3: {
    lesson: "Communication",
    detail:
      "The absence of 3 (Jupiter) points to the lesson of authentic self-expression. There may be a pattern of swallowing words, minimising your perspective, or struggling to find language adequate to inner experience. Jupiter's lesson is generous and expansive: your ideas, stories, and insights have value. The world needs to hear them. Finding your voice — through writing, speaking, teaching, or creative practice — is not vanity. It is your contribution.",
  },
  4: {
    lesson: "Discipline",
    detail:
      "The absence of 4 (Rahu) points to the lesson of sustainable discipline — building the internal and external structures that allow long-term vision to become lived reality. This is often accompanied by a complex relationship with routine: either resisting it as suffocating, or craving it but being unable to maintain it. Rahu's lesson is grounding: to discover that structure is not the enemy of freedom but its precondition. What you build deliberately, you keep.",
  },
  5: {
    lesson: "Stability",
    detail:
      "The absence of 5 (Mercury) from the very centre of the grid is significant. The centrepoint governs integration and balance across all planes. This karmic lesson is stability — not rigidity, but the capacity to remain centred when external circumstances are in flux. Life may feel like a series of extremes: periods of intense activity followed by exhaustion, or oscillation between different life visions without a coherent thread. Mercury's lesson is to develop a core that does not move, even as everything around it does.",
  },
  6: {
    lesson: "Responsibility",
    detail:
      "The absence of 6 (Venus) points to the lesson of responsibility — particularly in relationships, family, and creative commitments. This may manifest as difficulty with long-term obligations, a pattern of under-giving when giving feels costly, or, at the other extreme, giving so completely that one's own needs become invisible. Venus's lesson is reciprocal love: the practice of meeting others' needs and one's own with equal care, sustained over time.",
  },
  7: {
    lesson: "Faith",
    detail:
      "The absence of 7 (Ketu) points to the lesson of faith — trust in the dimensions of life that cannot be seen, measured, or controlled. There may be an over-reliance on external evidence, scepticism that becomes armour, or a sense that one must figure everything out alone because no unseen force is available to assist. Ketu's lesson is surrender: not passivity, but the willingness to trust inner knowing and act from it, even before external confirmation arrives.",
  },
  8: {
    lesson: "Financial Discipline",
    detail:
      "The absence of 8 (Saturn) points to the lesson of mastery over material resources and power. This may show up as inconsistency with money — cycles of abundance and scarcity — or discomfort with claiming authority or compensation for one's work. Saturn's lesson is exacting but deeply liberating: integrity with material resources creates the foundation for everything else. Developing a right relationship with earning, saving, and spending is a spiritual practice as much as a practical one.",
  },
  9: {
    lesson: "Compassion",
    detail:
      "The absence of 9 (Mars) points to the lesson of compassion — both for others and, perhaps more urgently, for oneself. There may be a tendency toward self-judgement, perfectionism that makes forgiveness difficult, or a withholding of warmth out of fear of being depleted. Mars in its highest expression is the warrior who serves: someone who acts from genuine care for the collective, without losing self in the process. The lesson is to give generously, forgive readily, and release the belief that compassion must be earned.",
  },
}

// ─── Master Number Meanings ───────────────────────────────────────────────────

export const MASTER_NUMBER_MEANINGS: Record<number, { title: string; detail: string }> = {
  11: {
    title: "Master Number 11 — The Illuminator",
    detail:
      "Master Number 11 is the number of spiritual illumination and inspired vision. It carries the sensitivity of 2 amplified to a higher octave — giving profound intuition, psychic awareness, and an ability to transmit higher wisdom into human experience. Those with 11 as a life path or destiny number are often born before their time: their perceptions are ahead of where collective consciousness currently sits. The challenge of 11 is grounding the extraordinary vision it carries into practical, usable form — without burning out or collapsing under the weight of its own sensitivity.",
  },
  22: {
    title: "Master Number 22 — The Master Builder",
    detail:
      "Master Number 22 is called the Master Builder — the ability to manifest on a scale that most people cannot conceive. It combines the visionary quality of 11 with the structural power of 4, producing someone capable of building lasting institutions, movements, or works that serve humanity for generations. The challenge of 22 is its own weight: the gap between what it can see and what presently exists can produce frustration and paralysis if not met with patience and incremental execution.",
  },
  33: {
    title: "Master Number 33 — The Master Teacher",
    detail:
      "Master Number 33 is the rarest of the master numbers — the Master Teacher. It represents the synthesis of all the lessons of the numbers below it, expressed through unconditional love and service. Those with 33 as their number carry an enormous responsibility: to heal, teach, and uplift through the quality of their own being as much as through their actions. The challenge is avoiding martyrdom — learning that the most powerful service comes from a place of fullness, not depletion.",
  },
}

// ─── Plane Guidance Text ──────────────────────────────────────────────────────

export const PLANE_GUIDANCE: Record<string, { strong: string; moderate: string; weak: string; veryWeak: string }> = {
  "Mental Plane": {
    strong: "Your mental plane (4, 9, 2) is fully activated. You possess exceptional capacity for strategic thinking, long-range planning, and intellectual synthesis. The combination of Rahu's ambition (4), Mars's drive (9), and Moon's intuition (2) creates a mind that is both visionary and detail-oriented — a rare pairing.",
    moderate: "Your mental plane is moderately active. Some areas of thinking are well-developed, but there may be gaps — perhaps between vision and execution, or between analysis and intuition. Deliberately cultivating the missing quality will significantly deepen your intellectual effectiveness.",
    weak: "The mental plane is lightly activated. Thinking may tend toward the practical and immediate rather than the strategic and conceptual. Building habits of reflection, study, and strategic planning will develop this plane over time.",
    veryWeak: "The mental plane (4, 9, 2) is entirely absent from your grid. This is a significant karmic indicator pointing toward the need to develop intellectual rigour, long-range thinking, and the discipline of working with ideas systematically. This does not indicate low intelligence — it indicates that the mind's natural mode may be more intuitive, embodied, or emotional than analytical.",
  },
  "Emotional Plane": {
    strong: "Your emotional plane (3, 5, 7) is fully activated — a rare and powerful combination of Jupiter's wisdom, Mercury's expressiveness, and Ketu's depth. You are likely someone who feels deeply, navigates emotional complexity with grace, and has developed real spiritual perception through lived experience.",
    moderate: "Your emotional plane is moderately active. Some emotional capacities are well-developed, but there may be areas — perhaps in intuition, expression, or spiritual connection — that remain partially developed. These represent specific growth edges.",
    weak: "The emotional plane is lightly activated. Relationships and inner life may sometimes feel difficult to navigate. Developing emotional vocabulary — through therapy, journalling, creative practice, or contemplative study — can significantly expand capacity in this area.",
    veryWeak: "The emotional plane (3, 5, 7) is entirely absent. This is one of the more challenging configurations, as the emotional plane governs the quality of inner life and relational depth. The invitation is substantial: to develop feeling, intuition, and spiritual attunement as conscious practices rather than leaving them to chance.",
  },
  "Physical Plane": {
    strong: "Your physical plane (8, 1, 6) is fully activated — Saturn's discipline, the Sun's vitality, and Venus's relational warmth combine to create exceptional capacity for worldly achievement. You have both the drive to build and the wisdom to sustain what you build over time.",
    moderate: "Your physical plane is moderately active. The capacity for real-world execution is present but may be inconsistent. Identifying which of the three qualities — discipline (8), vitality (1), or relational warmth (6) — is underdeveloped, and deliberately strengthening it, will increase effectiveness considerably.",
    weak: "The physical plane is lightly activated. Translating ideas and intentions into sustained, tangible action may be a recurring challenge. Building physical routines — exercise, structured work habits, and consistent follow-through — directly strengthens this plane.",
    veryWeak: "The physical plane (8, 1, 6) is entirely absent. This is a significant karmic indicator around embodiment and material mastery. There may be a tendency to live primarily in the mind or spirit while the physical world — finances, health, career execution — receives insufficient attention. Grounding practices are essential.",
  },
  "Practical Plane": {
    strong: "Your practical plane (4, 3, 8) is fully activated. You combine structural thinking (4), creative expression (3), and material ambition (8) into a powerful capacity for worldly productivity. You are the person who can both conceive a plan and execute it to completion.",
    moderate: "Your practical plane is moderately active. Execution is generally good but may have gaps — perhaps in creativity within structure, or in the discipline needed to see projects through.",
    weak: "The practical plane is lightly activated. Work may feel like a struggle to sustain momentum, or there may be difficulty translating effort into tangible results. Structured work habits and accountability practices help.",
    veryWeak: "The practical plane (4, 3, 8) is entirely absent. Material productivity — the ability to work consistently and build durable results — is a primary life lesson. External support structures (coaches, systems, accountability partners) can compensate significantly while this capacity is developed internally.",
  },
  "Willpower Plane": {
    strong: "Your willpower plane (9, 5, 1) is fully activated — the diagonal of the determined soul is complete. Mars's compassionate drive (9), Mercury's agility (5), and the Sun's individuality (1) form the most powerful axis of purposeful action in the grid. You are built for the long game.",
    moderate: "Your willpower plane is moderately active. There is genuine determination present, but it may be inconsistent — strong in some contexts, depleted in others. Identifying what drains vs. fuels sustained commitment is key.",
    weak: "The willpower plane is lightly activated. Motivation may feel dependent on external circumstances rather than internal resolve. Building purpose-led practices — clear goals, daily affirmations of commitment, and small wins that build evidence of capability — strengthens this plane.",
    veryWeak: "The willpower plane (9, 5, 1) is entirely absent. The Arrow of Determination is also missing. This is a significant life theme around developing inner drive that is self-sustaining rather than reactive. The work here is both psychological and practical: discovering what genuinely matters, and building the infrastructure to pursue it relentlessly.",
  },
  "Action Plane": {
    strong: "Your action plane (2, 7, 6) is fully activated. Moon's emotional sensitivity (2), Ketu's depth (7), and Venus's relational warmth (6) form a uniquely powerful axis — one that excels at taking thoughtful, relationship-aware action that creates lasting positive impact.",
    moderate: "Your action plane is moderately active. Decision-making is generally good, but there may be moments of hesitation or inconsistency — particularly under emotional pressure.",
    weak: "The action plane is lightly activated. There may be a tendency to over-think before acting, or to let emotional uncertainty delay decisions. Practising decisive small actions builds the muscle for larger ones.",
    veryWeak: "The action plane (2, 7, 6) is entirely absent. Decision-making and execution may be significantly impacted by emotional or intuitive underdevelopment. The invitation is to develop each missing quality — relational awareness (2), inner knowing (7), and harmonising impulse (6) — as deliberate capacities.",
  },
}
