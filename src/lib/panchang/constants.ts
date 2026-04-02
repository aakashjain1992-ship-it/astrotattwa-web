// ─────────────────────────────────────────────────────────────────────────────
// Panchang Constants & Lookup Tables
// All lookup tables used for panchang calculations.
// Verify values marked "// ⚠️ verify" against drikpanchang.com on multiple dates.
// ─────────────────────────────────────────────────────────────────────────────

// ── Nakshatra names (1-indexed, 27 total) ──────────────────────────────────
export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const

// Nakshatra lords (planet governing each nakshatra)
export const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury",
] as const

// ── Rashi names (Sanskrit, 12 total) ──────────────────────────────────────
export const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const

export const RASHI_ENGLISH = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const

// ── Tithi names (1-indexed, 1-30) ─────────────────────────────────────────
export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", // Shukla 1-15
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya", // Krishna 1-15
] as const

// ── Yoga names (1-indexed, 27 total) ──────────────────────────────────────
export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Aindra", "Vaidhriti",
] as const

// Yoga auspiciousness (true = auspicious)
export const YOGA_AUSPICIOUS: boolean[] = [
  false, true, true, true, true,      // Vishkambha(bad), Priti, Ayushman, Saubhagya, Shobhana
  false, true, true, false, false,     // Atiganda(bad), Sukarma, Dhriti, Shula(bad), Ganda(bad)
  true, true, false, true, false,      // Vriddhi, Dhruva, Vyaghata(bad), Harshana, Vajra(bad)
  true, false, true, false, true,      // Siddhi, Vyatipata(bad), Variyan, Parigha(bad), Shiva
  true, true, true, true, true,        // Siddha, Sadhya, Shubha, Shukla, Brahma
  true, false,                         // Aindra, Vaidhriti(bad)
]

// ── Karana names (11 types: 4 fixed + 7 repeating) ────────────────────────
// The 7 movable karanas repeat through the cycle
export const KARANA_NAMES_MOVABLE = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
] as const

// Fixed karanas at specific positions
export const KARANA_NAMES_FIXED = [
  "Shakuni", "Chatushpada", "Naga", "Kimstughna",
] as const

// ── Vara (weekday) names ──────────────────────────────────────────────────
export const VARA_NAMES = [
  "Ravivara", "Somavara", "Mangalavara", "Budhavara",
  "Guruvara", "Shukravara", "Shanivara",
] as const

export const VARA_RULING_PLANETS = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn",
] as const

// ── Inauspicious timing divisors ──────────────────────────────────────────
// Day split into 8 equal parts from sunrise. Part index (0-based) for each timing.
// Weekday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

export const RAHU_KALAM_PART: Record<number, number> = {
  0: 7, // Sun: 8th part (index 7)
  1: 1, // Mon: 2nd part
  2: 6, // Tue: 7th part
  3: 4, // Wed: 5th part
  4: 5, // Thu: 6th part
  5: 3, // Fri: 4th part
  6: 2, // Sat: 3rd part
}

export const YAMAGANDA_PART: Record<number, number> = {
  0: 4, // Sun: 5th part
  1: 3, // Mon: 4th part
  2: 2, // Tue: 3rd part
  3: 1, // Wed: 2nd part
  4: 0, // Thu: 1st part
  5: 6, // Fri: 7th part
  6: 5, // Sat: 6th part
}

export const GULIKAI_PART: Record<number, number> = {
  0: 6, // Sun: 7th part
  1: 5, // Mon: 6th part
  2: 4, // Tue: 5th part
  3: 3, // Wed: 4th part
  4: 2, // Thu: 3rd part
  5: 1, // Fri: 2nd part
  6: 0, // Sat: 1st part
}

// ── Dur Muhurtam (inauspicious muhurtas by weekday) ──────────────────────
// Day divided into 30 muhurtas (each = dayDuration/30).
// Values are 1-indexed muhurta numbers that are inauspicious.
// ⚠️ verify against drikpanchang for multiple dates
export const DUR_MUHURTAM_PARTS: Record<number, number[]> = {
  0: [8, 12],   // Sun
  1: [7, 8],    // Mon
  2: [7, 12],   // Tue
  3: [5, 15],   // Wed
  4: [5, 10],   // Thu
  5: [6, 7],    // Fri
  6: [6, 10],   // Sat
}

// ── Amrit Kalam by Nakshatra ──────────────────────────────────────────────
// Start offset in ghatis (1 ghati = 24 min) from midnight. Duration = 4 ghatis (96 min).
// ⚠️ verify against drikpanchang for multiple dates
export const AMRIT_KALAM_GHATI: number[] = [
  4,  // 1 Ashwini
  14, // 2 Bharani
  22, // 3 Krittika
  20, // 4 Rohini
  24, // 5 Mrigashira
  26, // 6 Ardra
  2,  // 7 Punarvasu
  50, // 8 Pushya
  16, // 9 Ashlesha
  18, // 10 Magha
  20, // 11 Purva Phalguni
  22, // 12 Uttara Phalguni
  24, // 13 Hasta
  26, // 14 Chitra
  28, // 15 Swati
  42, // 16 Vishakha
  4,  // 17 Anuradha
  6,  // 18 Jyeshtha
  8,  // 19 Mula
  10, // 20 Purva Ashadha
  38, // 21 Uttara Ashadha
  40, // 22 Shravana
  42, // 23 Dhanishtha
  44, // 24 Shatabhisha
  46, // 25 Purva Bhadrapada
  48, // 26 Uttara Bhadrapada
  2,  // 27 Revati
]

// ── Varjyam by Nakshatra ──────────────────────────────────────────────────
// Start offset in ghatis from midnight. Duration = 4 ghatis (96 min).
// ⚠️ verify against drikpanchang for multiple dates
export const VARJYAM_GHATI: number[] = [
  17, // 1 Ashwini
  6,  // 2 Bharani
  11, // 3 Krittika
  11, // 4 Rohini
  13, // 5 Mrigashira
  13, // 6 Ardra
  50, // 7 Punarvasu
  10, // 8 Pushya
  2,  // 9 Ashlesha
  5,  // 10 Magha
  22, // 11 Purva Phalguni
  6,  // 12 Uttara Phalguni
  18, // 13 Hasta
  7,  // 14 Chitra
  16, // 15 Swati
  28, // 16 Vishakha
  22, // 17 Anuradha
  20, // 18 Jyeshtha
  20, // 19 Mula
  16, // 20 Purva Ashadha
  14, // 21 Uttara Ashadha
  16, // 22 Shravana
  5,  // 23 Dhanishtha
  11, // 24 Shatabhisha
  12, // 25 Purva Bhadrapada
  14, // 26 Uttara Bhadrapada
  28, // 27 Revati
]

// ── Baana by weekday ──────────────────────────────────────────────────────
// The 5 arrows (Baana types) and their weekday associations
// ⚠️ verify
export const BAANA_BY_WEEKDAY: string[] = [
  "Surya Baana",  // Sun
  "Soma Baana",   // Mon
  "Bhoomi Baana", // Tue
  "Jal Baana",    // Wed
  "Akasha Baana", // Thu
  "Agni Baana",   // Fri
  "Vayu Baana",   // Sat
]

// ── Anandadi Yoga Table (28 yogas) ────────────────────────────────────────
// Sunday anchor: Ashwini(1) → Ananda. Each day shifts by +4 nakshatras.
export const ANANDADI_YOGA_LIST = [
  { name: "Ananda", auspicious: true },       // 1
  { name: "Kala", auspicious: false },         // 2
  { name: "Dhumra", auspicious: false },       // 3
  { name: "Prajapati", auspicious: true },     // 4
  { name: "Soumya", auspicious: true },        // 5
  { name: "Dhwanksha", auspicious: false },    // 6
  { name: "Dhwaja", auspicious: true },        // 7
  { name: "Shreevatsa", auspicious: true },    // 8
  { name: "Vajra", auspicious: false },        // 9
  { name: "Mudgar", auspicious: false },       // 10
  { name: "Chhatra", auspicious: true },       // 11
  { name: "Mitra", auspicious: true },         // 12
  { name: "Manas", auspicious: true },         // 13
  { name: "Padma", auspicious: true },         // 14
  { name: "Lumbak", auspicious: false },       // 15
  { name: "Utpat", auspicious: false },        // 16
  { name: "Mrityu", auspicious: false },       // 17 (very bad)
  { name: "Kana", auspicious: false },         // 18
  { name: "Siddha", auspicious: true },        // 19
  { name: "Shubha", auspicious: true },        // 20
  { name: "Amrit", auspicious: true },         // 21 (very good)
  { name: "Musal", auspicious: false },        // 22
  { name: "Gada", auspicious: false },         // 23
  { name: "Matanga", auspicious: true },       // 24
  { name: "Rakshasa", auspicious: false },     // 25
  { name: "Chara", auspicious: true },         // 26 (neutral)
  { name: "Sthira", auspicious: true },        // 27 (neutral)
  { name: "Vriddhi", auspicious: true },       // 28
] as const

// Per-day offset (how many nakshatras to shift from Sunday anchor)
export const ANANDADI_DAY_OFFSET: Record<number, number> = {
  0: 0,  // Sun: Ashwini=Ananda
  1: 4,  // Mon: Mrigashira=Ananda
  2: 8,  // Tue: Ashlesha=Ananda
  3: 12, // Wed: Chitra=Ananda
  4: 16, // Thu: Vishakha=Ananda
  5: 20, // Fri: Mula=Ananda
  6: 24, // Sat: Shatabhisha=Ananda
}

// ── Homahuti by weekday ───────────────────────────────────────────────────
export const HOMAHUTI: string[] = [
  "Surya (Sun)", "Chandra (Moon)", "Mangal (Mars)",
  "Chandra (Moon)", // Wed → Moon (same as Mon in some traditions) ⚠️ verify
  "Chandra (Moon)", // Thu ⚠️ verify
  "Shukra (Venus)",
  "Shani (Saturn)",
]

// ⚠️ Standard homahuti table (verify):
export const HOMAHUTI_BY_WEEKDAY: string[] = [
  "Surya",  // Sun
  "Chandra", // Mon
  "Mangal",  // Tue
  "Budha",   // Wed
  "Chandra", // Thu (note: same as Mon per some sources)
  "Shukra",  // Fri
  "Shani",   // Sat
]

// ── Disha Shool (inauspicious travel direction) ───────────────────────────
export const DISHA_SHOOL: string[] = [
  "West",  // Sun
  "East",  // Mon
  "North", // Tue
  "North", // Wed
  "South", // Thu
  "West",  // Fri (⚠️ some sources say East)
  "East",  // Sat
]

export const DISHA_SHOOL_REMEDY: string[] = [
  "Eat betel leaf before travel",       // Sun
  "Look in mirror before travel",       // Mon
  "Eat jaggery before travel",          // Tue
  "Eat coriander before travel",        // Wed
  "Eat cumin before travel",            // Thu
  "Eat curd before travel",             // Fri
  "Eat ginger before travel",           // Sat
]

// ── Rahu Vasa by weekday ──────────────────────────────────────────────────
export const RAHU_VASA: string[] = [
  "South-West", // Sun
  "North-East", // Mon
  "South",      // Tue
  "North",      // Wed
  "South",      // Thu
  "West",       // Fri
  "East",       // Sat
]

// ── Shivavasa by tithi (5-cycle: Kailash, Bhojana, Nandi, Shmashana, Gowri) ─
export const SHIVAVASA_LOCATIONS: string[] = [
  "Kailash",
  "Bhojana (eating)",
  "Nandi (bull)",
  "Shmashana (cremation ground)",
  "With Gowri (Parvati)",
]

// ── Kumbha Chakra by nakshatra ────────────────────────────────────────────
// Verified pattern (each nakshatra → direction) ⚠️ verify all 27 against drikpanchang
export const KUMBHA_CHAKRA: string[] = [
  "East",   // 1 Ashwini
  "South",  // 2 Bharani
  "West",   // 3 Krittika
  "North",  // 4 Rohini
  "East",   // 5 Mrigashira
  "South",  // 6 Ardra
  "West",   // 7 Punarvasu
  "North",  // 8 Pushya
  "East",   // 9 Ashlesha
  "South",  // 10 Magha
  "West",   // 11 Purva Phalguni
  "North",  // 12 Uttara Phalguni
  "East",   // 13 Hasta
  "South",  // 14 Chitra
  "West",   // 15 Swati
  "North",  // 16 Vishakha
  "East",   // 17 Anuradha
  "South",  // 18 Jyeshtha
  "West",   // 19 Mula
  "North",  // 20 Purva Ashadha
  "East",   // 21 Uttara Ashadha
  "South",  // 22 Shravana
  "West",   // 23 Dhanishtha
  "North",  // 24 Shatabhisha
  "East",   // 25 Purva Bhadrapada
  "South",  // 26 Uttara Bhadrapada
  "West",   // 27 Revati
]

// ── Vikram Samvat 60-year cycle names ────────────────────────────────────
// Index 0 = Prabhava (VS 1, 57, 117, ...). Formula: (vsYear - 1) % 60
// ⚠️ verify: VS 2083 should map to "Saumya" per standard cycle
export const SAMVATSARA_NAMES: string[] = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati",
  "Angira", "Shrimukha", "Bhava", "Yuvan", "Dhata",
  "Ishwara", "Bahudhanya", "Pramathi", "Vikrama", "Vrisha",
  "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikrita", "Khara",
  "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava",
  "Shubhakruta", "Shobhana", "Krodhi", "Vishwavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikruta",
  "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
  "Pingala", "Kalayukti", "Siddharthi", "Raudri", "Durmati",
  "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya",
]

// ── Chandramasa (lunar month names) ──────────────────────────────────────
export const CHANDRAMASA_NAMES: string[] = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
  "Shravana", "Bhadrapada", "Ashwina", "Kartika",
  "Margashirsha", "Pausha", "Magha", "Phalguna",
]

// ── Mantri Mandala data by VS year ────────────────────────────────────────
// Lookup table for VS 2080–2090. ⚠️ verify against standard Vedic almanac sources.
// Planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
export const MANTRI_MANDALA_TABLE: Record<number, Record<string, string>> = {
  2080: { raja: "Saturn", mantri: "Jupiter", sasyadhipati: "Venus", dhanadhipati: "Mercury",
          rasadhipati: "Moon", senadhipati: "Sun", dhanyadhipati: "Mars",
          meghadhipati: "Rahu", nirasadhipati: "Saturn", phaladhipati: "Jupiter" },
  2081: { raja: "Jupiter", mantri: "Mars", sasyadhipati: "Saturn", dhanadhipati: "Venus",
          rasadhipati: "Sun", senadhipati: "Moon", dhanyadhipati: "Mercury",
          meghadhipati: "Jupiter", nirasadhipati: "Mars", phaladhipati: "Saturn" },
  2082: { raja: "Mars", mantri: "Venus", sasyadhipati: "Jupiter", dhanadhipati: "Saturn",
          rasadhipati: "Mercury", senadhipati: "Sun", dhanyadhipati: "Moon",
          meghadhipati: "Mars", nirasadhipati: "Venus", phaladhipati: "Jupiter" },
  2083: { raja: "Sun", mantri: "Mercury", sasyadhipati: "Mars", dhanadhipati: "Jupiter",
          rasadhipati: "Saturn", senadhipati: "Venus", dhanyadhipati: "Sun",
          meghadhipati: "Mercury", nirasadhipati: "Moon", phaladhipati: "Mars" },
  2084: { raja: "Venus", mantri: "Moon", sasyadhipati: "Sun", dhanadhipati: "Mars",
          rasadhipati: "Jupiter", senadhipati: "Saturn", dhanyadhipati: "Venus",
          meghadhipati: "Moon", nirasadhipati: "Sun", phaladhipati: "Mercury" },
  2085: { raja: "Moon", mantri: "Sun", sasyadhipati: "Venus", dhanadhipati: "Moon",
          rasadhipati: "Mars", senadhipati: "Jupiter", dhanyadhipati: "Saturn",
          meghadhipati: "Venus", nirasadhipati: "Mercury", phaladhipati: "Moon" },
  2086: { raja: "Mercury", mantri: "Saturn", sasyadhipati: "Moon", dhanadhipati: "Sun",
          rasadhipati: "Venus", senadhipati: "Mars", dhanyadhipati: "Jupiter",
          meghadhipati: "Saturn", nirasadhipati: "Venus", phaladhipati: "Sun" },
  2087: { raja: "Saturn", mantri: "Jupiter", sasyadhipati: "Mercury", dhanadhipati: "Moon",
          rasadhipati: "Sun", senadhipati: "Venus", dhanyadhipati: "Mars",
          meghadhipati: "Jupiter", nirasadhipati: "Saturn", phaladhipati: "Mercury" },
  2088: { raja: "Jupiter", mantri: "Mars", sasyadhipati: "Saturn", dhanadhipati: "Mercury",
          rasadhipati: "Moon", senadhipati: "Sun", dhanyadhipati: "Venus",
          meghadhipati: "Mars", nirasadhipati: "Jupiter", phaladhipati: "Saturn" },
  2089: { raja: "Mars", mantri: "Venus", sasyadhipati: "Jupiter", dhanadhipati: "Saturn",
          rasadhipati: "Mercury", senadhipati: "Moon", dhanyadhipati: "Sun",
          meghadhipati: "Venus", nirasadhipati: "Mars", phaladhipati: "Jupiter" },
  2090: { raja: "Sun", mantri: "Mercury", sasyadhipati: "Mars", dhanadhipati: "Jupiter",
          rasadhipati: "Saturn", senadhipati: "Venus", dhanyadhipati: "Moon",
          meghadhipati: "Sun", nirasadhipati: "Mercury", phaladhipati: "Mars" },
}

// Tarabalam: tara count → favorable/unfavorable
// Taras 1-9 cycle: Janma(mixed), Sampat(good), Vipat(bad), Kshema(good),
// Pratyak(bad), Sadhana(good), Vadha(bad), Mitra(good), ParamMitra(good)
export const TARA_QUALITY: ('good' | 'mixed' | 'bad')[] = [
  'mixed', // 1 Janma
  'good',  // 2 Sampat
  'bad',   // 3 Vipat
  'good',  // 4 Kshema
  'bad',   // 5 Pratyak
  'good',  // 6 Sadhana
  'bad',   // 7 Vadha
  'good',  // 8 Mitra
  'good',  // 9 ParamMitra
]

// ── Panchaka Rahita Muhurta classification ────────────────────────────────
// Based on rising lagna (rashi index 0-11)
// ⚠️ verify mapping against drikpanchang
export const PANCHAKA_TYPE: Array<'good' | 'roga' | 'mrityu' | 'agni' | 'raja' | 'chora'> = [
  'good',   // Mesha (0)
  'good',   // Vrishabha (1)
  'good',   // Mithuna (2)
  'good',   // Karka (3)
  'raja',   // Simha (4) — Raja Panchaka
  'good',   // Kanya (5)
  'good',   // Tula (6)
  'good',   // Vrishchika (7)
  'good',   // Dhanu (8)
  'agni',   // Makara (9) — Agni Panchaka
  'chora',  // Kumbha (10) — Chora Panchaka
  'mrityu', // Meena (11) — Mrityu Panchaka (when combined with specific nakshatras)
]

// Sarvartha Siddhi Yoga: weekday → nakshatras (0-indexed)
export const SARVARTHA_SIDDHI_NAKSHATRAS: Record<number, number[]> = {
  0: [12, 18, 0, 7],      // Sun: Hasta, Mula, Ashwini, Pushya
  1: [3, 4, 16, 7, 21],   // Mon: Rohini, Mrigashira, Anuradha, Pushya, Shravana
  2: [0, 2, 4, 13, 22, 16, 26], // Tue: Ashwini, Krittika, Mrigashira, Chitra, Dhanishtha, Anuradha, Revati
  3: [3, 16, 12, 2, 4],   // Wed: Rohini, Anuradha, Hasta, Krittika, Mrigashira
  4: [6, 0, 26, 7],       // Thu: Punarvasu, Ashwini, Revati, Pushya
  5: [16, 3, 26, 12, 4, 6, 0], // Fri: Anuradha, Rohini, Revati, Hasta, Mrigashira, Punarvasu, Ashwini
  6: [3, 14, 15, 16, 26], // Sat: Rohini, Swati, Vishakha, Anuradha, Revati
}

// Amrit Siddhi Yoga: weekday → nakshatra (0-indexed)
export const AMRIT_SIDDHI_NAKSHATRA: Record<number, number> = {
  0: 12,  // Sun: Hasta (index 12)
  1: 4,   // Mon: Mrigashira (index 4)
  2: 0,   // Tue: Ashwini (index 0)
  3: 16,  // Wed: Anuradha (index 16)
  4: 7,   // Thu: Pushya (index 7)
  5: 26,  // Fri: Revati (index 26)
  6: 3,   // Sat: Rohini (index 3)
}

// Ganda Mula nakshatras (0-indexed): Ashwini(0), Ashlesha(8), Magha(9), Jyeshtha(17), Mula(18), Revati(26)
export const GANDA_MULA_NAKSHATRAS = new Set([0, 8, 9, 17, 18, 26])

// Dwipushkar: (weekday in {Sun,Tue,Sat}) AND (tithi in {2,7,12}) AND (nakshatra in specific set)
export const DWIPUSHKAR_WEEKDAYS = new Set([0, 2, 6])
export const DWIPUSHKAR_TITHIS = new Set([2, 7, 12])
export const DWIPUSHKAR_NAKSHATRAS = new Set([2, 6, 11, 15, 20, 24]) // Krittika,Punarvasu,U.Phalguni,Vishakha,U.Ashadha,P.Bhadra

// Tripushkar: (weekday in {Sun,Tue,Sat}) AND (tithi in {3,8,13}) AND (nakshatra same set)
export const TRIPUSHKAR_TITHIS = new Set([3, 8, 13])
