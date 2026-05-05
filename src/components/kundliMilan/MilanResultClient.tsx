'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { MilanResult, KutaResult } from '@/lib/astrology/kundliMilan/types'
import type { PersonBirthInput } from '@/lib/astrology/kundliMilan/types'
import { useAuth } from '@/hooks/useAuth'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

interface StoredResult {
  result: MilanResult
  person1Input: PersonBirthInput
  person2Input: PersonBirthInput
}

const VERDICT_COLOR: Record<string, string> = {
  excellent: '#16a34a',
  good:      '#2563eb',
  acceptable:'#d97706',
  low:       '#dc2626',
}
const VERDICT_BG: Record<string, string> = {
  excellent: 'rgba(22,163,74,0.1)',
  good:      'rgba(37,99,235,0.1)',
  acceptable:'rgba(217,119,6,0.1)',
  low:       'rgba(220,38,38,0.1)',
}

const HI = {
  // breadcrumb & nav
  breadcrumbResult: 'अष्टकूट मिलान परिणाम',
  // score section
  totalScore: 'कुल अंक',
  outOf: 'में से',
  compatibility: 'अनुकूलता',
  compatibilityPct: '% अनुकूलता',
  acceptable18: '१८ — सामान्य',
  // person card
  viewKundli: 'कुंडली देखें →',
  opening: 'खुल रहा है…',
  // kuta section
  kutaBreakdown: 'अष्ट कूट विश्लेषण',
  kutaTapHint: (p1: string, p2: string) => `किसी भी कूट पर टैप करें और देखें कि ${p1} और ${p2} के लिए इसका क्या अर्थ है।`,
  maxPts: 'अधिकतम',
  // manglik section
  doshaAnalysis: 'दोष विश्लेषण',
  manglikTitle: 'मांगलिक दोष',
  manglikExplainer: 'मांगलिक दोष तब बनता है जब मंगल लग्न से 1, 4, 7, 8 या 12वें भाव में होता है। रद्दीकरण कारक जैसे गुरु की दृष्टि, मंगल स्वराशि में या उच्च का हो — दोष को काफी हद तक कम या निरस्त कर सकते हैं।',
  manglikYes: '⚠ मांगलिक',
  manglikPartly: '~ मांगलिक (आंशिक)',
  manglikNo: '✓ मांगलिक नहीं',
  combinedReading: 'संयुक्त विश्लेषण',
  doubleManglik: (p1: string, p2: string) => `${p1} और ${p2} दोनों मांगलिक हैं। अधिकांश वैदिक परंपराओं में, जब दोनों साथी मांगलिक हों तो दोष एक-दूसरे को निरस्त करते हैं। इस मिलान में सामान्य मांगलिक चिंता नहीं है।`,
  neitherManglik: (p1: string, p2: string) => `न ${p1} और न ${p2} को मांगलिक दोष है। इस मिलान में कोई मांगलिक-संबंधी समस्या नहीं है।`,
  oneManglik: 'एक साथी मांगलिक है और दूसरा नहीं। परंपरागत रूप से यह ध्यान देने योग्य है — परंतु रद्दीकरण कारक, मंगल की गरिमा, 7वें भाव की स्थिति और शुक्र/गुरु की स्थिति वास्तविक प्रभाव को बदलती है।',
  ageTitle: 'आयु के साथ मांगल दोष का प्रभाव कम होता है',
  ageBothOver30: (p1: string, p2: string) => `कई वैदिक ज्योतिषी मानते हैं कि मंगल-संबंधी दोष लगभग 28 वर्ष की आयु के बाद कम होता है। चूंकि ${p1} और ${p2} दोनों 30 से ऊपर हैं, मांगलिक कारकों को पूर्ण कुंडली के संदर्भ में पढ़ा जाना चाहिए।`,
  ageEitherOver30: 'एक साथी 30 से ऊपर है, इसलिए मांगलिक कारकों को इस मिलान में अधिक संदर्भ के साथ व्याख्यायित किया जाता है।',
  ageNeither: 'अष्टकूट मिलान एक दृष्टिकोण है, संपूर्ण चित्र नहीं। चरित्र, संवाद, साझा मूल्य, और दोनों कुंडलियों में 7वें भाव व शुक्र की स्थिति उतनी ही — यदि अधिक नहीं — निर्णायक होती है।',
  // dosha remedies
  remediesTitle: 'दोष निवारण उपाय',
  signInForRemedies: 'उपाय देखने के लिए लॉग इन करें',
  // verdict
  verdictLabels: {
    excellent: 'उत्तम संयोग',
    good: 'शुभ संयोग',
    acceptable: 'सामान्य संयोग',
    low: 'अशुभ संयोग',
  },
  verdictDesc: {
    excellent: 'उच्च अनुकूलता। सभी जीवन क्षेत्रों — आध्यात्मिक, भावनात्मक और शारीरिक — में मजबूत सामंजस्य।',
    good: 'अनुकूल मिलान। एक सुखमय जीवन की अच्छी संभावनाएं हैं।',
    acceptable: 'मध्यम अनुकूलता। कुछ अंतर हैं, लेकिन आपसी समझ से इन्हें संभाला जा सकता है।',
    low: 'स्वभाव और जीवन ऊर्जाओं में उल्लेखनीय अंतर। सावधानीपूर्वक विचार आवश्यक है।',
  },
  // manglik card
  manglikBadgeYes: '⚠ मांगलिक',
  manglikBadgePartly: '~ मांगलिक (आंशिक)',
  manglikBadgeNo: '✓ मांगलिक नहीं',
  severityLabel: {
    weak: 'हल्का',
    moderate: 'मध्यम',
    strong: 'तीव्र',
    very_strong: 'अत्यंत तीव्र',
  },
  marsHouse: (h: number) => `मंगल · भाव ${h}`,
  ageReduces: (age: number) => ` ${age} वर्ष की आयु में मंगल-संबंधी प्रभाव की तीव्रता कम होती जाती है।`,
  kutaNames: {
    'Varna': 'वर्ण',
    'Vashya': 'वश्य',
    'Tara': 'तारा',
    'Yoni': 'योनि',
    'Graha Maitri': 'ग्रह मैत्री',
    'Gana': 'गण',
    'Bhakoot': 'भकूट',
    'Nadi': 'नाड़ी',
  },
  // CTA section
  openChart: 'कुंडली देखें',
  checkAnother: '← दूसरा मिलान करें',
  // Muhurta CTA card
  muhurtaCardLabel: 'अगला कदम',
  muhurtaCardTitle: 'विवाह मुहूर्त खोजें',
  muhurtaCardBody: 'तिथि, नक्षत्र, लग्न और ग्रह स्थिति के आधार पर सबसे शुभ विवाह तिथियां खोजें।',
  muhurtaCardBtn: 'मुहूर्त खोजें →',
  // Kundli CTA card
  kundliCardLabel: 'व्यक्तिगत कुंडली',
  kundliCardTitle: 'अपनी कुंडली देखें',
  kundliCardBody: 'विवाह का समय, साथी का विवरण, संतान, वित्त — ये सब आपकी जन्मकुंडली से आते हैं।',
  kundliCardBtn: 'निःशुल्क कुंडली बनाएं →',
  // Find Muhurta (old, keep for backward compat)
  findMuhurta: 'विवाह मुहूर्त खोजें →',
  // Share
  shareBtn: 'शेयर करें',
  shareMsgFmt: (n1: string, n2: string, score: number, pct: number, verdict: string) =>
    `${n1} और ${n2} का कुंडली मिलान परिणाम\n\nअष्टकूट स्कोर: ${score}/36 (${pct}%)\n${verdict}\n\nअपना कुंडली मिलान जांचें: https://astrotattwa.com/kundli-milan`,
  // Person card
  born: 'जन्म',
  moonSignLabel: 'चंद्र राशि',
}

const DOSHA_REMEDIES: Record<string, { en: string[]; hi: string[] }> = {
  'Nadi Dosha': {
    en: [
      'Recite Maha Mrityunjaya mantra 108 times daily for 40 days before marriage',
      'Donate sesame seeds (til) and black sesame on Saturdays',
      'Perform Nadi Dosha Nivaran Puja with a qualified priest before the wedding',
      'Observe fast on Saturdays and donate to the needy',
    ],
    hi: [
      'विवाह से 40 दिन पूर्व प्रतिदिन महा मृत्युंजय मंत्र का 108 बार जाप करें',
      'शनिवार को तिल और काले तिल का दान करें',
      'विवाह से पूर्व योग्य पुजारी द्वारा नाड़ी दोष निवारण पूजा करवाएं',
      'शनिवार का व्रत रखें और जरूरतमंदों को दान करें',
    ],
  },
  'Bhakoot Dosha': {
    en: [
      'Recite Vishnu Sahasranama together as a couple after marriage',
      'Perform Satyanarayan Katha before or after the wedding ceremony',
      'Donate to Brahmins and temples on Thursdays',
      'Seek blessings at a Vishnu or Jupiter-associated temple together',
    ],
    hi: [
      'विवाह के बाद दोनों साथ मिलकर विष्णु सहस्रनाम का पाठ करें',
      'विवाह से पहले या बाद में सत्यनारायण कथा करवाएं',
      'गुरुवार को ब्राह्मणों और मंदिरों में दान करें',
      'साथ मिलकर विष्णु या गुरु से संबंधित मंदिर में आशीर्वाद लें',
    ],
  },
  'Gana Dosha': {
    en: [
      'Recite Hanuman Chalisa daily for both partners',
      'Donate red items (cloth, lentils) on Tuesdays',
      'Perform Mangal Shanti Puja before the wedding',
      'Worship Lord Shiva together — offer water to Shivalinga on Mondays',
    ],
    hi: [
      'दोनों साथी प्रतिदिन हनुमान चालीसा का पाठ करें',
      'मंगलवार को लाल वस्तुओं (कपड़ा, दाल) का दान करें',
      'विवाह से पूर्व मंगल शांति पूजा करवाएं',
      'साथ मिलकर भगवान शिव की पूजा करें — सोमवार को शिवलिंग पर जल चढ़ाएं',
    ],
  },
  'Mangal Dosha': {
    en: [
      'Recite Mangal mantra "Om Kram Kreem Kraum Sah Bhaumaya Namah" 108 times daily',
      'Observe fast on Tuesdays and donate red lentils (masoor dal) and red cloth',
      'Worship Lord Hanuman on Tuesdays and Saturdays',
      'For severe Mangal Dosha: consider Kumbh Vivah ritual as advised by a priest',
    ],
    hi: [
      'प्रतिदिन मंगल मंत्र "ॐ क्रां क्रीं क्रौं सः भौमाय नमः" का 108 बार जाप करें',
      'मंगलवार का व्रत रखें और मसूर दाल व लाल कपड़े का दान करें',
      'मंगलवार और शनिवार को हनुमान जी की पूजा करें',
      'गंभीर मांगलिक दोष के लिए: पुजारी की सलाह पर कुंभ विवाह संस्कार पर विचार करें',
    ],
  },
}

// ── Hindi lookup maps ────────────────────────────────────────────────────────

const HI_SIGN: Record<string, string> = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क",
  Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक",
  Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
}

const HI_NAKSHATRA: Record<string, string> = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी",
  Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य",
  Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्व फाल्गुनी",
  "Uttara Phalguni": "उत्तर फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा",
  Swati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा",
  Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा",
  Shravana: "श्रवण", Dhanishtha: "धनिष्ठा", Shatabhisha: "शतभिषा",
  "Purva Bhadrapada": "पूर्व भाद्रपद", "Uttara Bhadrapada": "उत्तर भाद्रपद", Revati: "रेवती",
}

const HI_PLANET: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
  Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि",
}

const HI_VARNA: Record<string, { name: string; desc: string }> = {
  Brahmin:   { name: "ब्राह्मण", desc: "ब्राह्मण वर्ण ज्ञान, विवेक और आध्यात्मिक झुकाव से जुड़ा है।" },
  Kshatriya: { name: "क्षत्रिय", desc: "क्षत्रिय वर्ण साहस, सुरक्षा और नेतृत्व से जुड़ा है।" },
  Vaishya:   { name: "वैश्य", desc: "वैश्य वर्ण व्यापार, उद्यमशीलता और भौतिक उपलब्धियों से जुड़ा है।" },
  Shudra:    { name: "शूद्र", desc: "शूद्र वर्ण सेवा, समर्पण और व्यावहारिक दृढ़ता से जुड़ा है।" },
}

const HI_VASHYA: Record<string, { name: string; desc: string }> = {
  Human:     { name: "मानव (नर)", desc: "मानव वर्ग बौद्धिक रूप से प्रेरित, सामाजिक और मानसिक तालमेल चाहते हैं।" },
  Quadruped: { name: "चतुष्पाद", desc: "चतुष्पाद वर्ग स्थिर, वफादार होते हैं और सुरक्षा व नियमितता को महत्व देते हैं।" },
  Water:     { name: "जलचर", desc: "जलचर वर्ग भावनात्मक रूप से संवेदनशील, अनुकूलनीय और गहरे बंधनों में पनपते हैं।" },
  Wild:      { name: "वनचर", desc: "वनचर वर्ग स्वतंत्र, प्रभावशाली होते हैं और उन्हें स्थान व सम्मान चाहिए।" },
  Insect:    { name: "कीट", desc: "कीट वर्ग तीव्र, अंतर्ज्ञानी होते हैं और गहरी प्रवृत्ति पर चलते हैं।" },
}

const HI_TARA: Record<string, { name: string; desc: string }> = {
  Janma:         { name: "जन्म",       desc: "जन्म — अशुभ, स्वास्थ्य संबंधी चिंताओं से जुड़ा।" },
  Sampat:        { name: "संपत",       desc: "संपत (धन) — अत्यंत शुभ, समृद्धि लाने वाला।" },
  Vipat:         { name: "विपत्",      desc: "विपत् (खतरा) — अशुभ, बाधाओं और कठिनाइयों से जुड़ा।" },
  Kshema:        { name: "क्षेम",      desc: "क्षेम (कल्याण) — शुभ, आराम और स्थिरता देने वाला।" },
  Pratyak:       { name: "प्रत्यक्",   desc: "प्रत्यक् (बाधा) — अशुभ, घर्षण और देरी से जुड़ा।" },
  Sadhaka:       { name: "साधक",       desc: "साधक (उपलब्धि) — शुभ, लक्ष्यों और विकास को सहारा देता है।" },
  Vadha:         { name: "वध",         desc: "वध (रुकावट) — अशुभ, गंभीर कठिनाइयों से जुड़ा।" },
  Mitra:         { name: "मित्र",      desc: "मित्र (मित्र) — शुभ, सद्भाव और पारस्परिक सहयोग लाने वाला।" },
  "Param Mitra": { name: "परम मित्र", desc: "परम मित्र (महान मित्र) — सर्वाधिक शुभ तारा, असाधारण सामंजस्य।" },
}

const HI_GANA: Record<string, { name: string; desc: string }> = {
  Deva:     { name: "देव",     desc: "देव गण के जातक सामान्यतः कोमल, आदर्शवादी, आध्यात्मिक झुकाव वाले और जीवन को खुलेपन व करुणा से देखने वाले होते हैं।" },
  Manushya: { name: "मनुष्य", desc: "मनुष्य गण के जातक संतुलित, व्यावहारिक और जमीन से जुड़े होते हैं — वे सांसारिक सफलता और व्यक्तिगत संबंधों दोनों को महत्व देते हैं।" },
  Rakshasa: { name: "राक्षस", desc: "राक्षस गण के जातक तीव्र, स्वतंत्र, दृढ़ और महत्वाकांक्षी होते हैं।" },
}

const HI_NADI: Record<string, { name: string; desc: string }> = {
  Adi:    { name: "आदि नाड़ी",  desc: "आदि (प्रथम) नाड़ी वात प्रकृति से जुड़ी है — सक्रिय, वायवीय ऊर्जा।" },
  Madhya: { name: "मध्य नाड़ी", desc: "मध्य नाड़ी पित्त प्रकृति से जुड़ी है — तीक्ष्ण, अग्नि ऊर्जा।" },
  Antya:  { name: "अंत्य नाड़ी", desc: "अंत्य (अंतिम) नाड़ी कफ प्रकृति से जुड़ी है — स्थिर, पृथ्वी ऊर्जा।" },
}

const HI_YONI: Record<string, string> = {
  Horse: "अश्व", Elephant: "गज", Sheep: "मेढ़ा", Serpent: "सर्प",
  Dog: "श्वान", Cat: "मार्जार", Rat: "मूषक", Cow: "गो",
  Buffalo: "महिष", Tiger: "व्याघ्र", Hare: "शश", Deer: "मृग",
  Monkey: "वानर", Mongoose: "नकुल", Lion: "सिंह",
}

const TARA_NAMES_EN = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhaka", "Vadha", "Mitra", "Param Mitra"]
const AUSPICIOUS_TARAS_SET = new Set([2, 4, 6, 8, 9])

// ── Hindi kuta content generator ─────────────────────────────────────────────

type KutaHindiContent = { description: string; about: string; p1text: string; p2text: string; meaning: string }

function getHindiKutaContent(
  kuta: KutaResult,
  p1: MilanResult["person1"],
  p2: MilanResult["person2"],
): KutaHindiContent | null {
  const n1 = p1.name, n2 = p2.name
  const s1 = HI_SIGN[p1.moonSign] ?? p1.moonSign
  const s2 = HI_SIGN[p2.moonSign] ?? p2.moonSign
  const nak1 = HI_NAKSHATRA[p1.nakshatra] ?? p1.nakshatra
  const nak2 = HI_NAKSHATRA[p2.nakshatra] ?? p2.nakshatra

  switch (kuta.name) {

    case "Varna": {
      const v1 = HI_VARNA[p1.varna] ?? { name: p1.varna, desc: "" }
      const v2 = HI_VARNA[p2.varna] ?? { name: p2.varna, desc: "" }
      return {
        description: kuta.score === 1
          ? `${v1.name} (${n1}) ≥ ${v2.name} (${n2}) — अनुकूल`
          : `${v1.name} (${n1}) < ${v2.name} (${n2}) — प्रतिकूल`,
        about: "वर्ण अष्टकूट का पहला और सबसे सरल कूट है जिसका अधिकतम 1 अंक है। यह पारंपरिक चार-स्तरीय ढांचे — ब्राह्मण, क्षत्रिय, वैश्य और शूद्र — का उपयोग करके प्रत्येक व्यक्ति की चंद्र राशि की आध्यात्मिक प्रवृत्ति की तुलना करता है। परंपरागत शास्त्र यह अपेक्षा करते हैं कि पुरुष साथी का वर्ण स्त्री के वर्ण के बराबर या अधिक हो। यह कूट सबसे कम भार रखता है, किंतु यह बताता है कि दोनों साथी जीवन के प्रति एक व्यापक रूप से अनुकूल दृष्टिकोण साझा करते हैं या नहीं।",
        p1text: `${n1} की चंद्र राशि ${s1} है, जो उन्हें ${v1.name} वर्ण में रखती है। ${v1.desc}`,
        p2text: `${n2} की चंद्र राशि ${s2} है, जो उन्हें ${v2.name} वर्ण में रखती है। ${v2.desc}`,
        meaning: kuta.score === 1
          ? `${n1} का ${v1.name} वर्ण ${n2} के ${v2.name} वर्ण से बराबर या अधिक है, इसलिए यह कूट संतुष्ट है। यह दर्शाता है कि दोनों साथी एक अनुकूल आध्यात्मिक दृष्टिकोण साझा करते हैं।`
          : `${n1} का ${v1.name} वर्ण ${n2} के ${v2.name} वर्ण से कम है। परंपरागत रूप से यह कूट संतुष्ट नहीं है, हालांकि इसका भार केवल 1 अंक है। जब अन्य कूट — विशेषकर नाड़ी, भकूट और गण — मजबूत हों, तो इस कूट के अनेक जोड़े बहुत सुखपूर्वक जीवन व्यतीत करते हैं।`,
      }
    }

    case "Vashya": {
      const va1 = HI_VASHYA[p1.vashya] ?? { name: p1.vashya, desc: "" }
      const va2 = HI_VASHYA[p2.vashya] ?? { name: p2.vashya, desc: "" }
      return {
        description: kuta.score === 2
          ? `एक ही वर्ग (${va1.name}) — पूर्णतः अनुकूल`
          : kuta.score === 1
          ? `${va1.name} × ${va2.name} — आंशिक अनुकूलता`
          : `${va1.name} (${n1}) × ${va2.name} (${n2}) — प्रतिकूल`,
        about: "वश्य (अर्थात \"आकर्षण\" या \"प्रभाव\") साझेदारों के बीच स्वाभाविक शक्ति संतुलन और चुंबकीय आकर्षण का आकलन करता है। प्रत्येक चंद्र राशि को पांच वर्गों में वर्गीकृत किया गया है: मानव (नर), चतुष्पाद, जलचर, वनचर या कीट। एक ही वर्ग के साथी पूर्ण वश्य का आनंद लेते हैं — एक स्वाभाविक, संतुलित आकर्षण। कुछ अंतर-वर्ग युग्म आंशिक अंक प्राप्त करते हैं।",
        p1text: `${n1} की चंद्र राशि ${s1} है, जो ${va1.name} वर्ग से संबंधित है। ${va1.desc}`,
        p2text: `${n2} की चंद्र राशि ${s2} है, जो ${va2.name} वर्ग से संबंधित है। ${va2.desc}`,
        meaning: kuta.score === 2
          ? `${n1} और ${n2} दोनों एक ही ${va1.name} वर्ग से हैं, जिससे पूर्ण वश्य अनुकूलता प्राप्त होती है। यह एक स्वाभाविक, सममित आकर्षण और परस्पर सम्मान को दर्शाता है।`
          : kuta.score === 1
          ? `${va1.name} और ${va2.name} को आंशिक रूप से अनुकूल वर्ग माना जाता है। कुछ स्वाभाविक आकर्षण है, किंतु अधिकार या निर्णय लेने के दृष्टिकोण में कभी-कभी अंतर हो सकता है।`
          : `${va1.name} और ${va2.name} इस कूट में प्रतिकूल वर्ग माने गए हैं। नियंत्रण, स्वायत्तता या संबंध भूमिकाओं के बारे में भिन्न विचार हो सकते हैं। कई अन्य कूट इसकी भरपाई कर सकते हैं।`,
      }
    }

    case "Tara": {
      const dist1 = (p1.nakshatraIndex - p2.nakshatraIndex + 27) % 27
      const dist2 = (p2.nakshatraIndex - p1.nakshatraIndex + 27) % 27
      const tara1idx = (dist1 % 9) + 1
      const tara2idx = (dist2 % 9) + 1
      const a1 = AUSPICIOUS_TARAS_SET.has(tara1idx)
      const a2 = AUSPICIOUS_TARAS_SET.has(tara2idx)
      const t1en = TARA_NAMES_EN[tara1idx - 1]
      const t2en = TARA_NAMES_EN[tara2idx - 1]
      const t1 = HI_TARA[t1en] ?? { name: t1en, desc: "" }
      const t2 = HI_TARA[t2en] ?? { name: t2en, desc: "" }
      return {
        description: `${n1}: ${t1.name} (${a1 ? "शुभ" : "अशुभ"}), ${n2}: ${t2.name} (${a2 ? "शुभ" : "अशुभ"})`,
        about: "तारा (नक्षत्र) एक व्यक्ति की जन्म नक्षत्र से दूसरे की ओर नक्षत्र दूरी गिनकर भाग्य अनुकूलता की जांच करता है। परिणामी स्थिति (1–9) नौ नामित तारों में से एक पर आती है: जन्म, संपत, विपत्, क्षेम, प्रत्यक्, साधक, वध, मित्र और परम मित्र। सम-क्रमांक वाले (संपत, क्षेम, साधक, मित्र, परम मित्र) शुभ हैं। विषम क्रमांक वाले (जन्म, विपत्, प्रत्यक्, वध) अशुभ हैं। पूर्ण अंक के लिए दोनों साथियों की स्थिति शुभ होनी चाहिए।",
        p1text: `${n1} की जन्म नक्षत्र ${nak1} है। ${n2} की नक्षत्र (${nak2}) से गिनने पर यह स्थिति ${tara1idx} — ${t1.name} पर आती है। ${t1.desc}`,
        p2text: `${n2} की जन्म नक्षत्र ${nak2} है। ${n1} की नक्षत्र (${nak1}) से गिनने पर यह स्थिति ${tara2idx} — ${t2.name} पर आती है। ${t2.desc}`,
        meaning: kuta.score === 3
          ? `${n1} (${t1.name}) और ${n2} (${t2.name}) दोनों शुभ तारा स्थितियों पर हैं — पूर्ण 3 अंक। यह साझे भाग्य के लिए एक बहुत सकारात्मक संकेत है।`
          : kuta.score === 1.5
          ? "एक साथी की शुभ तारा स्थिति है और दूसरे की नहीं। यह मिश्रित परिणाम है — एक साथी को दूसरे की तुलना में अधिक लाभ होता है।"
          : `${n1} (${t1.name}) और ${n2} (${t2.name}) दोनों अशुभ तारा स्थितियों पर हैं। यह परंपरागत रूप से साझी यात्रा में संभावित बाधाओं का संकेत है। अन्य मजबूत कूट — विशेषकर नाड़ी और भकूट — सार्थक संतुलन प्रदान कर सकते हैं।`,
      }
    }

    case "Yoni": {
      const y1 = HI_YONI[p1.yoni] ?? p1.yoni
      const y2 = HI_YONI[p2.yoni] ?? p2.yoni
      const isEnemy = kuta.score === 0 && p1.yoni !== p2.yoni
      return {
        description: kuta.score === 4
          ? `दोनों ${y1} — प्राकृतिक युगल (विपरीत लिंग)`
          : kuta.score === 3
          ? `दोनों ${y1} — एक ही पशु, एक ही लिंग`
          : isEnemy
          ? `${y1} (${n1}) और ${y2} (${n2}) शत्रु पशु हैं`
          : `${y1} (${n1}) और ${y2} (${n2}) — तटस्थ`,
        about: "योनि प्रत्येक 27 नक्षत्रों को एक पशु प्रतीक — पुरुष या स्त्री — देकर शारीरिक और अंतरंग अनुकूलता का आकलन करती है। इसमें 14 पशु हैं। आदर्श संयोग एक ही पशु का विपरीत लिंग युगल है, जो स्वाभाविक, पूरक आकर्षण को दर्शाता है। कुछ पशु युग्म शत्रु माने जाते हैं जैसे सर्प और नकुल — और शून्य अंक देते हैं।",
        p1text: `${n1} की नक्षत्र ${nak1} है, जिसका प्रतीक ${y1} है।`,
        p2text: `${n2} की नक्षत्र ${nak2} है, जिसका प्रतीक ${y2} है।`,
        meaning: kuta.score === 4
          ? `${n1} (${y1}) और ${n2} (${y2}) एक ही पशु के विपरीत लिंग युगल हैं — आदर्श योनि मिलान। यह परंपरागत रूप से गहरी शारीरिक अनुकूलता और स्वाभाविक आकर्षण का संकेत है।`
          : kuta.score === 3
          ? `दोनों ${y1} पशु साझा करते हैं — अच्छी अनुकूलता। एक ही लिंग का एक ही पशु सामंजस्यपूर्ण माना जाता है।`
          : isEnemy
          ? `${y1} और ${y2} इस पद्धति में शत्रु पशु माने जाते हैं। यह परंपरागत रूप से शारीरिक असामंजस्य या अंतरंग क्षेत्र में घर्षण का संकेत है। यह 8 कूटों में से एक है और अन्य मजबूत संरेखण इसकी भरपाई कर सकते हैं।`
          : `${y1} और ${y2} एक तटस्थ पशु युगल हैं, जिससे 4 में से 2 अंक मिलते हैं। यह एक कार्यात्मक, यदि असाधारण नहीं तो, शारीरिक अनुकूलता है।`,
      }
    }

    case "Graha Maitri": {
      const lord1en = (p1.moonSign === "Aries" || p1.moonSign === "Scorpio") ? "Mars"
        : (p1.moonSign === "Taurus" || p1.moonSign === "Libra") ? "Venus"
        : (p1.moonSign === "Gemini" || p1.moonSign === "Virgo") ? "Mercury"
        : (p1.moonSign === "Cancer") ? "Moon"
        : (p1.moonSign === "Leo") ? "Sun"
        : (p1.moonSign === "Sagittarius" || p1.moonSign === "Pisces") ? "Jupiter"
        : "Saturn"
      const lord2en = (p2.moonSign === "Aries" || p2.moonSign === "Scorpio") ? "Mars"
        : (p2.moonSign === "Taurus" || p2.moonSign === "Libra") ? "Venus"
        : (p2.moonSign === "Gemini" || p2.moonSign === "Virgo") ? "Mercury"
        : (p2.moonSign === "Cancer") ? "Moon"
        : (p2.moonSign === "Leo") ? "Sun"
        : (p2.moonSign === "Sagittarius" || p2.moonSign === "Pisces") ? "Jupiter"
        : "Saturn"
      const l1 = HI_PLANET[lord1en] ?? lord1en
      const l2 = HI_PLANET[lord2en] ?? lord2en
      return {
        description: `${l1} (${n1}) और ${l2} (${n2}) — ${kuta.score >= 4 ? "मित्र" : kuta.score >= 3 ? "तटस्थ" : "शत्रु"}`,
        about: "ग्रह मैत्री प्रत्येक व्यक्ति की चंद्र राशि के स्वामी ग्रहों के बीच संबंध की जांच करके मानसिक और बौद्धिक अनुकूलता मापती है। जब दोनों स्वामी ग्रह प्राकृतिक मित्र हों, तो दंपति स्वाभाविक रूप से एक-दूसरे को समझते हैं, समान मूल्य साझा करते हैं और मानसिक सहजता अनुभव करते हैं। तटस्थ या शत्रु संबंध संवाद में कभी-कभी घर्षण का संकेत दे सकते हैं।",
        p1text: `${n1} की चंद्र राशि ${s1} है, जिसके स्वामी ${l1} हैं। ${l1}, ${n1} के विचार पैटर्न और भावनात्मक शैली को आकार देते हैं। ${l2} (${n2} के चंद्र स्वामी) के संबंध में, ${l1} ${kuta.score >= 3 ? "मित्र या तटस्थ" : "शत्रु"} हैं।`,
        p2text: `${n2} की चंद्र राशि ${s2} है, जिसके स्वामी ${l2} हैं। ${l2}, ${n2} की आंतरिक दुनिया और भावनात्मक अभिव्यक्ति को आकार देते हैं।`,
        meaning: kuta.score === 5
          ? `दोनों चंद्र स्वामी परस्पर मित्र हैं — ${l1} और ${l2} दोनों दिशाओं में स्वाभाविक रूप से मेल खाते हैं। यह सर्वोत्तम ग्रह मैत्री परिणामों में से एक है।`
          : kuta.score >= 3
          ? "ग्रह मैत्री सकारात्मक है, किंतु पूरी तरह पारस्परिक नहीं। एक स्वामी दूसरे की ओर अधिक आकर्षित हो सकता है। व्यवहार में यह अच्छा काम करता है।"
          : kuta.score === 2
          ? "एक स्वामी मित्र है जबकि दूसरा उसे शत्रु मानता है। यह एक असममित गतिशीलता बनाता है — एक साथी को दूसरे से अधिक समझा महसूस हो सकता है।"
          : `${l1} और ${l2} इस ढांचे में तटस्थ-से-शत्रु या दोनों शत्रु हैं। मानसिक और संवाद संबंधी मतभेद अधिक ध्यान देने योग्य हो सकते हैं। धैर्य और एक-दूसरे की सोच के प्रति वास्तविक जिज्ञासा से ये मतभेद पूरक बन सकते हैं।`,
      }
    }

    case "Gana": {
      const g1 = HI_GANA[p1.gana] ?? { name: p1.gana, desc: "" }
      const g2 = HI_GANA[p2.gana] ?? { name: p2.gana, desc: "" }
      return {
        description: `${n1}: ${g1.name}, ${n2}: ${g2.name}${kuta.score === 0 ? " — गण दोष" : ""}`,
        about: "गण उनके जन्म नक्षत्र से व्युत्पन्न तीन दिव्य आदर्शों के माध्यम से प्रत्येक व्यक्ति के मूलभूत स्वभाव और प्रकृति की जांच करता है: देव (दैवीय), मनुष्य (मानवीय) और राक्षस (उग्र)। इस कूट का अधिकतम 6 अंक है — यह तीसरा सबसे अधिक भारित आकलन है। स्वभाव अनुकूलता महत्वपूर्ण है क्योंकि यह दैनिक जीवन को प्रभावित करती है: संघर्ष को कैसे संभालें, प्राथमिकताएं कैसे तय करें, प्यार कैसे व्यक्त करें। देव और मनुष्य अनुकूल माने जाते हैं। राक्षस के साथ किसी भी अन्य के लिए अधिक सचेत समायोजन की आवश्यकता हो सकती है।",
        p1text: `${n1} की नक्षत्र ${nak1} ${g1.name} गण से संबंधित है। ${g1.desc}`,
        p2text: `${n2} की नक्षत्र ${nak2} ${g2.name} गण से संबंधित है। ${g2.desc}`,
        meaning: kuta.score === 6
          ? `${n1} और ${n2} दोनों ${g1.name} गण साझा करते हैं — सर्वोत्तम गण अनुकूलता। साझा स्वभाव का अर्थ है दैनिक जीवन में कम घर्षण बिंदु।`
          : kuta.score === 5
          ? "देव और मनुष्य को अनुकूल गण माना जाता है, जिससे लगभग पूर्ण अंक मिलते हैं। ये दो प्रकृतियां एक-दूसरे की अच्छी तरह पूरक हैं।"
          : kuta.score === 1
          ? "देव और राक्षस गण काफी भिन्न प्रकृति के माने जाते हैं। साझे लक्ष्य और परस्पर सम्मान स्वभाव संबंधी अंतर को पाट सकते हैं।"
          : "मनुष्य और राक्षस मिलकर गण दोष बनाते हैं — मूलभूत स्वभाव में महत्वपूर्ण असमानता। यह अधिक महत्वपूर्ण कूट चिंताओं में से एक है, किंतु कई जोड़े आत्म-जागरूकता और मजबूत संवाद से इसे सफलतापूर्वक संभालते हैं।",
      }
    }

    case "Bhakoot": {
      const bs = p1.moonSignNumber
      const gs = p2.moonSignNumber
      const posB = ((bs - gs + 12) % 12) + 1
      const posG = ((gs - bs + 12) % 12) + 1
      const pair = new Set([posB, posG])
      const is2_12 = pair.has(2) && pair.has(12)
      const is6_8 = pair.has(6) && pair.has(8)
      const inauspicious = is2_12 || is6_8
      return {
        description: inauspicious
          ? `${posB}-${posG} संबंध — भकूट दोष`
          : `${s1} × ${s2} — अनुकूल`,
        about: "भकूट दूसरा सबसे अधिक भारित कूट है (7 अंक) और राशिचक्र में दो चंद्र राशियों के बीच स्थितीय संबंध की जांच करता है। यह प्रत्येक राशि की दूसरे से स्थिति गिनता है और दो अशुभ पैटर्न की जांच करता है: 2-12 संबंध (जो वित्तीय स्थिरता और पारिवारिक सद्भाव को प्रभावित करता है) और 6-8 संबंध (जो स्वास्थ्य चुनौतियों और भावनात्मक घर्षण से जुड़ा है)। ये दो विन्यास \"भकूट दोष\" बनाते हैं। अन्य सभी अंतर-राशि स्थितियां अनुकूल मानी जाती हैं।",
        p1text: `${n1} की चंद्र राशि ${s1} (राशि क्रमांक ${bs}) है। ${n2} की ${s2} राशि से गिनने पर ${n1} की राशि ${posB}वें स्थान पर आती है।`,
        p2text: `${n2} की चंद्र राशि ${s2} (राशि क्रमांक ${gs}) है। ${n1} की ${s1} राशि से गिनने पर ${n2} की राशि ${posG}वें स्थान पर आती है।`,
        meaning: !inauspicious
          ? `${n1} और ${n2} के बीच ${posB}-${posG} चंद्र राशि संबंध किसी भी अशुभ भकूट पैटर्न में नहीं आता, जिससे पूर्ण 7 अंक मिलते हैं। यह दीर्घकालिक भावनात्मक सद्भाव और साझी भौतिक स्थिरता के लिए एक सकारात्मक संकेत है।`
          : is2_12
          ? "2-12 भकूट दोष उपस्थित है। यह परंपरागत रूप से वित्त, पारिवारिक अपेक्षाओं, या एक साथी को अधिक लाभ होने की संभावित चुनौतियों का संकेत देता है। धन और पारिवारिक भूमिकाओं के बारे में स्पष्ट संवाद से इस कूट के अनेक जोड़े मजबूत, स्थायी विवाह बनाते हैं।"
          : "6-8 भकूट दोष उपस्थित है। यह परंपरागत रूप से समय के साथ संभावित स्वास्थ्य चुनौतियों या भावनात्मक दूरी का संकेत देता है। यह किसी विशिष्ट परिणाम की भविष्यवाणी नहीं करता — इस पैटर्न वाले कई जोड़े खुशी से एक साथ रहते हैं — किंतु मजबूत भावनात्मक संवाद की आदतें बनाना लाभकारी है।",
      }
    }

    case "Nadi": {
      const nadi1 = HI_NADI[p1.nadi] ?? { name: p1.nadi, desc: "" }
      const nadi2 = HI_NADI[p2.nadi] ?? { name: p2.nadi, desc: "" }
      const same = p1.nadi === p2.nadi
      return {
        description: same
          ? `दोनों ${nadi1.name} — नाड़ी दोष`
          : `${n1}: ${nadi1.name}, ${n2}: ${nadi2.name} — अनुकूल`,
        about: "नाड़ी सबसे अधिक भारित कूट है जिसका 36 में से 8 अंक है। यह स्वास्थ्य, शारीरिक संविधान और एक स्वस्थ परिवार के लिए आवश्यक आनुवंशिक अनुकूलता से संबंधित है। 27 नक्षत्रों को तीन नाड़ी चैनलों में विभाजित किया गया है — आदि, मध्य और अंत्य — जो आयुर्वेदिक त्रिदोष ढांचे (वात, पित्त और कफ) के अनुरूप हैं। जब दोनों साथी एक ही नाड़ी साझा करते हैं, तो इसे नाड़ी दोष कहा जाता है — परंपरागत रूप से यह सबसे गंभीर अनुकूलता चिंता मानी जाती है। पूरक नाड़ी (एक-दूसरे से भिन्न) पूर्ण 8 अंक देती है।",
        p1text: `${n1} की जन्म नक्षत्र ${nak1} है, जो ${nadi1.name} से संबंधित है। ${nadi1.desc}`,
        p2text: `${n2} की जन्म नक्षत्र ${nak2} है, जो ${nadi2.name} से संबंधित है। ${nadi2.desc}`,
        meaning: !same
          ? `${n1} (${nadi1.name}) और ${n2} (${nadi2.name}) की पूरक नाड़ी चैनल हैं — सबसे महत्वपूर्ण अनुकूलता संकेतक को पूर्ण 8 अंक मिलते हैं। भिन्न नाड़ी पूरक संविधान का संकेत देती है।`
          : `${n1} और ${n2} दोनों ${nadi1.name} साझा करते हैं, जिससे नाड़ी दोष बनता है। यह तीन प्रमुख दोषों में सबसे महत्वपूर्ण है (भकूट और गण दोष के साथ)। परंपरागत ग्रंथ इसे स्वास्थ्य चुनौतियों से जोड़ते हैं। व्यवहार में, नाड़ी दोष वाले कई जोड़ों के स्वस्थ परिवार हैं — ज्योतिषीय उपाय, मजबूत अन्य कूट और स्वास्थ्य के प्रति सक्रिय दृष्टिकोण सार्थक शमन प्रदान कर सकते हैं।`,
      }
    }

    default:
      return null
  }
}

// ── Share URL codec ──────────────────────────────────────────────────────────
// Array format: [name, M/F, YYYY-MM-DD, HH:MM, AM|PM, place, lat, lng, tz]
// Saves ~50% vs JSON object with full key names.

function encodeShare(p1: PersonBirthInput, p2: PersonBirthInput): string {
  const c = (i: PersonBirthInput) => [
    i.name,
    (i.gender?.toLowerCase() === 'female') ? 'F' : 'M',
    i.birthDate, i.birthTime, i.timePeriod,
    i.birthPlace ?? '',
    Math.round(i.latitude * 10000) / 10000,
    Math.round(i.longitude * 10000) / 10000,
    i.timezone,
  ]
  return btoa(unescape(encodeURIComponent(JSON.stringify([c(p1), c(p2)]))))
}

function decodeShare(encoded: string): { p1: PersonBirthInput; p2: PersonBirthInput } {
  const arr = JSON.parse(decodeURIComponent(escape(atob(encoded)))) as [unknown[], unknown[]]
  const x = (a: unknown[]): PersonBirthInput => ({
    name: a[0] as string,
    gender: a[1] === 'F' ? 'Female' : 'Male',
    birthDate: a[2] as string,
    birthTime: a[3] as string,
    timePeriod: a[4] as 'AM' | 'PM',
    birthPlace: a[5] as string,
    latitude: a[6] as number,
    longitude: a[7] as number,
    timezone: a[8] as string,
  })
  return { p1: x(arr[0]), p2: x(arr[1]) }
}

function getAge(birthDate: string): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age
}

function formatBirthDate(input: PersonBirthInput): string {
  const [y, m, d] = input.birthDate.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d} ${months[m-1]} ${y}  ·  ${input.birthTime} ${input.timePeriod}`
}

export default function MilanResultClient() {
  const [stored, setStored] = useState<StoredResult | null>(null)
  const [mounted, setMounted] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [activeKuta, setActiveKuta] = useState<string | null>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const [loadingChart, setLoadingChart] = useState<1 | 2 | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    if (typeof window === 'undefined') return 'en'
    return (localStorage.getItem('horoscope_lang') as 'en' | 'hi') ?? 'en'
  })

  useEffect(() => {
    setMounted(true)

    const shareParam = searchParams.get('share')
    if (shareParam) {
      setShareLoading(true)
      try {
        const { p1, p2 } = decodeShare(shareParam)
        fetch('/api/kundli-milan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person1: p1, person2: p2 }),
        })
          .then(r => r.json())
          .then(json => {
            const s: StoredResult = { result: json.data, person1Input: p1, person2Input: p2 }
            localStorage.setItem('milanResult', JSON.stringify(s))
            setStored(s)
            setShareLoading(false)
          })
          .catch(() => { window.location.href = '/kundli-milan' })
      } catch {
        window.location.href = '/kundli-milan'
      }
      return
    }

    const raw = localStorage.getItem('milanResult')
    if (!raw) { window.location.href = '/kundli-milan'; return }
    try { setStored(JSON.parse(raw)) } catch { window.location.href = '/kundli-milan' }
  }, [searchParams])

  useEffect(() => {
    if (!activeKuta || !detailPanelRef.current) return
    // On mobile (≤768px), scroll the panel into view after a short delay
    // to let the DOM update first
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [activeKuta])

  if (!mounted || !stored || shareLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        {shareLoading && <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text3)' }}>Calculating compatibility…</p>}
      </div>
    )
  }

  const { result, person1Input, person2Input } = stored
  const color = VERDICT_COLOR[result.verdict.level]
  const bg    = VERDICT_BG[result.verdict.level]
  const pct   = result.percentage

  const activeKutaData = activeKuta ? result.kutas.find(k => k.name === activeKuta) : null

  async function openChart(input: PersonBirthInput, person: 1 | 2) {
    setLoadingChart(person)
    setChartError(null)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Could not load chart.')
      const data = await res.json()
      localStorage.setItem('lastChart', JSON.stringify(data.data))
      window.open('/chart', '_blank')
    } catch (err) {
      setChartError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoadingChart(null)
    }
  }

  const ms = result.manglikStatus
  const age1 = getAge(person1Input.birthDate)
  const age2 = getAge(person2Input.birthDate)
  const bothOver30 = age1 >= 30 && age2 >= 30
  const eitherOver30 = age1 >= 30 || age2 >= 30

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .milan-result-wrap{max-width:1100px;margin:0 auto;padding:0 32px}
        @media(max-width:680px){.milan-result-wrap{padding:0 16px}}
        .kutas-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        @media(max-width:900px){.kutas-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:500px){.kutas-grid{grid-template-columns:1fr 1fr}}
        .kuta-card{
          border-radius:14px;border:1.5px solid var(--border);
          background:hsl(var(--card));overflow:hidden;
          display:flex;flex-direction:column;cursor:pointer;
          transition:border-color 0.15s,box-shadow 0.15s;
          box-shadow:0 1px 4px rgba(0,0,0,0.07),0 4px 12px rgba(0,0,0,0.05);
        }
        .kuta-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.06);border-color:rgba(0,0,0,0.15)}
        .kuta-card.active{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.12),0 4px 16px rgba(0,0,0,0.08)}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:540px){.detail-grid{grid-template-columns:1fr}}
        .person-cards-row{display:grid;grid-template-columns:1fr auto 1fr;gap:0;align-items:stretch}
        @media(max-width:600px){.person-cards-row{grid-template-columns:1fr;}}
        .person-chip{
          padding:20px 22px;
          border-radius:14px;border:1px solid var(--border);
          background:hsl(var(--card));box-shadow:var(--shadow-sm);
        }
        .astro-chip{
          display:inline-flex;align-items:center;
          padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:600;
          border:1px solid var(--border);background:hsl(var(--muted)/0.7);
          color:var(--text2);white-space:nowrap;
        }
        .manglik-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
        @media(max-width:540px){.manglik-grid{grid-template-columns:1fr}}
      `}</style>

      {/* ── Score Hero ──────────────────────────────────── */}
      <section style={{ background: 'hsl(var(--muted)/0.45)', borderBottom: '1px solid var(--border)', padding: '36px 0 48px' }}>
        <div className="milan-result-wrap">

          {/* Breadcrumb + Language Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text3)', flexWrap: 'wrap' }}>
              <a href="/" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Home</a>
              <span>›</span>
              <a href="/kundli-milan" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Kundli Milan</a>
              <span>›</span>
              <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{lang === 'hi' ? HI.breadcrumbResult : 'Ashtkoot Milan Result'}</span>
            </nav>
            <LanguageToggle value={lang} onChange={l => { setLang(l); localStorage.setItem('horoscope_lang', l) }} />
          </div>

          {/* Person comparison row */}
          <div className="person-cards-row" style={{ marginBottom: 32 }}>
            {([
              { p: result.person1, input: person1Input, accent: '#3b82f6', n: 1 as const },
              { p: result.person2, input: person2Input, accent: '#8b5cf6', n: 2 as const },
            ] as const).map(({ p, input, accent, n }, i) => {
              const isFemale   = input.gender?.toLowerCase() === 'female'
              const rashiLabel = lang === 'hi' ? (HI_SIGN[p.moonSign] ?? p.moonSign) : p.moonSign
              const nakLabel   = lang === 'hi' ? (HI_NAKSHATRA[p.nakshatra] ?? p.nakshatra) : p.nakshatra
              const ganaLabel  = lang === 'hi' ? ((HI_GANA[p.gana]?.name ?? p.gana) + ' गण') : (p.gana + ' Gana')
              const nadiLabel  = lang === 'hi' ? (HI_NADI[p.nadi]?.name ?? p.nadi) : (p.nadi + ' Nadi')
              const varnaLabel = lang === 'hi' ? ((HI_VARNA[p.varna]?.name ?? p.varna) + ' वर्ण') : (p.varna + ' Varna')
              return (
                <>
                  {/* VS separator — rendered between cards in DOM so grid places it correctly */}
                  {i === 1 && (
                    <div key="vs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, color: 'var(--text3)' }}>♡</div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>vs</div>
                      </div>
                    </div>
                  )}

                  <div key={p.name} className="person-chip" style={{ borderColor: `${accent}33` }}>
                    {/* Top: avatar + info */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                        background: isFemale
                          ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.12))'
                          : 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(14,165,233,0.12))',
                        border: `2px solid ${accent}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, color: accent,
                      }}>
                        {isFemale ? '♀' : '♂'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', lineHeight: 1.2 }}>{p.name}</p>
                        <p style={{ fontSize: 13.5, color: accent, fontWeight: 700, margin: '0 0 9px' }}>
                          {rashiLabel} · {nakLabel}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>📅 {formatBirthDate(input)}</p>
                          {input.birthPlace && (
                            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📍 {input.birthPlace}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: `${accent}22`, margin: '14px 0 12px' }} />

                    {/* Bottom: chips + kundli button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        <span className="astro-chip" style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}>{ganaLabel}</span>
                        <span className="astro-chip">{nadiLabel}</span>
                        <span className="astro-chip">{varnaLabel}</span>
                      </div>
                      <button
                        onClick={() => openChart(input, n)}
                        disabled={loadingChart !== null}
                        style={{ fontSize: 12, fontWeight: 600, color: loadingChart === n ? 'var(--text3)' : accent, background: 'none', border: 'none', cursor: loadingChart !== null ? 'not-allowed' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                      >
                        {loadingChart === n
                          ? <><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} /> {lang === 'hi' ? HI.opening : 'Opening…'}</>
                          : lang === 'hi' ? HI.openChart : `View ${p.name.split(' ')[0]}'s Kundli →`
                        }
                      </button>
                    </div>
                  </div>
                </>
              )
            })}
          </div>
          {chartError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 16, marginTop: -24 }}>{chartError}</p>}

          {/* Score + verdict */}
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color }}>{result.totalScore}</span>
                <span style={{ fontSize: 24, color: 'var(--text3)', fontWeight: 400 }}>/36</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text3)', margin: '4px 0 0' }}>{pct}{lang === 'hi' ? HI.compatibilityPct : '% compatibility'}</p>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: bg, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{lang === 'hi' ? HI.verdictLabels[result.verdict.level] : result.verdict.label}</span>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>{lang === 'hi' ? HI.verdictDesc[result.verdict.level] : result.verdict.description}</p>
            </div>
          </div>

          {/* Compatibility bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', height: 10, borderRadius: 99, background: 'var(--border)', overflow: 'visible', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${color}88,${color})`, width: `${pct}%`, transition: 'width 1s ease' }} />
              <div style={{ position: 'absolute', top: -4, left: `${(18/36)*100}%`, width: 2, height: 18, background: 'var(--text3)', borderRadius: 1, transform: 'translateX(-50%)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)' }}>
              <span>0</span>
              <span>{lang === 'hi' ? HI.acceptable18 : '18 — acceptable'}</span>
              <span>36</span>
            </div>
          </div>

          {/* WhatsApp Share */}
          <button
            onClick={() => {
              const shareData = encodeShare(person1Input, person2Input)
              const shareUrl = `https://astrotattwa.com/kundli-milan/result?share=${shareData}`
              const verdict = lang === 'hi' ? HI.verdictLabels[result.verdict.level] : result.verdict.label
              const text = lang === 'hi'
                ? `${result.person1.name} और ${result.person2.name} का कुंडली मिलान\n\nअष्टकूट स्कोर: ${result.totalScore}/36 (${pct}%)\n${verdict}\n\n${shareUrl}`
                : `${result.person1.name} & ${result.person2.name}'s Kundli Milan\n\nAshtkoot Score: ${result.totalScore}/36 (${pct}%)\n${verdict}\n\n${shareUrl}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 99,
              background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)',
              color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {lang === 'hi' ? HI.shareBtn : 'Share on WhatsApp'}
          </button>
        </div>
      </section>

      {/* ── Kuta Breakdown ──────────────────────────────── */}
      <section style={{ padding: '52px 0 0', background: 'hsl(var(--background))' }}>
        <div className="milan-result-wrap">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{lang === 'hi' ? HI.kutaBreakdown : '8 Kuta Breakdown'}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>
              {lang === 'hi' ? HI.kutaTapHint(result.person1.name, result.person2.name) : `Tap any kuta to see what it means specifically for ${result.person1.name} and ${result.person2.name}.`}
            </p>
          </div>

          <div className="kutas-grid">
            {result.kutas.map(k => (
              <KutaCard
                key={k.name}
                kuta={k}
                isActive={activeKuta === k.name}
                onToggle={() => setActiveKuta(prev => prev === k.name ? null : k.name)}
                lang={lang}
                p1={result.person1}
                p2={result.person2}
              />
            ))}
          </div>

          {/* Full-width detail panel */}
          {activeKutaData && activeKutaData.detail && (
            <div ref={detailPanelRef}>
              <KutaDetailPanel
                kuta={activeKutaData}
                onClose={() => setActiveKuta(null)}
                lang={lang}
                p1={result.person1}
                p2={result.person2}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Manglik Dosha Interpretation ────────────────── */}
      <section style={{ padding: '52px 0', borderTop: '1px solid var(--border)' }}>
        <div className="milan-result-wrap">
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 8px' }}>{lang === 'hi' ? HI.doshaAnalysis : 'Dosha Analysis'}</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{lang === 'hi' ? HI.manglikTitle : 'Manglik Dosha'}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.65 }}>
              {lang === 'hi' ? HI.manglikExplainer : 'Manglik dosha is formed when Mars occupies houses 1, 4, 7, 8, or 12 from the Lagna. It is one of the most discussed — and most misunderstood — factors in Vedic compatibility assessment. Cancellation factors like Jupiter\'s aspect, Mars in its own sign, or Mars exalted can significantly reduce or nullify the dosha.'}
            </p>
          </div>

          <div className="manglik-grid">
            {[
              { name: result.person1.name, ps: ms.person1, accent: '#3b82f6', age: age1 },
              { name: result.person2.name, ps: ms.person2, accent: '#8b5cf6', age: age2 },
            ].map(({ name, ps, accent, age }) => (
              <ManglikPersonCard key={name} name={name} ps={ps} accent={accent} age={age} lang={lang} />
            ))}
          </div>

          {/* Combined interpretation */}
          <div style={{ padding: '20px 24px', borderRadius: 14, border: '1px solid var(--border)', background: 'hsl(var(--card))', marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{lang === 'hi' ? HI.combinedReading : 'Combined Reading'}</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.7 }}>
              {ms.doubleManglik
                ? lang === 'hi' ? HI.doubleManglik(result.person1.name, result.person2.name) : `Both ${result.person1.name} and ${result.person2.name} have Manglik dosha. In most Vedic traditions, when both partners are Manglik the doshas cancel each other out — like energies balance. This match does not carry the usual Manglik concern.`
                : !ms.person1.isManglik && !ms.person2.isManglik
                  ? lang === 'hi' ? HI.neitherManglik(result.person1.name, result.person2.name) : `Neither ${result.person1.name} nor ${result.person2.name} has Manglik dosha. There is no Manglik-related friction to account for in this match.`
                  : lang === 'hi' ? HI.oneManglik : `One partner has Manglik dosha and the other does not. Classically this calls for attention — however, cancellation factors, Mars dignity, the strength of the 7th house, and Venus/Jupiter conditions all modify the actual impact. Many happy couples have exactly this configuration.`
              }
            </p>
          </div>

          {/* Age guidance */}
          <div style={{ padding: '18px 22px', borderRadius: 14, border: '1px solid rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.05)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
                {lang === 'hi' ? HI.ageTitle : 'Age reduces the practical intensity of Mangal Dosha'}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text2)', margin: 0, lineHeight: 1.7 }}>
                {bothOver30
                  ? lang === 'hi' ? HI.ageBothOver30(result.person1.name, result.person2.name) : `Many Vedic astrologers consider Mars-related dosha effects to soften after the late twenties, especially after Mars matures around age 28. Since both ${result.person1.name} and ${result.person2.name} are over 30, Manglik factors should be read in context with the full chart rather than judged in isolation — not treated as a decisive concern on their own.`
                  : eitherOver30
                    ? lang === 'hi' ? HI.ageEitherOver30 : `Many Vedic astrologers consider Mangal Dosha to reduce in intensity after the late twenties. Since one partner is over 30, Manglik factors are generally interpreted with more context in this match rather than as a standalone concern.`
                    : lang === 'hi' ? HI.ageNeither : `Ashtkoot Milan is one lens, not the full picture. Character, communication, shared values, and the condition of the 7th house and Venus in both charts are equally — if not more — decisive for a lasting marriage.`
                }
              </p>
            </div>
          </div>

          {/* ── Dosha Remedies ── */}
          {(() => {
            const activeDoshas: string[] = []
            result.kutas.forEach(k => {
              if (k.score === 0 && k.note) {
                if (k.note.includes('Nadi Dosha')) activeDoshas.push('Nadi Dosha')
                if (k.note.includes('Bhakoot Dosha')) activeDoshas.push('Bhakoot Dosha')
                if (k.note.includes('Gana Dosha')) activeDoshas.push('Gana Dosha')
              }
            })
            const oneManglik = (ms.person1.isManglik || ms.person2.isManglik) && !ms.doubleManglik
            if (oneManglik) activeDoshas.push('Mangal Dosha')
            if (activeDoshas.length === 0) return null

            return (
              <div style={{ marginTop: 28, padding: '22px 24px', borderRadius: 14, border: '1px solid rgba(217,119,6,0.3)', borderLeft: '4px solid rgba(217,119,6,0.6)', background: 'rgba(217,119,6,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d97706', margin: '0 0 12px' }}>
                  {lang === 'hi' ? HI.remediesTitle : 'Dosha Remedies'}
                </p>
                {user === null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'hsl(var(--card))' }}>
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)' }}>
                      {lang === 'hi' ? HI.signInForRemedies : 'Sign in to see remedies'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {activeDoshas.map(doshaName => {
                      const remedies = DOSHA_REMEDIES[doshaName]
                      if (!remedies) return null
                      return (
                        <div key={doshaName}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{doshaName}</p>
                          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {remedies[lang].map((remedy, i) => (
                              <li key={i} style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.65 }}>{remedy}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ── Next Steps ───────────────────────────────────── */}
      <section style={{ padding: '52px 0 64px', borderTop: '1px solid var(--border)', background: 'hsl(var(--muted)/0.4)' }}>
        <div className="milan-result-wrap">

          {/* Two CTA cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }} className="cta-cards-grid">

            {/* Card 1 — Marriage Muhurta */}
            <div style={{ padding: '28px 24px', borderRadius: 16, border: '1px solid var(--border)', background: 'hsl(var(--card))', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🗓️</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 6px' }}>
                  {lang === 'hi' ? HI.muhurtaCardLabel : 'Next Step'}
                </p>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {lang === 'hi' ? HI.muhurtaCardTitle : 'Find Marriage Muhurta'}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'hi' ? HI.muhurtaCardBody : 'Get auspicious wedding dates based on tithi, nakshatra, lagna, and planetary conditions.'}
                </p>
              </div>
              <a
                href="/muhurta/marriage?from=kundli-milan"
                style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                {lang === 'hi' ? HI.muhurtaCardBtn : 'Find Muhurta →'}
              </a>
            </div>

            {/* Card 2 — Individual Kundli */}
            <div style={{ padding: '28px 24px', borderRadius: 16, border: '1px solid var(--border)', background: 'hsl(var(--card))', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 28 }}>☸️</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b5cf6', margin: '0 0 6px' }}>
                  {lang === 'hi' ? HI.kundliCardLabel : 'Personal Chart'}
                </p>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {lang === 'hi' ? HI.kundliCardTitle : 'See Your Individual Kundli'}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'hi' ? HI.kundliCardBody : 'Marriage timing, partner description, children, finances — these come from your personal birth chart.'}
                </p>
              </div>
              <a
                href="/kundli"
                style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border2)', background: 'hsl(var(--background))', color: 'var(--text)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                {lang === 'hi' ? HI.kundliCardBtn : 'Generate free Kundli →'}
              </a>
            </div>

          </div>

          {/* Check another match — subtle link below */}
          <div style={{ textAlign: 'center' }}>
            <a href="/kundli-milan" style={{ fontSize: 13.5, color: 'var(--text3)', textDecoration: 'none', fontWeight: 500 }}>
              {lang === 'hi' ? HI.checkAnother : '← Check another match'}
            </a>
          </div>

        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .cta-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

// ── Kuta Card (compact, selectable) ─────────────────────────────────────────

function KutaCard({ kuta, isActive, onToggle, lang, p1, p2 }: { kuta: KutaResult; isActive: boolean; onToggle: () => void; lang: 'en' | 'hi'; p1: MilanResult['person1']; p2: MilanResult['person2'] }) {
  const hindiContent = lang === 'hi' ? getHindiKutaContent(kuta, p1, p2) : null
  const pct = (kuta.score / kuta.max) * 100
  const color =
    pct === 100 ? '#16a34a' :
    pct >= 60   ? '#2563eb' :
    pct >= 25   ? '#d97706' : '#dc2626'

  return (
    <div
      className={`kuta-card${isActive ? ' active' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
    >
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', margin: '0 0 1px' }}>{lang === 'hi' ? (HI.kutaNames[kuta.name as keyof typeof HI.kutaNames] ?? kuta.name) : kuta.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{lang === 'hi' ? `${HI.maxPts} ${kuta.max}` : `max ${kuta.max} pts`}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{kuta.score}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>/{kuta.max}</span>
          </div>
        </div>

        <div style={{ height: 5, borderRadius: 99, background: 'var(--border)', marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color }} />
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.5, margin: 0, flex: 1 }}>{hindiContent?.description ?? kuta.description}</p>

        {kuta.note && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)' }}>
            <span style={{ fontSize: 10 }}>⚠</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{kuta.note}</span>
          </div>
        )}

        {kuta.detail && (
          <p style={{ fontSize: 11.5, fontWeight: 600, color: isActive ? 'var(--text3)' : 'var(--blue)', margin: '10px 0 0' }}>
            {isActive
              ? (lang === 'hi' ? '▲ विवरण छुपाएं' : '▲ Hide detail')
              : (lang === 'hi' ? '▼ इसका अर्थ क्या है?' : '▼ What does this mean?')}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Full-width detail panel ──────────────────────────────────────────────────

function KutaDetailPanel({ kuta, onClose, lang, p1, p2 }: { kuta: KutaResult; onClose: () => void; lang: 'en' | 'hi'; p1: MilanResult['person1']; p2: MilanResult['person2'] }) {
  const hindiContent = lang === 'hi' ? getHindiKutaContent(kuta, p1, p2) : null
  const pct = (kuta.score / kuta.max) * 100
  const color =
    pct === 100 ? '#16a34a' :
    pct >= 60   ? '#2563eb' :
    pct >= 25   ? '#d97706' : '#dc2626'
  const meaningBg =
    pct === 0   ? 'rgba(220,38,38,0.07)' :
    pct >= 60   ? 'rgba(22,163,74,0.07)' : 'rgba(217,119,6,0.07)'
  const meaningBorder =
    pct === 0   ? 'rgba(220,38,38,0.2)' :
    pct >= 60   ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)'

  if (!kuta.detail) return null

  const kutaNameHi = HI.kutaNames[kuta.name as keyof typeof HI.kutaNames] ?? kuta.name
  const displayName = lang === 'hi' ? kutaNameHi : kuta.name
  const aboutText = hindiContent?.about ?? kuta.detail.about
  const person1Text = hindiContent?.p1text ?? kuta.detail.person1
  const person2Text = hindiContent?.p2text ?? kuta.detail.person2
  const meaningText = hindiContent?.meaning ?? kuta.detail.meaning

  return (
    <div style={{
      marginTop: 20, marginBottom: 12,
      padding: '24px 28px',
      borderRadius: 16,
      border: `1.5px solid ${color}44`,
      background: 'hsl(var(--card))',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color }}>{kuta.score}</span>
            <span style={{ fontSize: 14, color: 'var(--text3)' }}>{lang === 'hi' ? `में से ${kuta.max}` : `out of ${kuta.max}`}</span>
            <div style={{ height: 6, width: 80, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{displayName}</h3>
        </div>
        <button onClick={onClose} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
          ✕ {lang === 'hi' ? 'बंद करें' : 'Close'}
        </button>
      </div>

      {/* About */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '0 0 6px' }}>
          {lang === 'hi' ? `${displayName} क्या है?` : `What is ${displayName}?`}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.7 }}>{aboutText}</p>
      </div>

      {/* Person cards */}
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        {[
          { label: lang === 'hi' ? 'आपकी कुंडली में' : 'In your chart', text: person1Text, accent: '#3b82f6' },
          { label: lang === 'hi' ? 'साथी की कुंडली में' : "In partner's chart", text: person2Text, accent: '#8b5cf6' },
        ].map(({ label, text, accent }) => (
          <div key={label} style={{ padding: '14px 16px', borderRadius: 12, background: 'hsl(var(--muted)/0.5)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
              <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Meaning */}
      <div style={{ padding: '14px 16px', borderRadius: 12, background: meaningBg, border: `1px solid ${meaningBorder}` }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '0 0 6px' }}>
          {lang === 'hi' ? 'आपके लिए इसका अर्थ' : 'What this means for you'}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>{meaningText}</p>
      </div>
    </div>
  )
}

// ── Manglik Person Card ──────────────────────────────────────────────────────

const SEVERITY_LABEL: Record<string, string> = {
  weak: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
  very_strong: 'Very Strong',
}

function ManglikPersonCard({ name, ps, accent, age, lang }: {
  name: string
  ps: import('@/lib/astrology/kundliMilan/types').ManglikPersonStatus
  accent: string
  age: number
  lang: 'en' | 'hi'
}) {
  const { isManglik, marsHouseLagna, isReduced, severity, chartNarrative } = ps
  const borderColor = isManglik
    ? isReduced ? 'rgba(217,119,6,0.35)' : 'rgba(239,68,68,0.3)'
    : 'rgba(22,163,74,0.3)'
  const bgColor = isManglik
    ? isReduced ? 'rgba(217,119,6,0.05)' : 'rgba(239,68,68,0.05)'
    : 'rgba(22,163,74,0.05)'

  const badge = lang === 'hi'
    ? isManglik ? (isReduced ? HI.manglikBadgePartly : HI.manglikBadgeYes) : HI.manglikBadgeNo
    : isManglik ? (isReduced ? '~ Manglik (Partly Reduced)' : '⚠ Manglik') : '✓ Non-Manglik'

  const severityText = severity
    ? lang === 'hi' ? (HI.severityLabel[severity as keyof typeof HI.severityLabel] ?? severity) : (SEVERITY_LABEL[severity] ?? severity)
    : null

  const marsText = marsHouseLagna > 0
    ? lang === 'hi' ? HI.marsHouse(marsHouseLagna) : `Mars · House ${marsHouseLagna}`
    : null

  return (
    <div style={{ padding: '18px 20px', borderRadius: 14, border: `1px solid ${borderColor}`, background: bgColor }}>
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{name}</p>
      </div>

      {/* Badge row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {/* Main status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 99, fontSize: 12.5, fontWeight: 700,
          background: isManglik
            ? isReduced ? 'rgba(217,119,6,0.12)' : 'rgba(239,68,68,0.12)'
            : 'rgba(22,163,74,0.12)',
          color: isManglik
            ? isReduced ? '#d97706' : '#dc2626'
            : '#16a34a',
        }}>
          {badge}
        </span>
        {/* Severity badge */}
        {isManglik && severityText && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text3)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'hsl(var(--card))' }}>
            {severityText}
          </span>
        )}
        {/* Mars house */}
        {marsText && (
          <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>{marsText}</span>
        )}
      </div>

      {/* Narrative */}
      <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.65 }}>
        {chartNarrative ?? (
          lang === 'hi'
            ? isManglik
              ? `मंगल ${marsHouseLagna}वें भाव में स्थित है, जो मांगलिक दोष उत्पन्न करता है।`
              : marsHouseLagna > 0
                ? `मंगल ${marsHouseLagna}वें भाव में है, जो मांगलिक भावों के बाहर है। कोई मांगलिक दोष नहीं।`
                : 'मंगल इस कुंडली में किसी मांगलिक भाव में स्थित नहीं है।'
            : isManglik
              ? `Mars in the ${ordinal(marsHouseLagna)} house activates Manglik dosha.`
              : marsHouseLagna > 0
                ? `Mars is placed in the ${ordinal(marsHouseLagna)} house, outside the Manglik houses. No Manglik formation.`
                : 'Mars does not occupy any Manglik house in this chart.'
        )}
        {age >= 30 && (lang === 'hi' ? HI.ageReduces(age) : ` At age ${age}, the intensity of Mars-related patterns tends to reduce.`)}
      </p>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  if (n <= 0) return `${n}th`
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
