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
// Day divided into 15 muhurtas (each = dayDuration/15, ~48-50 min each).
// Values are 1-indexed muhurta numbers from sunrise (partNum 1 = first muhurta of day).
// All 7 days verified vs drikpanchang across multiple dates (Apr 2026).
// Note: Tuesday also has a night Dur Muhurtam slot — implement when night muhurta support added.
// Note: Thursday and Sunday may have a second slot — one more observation needed to confirm.
export const DUR_MUHURTAM_PARTS: Record<number, number[]> = {
  0: [10],      // Sun   ✅ ~1 afternoon slot (second slot unconfirmed, omitted)
  1: [10, 11],  // Mon   ✅ verified Apr 27
  2: [2],       // Tue   ✅ verified Apr 21, Apr 28 (daytime slot; night slot separate)
  3: [8],       // Wed   ✅ verified Apr 22, Apr 29
  4: [5],       // Thu   ✅ verified Apr 23 (second slot unconfirmed, omitted)
  5: [3, 8],    // Fri   ✅ verified Apr 24
  6: [1, 2],    // Sat   ✅ verified Apr 25
}

// ── Amrit Kalam by Nakshatra ──────────────────────────────────────────────
// Start offset in ghatis (1 ghati = 24 min) from midnight. Duration = 4 ghatis (96 min).
// ⚠️ verify against drikpanchang for multiple dates
export const AMRIT_KALAM_GHATI: number[] = [
  4,  // 0 Ashwini
  14, // 1 Bharani
  22, // 2 Krittika
  20, // 3 Rohini
  24, // 4 Mrigashira
  26, // 5 Ardra
  2,  // 6 Punarvasu
  50, // 7 Pushya
  16, // 8 Ashlesha
  18, // 9 Magha
  20, // 10 Purva Phalguni
  22, // 11 Uttara Phalguni
  28, // 12 Hasta — 28 ghatis from midnight ≈ 11:12 AM (verified ~11:18 drikpanchang)
  31, // 13 Chitra    — verified drikpanchang (~12:32 PM = 31.3 ghatis from midnight)
  30, // 14 Swati     — verified drikpanchang (~11:59 AM = 29.95 ghatis)
  36, // 15 Vishakha  — verified drikpanchang (~2:24 PM = 36 ghatis)
  38, // 16 Anuradha  — verified drikpanchang (~3:19 PM = 38.3 ghatis)
  50, // 17 Jyeshtha  — verified drikpanchang (~8:01 PM = 50 ghatis)
  64, // 18 Mula      — verified drikpanchang (~1:38 AM next day = 64 ghatis)
  10, // 19 Purva Ashadha
  38, // 20 Uttara Ashadha
  40, // 21 Shravana
  42, // 22 Dhanishtha
  44, // 23 Shatabhisha
  46, // 24 Purva Bhadrapada
  48, // 25 Uttara Bhadrapada
  2,  // 26 Revati
]

// ── Varjyam by Nakshatra ──────────────────────────────────────────────────
// Start offset in ghatis from midnight. Duration = 4 ghatis (96 min).
// ⚠️ verify against drikpanchang for multiple dates
export const VARJYAM_GHATI: number[] = [
  17, // 0 Ashwini
  6,  // 1 Bharani
  11, // 2 Krittika
  11, // 3 Rohini
  13, // 4 Mrigashira
  13, // 5 Ardra
  50, // 6 Punarvasu
  10, // 7 Pushya
  2,  // 8 Ashlesha
  5,  // 9 Magha
  22, // 10 Purva Phalguni
  6,  // 11 Uttara Phalguni
  65, // 12 Hasta — 65 ghatis from midnight ≈ next day 02:00 AM (verified ~02:14 drikpanchang)
  64, // 13 Chitra    — verified drikpanchang (~1:31 AM next day)
  17, // 14 Swati     — verified drikpanchang (~6:58 AM)
  71, // 15 Vishakha  — verified drikpanchang (~4:36 AM next day)
  22, // 16 Anuradha
  23, // 17 Jyeshtha  — verified drikpanchang (~9:14 AM)
  37, // 18 Mula      — verified drikpanchang (~2:52 PM)
  16, // 19 Purva Ashadha
  14, // 20 Uttara Ashadha
  16, // 21 Shravana
  5,  // 22 Dhanishtha
  11, // 23 Shatabhisha
  12, // 24 Purva Bhadrapada
  14, // 25 Uttara Bhadrapada
  28, // 26 Revati
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
// Sequence starts at Vriddhi (index 0). Formula uses 28-nakshatra position (Abhijeet inserted
// between UttaraAshadha=20 and Shravana=21). Standard indices 21–26 get +1 before the formula.
//   position28 = nakshatraIndex > 20 ? nakshatraIndex + 1 : nakshatraIndex
//   adjustedIndex = ((position28 - dayOffset) % 28 + 28) % 28
// Verified across 14+ dates (Apr 10, 14–15, 18, 20–29, 2026) against drikpanchang.
export const ANANDADI_YOGA_LIST = [
  { name: "Vriddhi",    auspicious: true  },  // 0
  { name: "Ananda",     auspicious: true  },  // 1
  { name: "Kala",       auspicious: false },  // 2
  { name: "Dhumra",     auspicious: false },  // 3
  { name: "Prajapati",  auspicious: true  },  // 4
  { name: "Soumya",     auspicious: true  },  // 5
  { name: "Dhwanksha",  auspicious: false },  // 6
  { name: "Dhwaja",     auspicious: true  },  // 7
  { name: "Shreevatsa", auspicious: true  },  // 8
  { name: "Vajra",      auspicious: false },  // 9
  { name: "Mudgar",     auspicious: false },  // 10
  { name: "Chhatra",    auspicious: true  },  // 11
  { name: "Mitra",      auspicious: true  },  // 12
  { name: "Manas",      auspicious: true  },  // 13
  { name: "Padma",      auspicious: true  },  // 14
  { name: "Lumbak",     auspicious: false },  // 15
  { name: "Utpat",      auspicious: false },  // 16
  { name: "Mrityu",     auspicious: false },  // 17 (very bad)
  { name: "Kana",       auspicious: false },  // 18
  { name: "Siddha",     auspicious: true  },  // 19
  { name: "Shubha",     auspicious: true  },  // 20
  { name: "Amrit",      auspicious: true  },  // 21 (very good)
  { name: "Musal",      auspicious: false },  // 22
  { name: "Gada",       auspicious: false },  // 23
  { name: "Matanga",    auspicious: true  },  // 24
  { name: "Rakshasa",   auspicious: false },  // 25
  { name: "Chara",      auspicious: true  },  // 26
  { name: "Sthira",     auspicious: true  },  // 27
] as const

// Per-day offset — clean +4 cycle, all 7 days verified vs drikpanchang.
// 0=Sunday, 1=Monday, ..., 6=Saturday
export const ANANDADI_DAY_OFFSET: Record<number, number> = {
  0: 27, // Sun  ✅ verified Apr 26
  1:  3, // Mon  ✅ verified Apr 27
  2:  7, // Tue  ✅ verified Apr 21, Apr 28
  3: 11, // Wed  ✅ verified Apr 22, Apr 29
  4: 15, // Thu  ✅ verified Apr 23
  5: 19, // Fri  ✅ verified Apr 24
  6: 23, // Sat  ✅ verified Apr 25
}

// ── Tamil Yoga by Anandadi index (28 values, 0-indexed) ────────────────────
// Tamil Yoga is derived from the same Anandadi index — no separate nakshatra lookup.
// Values: 'Siddha' (auspicious), 'Amrita' (very auspicious), 'Marana' (inauspicious).
// 22/28 confirmed vs drikpanchang; 6 marked tentative (*).
export const TAMIL_YOGA_BY_INDEX: string[] = [
  'Siddha',  // 0  Vriddhi    ✅
  'Siddha',  // 1  Ananda     ✅ Apr 29 Wed Hasta
  'Marana',  // 2  Kala       ✅ Apr 29 Wed Chitra
  'Marana',  // 3  Dhumra     * tentative
  'Siddha',  // 4  Prajapati  ✅ Apr 28 Tue U.Phalguni
  'Siddha',  // 5  Soumya     ✅ Apr 18 Sat Ashwini
  'Marana',  // 6  Dhwanksha  ✅ Apr 18 Sat Bharani
  'Siddha',  // 7  Dhwaja     ✅ Apr 27 Mon P.Phalguni
  'Siddha',  // 8  Shreevatsa ✅ Apr 27 Mon U.Phalguni
  'Marana',  // 9  Vajra      * tentative
  'Marana',  // 10 Mudgar     ✅ Apr 26 Sun Magha
  'Amrita',  // 11 Chhatra    ✅ Apr 26 Sun P.Phalguni
  'Siddha',  // 12 Mitra      ✅ Apr 16 Thu Revati
  'Amrita',  // 13 Manas      ✅ Apr 25 Sat Ashlesha
  'Siddha',  // 14 Padma      ✅ Apr 25 Sat Magha
  'Marana',  // 15 Lumbak     ✅ Apr 15 Wed U.Bhadra
  'Marana',  // 16 Utpat      ✅ Apr 24 Fri Pushya
  'Marana',  // 17 Mrityu     ✅ Apr 14 Tue Shatabhisha
  'Marana',  // 18 Kana       ✅ Apr 14 Tue P.Bhadra
  'Siddha',  // 19 Siddha     * tentative
  'Siddha',  // 20 Shubha     ✅ Apr 23 Thu Pushya
  'Marana',  // 21 Amrit      ✅ Apr 10 Fri Hasta — counterintuitive but confirmed
  'Marana',  // 22 Musal      ✅ Apr 22 Wed Ardra
  'Marana',  // 23 Gada       ✅ Apr 22 Wed Punarvasu
  'Marana',  // 24 Matanga    * tentative
  'Marana',  // 25 Rakshasa   ✅ Apr 21 Tue Mrigashira
  'Siddha',  // 26 Chara      ✅ Apr 21 Tue Ardra
  'Siddha',  // 27 Sthira     * tentative
]

// ── Homahuti by Nakshatra (0-based index) ────────────────────────────────
// 23/27 nakshatras confirmed vs drikpanchang. Returns '' for unknown — hide field.
// Unknown: index 2 (Krittika), 15 (Vishakha), 16 (Anuradha), 17 (Jyeshtha), 18 (Mula).
export const HOMAHUTI_BY_NAKSHATRA: Partial<Record<number, string>> = {
  0:  'Sun',     // Ashwini         ✅
  1:  'Sun',     // Bharani         ✅
  // 2: Krittika  — unknown, omit
  3:  'Budha',   // Rohini          ✅ Apr 20
  4:  'Budha',   // Mrigashira      ✅ Apr 21
  5:  'Budha',   // Ardra           ✅ Apr 22
  6:  'Shukra',  // Punarvasu       ✅ Apr 22–23
  7:  'Shukra',  // Pushya          ✅ Apr 24
  8:  'Shukra',  // Ashlesha        ✅ Apr 25
  9:  'Shani',   // Magha           ✅ Apr 25–26
  10: 'Shani',   // Purva Phalguni  ✅ Apr 26–27
  11: 'Shani',   // Uttara Phalguni ✅ Apr 27–28
  12: 'Chandra', // Hasta           ✅ Apr 28–29
  13: 'Chandra', // Chitra          ✅ Apr 29
  14: 'Mangal',  // Swati           ✅
  // 15: Vishakha  — unknown
  // 16: Anuradha  — unknown
  // 17: Jyeshtha  — unknown
  // 18: Mula      — unknown
  19: 'Guru',    // Purva Ashadha   ✅
  20: 'Rahu',    // Uttara Ashadha  ✅
  21: 'Rahu',    // Shravana        ✅
  22: 'Rahu',    // Dhanishtha      ✅
  23: 'Ketu',    // Shatabhisha     ✅
  24: 'Rahu',    // Purva Bhadrapada ✅
  25: 'Ketu',    // Uttara Bhadrapada ✅
  26: 'Ketu',    // Revati          ✅
}

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
  "North",      // Sun
  "North-West", // Mon
  "West",       // Tue
  "South-West", // Wed
  "South",      // Thu
  "South-East", // Fri
  "East",       // Sat
]

// ── Shivavasa by tithi (7-cycle) — formula: (tithiNumber - 1) % 7 ──────────
// Verified correct for tithis 1–16, 30. Known exception: tithi 14 on Apr 15 Wed
// (formula gives Bhojana, DP shows Shmashana — likely a year-level phase offset).
export const SHIVAVASA_LOCATIONS: string[] = [
  "Shmashana", // 0 → tithis 1, 8, 15, 22, 29
  "Gowri",     // 1 → tithis 2, 9, 16, 23, 30
  "Sabha",     // 2 → tithis 3, 10, 17, 24
  "Krida",     // 3 → tithis 4, 11, 18, 25
  "Kailash",   // 4 → tithis 5, 12, 19, 26
  "Nandi",     // 5 → tithis 6, 13, 20, 27
  "Bhojana",   // 6 → tithis 7, 14, 21, 28
]

// ── Agnivasa by tithi (partial lookup, ~60% coverage) ─────────────────────
// Returns '' for unknown tithis — hide field when ''.
// Tithi numbering: 1–15 = Shukla Pratipada–Purnima, 16–30 = Krishna Pratipada–Amavasya.
export const AGNIVASA_BY_TITHI: Partial<Record<number, string>> = {
  // Shukla Paksha
  1:  'Akasha',  // Pratipada   ✅
  2:  'Patala',  // Dwitiya     ✅
  3:  'Patala',  // Tritiya     ✅
  4:  'Prithvi', // Chaturthi   ✅
  5:  'Akasha',  // Panchami    ✅
  // 6: Shashthi — ambiguous, omit
  7:  'Akasha',  // Saptami     ✅
  // 8: Ashtami  — ambiguous, omit
  9:  'Akasha',  // Navami      ✅ Apr 25
  10: 'Prithvi', // Dashami     ✅ Apr 26
  11: 'Akasha',  // Ekadashi    ✅ Apr 26
  // 12: Dwadashi — varies, omit
  13: 'Patala',  // Trayodashi  ✅ Apr 29 Wed
  14: 'Prithvi', // Chaturdashi ✅ Apr 29
  15: 'Akasha',  // Purnima     ✅
  // Krishna Paksha
  16: 'Patala',  // Krishna Pratipada ✅
  // 17–26: unknown
  27: 'Prithvi', // Krishna Dwadashi  ✅
  28: 'Akasha',  // Krishna Trayodashi ✅
  29: 'Patala',  // Krishna Chaturdashi ✅
  30: 'Akasha',  // Amavasya    ✅
}

// ── Kumbha Chakra by nakshatra ────────────────────────────────────────────
// Groups of 7 nakshatras per direction (verified: Hasta index 12 → North).
// East: Ashwini–Punarvasu (0–6), North: Pushya–Chitra (7–13),
// West: Swati–Uttara Ashadha (14–20), South: Shravana–Revati (21–26)
export const KUMBHA_CHAKRA: string[] = [
  "East",   // 0 Ashwini
  "East",   // 1 Bharani
  "East",   // 2 Krittika
  "East",   // 3 Rohini
  "East",   // 4 Mrigashira
  "East",   // 5 Ardra
  "East",   // 6 Punarvasu
  "North",  // 7 Pushya
  "North",  // 8 Ashlesha
  "North",  // 9 Magha
  "North",  // 10 Purva Phalguni
  "North",  // 11 Uttara Phalguni
  "North",  // 12 Hasta
  "North",  // 13 Chitra
  "West",   // 14 Swati
  "West",   // 15 Vishakha
  "West",   // 16 Anuradha
  "West",   // 17 Jyeshtha
  "West",   // 18 Mula
  "West",   // 19 Purva Ashadha
  "West",   // 20 Uttara Ashadha
  "South",  // 21 Shravana
  "South",  // 22 Dhanishtha
  "South",  // 23 Shatabhisha
  "South",  // 24 Purva Bhadrapada
  "South",  // 25 Uttara Bhadrapada
  "South",  // 26 Revati
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

// ── Chaitra Shukla Pratipada dates (VS year → Gregorian date of Hindu New Year) ──
// Pravishte = days elapsed since this date (inclusive, day 1 = Pratipada itself).
// VS 2083 = 2026-03-15 verified: Apr 2 gives 19, Apr 3 gives 20.
// Other years: ⚠️ verify against drikpanchang before relying on them.
export const CHAITRA_PRATIPADA_DATES: Record<number, string> = {
  2080: '2023-03-22', // ⚠️ verify
  2081: '2024-04-09', // ⚠️ verify
  2082: '2025-03-30', // Gudi Padwa 2025 — verify
  2083: '2026-03-15', // verified (Apr 2 = 19, Apr 3 = 20)
  2084: '2027-04-03', // ⚠️ verify
  2085: '2028-03-23', // ⚠️ verify
  2086: '2029-04-10', // ⚠️ verify
  2087: '2030-03-31', // ⚠️ verify
}

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
  2083: { raja: "Jupiter", mantri: "Mars", sasyadhipati: "Jupiter", dhanadhipati: "Jupiter",
          rasadhipati: "Saturn", senadhipati: "Moon", dhanyadhipati: "Mercury",
          meghadhipati: "Moon", nirasadhipati: "Jupiter", phaladhipati: "Moon" },
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
// DEPRECATED: rashi-based Panchaka (was an oversimplification). Kept for reference.
// Use PANCHAKA_BY_NAKSHATRA instead.
export const PANCHAKA_TYPE: Array<'good' | 'roga' | 'mrityu' | 'agni' | 'raja' | 'chora'> = [
  'good',   // Mesha (0)
  'good',   // Vrishabha (1)
  'good',   // Mithuna (2)
  'good',   // Karka (3)
  'good',   // Simha (4)
  'good',   // Kanya (5)
  'good',   // Tula (6)
  'good',   // Vrishchika (7)
  'good',   // Dhanu (8)
  'good',   // Makara (9)
  'chora',  // Kumbha (10)
  'good',   // Meena (11)
]

// Panchaka classification by nakshatra index (0-based, Ashwini=0).
// The 5 Panchaka nakshatras and their types:
export const PANCHAKA_BY_NAKSHATRA: Partial<Record<number, 'roga' | 'mrityu' | 'agni' | 'raja' | 'chora'>> = {
  22: 'roga',   // Dhanishtha  (293°20' – 306°40')
  23: 'mrityu', // Shatabhisha (306°40' – 320°00')
  24: 'agni',   // Purva Bhadrapada (320°00' – 333°20')
  25: 'raja',   // Uttara Bhadrapada (333°20' – 346°40')
  26: 'chora',  // Revati (346°40' – 360°00')
}

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
