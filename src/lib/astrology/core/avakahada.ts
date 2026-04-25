/**
 * Avakahada Chakra - Vedic Astrology Birth Attributes
 * Calculates 17 essential attributes based on birth chart data
 */

interface Avakahada {
  ascendantSign: string;
  ascendantLord: string;
  rasiSign: string;
  rasiLord: string;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  yoga: string;
  karan: string;
  gana: string;
  yoni: string;
  nadi: string;
  varan: string;
  vashya: string;
  varga: string;
  yunja: string;
  hansak: string;
  nameAlphabet: string;
  payaRasi: string;
  payaNakshatra: string;
  sunSignWestern: string;
}

// Sign rulers
const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

// 27 Nakshatras with their properties
const NAKSHATRA_DATA = [
  // Name, Lord, Gana, Yoni, Nadi, Varan, Varga, Yunja, Hansak, Paya
  { name: "Ashwini", lord: "Ketu", gana: "Deva", yoni: "Horse", nadi: "Adi", varan: "Vaishya", varga: "Ashwa", yunja: "Adya", hansak: "Vayu", paya: "Gold" },
  { name: "Bharani", lord: "Venus", gana: "Manushya", yoni: "Elephant", nadi: "Adi", varan: "Mleccha", varga: "Gaja", yunja: "Adya", hansak: "Prithvi", paya: "Silver" },
  { name: "Krittika", lord: "Sun", gana: "Rakshasa", yoni: "Goat", nadi: "Adi", varan: "Brahmin", varga: "Mesh", yunja: "Adya", hansak: "Agni", paya: "Copper" },
  { name: "Rohini", lord: "Moon", gana: "Manushya", yoni: "Serpent", nadi: "Madhya", varan: "Shudra", varga: "Sarpa", yunja: "Madhya", hansak: "Prithvi", paya: "Iron" },
  { name: "Mrigashira", lord: "Mars", gana: "Deva", yoni: "Serpent", nadi: "Madhya", varan: "Shudra", varga: "Sarpa", yunja: "Madhya", hansak: "Prithvi", paya: "Gold" },
  { name: "Ardra", lord: "Rahu", gana: "Manushya", yoni: "Dog", nadi: "Madhya", varan: "Butcher", varga: "Shwan", yunja: "Madhya", hansak: "Jala", paya: "Silver" },
  { name: "Punarvasu", lord: "Jupiter", gana: "Deva", yoni: "Cat", nadi: "Antya", varan: "Vaishya", varga: "Marjar", yunja: "Antya", hansak: "Vayu", paya: "Copper" },
  { name: "Pushya", lord: "Saturn", gana: "Deva", yoni: "Goat", nadi: "Antya", varan: "Brahmin", varga: "Mesh", yunja: "Antya", hansak: "Agni", paya: "Iron" },
  { name: "Ashlesha", lord: "Mercury", gana: "Rakshasa", yoni: "Cat", nadi: "Antya", varan: "Mleccha", varga: "Marjar", yunja: "Antya", hansak: "Jala", paya: "Gold" },
  { name: "Magha", lord: "Ketu", gana: "Rakshasa", yoni: "Rat", nadi: "Adi", varan: "Shudra", varga: "Mooshak", yunja: "Adya", hansak: "Jala", paya: "Silver" },
  { name: "Purva Phalguni", lord: "Venus", gana: "Manushya", yoni: "Rat", nadi: "Adi", varan: "Brahmin", varga: "Mooshak", yunja: "Adya", hansak: "Jala", paya: "Copper" },
  { name: "Uttara Phalguni", lord: "Sun", gana: "Manushya", yoni: "Cow", nadi: "Adi", varan: "Kshatriya", varga: "Go", yunja: "Adya", hansak: "Agni", paya: "Iron" },
  { name: "Hasta", lord: "Moon", gana: "Deva", yoni: "Buffalo", nadi: "Madhya", varan: "Vaishya", varga: "Mahish", yunja: "Madhya", hansak: "Prithvi", paya: "Gold" },
  { name: "Chitra", lord: "Mars", gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya", varan: "Shudra", varga: "Vyaghra", yunja: "Madhya", hansak: "Agni", paya: "Silver" },
  { name: "Swati", lord: "Rahu", gana: "Deva", yoni: "Buffalo", nadi: "Madhya", varan: "Butcher", varga: "Mahish", yunja: "Madhya", hansak: "Vayu", paya: "Copper" },
  { name: "Vishakha", lord: "Jupiter", gana: "Rakshasa", yoni: "Tiger", nadi: "Antya", varan: "Mleccha", varga: "Vyaghra", yunja: "Antya", hansak: "Agni", paya: "Iron" },
  { name: "Anuradha", lord: "Saturn", gana: "Deva", yoni: "Deer", nadi: "Antya", varan: "Shudra", varga: "Mrig", yunja: "Antya", hansak: "Agni", paya: "Gold" },
  { name: "Jyeshtha", lord: "Mercury", gana: "Rakshasa", yoni: "Deer", nadi: "Antya", varan: "Shudra", varga: "Mrig", yunja: "Antya", hansak: "Vayu", paya: "Silver" },
  { name: "Mula", lord: "Ketu", gana: "Rakshasa", yoni: "Dog", nadi: "Adi", varan: "Butcher", varga: "Shwan", yunja: "Adya", hansak: "Jala", paya: "Copper" },
  { name: "Purva Ashadha", lord: "Venus", gana: "Manushya", yoni: "Monkey", nadi: "Adi", varan: "Brahmin", varga: "Vanara", yunja: "Adya", hansak: "Jala", paya: "Iron" },
  { name: "Uttara Ashadha", lord: "Sun", gana: "Manushya", yoni: "Mongoose", nadi: "Adi", varan: "Kshatriya", varga: "Nakul", yunja: "Adya", hansak: "Agni", paya: "Gold" },
  { name: "Shravana", lord: "Moon", gana: "Deva", yoni: "Monkey", nadi: "Madhya", varan: "Mleccha", varga: "Vanara", yunja: "Madhya", hansak: "Prithvi", paya: "Silver" },
  { name: "Dhanishta", lord: "Mars", gana: "Rakshasa", yoni: "Lion", nadi: "Madhya", varan: "Shudra", varga: "Simha", yunja: "Madhya", hansak: "Prithvi", paya: "Copper" },
  { name: "Shatabhisha", lord: "Rahu", gana: "Rakshasa", yoni: "Horse", nadi: "Madhya", varan: "Butcher", varga: "Ashwa", yunja: "Madhya", hansak: "Vayu", paya: "Iron" },
  { name: "Purva Bhadrapada", lord: "Jupiter", gana: "Manushya", yoni: "Lion", nadi: "Antya", varan: "Brahmin", varga: "Simha", yunja: "Antya", hansak: "Vayu", paya: "Gold" },
  { name: "Uttara Bhadrapada", lord: "Saturn", gana: "Manushya", yoni: "Cow", nadi: "Antya", varan: "Kshatriya", varga: "Go", yunja: "Antya", hansak: "Prithvi", paya: "Silver" },
  { name: "Revati", lord: "Mercury", gana: "Deva", yoni: "Elephant", nadi: "Antya", varan: "Shudra", varga: "Gaja", yunja: "Antya", hansak: "Prithvi", paya: "Copper" },
];

// Name alphabets for each nakshatra pada (108 padas total)
const NAME_ALPHABETS: string[] = [
  // Ashwini
  "Chu", "Che", "Cho", "La",
  // Bharani
  "Li", "Lu", "Le", "Lo",
  // Krittika
  "Aa", "Ee", "Oo", "Ae",
  // Rohini
  "O", "Va", "Vi", "Vu",
  // Mrigashira
  "Ve", "Vo", "Ka", "Ki",
  // Ardra
  "Ku", "Gha", "Nga", "Chha",
  // Punarvasu
  "Ke", "Ko", "Ha", "Hi",
  // Pushya
  "Hu", "He", "Ho", "Da",
  // Ashlesha
  "Di", "Du", "De", "Do",
  // Magha
  "Ma", "Mi", "Mu", "Me",
  // Purva Phalguni
  "Mo", "Ta", "Ti", "Tu",
  // Uttara Phalguni
  "Te", "To", "Pa", "Pi",
  // Hasta
  "Pu", "Sha", "Na", "Tha",
  // Chitra
  "Pe", "Po", "Ra", "Ri",
  // Swati
  "Ru", "Re", "Ro", "Ta",
  // Vishakha
  "Ti", "Tu", "Te", "To",
  // Anuradha
  "Na", "Ni", "Nu", "Ne",
  // Jyeshtha
  "No", "Ya", "Yi", "Yu",
  // Mula
  "Ye", "Yo", "Bha", "Bhi",
  // Purva Ashadha
  "Bhu", "Dha", "Pha", "Dha",
  // Uttara Ashadha
  "Bhe", "Bho", "Ja", "Ji",
  // Shravana
  "Ju", "Je", "Jo", "Gha",
  // Dhanishta
  "Ga", "Gi", "Gu", "Ge",
  // Shatabhisha
  "Go", "Sa", "Si", "Su",
  // Purva Bhadrapada
  "Se", "So", "Da", "Di",
  // Uttara Bhadrapada
  "Du", "Tha", "Jha", "Jna",
  // Revati
  "De", "Do", "Cha", "Chi",
];

// 27 Nitya Yogas
const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana",
  "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha",
  "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

// 11 Karanas (each repeats, total 60)
const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

// Vashya based on Moon sign
const VASHYA_MAP: Record<string, string> = {
  Aries: "Quadruped",
  Taurus: "Quadruped",
  Gemini: "Human",
  Cancer: "Water",
  Leo: "Quadruped",
  Virgo: "Human",
  Libra: "Human",
  Scorpio: "Insect",
  Sagittarius: "Human",
  Capricorn: "Water",
  Aquarius: "Human",
  Pisces: "Water",
};

// Western tropical zodiac signs
const WESTERN_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Get sign name from longitude
 */
function getSignName(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex];
}

/**
 * Calculate Yoga (Nitya Yoga)
 * Yoga = (Sun longitude + Moon longitude) mod 13.333333
 */
function calculateYoga(sunLongitude: number, moonLongitude: number): string {
  const sum = (sunLongitude + moonLongitude) % 360;
  const yogaIndex = Math.floor(sum / 13.333333);
  return YOGAS[yogaIndex];
}

/**
 * Calculate Karan
 * Karan = (Moon longitude - Sun longitude) / 6
 */
function calculateKaran(sunLongitude: number, moonLongitude: number): string {
  let diff = moonLongitude - sunLongitude;
  if (diff < 0) diff += 360;
  
  const karanIndex = Math.floor(diff / 6) % 60;
  
  // First 4 karanas appear once, next 7 repeat 8 times each
  if (karanIndex === 0) return "Kimstughna";
  if (karanIndex >= 1 && karanIndex <= 56) {
    return KARANAS[(karanIndex - 1) % 7];
  }
  if (karanIndex === 57) return "Shakuni";
  if (karanIndex === 58) return "Chatushpada";
  if (karanIndex === 59) return "Naga";
  
  return "Bava"; // Default
}

/**
 * Get Western Sun Sign (Tropical - not sidereal)
 * Add 24 degrees to sidereal longitude for tropical
 */
function getWesternSunSign(sunLongitude: number): string {
  // Convert sidereal to tropical (approximately +24 degrees)
  const tropicalLongitude = (sunLongitude + 24) % 360;
  const signIndex = Math.floor(tropicalLongitude / 30);
  return WESTERN_SIGNS[signIndex];
}

/**
 * Calculate all Avakahada Chakra attributes
 */
export function calculateAvakahada(
  ascendantLongitude: number,
  moonLongitude: number,
  sunLongitude: number,
  moonNakshatraIndex: number,
  moonNakshatraPada: number,
  moonNakshatraLord: string
): Avakahada {
  const ascendantSign = getSignName(ascendantLongitude);
  const rasiSign = getSignName(moonLongitude);
  const nakshatraData = NAKSHATRA_DATA[moonNakshatraIndex];
  
  // Calculate pada index (0-107)
  const padaIndex = moonNakshatraIndex * 4 + (moonNakshatraPada - 1);
  
  return {
    ascendantSign,
    ascendantLord: SIGN_LORDS[ascendantSign],
    rasiSign,
    rasiLord: SIGN_LORDS[rasiSign],
    nakshatra: nakshatraData.name,
    nakshatraPada: moonNakshatraPada,
    nakshatraLord: moonNakshatraLord,
    yoga: calculateYoga(sunLongitude, moonLongitude),
    karan: calculateKaran(sunLongitude, moonLongitude),
    gana: nakshatraData.gana,
    yoni: nakshatraData.yoni,
    nadi: nakshatraData.nadi,
    varan: nakshatraData.varan,
    vashya: VASHYA_MAP[rasiSign],
    varga: nakshatraData.varga,
    yunja: nakshatraData.yunja,
    hansak: nakshatraData.hansak,
    nameAlphabet: NAME_ALPHABETS[padaIndex],
    payaRasi: NAKSHATRA_DATA[Math.floor(moonLongitude / 13.333333)].paya,
    payaNakshatra: nakshatraData.paya,
    sunSignWestern: getWesternSunSign(sunLongitude),
  };
}
