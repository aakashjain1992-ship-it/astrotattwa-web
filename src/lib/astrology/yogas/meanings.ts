/**
 * Per-yoga / per-dosha display copy.
 *
 * Soft, non-fear-based language only (per spec UX rules).
 * Words avoided: dangerous, fatal, destroyed, poverty, curse, doomed, guaranteed.
 *
 * Multi-paragraph text uses \n\n as separator — split in the UI component.
 *
 * `whatItMeans`        — what the yoga supports/shows (2–3 paragraphs)
 * `whyItForms`         — short technical rule statement (single line)
 * `strengthens`        — factors that boost it (2 paragraphs)
 * `weakens`            — factors that reduce it (2 paragraphs)
 * `whenItGivesResults` — dasha/timing guidance (2 paragraphs)
 * `shortMeaning`       — one-line summary used in the free-tier card
 */

import type { YogaCategory, YogaNature, LifeArea } from "./types"

export interface YogaMeaning {
  id: string
  name: string
  category: YogaCategory
  nature: YogaNature
  defaultLifeAreas: LifeArea[]
  whatItMeans: string
  whyItForms: string
  strengthens: string
  weakens: string
  whenItGivesResults: string
  shortMeaning: string
}

export const YOGA_MEANINGS: Record<string, YogaMeaning> = {

  // ─── Pancha Mahapurusha ─────────────────────────────────────────────────────

  ruchaka: {
    id: "ruchaka",
    name: "Ruchaka Yoga",
    category: "mahapurusha",
    nature: "positive",
    defaultLifeAreas: ["career", "health"],
    whatItMeans:
      "Ruchaka Yoga is one of the five Pancha Mahapurusha Yogas formed by Mars. It indicates a strong, direct and action-oriented nature. People with this yoga often show qualities of courage, physical vitality, leadership ability and a competitive drive that helps them stand out in their chosen field.\n\nThis yoga does not simply promise worldly success — it shows a person who is willing to act, take initiative and persist through effort. The results are often visible in careers that require boldness, physical ability, organisational power or the willingness to face challenges directly. Fields like defence, sports, engineering, surgery, law enforcement or independent enterprise often suit this combination.\n\nThe strength of Ruchaka Yoga depends heavily on how well Mars functions in the overall chart. A well-supported Mars can give remarkable results in areas of self-expression, leadership and physical achievement. The yoga also brings a certain energy and confidence that tends to leave an impression on others.",
    whyItForms: "Mars is in a Kendra house and in its own or exalted sign.",
    strengthens:
      "Ruchaka Yoga becomes stronger when Mars is free from serious affliction by Rahu, Ketu or Saturn. A Mars that is placed in its own sign (Aries or Scorpio) or in exaltation (Capricorn) without being heavily aspected by malefics is the ideal condition for this yoga to give clear results.\n\nThe yoga also gains power when the Lagna lord is strong, when Mars rules over important houses in the chart, or when the 10th house and its lord support Mars. If Mars has good directional strength and is in an angular house that is also strengthened by benefic aspects or associations, the results become more visible during planetary periods.",
    weakens:
      "Ruchaka Yoga loses much of its effectiveness when Mars is combust by the Sun, deeply debilitated or placed in a nakshatra that weakens its natural significations. Heavy affliction from Rahu can make the Mars energy erratic or impulsive, reducing the controlled courage and steady leadership that this yoga is meant to give.\n\nSaturn conjunct or aspecting Mars may delay results or bring obstacles before progress. If Mars rules difficult houses in the chart (such as the 6th, 8th or 12th for the Lagna in question) and is simultaneously afflicted, the yoga may give mixed outcomes rather than straightforward success.",
    whenItGivesResults:
      "Ruchaka Yoga tends to give its clearest results during the Mahadasha or Antardasha of Mars. During this period, the qualities associated with Mars — courage, drive, leadership and action — become more active and tend to produce tangible outcomes in career, physical pursuits or any field where initiative matters.\n\nThe yoga may also become more visible when Mars transits important natal positions such as the Lagna, the 10th house or its own placement. Periods when the Lagna lord is also strong by transit can bring the yoga's promise into practical expression. For some charts, results come earlier; for others, full activation may require maturity and sustained effort.",
    shortMeaning: "Supports courage, leadership and vitality.",
  },

  bhadra: {
    id: "bhadra",
    name: "Bhadra Yoga",
    category: "mahapurusha",
    nature: "positive",
    defaultLifeAreas: ["education", "career"],
    whatItMeans:
      "Bhadra Yoga is one of the Pancha Mahapurusha Yogas, formed by Mercury in a strong position. It primarily supports intellectual ability, communication skills, analytical thinking and the capacity to learn, teach, write or work with information effectively. This yoga often shows a person whose mind is sharp, precise and capable of grasping complex ideas.\n\nPeople with this yoga tend to do well in fields that require mental clarity, language, mathematics, logic or detailed work. Journalism, writing, teaching, accounting, research, technology, trade, and consulting are natural areas where this combination can show results. The emphasis is less on physical power and more on the strength of thought and expression.\n\nBhadra Yoga also often brings a quality of practical intelligence — not just theoretical knowledge but the ability to apply ideas usefully. This often helps in business matters, negotiations, planning and any work that requires communication between people or organisations.",
    whyItForms: "Mercury is in a Kendra house and in its own or exalted sign.",
    strengthens:
      "The yoga is strongest when Mercury is not deeply combust by the Sun and is placed in a Kendra (angular) house while in Gemini, Virgo or any sign where it has good dignity. When Mercury is also the lord of important houses for the Lagna and functions as a yogakaraka, its results become more pronounced.\n\nBenefic aspects from Jupiter can add wisdom and broader perspective to Mercury\"s precision. When Mercury rules the 10th or 4th house and is simultaneously in this strong position, the yoga often shows clearly in career success, educational achievement and the ability to build a respected reputation through intellectual work.",
    weakens:
      "Mercury within one degree of the Sun (deeply combust) significantly reduces the effectiveness of Bhadra Yoga. In this condition, Mercury's natural ability to communicate, analyse and express ideas clearly becomes overshadowed by the Sun's heat, often making the native less able to express the yoga's full potential.\n\nMalefic influence from Mars, Saturn or Rahu on Mercury can make the thinking restless, scattered or prone to anxiety. If Mercury rules difficult houses and is simultaneously afflicted, the intelligence may work in complex directions rather than producing clear and constructive results.",
    whenItGivesResults:
      "Bhadra Yoga gives its clearest results during Mercury Mahadasha or Antardasha. This is often a period of significant intellectual activity — writing, studying, communicating, travelling for work, building professional skills or achieving recognition for analytical ability.\n\nTransits of Mercury over the Lagna, 10th house or natal Mercury can also activate this yoga. For students, Mercury periods often bring educational milestones. For professionals, they often coincide with career growth in fields that use Mercury's natural significations. The age of early to mid-adulthood is when many people with strong Bhadra Yoga begin to see its practical expression.",
    shortMeaning: "Supports intellect, learning and communication.",
  },

  hamsa: {
    id: "hamsa",
    name: "Hamsa Yoga",
    category: "mahapurusha",
    nature: "positive",
    defaultLifeAreas: ["spirituality", "wealth", "family"],
    whatItMeans:
      "Hamsa Yoga is formed by Jupiter in a strong position and is considered one of the most auspicious of the Pancha Mahapurusha Yogas. It supports wisdom, ethical conduct, generosity, a sense of higher purpose and the ability to inspire and guide others. This yoga brings qualities of refinement, sincerity and a natural orientation towards truth and fairness.\n\nPeople with this yoga often develop a sense of moral clarity that others recognise and respect. They may work as teachers, advisors, philosophers, counsellors, religious or spiritual leaders, doctors, judges or in any field where wisdom, ethics and the ability to hold a broader view are valuable. Wealth, family comfort and social respect often accompany this yoga when Jupiter is strong.\n\nHamsa Yoga is also associated with a certain grace in how the person moves through life — they tend to be well-regarded, receive support from good people around them, and often have a natural ability to see what is right in complex situations. It is a yoga that develops with age and deeper experience.",
    whyItForms: "Jupiter is in a Kendra house and in its own or exalted sign.",
    strengthens:
      "Hamsa Yoga becomes significantly stronger when Jupiter is unafflicted by Rahu, Ketu or Saturn and is placed in Cancer (exaltation), Sagittarius or Pisces (own signs) in an angular house. When Jupiter is also the Lagna lord or rules important trikona houses for the chart, its results deepen.\n\nBenefic associations or aspects from Venus or Mercury can add refinement and balance to Jupiter's wisdom. When the 9th house and its lord are also strong, the yoga combines both fortune and wisdom, making the native someone who benefits from good guidance in life and who also naturally serves as a guiding presence for others.",
    weakens:
      "The presence of Rahu in the same sign as Jupiter (Guru Chandal formation) significantly reduces the purity of Hamsa Yoga. In this case, Jupiter's wisdom may become unorthodox, questioning or entangled with ego-driven or worldly desires rather than expressing its clear, ethical and spiritual nature.\n\nJupiter retrograde in a sign where it is not naturally strong may also reduce the yoga's clarity. If Jupiter is debilitated (Capricorn) or in an enemy sign with malefic aspects, the yogic potential may express more weakly or unevenly. The practical benefits of wealth, guidance and social respect may still appear but often with complications or delays.",
    whenItGivesResults:
      "Hamsa Yoga gives its most visible results during Jupiter Mahadasha or Antardasha. This period often brings recognition, growth in career or education, support from wise people, important relationships, or significant spiritual or philosophical development.\n\nFor many people with this yoga, Jupiter's period also coincides with marriage, the birth of children, or the beginning of a respected career. The yoga tends to mature with time — the older the person is when Jupiter's period runs, the more crystallised and meaningful the results often become.",
    shortMeaning: "Supports wisdom, ethics and refined character.",
  },

  malavya: {
    id: "malavya",
    name: "Malavya Yoga",
    category: "mahapurusha",
    nature: "positive",
    defaultLifeAreas: ["marriage", "wealth", "health"],
    whatItMeans:
      "Malavya Yoga is formed by Venus in a strong angular position and is one of the five Pancha Mahapurusha Yogas. It supports beauty, refinement, comfort, artistic talent, harmonious relationships and an appreciation for the finer qualities in life. This yoga often shows a person with good taste, a pleasant manner and the ability to create beauty or comfort in their environment.\n\nPeople with Malavya Yoga often have an attractive personal quality that draws others to them. They may work in fields connected to beauty, art, design, music, entertainment, relationships, luxury goods, hospitality or any area that involves aesthetic value and the bringing of pleasure or comfort to others. Financial stability and material comfort often accompany this yoga when Venus is strong.\n\nMarriage and partnerships are often important channels for this yoga's expression. The person tends to value harmony in relationships and often has the social grace to maintain them. They generally understand how to navigate personal and professional relationships with care and tact.",
    whyItForms: "Venus is in a Kendra house and in its own or exalted sign.",
    strengthens:
      "Malavya Yoga is strongest when Venus is not combust by the Sun and is placed in Taurus, Libra (own signs) or Pisces (exaltation) in a Kendra house. When Venus also rules important houses such as the 7th, 2nd or 9th for the chart, its results become more pronounced.\n\nBenefic aspects from Jupiter can add wisdom and ethical depth to Venus's natural qualities of enjoyment and relationship. A strong 7th house and its lord further supports the relationship dimension of this yoga. When the chart overall has good benefic influence, Malavya Yoga is able to express its full range of comfort, beauty and harmonious connection.",
    weakens:
      "Venus combust by the Sun loses the independent expression that Malavya Yoga requires. In this state, Venus may be present in the right house and sign but unable to fully express its qualities, which can reduce the clarity of the yoga's results in relationships and material matters.\n\nMalefic aspects from Mars, Saturn or Rahu can make Venus's energy more conflicted or difficult to express smoothly. If Venus rules difficult houses and is simultaneously afflicted, the areas of relationship and comfort may come with complications, delays or periods of instability rather than the ease that this yoga typically supports.",
    whenItGivesResults:
      "Malavya Yoga gives its clearest results during Venus Mahadasha or Antardasha. This is often a period of significant relationship activity — marriage, romantic partnerships, artistic success, financial gains through Venus-related fields or the building of a comfortable and pleasant life.\n\nTransits of Venus over the Lagna, 7th house or natal Venus often coincide with important relationship events or aesthetic achievements. For many people with this yoga, the Venus period is remembered as one of the more enjoyable or satisfying phases of life, marked by social activity, creative expression and personal fulfilment.",
    shortMeaning: "Supports comfort, beauty and harmonious relationships.",
  },

  shasha: {
    id: "shasha",
    name: "Shasha Yoga",
    category: "mahapurusha",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth"],
    whatItMeans:
      "Shasha Yoga is formed by Saturn in a powerful angular position and is one of the Pancha Mahapurusha Yogas. It supports discipline, endurance, strategic thinking, authority built through effort and the ability to sustain consistent work over long periods. This yoga often shows a person who rises through persistence, systematic effort and a deep understanding of how to work within structures and systems.\n\nPeople with this yoga may appear reserved or serious, but they possess inner strength and the capacity to handle responsibility. They often reach positions of authority or leadership not through sudden luck but through patient accumulation of experience and capability. Fields like administration, law, politics, agriculture, real estate, mining, management and any long-term enterprise often suit this combination well.\n\nShasha Yoga is also associated with a certain authority over subordinates, workers or the masses. People with this yoga often know how to manage resources and people efficiently. Their success tends to compound over time as each achievement builds on the previous one.",
    whyItForms: "Saturn is in a Kendra house and in its own or exalted sign.",
    strengthens:
      "Shasha Yoga becomes strongest when Saturn is placed in Capricorn or Aquarius (own signs) or in Libra (exaltation) in an angular house, free from serious affliction. When Saturn is also the Lagna lord or rules important houses and functions well for the chart, its authority-giving nature becomes more reliable.\n\nWhen Saturn receives benefic aspects, particularly from Jupiter, its discipline becomes tempered with fairness and wisdom. A strong 10th house and its lord further support the career-building dimension of this yoga. For charts where Saturn naturally governs beneficial houses, the results of Shasha Yoga can be both long-lasting and deeply satisfying.",
    weakens:
      "Shasha Yoga is weakened when Saturn is in a difficult sign, under heavy pressure from both the Sun and Mars, or placed in a chart where Saturn's house rulerships make it a natural malefic for the Lagna. In these conditions, Saturn's energy may create more obstacles, delays and frustration before results arrive.\n\nSaturn retrograde, while not inherently harmful, can slow the yoga's expression. In certain charts, Saturn's conjunction with the Sun (creating a combust or closely squared energy) can bring significant delays to career growth and recognition even when the yoga is technically present.",
    whenItGivesResults:
      "Shasha Yoga gives its most substantial results during Saturn Mahadasha or Saturn Antardasha. These periods tend to be ones of significant work, responsibility and the building of a lasting foundation. Career achievement, land acquisition, authority positions and long-term projects often come to fruition during Saturn's periods.\n\nBecause Saturn's major period comes relatively late in life for many people, the results of Shasha Yoga are often most visible in middle age or beyond. This is consistent with the yoga's nature — discipline, patience and accumulated effort eventually produce results that are durable and socially recognised.",
    shortMeaning: "Supports discipline, endurance and lasting authority.",
  },

  // ─── Moon Yogas ─────────────────────────────────────────────────────────────

  gajaKesari: {
    id: "gajaKesari",
    name: "Gaja-Kesari Yoga",
    category: "moon",
    nature: "positive",
    defaultLifeAreas: ["education", "career", "emotional_life", "spirituality"],
    whatItMeans:
      "Gaja-Kesari Yoga is formed when Jupiter is in a Kendra position from the Moon. The name means \"elephant and lion\" — two symbols of strength, dignity and natural authority. This yoga supports wisdom, emotional maturity, a sense of purpose and the capacity to earn genuine respect from those around the native.\n\nThis yoga often shows a person with good judgement, a natural generosity and the ability to guide or inspire others. The qualities it supports — wisdom, honesty, social reputation and the capacity to learn from life — tend to deepen with age and genuine experience rather than arrive all at once. The emotional dimension is important here: the Moon represents the mind, and Jupiter's positive connection with it often brings emotional stability, hope and a broadly positive orientation to life.\n\nThe areas of education, career growth, social respect and the capacity to build meaningful relationships all benefit from this yoga. It is considered a background supporting influence that helps the native navigate life with more wisdom and less reactivity than they might otherwise have.",
    whyItForms: "Jupiter is placed in a Kendra from the Moon.",
    strengthens:
      "The yoga gains strength when both Jupiter and the Moon are well-placed, unafflicted and functioning as natural or functional benefics for the chart. When Jupiter is in a sign of dignity (Cancer, Sagittarius, Pisces) and the Moon is strong by sign and phase (near full Moon), the combination becomes significantly more effective.\n\nWhen the yoga forms in the 1st, 4th, 7th or 10th from the Lagna as well as from the Moon, its reach extends into both personal character and public expression. A strong Lagna lord in this configuration can make the yoga quite visible in the native's social and professional life.",
    weakens:
      "Affliction of either Jupiter or the Moon reduces this yoga's effectiveness. When Jupiter is with Rahu (Guru Chandal), its wisdom becomes distorted and the supportive quality it would normally offer the Moon is weakened. Similarly, a debilitated or heavily afflicted Moon reduces the foundation on which Jupiter's guidance can build.\n\nThe yoga is also weakened if Jupiter rules difficult houses for the Lagna in question and is simultaneously afflicted. In such cases, the wisdom and reputation it promises may arrive with complications, delays or require conscious effort to develop rather than manifesting naturally.",
    whenItGivesResults:
      "Gaja-Kesari Yoga gives its most noticeable results during Jupiter or Moon Mahadasha or Antardasha. Jupiter periods in particular often bring recognition, important relationships, educational milestones, spiritual growth or the kind of social standing that reflects the yoga's promise of respect and wisdom.\n\nBecause the Moon governs daily mood and short-term experience, Moon periods may bring more frequent moments of the yoga's quality — emotional clarity, good advice from others, or situations where the native's wisdom and character are tested and recognised. The yoga tends to be more subtle but consistent throughout life rather than explosive in any one period.",
    shortMeaning: "Supports wisdom, guidance and public respect.",
  },

  sunapha: {
    id: "sunapha",
    name: "Sunapha Yoga",
    category: "moon",
    nature: "positive",
    defaultLifeAreas: ["wealth", "career"],
    whatItMeans:
      "Sunapha Yoga is formed when a planet other than the Sun occupies the second house from the Moon. The Moon is the significator of the mind and resources, and a planet placed just ahead of it in the second house provides strong support for the accumulation of wealth, skill and self-reliance.\n\nThis yoga indicates a person with good earning potential, practical intelligence and the capacity to build financial security through their own efforts. The specific qualities it supports depend on which planet forms the yoga — Mercury here adds intellectual or commercial ability, Venus adds artistic or relational wealth-building, Mars adds enterprise and energy, Jupiter adds wisdom and opportunity, and Saturn adds endurance and systematic accumulation.\n\nSunapha is often described as a yoga that supports self-made success. The person does not necessarily rely on inherited wealth or others' support — they develop their own resources through initiative, skill and consistent effort over time.",
    whyItForms: "A planet other than the Sun occupies the 2nd from the Moon.",
    strengthens:
      "The yoga becomes stronger when the planet in the second from the Moon is well-placed by sign, free from malefic affliction and connected with wealth-supporting houses in the chart. If the same planet also aspects or connects with the 11th house lord or the 2nd house from the Lagna, the financial potential is reinforced from multiple directions.\n\nMultiple benefics in the second from the Moon make the yoga especially effective, creating layers of financial support. When the Moon itself is strong by sign and phase, the overall combination becomes more reliable as a source of consistent financial growth.",
    weakens:
      "When only malefics form this yoga — that is, when only Mars, Saturn or the nodes occupy the second from the Moon without benefic support — the financial support may come with more struggle, instability or effort before results arrive. The yoga still exists but its expression becomes more complex.\n\nAny planet forming this yoga that is simultaneously debilitated or heavily afflicted reduces the effectiveness of the combination. The yoga's promise may still activate during planetary periods, but the results may arrive with more resistance or require greater persistence.",
    whenItGivesResults:
      "Sunapha Yoga activates most clearly during the Mahadasha or Antardasha of the Moon or of the planet forming the yoga. During these periods, financial activity often increases — through better income, professional opportunities, skill development or the building of valuable resources and assets.\n\nEven outside these specific periods, Sunapha Yoga tends to be a steady background support for financial capability. People with this yoga often develop strong practical skills and financial awareness that serve them throughout life, with the clearest gains appearing when related planetary periods run.",
    shortMeaning: "Supports earned prosperity and resourcefulness.",
  },

  anapha: {
    id: "anapha",
    name: "Anapha Yoga",
    category: "moon",
    nature: "positive",
    defaultLifeAreas: ["wealth", "health", "emotional_life"],
    whatItMeans:
      "Anapha Yoga is formed when a planet other than the Sun occupies the twelfth house from the Moon. The twelfth from any planet represents what lies behind or beneath it — its inner resources, retreat, rest and the sense of having support in reserve. A planet in this position relative to the Moon provides a kind of emotional comfort, spiritual support or background security.\n\nThis yoga supports good health, emotional resilience, a comfortable personal life and a reputation that develops naturally through genuine relationships and honest conduct. The specific quality of support depends on which planet forms the yoga, but in general Anapha indicates someone who has inner resources to draw upon — they are not easily depleted by life's demands.\n\nThe yoga often shows a person with good personal habits, a degree of contentment and a quiet ability to recover from difficulties. Relationships, both personal and professional, often provide a source of stability and support for people with this yoga.",
    whyItForms: "A planet other than the Sun occupies the 12th from the Moon.",
    strengthens:
      "When natural benefics such as Jupiter or Venus occupy the twelfth from the Moon, the yoga becomes especially supportive for emotional well-being, health and reputation. A benefic here tends to give a certain inner ease and makes the person less reactive to outer pressures.\n\nThe yoga gains additional strength when the planet forming it is well-placed by sign and dignity, and when the Moon itself is strong. If the forming planet also connects with important houses in the overall chart, its supportive quality extends across more areas of life.",
    weakens:
      "When only natural malefics form this yoga without any balancing benefic support, the sustaining energy behind the Moon becomes more taxing than supportive. The person may feel the need to work harder to maintain equilibrium, or may find that personal rest and renewal are areas requiring more attention.\n\nA planet that is simultaneously debilitated or heavily afflicted in the twelfth from the Moon reduces the yoga's positive effect. The background support still exists in some form but may be less reliable or more conditional in its expression.",
    whenItGivesResults:
      "Anapha Yoga gives its clearest results during the Moon Mahadasha or Antardasha, or during the period of the planet forming the yoga. These periods often bring improvements in personal life, health matters, emotional stability or a quieter but genuine growth in comfort and reputation.\n\nThe yoga tends to work as a steady influence rather than a dramatic one. People may notice over time that they have more inner resources than they expected, or that their personal life has a certain ease and satisfaction that the yoga quietly supports throughout different phases of life.",
    shortMeaning: "Supports comfort, health and good reputation.",
  },

  durudhura: {
    id: "durudhura",
    name: "Durudhura Yoga",
    category: "moon",
    nature: "positive",
    defaultLifeAreas: ["wealth", "family", "emotional_life"],
    whatItMeans:
      "Durudhura Yoga is formed when planets other than the Sun occupy both the second and the twelfth houses from the Moon. The Moon is hemmed in on both sides by planetary influence, which creates a particularly well-supported mental and emotional environment. The name suggests abundance and a general sense of being held and resourced from multiple directions.\n\nThis yoga indicates good mental support, strong material resources, helpful companions and an overall favourable environment for personal and financial development. The person is rarely without support — there are usually relationships, resources or circumstances that provide stability and comfort even through challenging phases.\n\nThe quality of Durudhura depends on which planets surround the Moon. Benefics on both sides create the most positive version of this yoga, supporting emotional comfort, wealth and harmonious relationships. The combination of Sunapha and Anapha working together gives it a synergistic quality.",
    whyItForms: "Planets other than the Sun occupy both the 2nd and the 12th from the Moon.",
    strengthens:
      "The yoga is strongest when natural benefics — Jupiter, Venus or Mercury — occupy both flanking positions. In this case, the Moon is surrounded by constructive influences that support wisdom (Jupiter), comfort (Venus) or practical intelligence (Mercury), creating a particularly well-rounded and protected mental foundation.\n\nWhen the Moon itself is strong by sign and phase, and when the flanking planets are also strong and well-placed in the overall chart, the yoga's promise of material support, good company and emotional stability becomes much more reliable and consistent.",
    weakens:
      "When only malefics surround the Moon, the yoga becomes complex — support exists from multiple directions but it comes with pressure, challenge or the need to work through difficult energy before receiving its benefits. The person may still accumulate resources and connections but the path may involve more effort and conflict.\n\nIf the flanking planets are debilitated, heavily combust or afflicted, the yoga's supportive quality is reduced. In this case, the surrounding influence may bring more burden than comfort, though the basic structure of dual-sided support still distinguishes this from a completely isolated Moon.",
    whenItGivesResults:
      "Durudhura Yoga activates during the Moon period as well as during the periods of either or both flanking planets. These tend to be times when material circumstances improve, relationships deepen or the native experiences a greater sense of being supported in both practical and emotional terms.\n\nBecause the yoga involves the Moon (mind and emotions) being supported from both directions, its effects can be felt across different areas — from financial security to personal relationships to a general sense of psychological well-being. The yoga's influence is often steadier and more sustained than other yogas that express sharply and then fade.",
    shortMeaning: "Supports overall well-being around the mind and resources.",
  },

  kemadruma: {
    id: "kemadruma",
    name: "Kemadruma Yoga",
    category: "moon",
    nature: "challenging",
    defaultLifeAreas: ["emotional_life", "family"],
    whatItMeans:
      "Kemadruma Yoga is formed when no planets other than the Sun occupy the second or twelfth houses from the Moon, leaving the Moon without flanking support. The Moon represents the mind, emotions and sense of inner comfort, and when it stands alone in this way, it can indicate a tendency towards emotional independence that sometimes becomes self-reliance from necessity rather than choice.\n\nThis pattern may show a person who has learned to rely on their own inner resources more than most. There can be periods of feeling unsupported, emotionally isolated or as though one must manage challenges without the level of help that others seem to receive. However, this same quality often develops inner strength, resilience and a deep capacity for self-sufficiency.\n\nIt is important to note that Kemadruma Yoga has many cancellation conditions, and its intensity varies greatly depending on the rest of the chart. When the Moon receives Jupiter's aspect, when the Moon is strong by placement in a Kendra, or when there are planets in Kendra from the Lagna alongside the Moon, the challenging dimension of this yoga is significantly reduced.",
    whyItForms: "No planets (other than the Sun and nodes) occupy the 2nd or 12th from the Moon.",
    strengthens:
      "Kemadruma's challenging influence becomes more noticeable when the Moon is simultaneously debilitated, in a weak nakshatra, near new Moon phase, or in the eighth or twelfth house from the Lagna without benefic support. In this condition, the isolation of the Moon compounds with its other weaknesses.\n\nMalefic aspects to the Moon, particularly from Saturn or Rahu, in the absence of the flanking planets that would normally provide support, can make the emotional dimension of Kemadruma more pronounced. The degree of its influence depends heavily on how much cancellation is present in the overall chart.",
    weakens:
      "The effects of Kemadruma Yoga are significantly reduced when the Moon is in a Kendra house from the Lagna, when Jupiter aspects the Moon, when the Lagna lord is strong, or when there are planets in Kendra from the Moon even if not in the second or twelfth.\n\nA strong Moon by sign (Taurus exaltation, Cancer own sign) or a well-placed Moon near full phase has enough natural brightness to mitigate much of this yoga's challenge. The yoga's impact on the overall life is highly variable, and many people with Kemadruma live fulfilling lives with this pattern present, particularly when the rest of the chart is strong.",
    whenItGivesResults:
      "Kemadruma's influence tends to be most noticeable during Moon Mahadasha or Antardasha, or during periods of any planet that afflicts the Moon in the natal chart. During these phases, themes of emotional independence, the need for self-reliance or a feeling of walking a more solitary path may become more conscious.\n\nHowever, these same periods can also be ones of genuine inner development — the native may discover reserves of strength and capability that external support had previously made unnecessary. The challenging dimension of this yoga often softens meaningfully after the person reaches middle age and has built their own sense of identity and inner security.",
    shortMeaning: "May show emotional self-reliance and inner pressure.",
  },

  // ─── Conjunction Yogas ──────────────────────────────────────────────────────

  budhaditya: {
    id: "budhaditya",
    name: "Budhaditya Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["education", "career", "emotional_life"],
    whatItMeans:
      "Budhaditya Yoga is formed when the Sun and Mercury are in the same sign. The Sun represents the core self, authority and the capacity for clear purpose, while Mercury represents intelligence, communication, analysis and the ability to learn and express ideas. Their combination creates a person whose intellect and sense of identity are closely aligned — they think and communicate from a place of clear personal conviction.\n\nThis yoga supports sharp thinking, confident communication, good decision-making and the capacity to express ideas clearly and persuasively. People with this yoga often develop strong individual opinions and a direct way of expressing them. They tend to be effective in fields where intelligence, authority and communication work together — teaching, writing, law, management, public speaking, advisory roles, administration and technology are all areas where this combination can shine.\n\nThe strength of this yoga depends on how well Mercury is placed relative to the Sun. A mild combustion (where Mercury is close to but not overpowered by the Sun) still allows the yoga to function well. The yoga is most effective when it operates in a house that has strong natural significations aligned with Mercury's qualities.",
    whyItForms: "Sun and Mercury are in the same sign.",
    strengthens:
      "Budhaditya Yoga gains strength when Mercury is not within one degree of the Sun (avoiding deep combustion) and when both planets are placed in a strong house from the Lagna. The 1st, 2nd, 4th, 5th, 9th, 10th and 11th houses are particularly supportive positions for this combination.\n\nWhen Mercury rules an important house for the Lagna (such as the 1st, 5th, 9th or 10th) and the Sun also holds a positive relationship to the overall chart, the yoga's results become more pronounced. Benefic aspects from Jupiter add the quality of wisdom and ethical direction to the intelligence this yoga produces.",
    weakens:
      "Deep combustion — Mercury within one degree of the Sun — is the primary weakening factor for Budhaditya Yoga. At this degree of closeness, Mercury's independent analytical ability is absorbed into the Sun's energy, and the yoga's capacity for clear communication and objective thinking can become less accessible.\n\nIf both the Sun and Mercury are placed in difficult houses or are simultaneously afflicted by malefics, the yoga's positive expression is constrained. The intelligence may still be present but it may express through challenges, conflicts or areas of life that are more demanding than rewarding.",
    whenItGivesResults:
      "Budhaditya Yoga gives its clearest results during Sun or Mercury Mahadasha or Antardasha. Sun periods often bring recognition, authority and clarity of purpose. Mercury periods bring intellectual achievement, communication success, professional skill-building and the activation of the yoga's analytical dimension.\n\nFor students, this yoga is often most visible during educational phases. For professionals, Mercury and Sun periods frequently bring career growth through intellectual competence and the ability to express ideas effectively to important audiences.",
    shortMeaning: "Supports intelligence, communication and confidence.",
  },

  guruChandal: {
    id: "guruChandal",
    name: "Guru Chandal Yoga",
    category: "general",
    nature: "challenging",
    defaultLifeAreas: ["spirituality", "education", "family"],
    whatItMeans:
      "Guru Chandal Yoga is formed when Jupiter is in the same sign as Rahu or Ketu. Jupiter is the planet of wisdom, ethics, higher learning and clear moral understanding. Rahu and Ketu represent the karmic axis of desire, illusion and unconventional experience. Their meeting in the same sign creates a complex interaction between pure wisdom and the world's more ambiguous, boundary-crossing energies.\n\nThis yoga does not simply damage Jupiter's wisdom — it complicates it. The person may question traditional or inherited beliefs, seek wisdom outside conventional frameworks, or find that their path of learning and spiritual development is unconventional and sometimes contradictory. They may reject guidance that others accept without question, preferring to find their own truth through direct experience rather than received doctrine.\n\nFor some people, Guru Chandal Yoga leads to genuine independent wisdom — a hard-won understanding developed outside traditional systems. For others, it can show a pattern of being misled by false teachers, holding unconventional beliefs that create difficulties, or going through periods where the moral compass feels unclear. The outcome depends greatly on the rest of the chart, Jupiter's strength and the orb between Jupiter and the node.",
    whyItForms: "Jupiter is in the same sign as Rahu or Ketu.",
    strengthens:
      "The challenging dimension of this yoga is more pronounced when Jupiter and the node are within a tight orb (within five degrees), when Jupiter is the natural significator of important areas of the chart, and when there is no benefic aspect to provide grounding and clarity.\n\nWhen Jupiter is also in a sign where it is not comfortable (Capricorn, or a sign ruled by an inimical planet) and is simultaneously with Rahu or Ketu without support, the questioning of values and the tendency towards unconventional or contradictory thinking becomes more noticeable.",
    weakens:
      "The yoga's challenging dimension is significantly reduced when the orb between Jupiter and the node is wide (more than ten degrees in the same sign), when Jupiter receives beneficial aspects from natural benefics such as Venus or Mercury, or when Jupiter's sign and house position are strong.\n\nA strong Lagna lord, a well-placed 5th house and the absence of other afflicting factors can mean that Jupiter's wisdom, despite the node's proximity, retains much of its natural quality. In such charts, the yoga may show more as an independent or non-traditional philosophical approach rather than as genuine confusion or moral ambiguity.",
    whenItGivesResults:
      "The effects of Guru Chandal Yoga are most noticeable during Jupiter Mahadasha or Antardasha, or during the periods of Rahu or Ketu. These phases often bring questioning of beliefs, encounters with teachers or guides who may be unusual or whose guidance may be difficult to evaluate clearly.\n\nFor some people, Rahu's period brings a phase of exploration and boundary-crossing that eventually leads to deeper wisdom. For others, it brings situations where discernment about what is genuinely beneficial versus what only appears so becomes a central lesson. Working with a thoughtful guide or mentor during these periods can help navigate this yoga's more complex dimensions.",
    shortMeaning: "May indicate non-traditional thinking around wisdom.",
  },

  // ─── Vipreet Raja ───────────────────────────────────────────────────────────

  harsha: {
    id: "harsha",
    name: "Harsha Vipreet Raj Yoga",
    category: "vipreet_raja",
    nature: "positive",
    defaultLifeAreas: ["health", "career"],
    whatItMeans:
      "Harsha Vipreet Raj Yoga is formed when the lord of the 6th house — the house associated with enemies, obstacles, competition, illness and service — is placed in one of the difficult houses (6th, 8th or 12th). The principle of Vipreet Raj Yoga is that when a difficult house lord is placed in another difficult house, its capacity to create problems for the native is reduced, and the difficult energy turns inward upon itself rather than outward.\n\nThe result is that the native tends to have a certain resilience against competition and opposition. Enemies and rivals may neutralise each other or fail to cause lasting harm. Health challenges, when they occur, often resolve through the native's own strength rather than becoming chronic. There can be a remarkable ability to survive difficult circumstances and emerge from them with greater capacity than before.\n\nHarsha Yoga is associated with a kind of quiet confidence that comes from having faced opposition and discovered that one can manage it. The native is not necessarily free from challenge, but they develop the resilience and strategic awareness to handle adversity in ways that ultimately serve their growth.",
    whyItForms: "The 6th-house lord is placed in the 6th, 8th or 12th house.",
    strengthens:
      "This yoga becomes stronger when the 6th lord is well-placed by sign in the house it occupies, when it receives supportive aspects, and when the overall 6th house area (competition, service, health) is an important arena for the native's life. A strong 6th lord that then turns against itself tends to produce clearer results.\n\nWhen the 1st house and its lord are also strong, the native has the personal vitality and resilience needed to benefit fully from this yoga. The combination of a self-directed 6th house energy and a strong personal foundation creates someone who manages adversity with uncommon effectiveness.",
    weakens:
      "If the 6th lord is simultaneously a powerful benefic for the chart and is placed in a very sensitive position, the Vipreet Raja principle may not apply as cleanly. The yoga works on the basis that a challenging house lord confined to a difficult house loses its power to harm — if that lord is also important for good results, its confinement may reduce those positive effects along with the negative.\n\nA heavily afflicted 6th lord in the difficult house it occupies may create complex results — the Vipreet principle may still operate but with more turbulence in the process. The results may come after a period of genuine difficulty rather than arriving smoothly.",
    whenItGivesResults:
      "Harsha Yoga tends to give its most visible results during the Mahadasha or Antardasha of the 6th lord. During these periods, the native may find that obstacles clear, rivals fail, health issues that had been present resolve, or that they succeed in competitive situations in ways that surprised even themselves.\n\nThere can be periods during 6th lord periods where things appear more difficult before they improve — the Vipreet principle often involves going through the difficult house energy before the turnaround happens. Patience and sustained effort during these periods typically lead to the yoga's positive expression.",
    shortMeaning: "Supports resilience and rise after challenge.",
  },

  sarala: {
    id: "sarala",
    name: "Sarala Vipreet Raj Yoga",
    category: "vipreet_raja",
    nature: "positive",
    defaultLifeAreas: ["health", "career", "spirituality"],
    whatItMeans:
      "Sarala Vipreet Raj Yoga is formed when the lord of the 8th house — associated with transformation, hidden matters, longevity, inheritance and sudden change — is placed in the 6th, 8th or 12th house. By being confined to a difficult house, the 8th lord's disruptive energy turns inward rather than creating external crises, and in doing so it often supports longevity, resilience in the face of sudden change and the capacity to navigate hidden or complex matters.\n\nPeople with this yoga often have a natural understanding of depth, transformation and what lies beneath the surface of experience. They may work with hidden knowledge, research, occult sciences, medicine, psychology, healing or any field that requires navigating complexity and uncertainty. Their capacity to survive and even benefit from difficult transitions is often remarkable.\n\nSarala Yoga also often shows a person who does not fear the kind of change that frightens others. Their experience of transformation — whether in their own life or in their understanding of the world — often becomes a source of unusual insight and capability that distinguishes them from their peers.",
    whyItForms: "The 8th-house lord is placed in the 6th, 8th or 12th house.",
    strengthens:
      "The yoga becomes stronger when the 8th lord is well-supported by benefic aspects, particularly from Jupiter, which adds wisdom and protection to the transformative energy. A strong placement for the 8th lord within the difficult house it occupies can make the yoga's positive dimension clearer.\n\nWhen the 1st house, its lord and the overall longevity indicators in the chart are strong, Sarala Yoga operates within a framework of fundamental vitality that allows the transformation theme to be navigated productively. The combination of 8th house depth and personal resilience is what makes this yoga most effective.",
    weakens:
      "If the 8th lord is placed in the 8th house from the Lagna and is simultaneously deeply afflicted — particularly by Mars or Saturn — without any protective factors, the complex energy of the 8th house does not turn inward cleanly. Instead, it may create ongoing periods of turbulence or unexpected disruption.\n\nThe yoga also works less cleanly when the 8th lord rules another important benefic house for the Lagna. In that case, placing it in a difficult house removes it from its capacity to give positive results for that house, creating a trade-off between the Vipreet benefit and the loss of a positive house lord.",
    whenItGivesResults:
      "Sarala Yoga gives its most characteristic results during the Mahadasha or Antardasha of the 8th lord. These periods often involve navigating significant change, hidden matters, unexpected circumstances or a deep personal transformation that ultimately strengthens rather than weakens the native.\n\nFor many people with this yoga, the 8th lord period is remembered as one of the most intense but ultimately transformative phases of life. What initially appears as disruption or complexity often reveals itself in retrospect as a period of deep growth and the development of capabilities that serve the native for many years after.",
    shortMeaning: "Supports transformation and uncommon depth.",
  },

  vimala: {
    id: "vimala",
    name: "Vimala Vipreet Raj Yoga",
    category: "vipreet_raja",
    nature: "positive",
    defaultLifeAreas: ["wealth", "spirituality"],
    whatItMeans:
      "Vimala Vipreet Raj Yoga is formed when the lord of the 12th house — associated with expenditure, foreign places, isolation, spiritual retreat and liberation — is placed in the 6th, 8th or 12th house. The 12th house lord confined to a difficult house reduces the draining quality of 12th house energy and can convert excessive expenditure or loss into a more sustainable relationship with resources.\n\nThis yoga supports a certain contentment with what one has, the ability to spend wisely, a natural orientation towards spiritual or philosophical inquiry and a life that is not constantly burdened by excessive outgoings or material dissatisfaction. The person often develops a quiet wisdom about the true value of things rather than chasing accumulation for its own sake.\n\nVimala Yoga also often supports the ability to work well in foreign places, isolated environments, hospitals, retreat centres, ashrams or any setting that requires a comfortable relationship with solitude and inner life. People with this yoga sometimes find that their greatest fulfilment comes through service, spiritual practice or working behind the scenes rather than in the spotlight.",
    whyItForms: "The 12th-house lord is placed in the 6th, 8th or 12th house.",
    strengthens:
      "The yoga becomes stronger when the 12th lord receives benefic aspects, particularly from Jupiter, adding wisdom and positive spiritual orientation to the 12th house energy. A 12th lord placed in the 12th itself (own house) in a sign of good dignity often produces the clearest version of this yoga.\n\nWhen the native has a genuinely spiritual inclination or works in service-oriented fields, Vimala Yoga supports that path effectively. A strong Lagna and Lagna lord ensure that the yoga's inner-directed quality does not drain the person's overall vitality but instead enriches their inner life.",
    weakens:
      "If the 12th lord is also the lord of an important benefic house for the Lagna and is placed in a difficult house, some of the positive significations of that benefic house may be weakened along with the 12th house's draining quality. The trade-off needs to be evaluated in the context of the whole chart.\n\nA heavily afflicted 12th lord in the difficult house it occupies may produce more complex results — the reduction of 12th house problems happens alongside more turbulence in the difficult house it actually sits in. The yoga still operates but the path to its positive expression may involve navigating more difficulty than the ideal version of the yoga suggests.",
    whenItGivesResults:
      "Vimala Yoga tends to give its most characteristic results during the Mahadasha or Antardasha of the 12th lord. These periods often bring a drawing inward — spiritual inquiry, foreign travel, service work or the kind of expenditure that turns out to be meaningful rather than wasteful.\n\nFor people on a spiritual path, the 12th lord period can be deeply significant — a time of retreat, inner work and the development of understanding that has lasting value. For those in worldly life, these periods often bring a greater appreciation of simplicity, contentment and the value of what they already have.",
    shortMeaning: "Supports financial wisdom and contentment.",
  },

  // ─── Raja / Dhana ───────────────────────────────────────────────────────────

  rajYoga9_10: {
    id: "rajYoga9_10",
    name: "Raj Yoga (9th-10th Lord)",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth", "family"],
    whatItMeans:
      "Raj Yoga formed by the connection of the 9th and 10th house lords is considered one of the most powerful yoga formations in a chart. The 9th house represents dharma — one's higher purpose, spiritual merit, fortune and father — while the 10th house represents karma — one's actions, career, public life and social contribution. When these two house lords are connected, the person's work and their deeper sense of purpose align, creating the conditions for lasting recognition and achievement.\n\nThis yoga supports not just professional success but success that feels meaningful and well-directed. The person often finds that their career path aligns with what they genuinely value, and this alignment makes their work more sustainable and satisfying than achievement pursued purely for external reward. Authority, recognition, a respected reputation and the practical benefits that accompany these are all supported by this yoga.\n\nThe strength and clarity of this yoga varies significantly depending on which planets are involved as the 9th and 10th lords, how strong they are by sign and house, and what kind of connection they share — conjunction, mutual aspect, exchange or placement in each other's houses each give a somewhat different quality to the yoga's expression.",
    whyItForms: "The lords of the 9th and 10th houses are connected by conjunction, aspect, exchange or placement.",
    strengthens:
      "The yoga becomes significantly stronger when both the 9th and 10th lords are strong by sign — in own sign, exaltation or a friendly sign — and are placed in Kendra or Trikona houses. When they are also free from serious affliction, the yoga's promise of authority and recognition becomes much more reliable.\n\nA direct conjunction of the two lords, particularly in a Kendra or Trikona house, is one of the strongest forms of this yoga. When the conjunction also involves the Lagna or has benefic aspects, the personal dimension — the native's identity and purpose — becomes fully woven into the yoga's expression.",
    weakens:
      "The yoga is weakened when one or both of the involved lords is debilitated, combust, placed in a difficult house (6th, 8th or 12th) or heavily afflicted by malefics. In these conditions, the alignment between purpose and action that this yoga supports becomes harder to establish or maintain.\n\nIf the 9th or 10th lord simultaneously rules a difficult house for the Lagna, making it a functional malefic, the yoga becomes more complex — the connection between the houses may still operate, but the lord's dual rulership introduces competing interests that reduce the clarity of the yoga's results.",
    whenItGivesResults:
      "This Raj Yoga gives its clearest results during the Mahadasha or Antardasha of either the 9th or 10th lord. These periods often coincide with significant career milestones, recognition from important people, the establishment of professional authority, or the beginning of a phase where the person's work becomes publicly visible and respected.\n\nThe yoga may also activate during major transits of either lord over the 9th, 10th or 1st house. For some charts, the full expression of this yoga comes in middle age or later, when the person's accumulated experience and purpose have matured sufficiently to produce genuinely lasting recognition.",
    shortMeaning: "Supports career success aligned with purpose.",
  },

  kendraTrikona: {
    id: "kendraTrikona",
    name: "Kendra-Trikona Raj Yoga",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth"],
    whatItMeans:
      "Kendra-Trikona Raj Yoga is formed when a lord of a Kendra house (4th, 7th or 10th) is connected with a lord of a Trikona house (5th or 9th). Kendra houses represent action, structure, and the pillars of practical life — home, relationships and career. Trikona houses represent grace, merit, fortune and the support of life's deeper currents. When their lords connect, the hard work of life (Kendra) meets with genuine good fortune (Trikona), creating conditions for success that is both earned and supported.\n\nThis is considered one of the broadest and most reliable yoga formations in Vedic astrology. It appears in many forms depending on which Kendra and Trikona lords are involved, but in each case the principle is the same: the person's practical efforts are met with proportionate reward, and the areas of life governed by the connected houses tend to develop well together.\n\nThe practical expression of this yoga depends heavily on which specific houses and planets are involved. When important houses of career, wealth, relationship and fortune come together, the yoga tends to produce visible success across multiple areas of life. When the connected houses govern narrower domains, the success may be specific to those domains but still meaningful and real.",
    whyItForms: "A Kendra-house lord (4/7/10) is connected with a Trikona-house lord (5/9).",
    strengthens:
      "Kendra-Trikona Raj Yoga becomes substantially stronger when both lords are strong by sign — in own sign, exaltation or a friendly sign — and when they are placed in houses that are naturally supportive of their significations. A direct conjunction in a strong house, particularly when also aspected by benefics, gives the yoga its most concentrated expression.\n\nWhen the yoga involves the Lagna lord alongside important Kendra and Trikona lords, the native's personal identity becomes part of the yoga's expression, making success more closely tied to who the person fundamentally is rather than just what they do.",
    weakens:
      "The yoga is reduced when either lord is weak by sign, debilitated or placed in a difficult house. A Kendra-Trikona connection that operates through weak or afflicted planets may still bring some results but the outcomes will be more modest and may require greater effort or patience.\n\nWhen the connecting planets are also rulers of difficult houses (6th, 8th or 12th) alongside their Kendra or Trikona ownership, the dual rulership creates a more complex influence that reduces the clarity and strength of the yoga's positive results.",
    whenItGivesResults:
      "Kendra-Trikona Raj Yoga gives its most noticeable results during the Mahadasha or Antardasha of either of the connected lords. During these periods, the areas of life governed by the involved houses tend to improve together — career and fortune, home stability and creative success, relationships and recognition.\n\nBecause this yoga spans both practical (Kendra) and supportive (Trikona) domains, its results often feel like a combination of earned achievement and good fortune arriving together. The person may find that the right opportunities appear at the right time, or that their sustained efforts are recognised in ways that feel both deserved and fortunate.",
    shortMeaning: "Combines effort and grace for success.",
  },

  dharmaKarmadhipati: {
    id: "dharmaKarmadhipati",
    name: "Dharma-Karmadhipati Yoga",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth", "spirituality"],
    whatItMeans:
      "Dharma-Karmadhipati Yoga is the specific and most powerful form of the 9th-10th connection, formed when the lords of the 9th (dharma — right action, fortune, higher purpose) and 10th (karma — action, career, social role) houses are directly connected. This yoga is described in classical texts as particularly significant because it unites the two most important houses for a purposeful and successful life.\n\nPeople with this yoga often develop a career or public role that feels genuinely meaningful to them. They are not simply pursuing status or money — there is a sense of alignment between what they do and why they are doing it. This alignment tends to attract recognition, authority and the kind of sustained success that is difficult to achieve when career and deeper purpose are at odds.\n\nThe yoga also often brings a certain natural ethical quality to the person's work. They tend to approach their professional life with sincerity and a sense of responsibility that others notice and respect. This reputation for integrity often becomes one of their most valuable long-term assets.",
    whyItForms: "The 9th-house lord (dharma) and 10th-house lord (karma) are directly connected.",
    strengthens:
      "The yoga gains significant power when both lords are strong by sign and house, when they connect through direct conjunction or mutual aspect in an important house, and when the Lagna and its lord are also strong. A triple alignment — strong Lagna, strong 9th and strong 10th — creates one of the most reliable foundations for lasting achievement.\n\nWhen the conjunction or aspect forms in a Kendra or Trikona house, particularly the 1st, 4th, 5th, 9th or 10th, the yoga operates with maximum clarity. Additional benefic aspects from Jupiter or Venus can add the dimensions of wisdom, grace and social ease to the yoga's already strong career-supporting foundation.",
    weakens:
      "The yoga is significantly reduced when either the 9th or 10th lord is in a sign of debilitation, heavily combust or afflicted by malefics. In these conditions, the alignment between dharma and karma that this yoga promises becomes difficult to sustain — the person may work hard or have genuine purpose but find that the two do not easily combine to create the success and recognition this yoga describes.\n\nWhen either lord simultaneously rules a difficult house, introducing a malefic dimension alongside the benefic one, the yoga becomes more complex. Success may still come but it may require navigating obstacles, delays or contradictions that would not be present if the lords operated more cleanly.",
    whenItGivesResults:
      "This yoga gives its most characteristic results during the Mahadasha or Antardasha of either the 9th or 10th lord. These periods often bring the clearest moments of professional recognition, purposeful achievement and the establishment of a legacy or reputation that has lasting value.\n\nFor many people with this yoga, the full expression comes when both relevant planetary periods have run — the 9th lord period may establish the philosophical and fortunate foundation while the 10th lord period converts it into visible action and recognition. The combination of the two often marks the most productive decade or two of the person's professional life.",
    shortMeaning: "Supports purposeful authority and recognition.",
  },

  lakshmi: {
    id: "lakshmi",
    name: "Lakshmi Yoga",
    category: "dhana",
    nature: "positive",
    defaultLifeAreas: ["wealth", "family", "marriage"],
    whatItMeans:
      "Lakshmi Yoga is formed when the 9th house lord is strong and well-placed, and the Lagna lord is also strong — creating a direct channel between the person's fundamental identity and the fortune that the 9th house represents. Lakshmi, the goddess of abundance, prosperity and beauty, is associated with the 9th house and its lord in Vedic astrology, and this yoga carries that quality of graceful, sustainable prosperity.\n\nThis yoga supports comfortable living, financial abundance, family well-being and a life that has genuine grace and ease about it. The person often attracts prosperity without excessive struggle — opportunities appear, supportive relationships develop, and the overall quality of life tends to be pleasant and fulfilling. The yoga works most clearly when the person is living in alignment with their natural strengths and values.\n\nLakshmi Yoga also often shows in a person's overall quality of life — the environments they create, the relationships they cultivate and the ease with which good things tend to come to them. It is less about a single dramatic financial event and more about a general quality of abundance that runs through the chart.",
    whyItForms: "The 9th-house lord and the Lagna lord are both strong and well-placed.",
    strengthens:
      "The yoga becomes stronger when the 9th lord is in its own sign, exaltation or in a house of dignity, and the Lagna lord is similarly strong. When both lords are in Kendra or Trikona houses, the yoga operates with particular clarity, as the good fortune of the 9th and the personal vitality of the 1st are both at their strongest.\n\nBenefic aspects from Jupiter — the natural significator of fortune and abundance — can significantly enhance this yoga. When Jupiter also aspects the 9th house or its lord, or when the 5th house and its lord (representing purvapunya or past-life merit) are strong, the yoga's promise of prosperity tends to be both genuine and lasting.",
    weakens:
      "The yoga is weakened when either the 9th lord or Lagna lord is debilitated, combust or heavily afflicted. If the Lagna lord is weak, the person's fundamental vitality and personal direction are reduced, which limits their ability to receive and utilise the prosperity this yoga offers. If the 9th lord is weak, the fortunate dimension of the yoga operates less reliably.\n\nHeavy malefic influence on the 9th house, its lord or the Lagna — particularly from Saturn without compensating benefic aspects — can delay or complicate the yoga's expression. The prosperity may still come but it may require more effort, discipline and patience than the cleaner versions of this yoga suggest.",
    whenItGivesResults:
      "Lakshmi Yoga gives its most visible results during the Mahadasha or Antardasha of the 9th lord or the Lagna lord. These periods tend to bring financial improvement, family well-being, good opportunities and a general sense of things going well across multiple areas of life simultaneously.\n\nBecause this yoga involves the Lagna lord — the significator of the self — its results are often experienced as the person's genuine circumstances improving in ways that feel earned and natural rather than accidental. The yoga tends to express most fully in the second half of life, when the person has established the foundation that allows fortune to deliver its results.",
    shortMeaning: "Supports prosperity and good fortune.",
  },

  amala: {
    id: "amala",
    name: "Amala Yoga",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career"],
    whatItMeans:
      "Amala Yoga is formed when a natural benefic — Jupiter, Venus or Mercury — is placed in the 10th house from the Lagna or from the Moon. The 10th house represents career, public life, reputation and the visible contribution one makes to the world. A natural benefic here tends to give those actions and contributions a quality of genuine goodness that others recognise and respect over time.\n\nThe name \"Amala\" means \"spotless\" or \"pure\" — and this yoga specifically supports the development of a clean, lasting reputation. People with this yoga tend to be remembered well by those they have worked with. Their professional conduct tends to be characterised by fairness, honesty, competence and a quality of genuine care for what they do and who they serve.\n\nThis yoga often shows most clearly not in a single dramatic achievement but in the accumulation of trust and good regard over a career. The person's name and reputation tend to outlast the specific roles or positions they hold, and they are often spoken of positively long after they have moved on from a particular context.",
    whyItForms: "A natural benefic is placed in the 10th house from the Lagna or Moon.",
    strengthens:
      "The yoga becomes stronger when the benefic in the 10th is strong by sign — Jupiter in Cancer, Sagittarius or Pisces; Venus in Taurus, Libra or Pisces; Mercury in Gemini or Virgo — and is free from serious affliction. An unafflicted, well-placed benefic in the 10th gives the yoga maximum clarity of expression.\n\nWhen the benefic forming this yoga is also the Lagna lord, the 5th lord or the 9th lord — reinforcing its connection to the person's core identity, intelligence and fortune — the reputation-building dimension of the yoga becomes particularly pronounced.",
    weakens:
      "The yoga is weakened when the benefic in the 10th is deeply combust, debilitated or heavily afflicted by natural malefics. Under significant malefic pressure, even a naturally supportive planet in the 10th loses its capacity to give the clean, positive reputation this yoga describes.\n\nIf the 10th house itself is afflicted — by the conjunction or heavy aspect of natural malefics without balancing benefic influence — the benefic placed there may not have enough support from the house itself to deliver the yoga's promise of an unblemished professional reputation.",
    whenItGivesResults:
      "Amala Yoga gives its clearest results during the Mahadasha or Antardasha of the benefic forming the yoga. These periods often bring professional recognition, a strengthening of reputation, positive relationships with authority figures or the expansion of one's public role and influence.\n\nFor some people with this yoga, the reputation it supports builds gradually over many years and becomes most visible when the relevant planetary period coincides with the peak of their professional life. The yoga's promise of a lasting good name means its most important results may not always be the most immediately visible — they are the ones that endure.",
    shortMeaning: "Supports a clean reputation and good name.",
  },

  vasumati: {
    id: "vasumati",
    name: "Vasumati Yoga",
    category: "dhana",
    nature: "positive",
    defaultLifeAreas: ["wealth"],
    whatItMeans:
      "Vasumati Yoga is formed when two or more natural benefics are placed in the upachaya houses — the 3rd, 6th, 10th or 11th — from the Lagna or Moon. Upachaya houses are known as \"houses of growth\" because they improve with time and effort, and natural benefics placed here indicate that wealth and material resources tend to accumulate progressively through the native's life.\n\nThis yoga supports financial security through consistent effort, skill development and the expansion of income and gains over time. The upachaya placement of benefics means the results often improve as the person matures and builds experience — early life may be modest, but the trajectory tends to be upward. The yoga is associated with a steady capacity to earn, grow financial resources and build a materially secure life.\n\nBecause upachaya houses are associated with initiative, hard work, career and gains, Vasumati Yoga combines the positive energy of natural benefics with the improvement-oriented quality of these houses, creating a well-supported path for financial development that becomes more visible as life progresses.",
    whyItForms: "Two or more natural benefics are placed in upachaya houses (3, 6, 10, 11) from Lagna or Moon.",
    strengthens:
      "The yoga becomes stronger when three benefics occupy upachaya houses, when the benefics are strong by sign and relatively free from malefic affliction, and when the 11th house — the primary house of gains — is particularly well-supported.\n\nWhen the Lagna lord is also well-placed and strong, the native has the personal capacity and initiative to take full advantage of the financial opportunities this yoga creates. A strong 2nd house (savings) alongside strong upachaya placements gives the yoga both an income dimension and an accumulation dimension, making the overall financial picture more robust.",
    weakens:
      "The yoga is weakened when the benefics in the upachaya positions are themselves combust, debilitated or heavily afflicted. A benefic that cannot express its supportive quality — because it is too close to the Sun, in a weak sign or under malefic pressure — reduces the yoga's financial promise.\n\nWhen only one benefic occupies an upachaya position, the yoga still exists but with reduced strength. The improvement-over-time quality remains, but the multiple sources of financial support that Vasumati ideally describes require at least two well-placed benefics to operate convincingly.",
    whenItGivesResults:
      "Vasumati Yoga tends to give clear results during the Mahadasha or Antardasha of any of the benefics forming the yoga. As these planetary periods run, financial opportunities tend to increase, income grows, and the accumulation of material resources accelerates.\n\nBecause the yoga involves upachaya houses — which improve with time — its results often become most visible in the second half of life. People with this yoga may experience a gradual but clear upward trajectory in financial matters, with each passing decade bringing more stability and security than the previous one.",
    shortMeaning: "Supports financial security.",
  },

  neechaBhanga: {
    id: "neechaBhanga",
    name: "Neecha Bhanga Raja Yoga",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career", "spirituality"],
    whatItMeans:
      "Neecha Bhanga Raja Yoga is formed when a planet is in its sign of debilitation but one of several classical cancellation conditions is present, neutralising the debilitation and converting its energy into a source of unusual strength. \"Neecha\" means debilitation and \"Bhanga\" means cancellation — together, they describe a reversal of limitation that creates something stronger than a simple exaltation might produce.\n\nThe yoga is associated with a specific kind of resilience — the quality of rising after a genuine setback, difficulty or period of limitation. People with this yoga often go through phases where progress seems blocked, their strengths go unrecognised or they face situations that test their fundamental character. Having worked through these challenges, they tend to develop a depth of capability and a hard-won authority that those who have not faced similar tests rarely possess.\n\nNeecha Bhanga is considered particularly interesting because it shows that a chart's strength is not simply about easy placements — it is about how the native navigates difficulty. The yoga's promise is not that life will be easy, but that the specific challenge indicated by the debilitated planet will ultimately become a source of uncommon strength.",
    whyItForms: "A debilitated planet meets a classical cancellation condition.",
    strengthens:
      "The yoga becomes stronger and clearer when the cancellation lord — the planet that owns the sign of the debilitated planet's exaltation, or the planet that exalts in the sign of debilitation — is placed in a Kendra from the Lagna or Moon. A well-placed cancellation lord that itself is strong by sign and free from affliction gives the yoga its fullest expression.\n\nWhen multiple cancellation conditions are present simultaneously, the yoga is considered particularly powerful. The classic texts describe several independent conditions that can cancel a debilitation, and when more than one applies in the same chart, the reversal of limitation is considered more complete and the resulting strength more remarkable.",
    weakens:
      "The yoga is weakened when the cancellation condition is present but the cancellation lord is itself debilitated, combust or placed in a difficult house. In this case, the cancellation may be theoretical rather than practically effective — the debilitation is technically cancelled but the substitute strength is not robust enough to fully manifest.\n\nWhen the debilitated planet carries additional affliction beyond the sign weakness — such as being further afflicted by malefic aspects or in a difficult house — the yoga's reversal may only partially operate, giving mixed results rather than the clear rise that the most powerful versions of this yoga describe.",
    whenItGivesResults:
      "Neecha Bhanga Raja Yoga tends to give its clearest results during the Mahadasha or Antardasha of the debilitated planet that has been cancelled. This period often begins with a testing phase — the debilitation's challenges may be felt more acutely before the reversal begins to operate — and then produces a meaningful rise in the areas governed by that planet.\n\nFor many people with this yoga, the planetary period of the debilitated planet is remembered as a transformative time: initially demanding, then clarifying, and ultimately the source of a capability and recognition that would not have been possible without having navigated the earlier challenge. The Neecha Bhanga planet often becomes one of the native's most distinctive strengths precisely because it was earned through genuine difficulty.",
    shortMeaning: "Supports rise after early difficulty.",
  },

  parivartana: {
    id: "parivartana",
    name: "Parivartana Yoga",
    category: "raja",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth"],
    whatItMeans:
      "Parivartana Yoga is formed when two planets each occupy the sign owned by the other — a mutual exchange of signs. This creates a strong energetic connection between the two planets and between the houses they respectively occupy. The two life areas governed by these houses become closely interlinked, each supporting and drawing from the other.\n\nThis yoga is considered particularly powerful because both planets act as though they are simultaneously in their own sign and in the sign of the other — effectively doubling the scope of their influence. The exchange creates a kind of mutual reinforcement between the two houses involved, with each area of life supporting the development of the other in ways that would not otherwise be as natural.\n\nThe specific quality and significance of a Parivartana Yoga depends entirely on which houses are exchanging. An exchange between the 1st and 9th, for example, creates a deep connection between personal identity and fortune. An exchange between the 2nd and 11th brings wealth and gains together in a highly productive way. An exchange involving difficult houses (6th, 8th or 12th) is treated differently and may express more complexly.",
    whyItForms: "Two planets each occupy the sign owned by the other.",
    strengthens:
      "Parivartana Yoga becomes most powerful when the two exchanging planets are both strong by sign, well-placed in the houses they occupy, and free from serious malefic affliction. When the exchange involves Kendra and Trikona houses — particularly the most important ones such as 1st, 5th, 9th and 10th — the yoga's positive potential is at its highest.\n\nWhen both planets are natural benefics or are strong functional benefics for the Lagna, the exchange creates an entirely positive mutual support that benefits both areas of life clearly. Aspects from additional benefics on either planet further reinforce the yoga.",
    weakens:
      "The yoga becomes significantly more complex when one or both exchanging planets are simultaneously lords of difficult houses (6th, 8th or 12th). In this case, the exchange connects difficult house energy into the mix, which can create complications alongside the benefits.\n\nWhen both planets in the exchange are weak, afflicted or debilitated, the mutual reinforcement creates difficulties in both areas simultaneously rather than the mutual support of positive placements. The yoga still operates but its direction may be challenging rather than helpful.",
    whenItGivesResults:
      "Parivartana Yoga gives its most concentrated results during the Mahadasha or Antardasha of either of the two exchanging planets. During these periods, the mutual support between the two houses becomes active and visible — career and fortune develop together, wealth and self-expression support each other, or whichever two areas are connected experience simultaneous improvement.\n\nBoth planetary periods tend to express the yoga's quality, though with different emphases — the period of each planet brings its own dimension of the exchange to the foreground. People with a strong Parivartana Yoga between important houses often experience these two planetary periods as the most productive and significant of their life.",
    shortMeaning: "Links two life areas through sign exchange.",
  },

  dhana: {
    id: "dhana",
    name: "Dhana Yoga",
    category: "dhana",
    nature: "positive",
    defaultLifeAreas: ["wealth"],
    whatItMeans:
      "Dhana Yoga indicates the potential to build wealth, assets, financial stability and material comfort through the native's efforts, opportunities and timing. It does not always mean sudden wealth or effortless money; rather, it shows that the chart has a supportive financial pattern where income, savings, intelligence, family resources and gains can work together.\n\nWhen this yoga is strong, the person may get better chances to earn, save, invest and grow financially over time. The results usually improve with maturity, disciplined effort and the activation of the planets connected with wealth houses. It can also show support from family, speech, skills, networks, business or profession depending on the houses and planets involved.\n\nThe specific quality of this yoga — how wealth comes and through what channels — depends on which wealth-house lords are involved and how they are connected. A yoga formed through the 2nd and 11th lords alone has a different flavour from one that also involves the 5th or 9th lords. The more wealth-supporting houses that are connected, the broader and more multifaceted the financial potential becomes.",
    whyItForms: "The lords of wealth-related houses (2nd, 5th, 9th, 11th) are connected.",
    strengthens:
      "Dhana Yoga becomes stronger when the lords of wealth-giving houses such as the 2nd, 5th, 9th and 11th are directly connected through conjunction, mutual aspect, exchange or placement in each other's houses. A direct connection between the 2nd lord and 11th lord is especially important because the 2nd house shows accumulated wealth and savings while the 11th house shows income, gains and the fulfilment of desires.\n\nThe yoga becomes even more powerful when the involved planets are strong by dignity, placed in favourable houses, free from heavy affliction and supported by benefic aspects. If these planets are connected with the Lagna, 10th house or 9th house, the wealth potential may become more visible through career, luck, reputation or self-effort.",
    weakens:
      "Dhana Yoga becomes weaker when the wealth-house lords are debilitated, combust, heavily afflicted, placed in difficult houses or associated with strong malefic influences without benefic support. If the planets forming the yoga are weak in dignity or connected with loss-giving houses, the person may still earn money but may find consistent financial growth more challenging.\n\nThe yoga may also give delayed or mixed results if the 2nd, 5th, 9th or 11th houses are under pressure, or if the planets involved are significantly weakened. In such cases, wealth may come after greater effort, or require sustained discipline and careful management before yielding clear results.",
    whenItGivesResults:
      "Dhana Yoga generally gives stronger results during the Mahadasha, Antardasha or important transit periods of the planets involved in forming the yoga. When the planetary periods of the wealth-house lords run, financial opportunities, income growth, asset creation or important career-related gains often become more active.\n\nThe results may also become more visible when major transits support the 2nd, 5th, 9th, 10th or 11th houses from the Lagna or Moon. However, the outcome depends on the overall chart strength. A strong yoga can give clear wealth-building opportunities, while a moderate yoga may show gradual financial progress through effort, planning and disciplined choices.",
    shortMeaning: "Supports the building of wealth.",
  },

  shubhaKartari: {
    id: "shubhaKartari",
    name: "Shubha Kartari Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["emotional_life", "health"],
    whatItMeans:
      "Shubha Kartari Yoga is formed when natural benefic planets occupy both the 12th and 2nd houses from the Lagna, hemming the Lagna between benefic influences on both sides. \"Kartari\" means scissors — the Lagna is enclosed, but in this case the enclosure comes from supportive, protective energies rather than difficult ones.\n\nThis yoga supports a quality of protection and support around the native's personal life. The benefics on both sides of the Lagna tend to create a generally favourable environment — health tends to be reasonably good, personal circumstances tend to be comfortable and there is usually support available when it is needed. The native rarely feels completely unsupported, even during challenging phases.\n\nThe specific quality of the protection depends on which benefics are involved. Jupiter on both sides gives wisdom and spiritual support; Venus gives comfort and relational ease; Mercury gives practical intelligence and adaptability. Any combination of these creates a protective envelope around the first house that benefits the native's sense of security and personal well-being.",
    whyItForms: "Benefic planets occupy both the 12th and 2nd from the Lagna.",
    strengthens:
      "The yoga is strongest when both flanking benefics are themselves strong by sign — not combust, not debilitated and not heavily afflicted by malefics. Strong, healthy benefics on both sides of the Lagna create the clearest protective environment.\n\nWhen three natural benefics surround the Lagna (such as one in the 12th and two in the 2nd, or vice versa), the yoga is particularly powerful. The Lagna lord being strong and well-placed adds the native's own vitality to the protective support coming from the flanking planets.",
    weakens:
      "The yoga is weakened when the benefics forming it are combust, debilitated or under serious malefic pressure. A benefic that cannot express its own quality clearly cannot provide the protective, supportive environment this yoga describes.\n\nIf one side is benefic and the other malefic — creating a partial Shubha Kartari alongside a partial Paap Kartari — the overall effect is mixed and the protection the yoga would ideally provide is incomplete.",
    whenItGivesResults:
      "Shubha Kartari Yoga tends to be a sustained background influence rather than a yoga that gives specific dramatic results during a single period. Its quality of protection and support tends to be present throughout life in a steady way, reducing the intensity of difficulties and supporting a generally positive personal environment.\n\nDuring the Mahadasha or Antardasha of the flanking benefics, the yoga's qualities can become more prominent — periods of comfort, good health, supportive relationships and a sense of personal security. These periods are often ones the native looks back on as particularly pleasant and well-supported phases of life.",
    shortMeaning: "Supports protection around the self.",
  },

  paapKartari: {
    id: "paapKartari",
    name: "Paap Kartari Yoga",
    category: "general",
    nature: "challenging",
    defaultLifeAreas: ["emotional_life", "health"],
    whatItMeans:
      "Paap Kartari Yoga is formed when natural malefics — Saturn, Mars, Rahu or Ketu — occupy both the 12th and 2nd houses from the Lagna, hemming the Lagna between difficult planetary influences on both sides. The Lagna represents the self, physical body and overall life direction, and its enclosure by malefics can create a background quality of pressure around self-expression, vitality and the ability to move freely through life.\n\nThis yoga does not create constant difficulty, but it does tend to add friction to personal matters. The native may feel that progress requires more effort than it should, that self-expression meets with more resistance than expected, or that there is often something on both sides pulling against a clean path forward. However, this same pressure often develops resilience, self-awareness and a practical toughness that becomes a genuine strength over time.\n\nThe intensity of this yoga varies considerably. When the malefics are mild (Saturn at a wide orb, or Ketu in a supportive sign) or when there are also benefic aspects on the Lagna or Lagna lord, the challenging dimension is significantly reduced. The yoga is most difficult when both flanking malefics are themselves strong and the Lagna lord is simultaneously weakened.",
    whyItForms: "Malefic planets occupy both the 12th and 2nd from the Lagna.",
    strengthens:
      "The challenging dimension of this yoga becomes more pronounced when the malefics on both sides are strong and closely positioned relative to the Lagna — Saturn or Mars in angles to the Lagna lord, or Rahu and Ketu directly flanking a critical degree. Strong, close malefics create a more compressed and difficult environment.\n\nThe yoga is also more complex when the Lagna lord is simultaneously weak or afflicted, reducing the native's ability to navigate the encircling pressure. A strong, well-placed Lagna lord can significantly mitigate the yoga's challenging dimension even when the flanking malefics are powerful.",
    weakens:
      "The yoga's challenging dimension is significantly reduced when the Lagna or Lagna lord receives the aspect of natural benefics — particularly Jupiter's aspect, which acts as a powerful protective and clarifying influence. When Jupiter aspects the Lagna, it essentially steps in as a protective presence even when malefics flank it.\n\nWhen the flanking malefics are natural yogakarakas for the chart (such as Saturn for Taurus Lagna, where it rules Kendra and Trikona), their flanking position becomes much less problematic. The nature of a malefic that simultaneously rules important benefic houses for the chart is more complex and often less damaging than a purely functional malefic in the same position.",
    whenItGivesResults:
      "Paap Kartari Yoga tends to be a background influence throughout life rather than a yoga that intensifies sharply in specific periods. However, during the Mahadasha or Antardasha of either flanking malefic, the challenging quality may become more noticeable — periods of greater personal pressure, health-related attention requirements or situations where self-expression meets with friction.\n\nDuring benefic Mahadasha periods, the yoga's challenging quality tends to recede. These phases can be particularly important for building the personal confidence, social relationships and practical capabilities that help the native navigate the Paap Kartari environment more effectively over the long term.",
    shortMeaning: "May show pressure around self-expression.",
  },
  // ─── Solar yogas ──────────────────────────────────────────────────────────────

  vesi: {
    id: "vesi",
    name: "Vesi Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth"],
    whatItMeans:
      "Vesi Yoga is formed when any planet other than the Moon or nodes occupies the 2nd house from the Sun. In the solar cycle, the 2nd house represents what comes immediately after the Sun's own expression — resources, speech, and forward-facing momentum. A planet in this position lends its qualities as a kind of advance support for the Sun's purpose.\n\nThis yoga is traditionally associated with a quality of sustained effort, good character, and the ability to turn purpose into tangible achievement. The Sun represents your core vitality and identity; a planet in the 2nd from it provides backing, whether in the form of resources, initiative, communication, or practical skill. The specific planet determines the flavour of this support.\n\nThe yoga tends to show most clearly in how you apply yourself to your work and goals — there is generally a quality of purposeful follow-through rather than impulse without substance. The Sun's themes of authority, clarity, and self-direction tend to be reinforced by something that runs ahead of them in the chart.",
    whyItForms: "One or more planets (excluding Moon, Rahu, and Ketu) are placed in the 2nd house from the Sun.",
    strengthens:
      "Vesi Yoga is strongest when a natural benefic — Jupiter, Venus, or Mercury — occupies the 2nd from the Sun. Benefics here tend to support the Sun's expression with wisdom, creativity, or articulate intelligence, creating a quality of purposeful and ethical action rather than simply raw ambition.\n\nThe yoga gains further power when the Sun itself is in a strong position (in Leo, Aries, or a Kendra house) and when the planet in the 2nd from the Sun is in good dignity. Dasha periods of either the Sun or the relevant planet tend to bring out the yoga's qualities most clearly.",
    weakens:
      "Vesi Yoga loses power when the planet in the 2nd from the Sun is severely debilitated or combust. A combust planet near the Sun may in fact be too close to qualify meaningfully — its distinctness from the Sun is reduced. Heavy affliction from nodes or malefics on the relevant planet also weakens the yoga.\n\nIf only malefic planets occupy the 2nd from the Sun, the yoga is present but the support they provide is less graceful — the person may still be effective, but with more friction and less natural alignment of effort and result.",
    whenItGivesResults:
      "Vesi Yoga tends to give its clearest results during the Sun Mahadasha or Antardasha, and during the Mahadasha of the planet occupying the 2nd from the Sun. These are periods when the purposeful, forward-moving quality of the yoga becomes most practically visible — in career momentum, financial consolidation, or recognised contribution.\n\nThe yoga may also be activated when Jupiter transits the Sun's position or the relevant planet. For many people, the yoga's qualities are a consistent background quality of their working life — evident in the general character of how they approach effort and purpose — rather than arriving only in specific activated periods.",
    shortMeaning: "Supports purpose, effort, and forward momentum.",
  },

  vosi: {
    id: "vosi",
    name: "Vosi Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["wealth", "spirituality"],
    whatItMeans:
      "Vosi Yoga is formed when any planet other than the Moon or nodes occupies the 12th house from the Sun. In the solar sequence, the 12th represents what lies immediately behind the Sun — the realm of reflection, preparation, accumulated wisdom, and the foundation beneath visible action. A planet in this position provides inner depth and background support to the Sun's expression.\n\nThis yoga is traditionally associated with qualities of thoughtfulness, spiritual depth, and a capacity for behind-the-scenes preparation and wisdom that underlies outer activity. The person often has a rich inner life or a quality of working effectively in less visible ways. Intuition, private preparation, creative depth, and a sense of accumulated experience are all qualities associated with this arrangement.\n\nUnlike purely outer achievements, Vosi Yoga often supports a kind of depth that those close to the native recognise even when it is not immediately visible to the world. The planet in the 12th from the Sun describes the nature of this background quality.",
    whyItForms: "One or more planets (excluding Moon, Rahu, and Ketu) are placed in the 12th house from the Sun.",
    strengthens:
      "Vosi Yoga is strongest when Jupiter or Venus occupies the 12th from the Sun — these benefics provide wisdom, creative inspiration, or a refined quality of inner life that supports the Sun's expression with grace and depth. Jupiter here is particularly associated with philosophical depth, spiritual inclination, and the ability to act from principle rather than impulse.\n\nThe yoga is further strengthened when the relevant planet is in good dignity and the Sun is itself strong. During the planetary period of the planet in the 12th from the Sun, the background qualities of this yoga often become more consciously active and influential in the person's life direction.",
    weakens:
      "Vosi Yoga loses some of its positive quality when a heavy malefic — particularly Saturn, Mars, or Rahu — occupies the 12th from the Sun without any benefic modification. In this case, the background influence on the Sun's expression may carry more anxiety, difficulty, or hidden resistance. The yoga is still present but operates with more friction.\n\nSevere debilitation of the planet in the 12th from the Sun, or heavy affliction from nodes, reduces the quality of inner support it provides. The Sun may then lack the reflective depth that this yoga at its best provides.",
    whenItGivesResults:
      "Vosi Yoga becomes most apparent during the Mahadasha or Antardasha of the planet placed in the 12th from the Sun, or during Sun periods. These are times when the depth, preparation, or background wisdom the yoga represents tends to become more actively expressed — in the form of creative work, spiritual insight, behind-the-scenes leadership, or the ability to draw on accumulated experience in ways that support visible achievement.\n\nThe yoga's qualities are often most appreciated in retrospect — people with strong Vosi Yoga tend to look back on periods of apparent withdrawal or inner focus and recognise that they were building something essential during those times.",
    shortMeaning: "Supports depth, reflection, and inner resourcefulness.",
  },

  ubhayachari: {
    id: "ubhayachari",
    name: "Ubhayachari Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth"],
    whatItMeans:
      "Ubhayachari Yoga is formed when planets occupy both the 2nd and 12th houses from the Sun simultaneously — combining the conditions for Vesi Yoga (2nd from Sun) and Vosi Yoga (12th from Sun). The Sun is flanked on both sides: forward-facing support ahead of it, and reflective depth behind it. This double-sided support is considered more complete than either alone.\n\nThis yoga is associated with a well-rounded quality of the solar principle — the ability to act with both depth and momentum, both inner preparation and outer follow-through. The person tends to have a certain solidity of character that others recognise: their actions seem grounded in genuine experience and their presence carries a quality of sustained capability rather than merely surface-level energy.\n\nThe combination supports career, reputation, and personal authority in a sustained way rather than through peaks and troughs. Jupiter's qualities, when present in this configuration, tend to make it particularly notable for wisdom, ethics, and the kind of leadership that people willingly follow.",
    whyItForms: "Planets other than Moon, Rahu, and Ketu occupy both the 2nd and 12th houses from the Sun.",
    strengthens:
      "Ubhayachari Yoga is strongest when natural benefics occupy both the 2nd and 12th from the Sun — Jupiter in one position and Venus or Mercury in the other represents a particularly strong form. This gives the Sun both the forward momentum of an auspicious planet ahead of it and the wisdom and depth of a benefic behind it.\n\nThe yoga is further reinforced when the Sun itself is strong by position (Leo, Aries, a Kendra house) and by dignity. When the enclosing planets are also in good dignity and free from malefic affliction, the combined effect on the Sun's expression of purpose and authority is substantial.",
    weakens:
      "When malefics occupy both positions (Saturn in the 2nd from Sun and Mars in the 12th, for example), the flanking arrangement is present but the quality is compromised — the support around the Sun carries more pressure and less grace. The yoga is technically present, but its practical expression is more effortful.\n\nSevere affliction on the Sun itself, or on the planets flanking it, can undermine the yoga's effectiveness. A Sun that is deeply debilitated or heavily aspected by malefics without benefic protection may not be able to draw on the surrounding support constructively.",
    whenItGivesResults:
      "Ubhayachari Yoga tends to give its fullest expression during Sun Mahadasha or Antardasha, and during the Mahadashas of both enclosing planets. These periods often bring a phase of well-rounded activity where both outer achievement and inner development are simultaneously active.\n\nFor some charts, this yoga acts as a consistent background quality throughout adult life — the person simply tends to have a quality of presence and capability that is noticed over time. For others, it crystallises most clearly during the relevant planetary periods when the full support structure around the Sun is activated.",
    shortMeaning: "Supports authority, stability, and well-rounded capability.",
  },

  // ─── Additional yogas ──────────────────────────────────────────────────────────

  adhiYoga: {
    id: "adhiYoga",
    name: "Adhi Yoga",
    category: "moon",
    nature: "positive",
    defaultLifeAreas: ["career", "wealth", "education"],
    whatItMeans:
      "Adhi Yoga is formed when natural benefics — Mercury, Jupiter, and Venus — are placed in the 6th, 7th, or 8th house from the Moon. These three houses, counted from the Moon, represent the sphere immediately surrounding the Moon's position from the opposite side of the chart. When benefics occupy this arc, they provide a particular kind of support: the Moon is flanked by benefic planetary energy in the houses that deal with opposition, partnership, and transformation.\n\nThis yoga is associated with leadership, respect, authority, and a capacity to rise above opposition. The classical texts describe Adhi Yoga as producing ministers, commanders, and people of high standing — its practical modern expression is the ability to navigate challenges and competition without being overwhelmed by them. The more benefics in these houses from the Moon, the stronger the yoga is considered.\n\nAt its core, Adhi Yoga describes a person whose emotional foundation (Moon) is backed by three of the most supportive planetary influences in the chart. Even when facing the domains of obstacles, opposition, and difficulty (6th), partnership dynamics (7th), and deep transformation (8th), the benefic presence moderates and improves the experience.",
    whyItForms: "One or more of Mercury, Jupiter, and Venus are placed in the 6th, 7th, or 8th house from the Moon.",
    strengthens:
      "Adhi Yoga is strongest when all three benefics — Mercury, Jupiter, and Venus — are simultaneously placed in the 6th, 7th, or 8th from the Moon, and when they are in good dignity. The full configuration is rare and considered very powerful, producing qualities of refined leadership, eloquence, and the ability to handle complex situations with grace.\n\nThe yoga gains additional power when Jupiter, specifically, is among the qualifying planets — Jupiter's wisdom and expansive quality in these houses from the Moon provides particular protection against opposition and a capacity for sound judgment under pressure. A strong Moon with good dignity amplifies the overall effect.",
    weakens:
      "Adhi Yoga is weakest when only one benefic qualifies and it is in poor dignity or combust. The yoga is still technically present, but the support is narrower and less reliable. A Moon that is itself heavily afflicted reduces the yoga's ability to translate the surrounding benefic support into tangible results.\n\nIf the qualifying benefics are in enemy or debilitation signs, or if they are simultaneously afflicted by malefics, the yoga's quality is diluted. The combination is present but may manifest more as the capacity to navigate rather than rise above difficulty.",
    whenItGivesResults:
      "Adhi Yoga tends to give its clearest results during the Mahadashas of the qualifying benefic planets — Jupiter, Venus, or Mercury — and during Moon Mahadasha when the overall configuration is activated. These are often periods of professional recognition, advancement to leadership positions, or the resolution of long-standing competitive challenges in the native's favour.\n\nThe yoga may also show clearly during Jupiter transits to the Moon, or when the qualifying planets transit sensitive natal positions. For many people with this yoga, the results accumulate steadily through adult life rather than arriving in a single dramatic peak — the benefic support from the Moon's field provides consistent guidance toward positions of respect and influence.",
    shortMeaning: "Supports leadership, respect, and victory over challenges.",
  },

  chandraMangal: {
    id: "chandraMangal",
    name: "Chandra-Mangal Yoga",
    category: "dhana",
    nature: "positive",
    defaultLifeAreas: ["wealth", "career"],
    whatItMeans:
      "Chandra-Mangal Yoga is formed when the Moon and Mars are in conjunction (same sign) or in mutual aspect (7th from each other). The Moon represents the mind, emotions, and the capacity to receive and nurture; Mars represents energy, drive, and the impulse to act and earn. Their combination creates a distinctive quality: emotional intelligence that is charged with initiative, and action that is guided by intuitive awareness.\n\nThis yoga is particularly associated with wealth-building, financial initiative, and the capacity to turn ideas and emotions into tangible material results. The classical tradition identifies it with a determination to earn, accumulate, and hold onto resources through personal effort. The combination often gives a sharp, somewhat competitive quality to the personality — an ability to identify opportunities and pursue them with conviction.\n\nAt its best, Chandra-Mangal Yoga produces people who are courageous, enterprising, and emotionally direct — they say what they mean, pursue what they want, and tend to build their material life through genuine effort rather than inherited advantage. The conjunction form is considered stronger than the mutual-aspect form.",
    whyItForms: "The Moon and Mars are in the same sign (conjunction) or exactly opposite each other (mutual 7th aspect).",
    strengthens:
      "The yoga is strongest when Moon and Mars are in conjunction — occupying the same sign — rather than in opposition. Conjunction creates a more unified blending of their energies; opposition activates the qualities through alternating tension. The yoga gains additional power when the conjunction or aspect occurs in a Kendra (angular house) or Trikona (trine house), where both planets can express fully.\n\nWhen Jupiter aspects either or both planets, the yoga gains wisdom and moderation that channels the Mars-Moon energy constructively. A well-dignified Moon (in Taurus, Cancer) combined with a strong Mars gives the yoga a solid foundation in both emotional clarity and directed effort.",
    weakens:
      "The yoga loses power when either the Moon or Mars is severely debilitated — a debilitated Moon makes the emotional foundation of the combination unstable, while a debilitated Mars in Cancer adds frustration rather than focused drive. When the conjunction is closely afflicted by Rahu or Saturn, the impulsive quality of the Mars-Moon combination can become erratic or anxious rather than purposeful.\n\nA waning Moon in this combination (particularly a new-Moon phase Moon) reduces the emotional clarity available, making the yoga less constructive in its expression. The yoga's positive wealth dimension also depends on the condition of the 2nd and 11th houses — even when present, it may not fully deliver if wealth houses are simultaneously under stress.",
    whenItGivesResults:
      "Chandra-Mangal Yoga gives its clearest results during Moon or Mars Mahadasha and Antardasha — periods when the combined qualities of emotional drive and initiative become most active in the chart. These are often phases of significant financial effort, career assertiveness, or the initiation of projects that require both emotional conviction and practical willingness to take risks.\n\nMars transits over the Moon's natal position, and Moon transits over Mars's natal position, also activate the yoga monthly and annually. The yoga's wealth-building dimension tends to express gradually through adult life — with the most visible results arriving when sustained effort over time begins to produce clear returns.",
    shortMeaning: "Supports financial drive, courage, and earned wealth.",
  },

  saraswati: {
    id: "saraswati",
    name: "Saraswati Yoga",
    category: "general",
    nature: "positive",
    defaultLifeAreas: ["education", "career", "spirituality"],
    whatItMeans:
      "Saraswati Yoga is formed when Jupiter, Venus, and Mercury are all placed in Kendra (1st, 4th, 7th, or 10th), Trikona (1st, 5th, or 9th), or the 2nd house from the Lagna — and Jupiter is in a strong dignity (own, exalted, mooltrikona, or friendly sign). The yoga is named after Saraswati, the Vedic goddess of knowledge, arts, speech, and wisdom.\n\nThis configuration aligns the three planets most associated with the intellect, creativity, and refinement in the chart's most powerful houses. Jupiter provides wisdom and philosophical depth; Venus contributes aesthetic sensibility, creative talent, and the capacity to communicate with beauty; Mercury adds analytical precision, language ability, and the power of articulate expression. Together, they support a life oriented around knowledge, creativity, teaching, and the cultivation of genuine understanding.\n\nSaraswati Yoga is one of the more significant wisdom yogas in classical Vedic astrology. It often manifests in people who are deeply knowledgeable in at least one area, who express themselves with clarity and creativity, and who are respected for the quality of their thinking and communication rather than simply for outer achievement.",
    whyItForms: "Jupiter, Venus, and Mercury are all placed in Kendra, Trikona, or 2nd houses from Lagna, and Jupiter is in a strong dignity.",
    strengthens:
      "The yoga reaches its fullest potential when Jupiter is exalted (in Cancer) or in its own sign (Sagittarius or Pisces). A Jupiter with this level of strength provides the wisdom and expansiveness needed to draw together the refined qualities of Venus and Mercury into a coherent, purposeful expression. When all three planets are in good dignity simultaneously, the yoga can produce remarkable creative and intellectual gifts.\n\nThe yoga is particularly strong when the Lagna lord is also well-placed and in good dignity — this gives the native the personal vitality and identity to draw on and express the combined qualities of the three planets. A strong 5th house (creative intelligence) and 9th house (philosophical wisdom) in the chart further reinforces the Saraswati Yoga's expression.",
    weakens:
      "Saraswati Yoga weakens significantly when Jupiter is in a weak dignity (debilitated in Capricorn, or in enemy signs without compensating factors). The classical requirement is specifically that Jupiter must be strong — without a dignified Jupiter, the combination of Venus and Mercury alone does not carry the full yogic weight.\n\nHeavy affliction on any of the three planets — through combustion, conjunction with nodes, or debilitation — reduces the yoga's effectiveness. If Mercury is combust and Venus is afflicted, the articulate creative expression the yoga is meant to produce becomes more partial and inconsistent.",
    whenItGivesResults:
      "Saraswati Yoga gives its clearest results during the Mahadashas of Jupiter, Venus, and Mercury — particularly Jupiter Mahadasha, which activates the wisdom dimension, and Mercury Mahadasha, which activates the intellectual and communicative expression. During these periods, the native's creative, intellectual, or artistic abilities often become most publicly recognised and practically effective.\n\nThe yoga tends to develop and mature with age — younger people with Saraswati Yoga may show its qualities in raw form (curiosity, creativity, a love of learning), while the fully developed expression — refined knowledge, creative mastery, respected wisdom — often emerges more clearly in the 30s, 40s, and beyond, as the underlying depth has had time to develop.",
    shortMeaning: "Supports wisdom, creativity, arts, and eloquence.",
  },

}

// ─── Doshas ─────────────────────────────────────────────────────────────────

export interface DoshaMeaning {
  id: string
  name: string
  defaultLifeAreas: LifeArea[]
  whatItMeans: string
  whyItForms: string
  whatReducesIt: string
  guidance: string
  shortMeaning: string
}

export const DOSHA_MEANINGS: Record<string, DoshaMeaning> = {
  kaalSarp: {
    id: "kaalSarp",
    name: "Kaal Sarp Dosha",
    defaultLifeAreas: ["emotional_life", "spirituality", "family"],
    whatItMeans:
      "Kaal Sarp Dosha is formed when all seven visible planets are placed on one side of the Rahu-Ketu axis, leaving the other half of the chart without planetary occupation. Rahu and Ketu are the nodal points of the Moon and represent the karmic axis of desire, experience and spiritual evolution. When all planets are contained within this axis, it creates a concentrated pattern that is often described as intense, wave-like and at times consuming.\n\nThis does not mean that life is fated to be difficult or that success is impossible. Rather, it suggests a certain quality in how life unfolds — results may come in concentrated bursts rather than steadily, important areas of life may feel more urgent or all-consuming at certain phases, and the native may have a strong sense of working through karmic material rather than simply living an ordinary life. Many remarkable people who have made significant contributions have this pattern in their chart.\n\nThe experience of Kaal Sarp Dosha is highly individual and depends on which planets are within the axis, where Rahu and Ketu are placed, and how strong the Lagna and Lagna lord are. When the Lagna lord is strong and there are good yogas elsewhere in the chart, the concentrated energy of this pattern often becomes a source of intensity and focus that drives meaningful achievement rather than a purely limiting influence.",
    whyItForms: "All seven visible planets are placed on one side of the Rahu-Ketu axis.",
    whatReducesIt:
      "The challenging dimension of Kaal Sarp is significantly reduced when a planet is placed outside the axis — even at the boundary, this breaks the strict formation and reduces the intensity of the pattern. The closer the Lagna lord is to the Rahu-Ketu axis in terms of strength and support, the more effectively the native can navigate the concentrated energy.\n\nA strong Jupiter aspect on the Lagna or Moon acts as a powerful moderating influence on this pattern. Jupiter's wisdom, expansiveness and protective quality can provide the native with the perspective and equanimity needed to work constructively with the concentrated energy rather than feeling overwhelmed by it. Strong Lagna placement, good benefic yogas elsewhere and a well-placed Moon all contribute to reducing the dosha's more challenging expressions.",
    guidance:
      "Kaal Sarp Dosha is best understood as a description of a certain quality of karmic intensity rather than a prediction of difficulty. Many people with this pattern live highly productive, meaningful lives — the concentration of planetary energy that it describes can be a source of unusual focus, depth and the capacity to achieve things that require sustained effort and commitment.\n\nThis pattern is best assessed in the context of the full chart rather than in isolation. A chart with strong protective yogas, good Lagna strength and well-placed planets within the axis can express the concentrated energy of Kaal Sarp as drive, depth and purposeful living rather than as frustration or limitation.",
    shortMeaning: "Suggests a karmic concentration pattern.",
  },

  mangal: {
    id: "mangal",
    name: "Mangal Dosha",
    defaultLifeAreas: ["marriage", "emotional_life"],
    whatItMeans:
      "Mangal Dosha is formed when Mars is placed in the 1st, 4th, 7th, 8th or 12th house from the Lagna, Moon or Venus. Mars is the planet of energy, drive, assertion, directness and the capacity for action. In the houses associated with self, home, partnership, deep personal matters and endings or foreign places, Mars's assertive, sometimes impatient energy interacts with the sensitive domains of personal security, partnership and inner life in ways that require more conscious management.\n\nIn the context of relationships and marriage, this pattern shows a person who brings a strong, direct energy into their partnerships. They may have high expectations, a tendency towards directness that others can experience as intensity, or a quality of independence that needs to be balanced with the cooperation that intimate relationships require. This does not mean that relationships will fail — it means that managing the Mars energy consciously is an important part of making partnerships work well.\n\nMangal Dosha is one of the most widely discussed patterns in Indian astrology, and it is frequently overcorrected — not every person with this placement will experience serious relationship difficulties, and many people with this pattern have fulfilling long-term partnerships. The key factor is how well Mars functions in the overall chart and whether the native has the awareness and willingness to work with rather than against their own Mars energy.",
    whyItForms: "Mars is placed in the 1st, 4th, 7th, 8th or 12th house — checked from the Lagna, Moon and Venus.",
    whatReducesIt:
      "The challenging dimension of Mangal Dosha is significantly reduced when Mars is in its own sign (Aries or Scorpio) or in exaltation (Capricorn) — in these positions, Mars's energy is focused, disciplined and less impulsive than when it is in a less comfortable sign. Mars aspected by Jupiter gains wisdom and moderation that naturally reduces the dosha's challenging quality.\n\nThe traditional rule of matching Mangal in a partner's chart — that a person with Mangal Dosha marries someone who also has this pattern — is based on the idea that similar energies in both charts create a more balanced dynamic. Whether or not this traditional matching is used, what matters most is that both partners develop the awareness and communication skills to work constructively with the strong Mars energy that this placement brings.",
    guidance:
      "Mangal Dosha is most usefully understood as information about relationship energy rather than a prediction of partnership difficulty. Mars in sensitive houses brings intensity, directness and a need for individual space into partnership dynamics — qualities that can be assets when understood and managed, and sources of friction when they operate unconsciously.\n\nThis pattern should always be evaluated in the context of the full marriage chart, the overall strength of Venus and the 7th house, and the specific nature of Mars's placement in the chart. Reading Mangal Dosha in isolation — without considering the rest of the chart — regularly leads to misinterpretation and unnecessary concern.",
    shortMeaning: "May indicate intensity in partnership matters.",
  },

  grahan: {
    id: "grahan",
    name: "Grahan Dosha",
    defaultLifeAreas: ["emotional_life", "family"],
    whatItMeans:
      "Grahan Dosha is formed when the Sun or Moon is in the same sign as Rahu or Ketu. The word \"Grahan\" means eclipse, and this pattern is named after the astronomical event of a solar or lunar eclipse, which occurs when the Sun or Moon comes close to the nodal axis. In the birth chart, this proximity creates an influence where the clear, luminous quality of the Sun or Moon is mixed with the shadowing, veiling influence of the nodes.\n\nThe Sun represents the core self, authority, clarity of purpose and the vital principle. The Moon represents the mind, emotions, receptivity and the capacity for inner comfort. When either luminary is closely connected with a node, the natural clarity and stability of that luminary's significations can become periodically obscured or complicated. The person may have phases where their sense of direction feels unclear (Sun-node) or where emotional clarity and inner peace feel harder to maintain (Moon-node).\n\nThis pattern is not a fixed condition but a recurring influence that tends to become more noticeable during specific planetary periods and transits. Many people with this pattern develop, over time, a particular depth of self-understanding precisely because they have had to work through the periodic veiling of their Sun or Moon clarity.",
    whyItForms: "The Sun or the Moon is in the same sign as Rahu or Ketu.",
    whatReducesIt:
      "The challenging dimension of Grahan Dosha is significantly reduced when the orb between the luminary and the node is wide — a Sun or Moon in the same sign as a node but at a significant degree distance is much less affected than one within five degrees. Tight orbs (within two or three degrees) create the strongest version of this pattern.\n\nJupiter's aspect on the eclipsed luminary acts as a powerful moderating influence, providing the wisdom, hope and expansive clarity that can penetrate the node's veiling quality. When Jupiter aspects either the Sun or Moon in this condition, the native tends to have the inner resources to work through the periodic challenges of this pattern more effectively.",
    guidance:
      "Grahan Dosha is best approached through practices that support clarity and emotional steadiness — meditation, regular routine, time in nature, working with a skilled guide or teacher, or simply developing the ability to observe the mind's fluctuations without being wholly identified with them. The periods when this pattern is most active (during node or luminary periods) are precisely when these practices are most valuable.\n\nThe deeper significance of this pattern often involves developing a more conscious relationship with the areas of life that the affected luminary governs. For Sun-node, this may be learning to find clarity of purpose independently of external validation. For Moon-node, it may be developing genuine emotional self-knowledge rather than relying on outer circumstances for inner stability. These are demanding but ultimately enriching developments.",
    shortMeaning: "May show periods of inner shadow that resolve with awareness.",
  },

  angarak: {
    id: "angarak",
    name: "Angarak Dosha",
    defaultLifeAreas: ["emotional_life", "wealth"],
    whatItMeans:
      "Angarak Dosha is formed when Mars is in the same sign as Rahu, or when Rahu closely aspects Mars. Mars represents direct action, courage, energy and the capacity for decisive intervention. Rahu represents amplification, desire, breaking boundaries and the transgression of conventional limits. Their meeting in the same sign creates a combination where Mars's natural fire and directness is amplified and sometimes made unpredictable by Rahu's boundary-crossing quality.\n\nThis combination can manifest as sudden impulses, a tendency to act without sufficient reflection, financial or practical decisions made with urgency rather than considered planning, or phases of intense energy followed by volatility. The combination is not inherently destructive — Mars and Rahu together can also produce remarkable courage, entrepreneurial boldness and the willingness to pursue goals that others would not dare attempt.\n\nThe experience of Angarak Dosha varies considerably depending on where in the chart it falls, which houses Mars and Rahu govern, and how strong the rest of the chart's moderating factors are. In Kendra or Trikona houses, the combination may express as unusual initiative and ambition. In difficult houses (8th or 12th), the volatility may be more pronounced.",
    whyItForms: "Mars is in the same sign as Rahu (or within tight orb).",
    whatReducesIt:
      "The challenging dimension of Angarak Dosha is reduced when the orb between Mars and Rahu is wider, when Jupiter aspects the combination, and when Mars is in a sign where it has good dignity (Aries, Scorpio, Capricorn). A well-dignified Mars with Rahu tends to channel the amplified energy more constructively than a weak Mars.\n\nA strong overall chart with good Lagna strength, well-placed benefics and clear protective yogas provides the psychological and practical foundation that allows the Angarak combination to express more as bold action than as volatile impulsiveness.",
    guidance:
      "Working with Angarak Dosha involves developing conscious awareness of the impulse to act without sufficient reflection, particularly in financial matters and major decisions. The combination's volatility is most problematic when decisions are made at high emotional or energy peaks rather than from a place of considered judgment.\n\nDuring Mars or Rahu Mahadasha and Antardasha periods, a degree of additional caution with significant decisions — especially financial ones — can help navigate the combination's more impulsive dimension. These periods can also be ones of genuine achievement if the energy is channelled deliberately into constructive goals.",
    shortMeaning: "May show impulsiveness or pressure in finances.",
  },

  vish: {
    id: "vish",
    name: "Vish Yoga",
    defaultLifeAreas: ["emotional_life", "health"],
    whatItMeans:
      "Vish Yoga is formed when the Moon is in the same sign as Saturn, or when Saturn closely aspects the Moon. The Moon represents the mind, emotional receptivity and the capacity for inner ease and natural flow. Saturn represents contraction, discipline, reality-testing, delay and the encounter with what is necessary rather than what is desired. Their combination in the same sign or through close aspect creates a particular kind of inner tension — the emotional mind meets the principle of limitation and soberness.\n\nThis combination may show as a tendency towards periods of low mood, heaviness, excessive self-criticism or emotional difficulty under pressure. The person may feel the weight of responsibilities more keenly than others, may find it harder to access spontaneous joy or lightness, or may go through phases where life feels more demanding and serious than it needs to be. They often develop, as a result, remarkable practical wisdom and emotional depth — having navigated inner heaviness, they tend to understand life's difficulties with genuine empathy.\n\nMany people with Vish Yoga develop strong qualities of resilience, discipline and the capacity to do difficult things without complaint. The same Saturn that creates heaviness also builds endurance, seriousness of purpose and the ability to persist through what others give up on. The yoga's challenging dimension often transforms over time into a genuine inner strength.",
    whyItForms: "The Moon is in the same sign as Saturn, or Saturn aspects the Moon.",
    whatReducesIt:
      "The challenging dimension of Vish Yoga is significantly reduced when Jupiter aspects the Moon, providing the expansiveness, hope and wisdom that moderates Saturn's contracting influence. Jupiter's aspect on the Moon is one of the most reliable protective factors for this combination.\n\nA wider orb between Saturn and the Moon reduces the intensity of their meeting. When the Moon is in a strong sign (Taurus, Cancer) and Saturn is in a sign where it has good dignity, the combination becomes less problematic. A well-placed Lagna lord with strong benefic support can also provide the personal vitality and positive orientation that counterbalances the Moon-Saturn tension.",
    guidance:
      "Vish Yoga is particularly responsive to conscious self-care practices — routines that support emotional steadiness, physical health, adequate rest, meaningful work and regular connection with people and activities that bring genuine nourishment. Saturn's influence on the Moon tends to be reduced when the person has a stable, well-organised life that gives Saturn's need for structure a constructive outlet.\n\nDuring Saturn and Moon planetary periods, attending to emotional and physical health with extra care is especially valuable. These are periods when the yoga's challenging dimension may be more active — but they are also periods when the habits and practices the person has built for emotional resilience are most available and most needed. Working with a skilled counsellor, doctor or guide during difficult phases of these periods can make a meaningful practical difference.",
    shortMeaning: "May show periods of emotional heaviness.",
  },

  shrapit: {
    id: "shrapit",
    name: "Shrapit Dosha",
    defaultLifeAreas: ["career", "emotional_life", "family"],
    whatItMeans:
      "Shrapit Dosha is formed when Saturn and Rahu are in the same sign. Saturn is the planet of karma, discipline, delay and the lessons that come through sustained effort and responsibility. Rahu is the node of amplification, restlessness, ambition and the drive to transgress limits. Their conjunction creates a distinctive signature: intense karmic pressure meeting restless, boundary-pushing desire.\n\nIn practical terms, this pattern can show as a feeling of working harder than others for equivalent results, delays in career or financial stability, phases where progress feels blocked despite effort, overthinking combined with high ambition, and a tendency to carry responsibility early in life. There may also be sudden swings — long periods of slow movement followed by rapid change. These are not signs of failure; they are signs of a particular kind of karmic intensity that is being processed through the life.\n\nThe same combination carries a strong positive dimension. Saturn-Rahu conjunctions, over time, tend to produce remarkable endurance, the ability to survive and learn from adversity, deep practical maturity, and — when the chart supports it — a steady rise to positions of authority or technical mastery that comes from real-world experience rather than inherited advantage. This is a pattern of slow success, not blocked success.",
    whyItForms: "Saturn and Rahu are in the same sign (conjunction).",
    whatReducesIt:
      "The challenging dimension of Shrapit Dosha is significantly reduced when Jupiter aspects either Saturn or Rahu in the conjunction. Jupiter's moderating wisdom can provide the perspective and inner steadiness that prevents the Saturn-Rahu pressure from becoming overwhelming. When Jupiter's influence is present, the combination tends to express more as disciplined ambition than as restless frustration.\n\nSaturn in its own sign (Capricorn or Aquarius) or exaltation (Libra) is a meaningful relief condition — a strong Saturn provides the structure and focus that channels Rahu's restlessness more productively. When Rahu is placed in an upachaya house (3rd, 6th, 10th or 11th), its disruptive quality is naturally better directed toward competitive effort and achievement. A strong Lagna lord with good benefic support also helps the native navigate the pattern with greater personal resilience.",
    guidance:
      "This pattern shows strong Saturn-Rahu influence, which may create delays, pressure, or a feeling of working harder than others for the same results. Over time, this same pressure can build resilience, maturity, and long-term stability that others who have had easier paths may not develop.\n\nDuring Saturn or Rahu Mahadasha and Antardasha, the pattern tends to be most active. These are periods that reward consistent, steady work over impulsive action. Major decisions made from a place of considered judgment rather than urgency tend to produce much better outcomes during these periods. The combination's positive dimension — technical mastery, long-term career rise, authority positions — often becomes more visible after significant sustained effort.",
    shortMeaning: "May show karmic pressure, delays, and eventual endurance.",
  },

  pitra: {
    id: "pitra",
    name: "Pitra Dosha",
    defaultLifeAreas: ["family", "spirituality", "career"],
    whatItMeans:
      "Pitra Dosha is not a single planetary placement but a convergence of signals — it requires both the Sun (representing the father, authority, and lineage) and the 9th house or its lord (representing dharma, ancestral blessings, and the higher path) to be under stress simultaneously. When only one of these is affected, the pattern is too weak to carry this name meaningfully.\n\nIn real terms, this pattern can show as a complex or evolving relationship with the father or father figure, a sense of carrying family responsibility that was not fully passed on in a healthy form, a disconnect from inherited traditions or beliefs, or a feeling that the native must build their own path and value system rather than simply inheriting one. There may be a recurring theme of working through family dynamics — not to repeat old patterns, but to understand and resolve them.\n\nThis pattern also carries genuine potential: people with Pitra Dosha often develop a heightened sense of purpose, a strong capacity for spiritual growth, and the ability to break generational cycles in ways that benefit those who come after them. The pressure of this pattern, when worked with consciously, can become a path toward deep dharmic awareness and leadership built on genuine understanding rather than inherited status.\n\nNote: different astrology traditions define this pattern differently. It is shown here as an indicative tendency, not a fixed outcome.",
    whyItForms: "The Sun is disturbed (conjunct a node, debilitated, or under malefic influence) AND the 9th house or 9th lord is simultaneously afflicted.",
    whatReducesIt:
      "The most powerful relief condition for Pitra Dosha is Jupiter's presence — either placed in the 9th house, aspecting the 9th lord, or aspecting the Sun. Jupiter's wisdom and expansive quality can open the 9th house's connection to higher purpose and ancestral support even when the chart shows this affliction. A chart with strong Jupiter involvement is a very different experience of this pattern than one without it.\n\nWhen the 9th lord is strong — in its own sign or exaltation — the affliction to the 9th house's outer environment is offset by the internal strength of the house's ruler. The native may still face the themes this pattern brings, but they will have the inner resources and orientation to navigate them constructively rather than being consumed by them.",
    guidance:
      "This pattern may show strong family or ancestral themes. It can indicate responsibility toward family values, complex father-related dynamics, or the need to build your own path and sense of dharma rather than simply following what was inherited. These are meaningful life tasks, not punishments.\n\nDuring Sun, Ketu or Saturn Mahadasha (depending on which planets are involved in the pattern), these themes may become more prominent in daily experience. Engaging consciously with questions of purpose, heritage and what you wish to pass forward — rather than avoiding them — tends to shift the pattern's expression from burden to meaning over time.",
    shortMeaning: "May show family and ancestral themes requiring conscious integration.",
  },

  gandanta: {
    id: "gandanta",
    name: "Gandanta",
    defaultLifeAreas: ["emotional_life", "health", "spirituality"],
    whatItMeans:
      "Gandanta refers to a specific degree-based pattern in the birth chart where one or more planets — or the Lagna itself — are placed near the junction between a water sign (Cancer, Scorpio, or Pisces) and a fire sign (Aries, Leo, or Sagittarius). In sidereal Vedic astrology, these three sign transitions are considered energetically sensitive: the shift from water to fire represents a passage from formlessness to form, from dissolution to emergence.\n\nThe term Gandanta literally refers to a knot or difficult junction. Planets placed within approximately 3° of these sign boundaries — whether in the last degrees of a water sign or the first degrees of a fire sign — are said to occupy this sensitive zone. The Moon and the Lagna are considered most significant when placed here; other planets carry proportionally different weight depending on their importance in the chart.\n\nIn practical terms, this pattern may describe certain qualities of inner complexity, periods of significant transition, or a sense of standing between two phases of life rather than being settled in one. It is not a prediction of difficulty, but rather a marker of sensitivity and depth — people with prominent planets in Gandanta often develop an unusual capacity for transformation and working through inner complexity.",
    whyItForms: "One or more planets or the Lagna are placed within 3° of the transition between a water sign and a fire sign (Cancer/Leo, Scorpio/Sagittarius, or Pisces/Aries).",
    whatReducesIt:
      "The challenging dimension of Gandanta is significantly reduced when Jupiter strongly aspects the affected planet — Jupiter's wisdom and protective quality can provide the equanimity and perspective that helps the native navigate the sensitivity of these degrees constructively rather than being overwhelmed by it.\n\nWhen the affected planet is otherwise strong by dignity (own sign, exaltation) and the overall chart has good Lagna strength and supportive benefic yogas, the Gandanta position of one planet becomes one factor among many rather than a dominant influence. The Moon in Gandanta is particularly helped by Jupiter's aspect; the Lagna in Gandanta benefits from a strong Lagna lord well-placed in a Kendra or Trikona.",
    guidance:
      "Gandanta is best approached as a description of depth and sensitivity rather than a prediction of difficulty. Planets placed in these degrees are at a point of transition — between dissolution and emergence, between the formless and the formed. This can produce a quality of unusual inner richness, the capacity for profound change, and a life that moves through significant phases rather than remaining static.\n\nThe most common experience described by people with Moon or Lagna in Gandanta is a sense of being between two worlds at important life junctures — neither fully resolved nor fully in motion. Practices that support inner stability, emotional processing, and a grounded connection to the present tend to be particularly valuable for navigating this quality. The sensitivity associated with Gandanta, when worked with consciously, often becomes a genuine asset.",
    shortMeaning: "Indicates a sensitive degree position near a water-fire sign junction.",
  },
}
