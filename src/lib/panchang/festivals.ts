// ─────────────────────────────────────────────────────────────────────────────
// Festival Data
// Fetch festivals from the festival_calendar DB table for a given date.
// Also contains the seed data for 2026-2027.
// ─────────────────────────────────────────────────────────────────────────────
import type { FestivalData } from './types'

/** Fetch festivals for a date from Supabase (called from API route, not here) */
export type FestivalRow = {
  id: string
  date: string
  name: string
  type: string
  description?: string
  image_url?: string
}

export function mapFestivalRow(row: FestivalRow): FestivalData {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    type: row.type as FestivalData['type'],
    description: row.description,
    image_url: row.image_url,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data: 2026-2027 Major Hindu Festivals
// These are approximate Gregorian dates. Actual tithi-based dates may differ
// by ±1 day depending on location/timezone.
// ─────────────────────────────────────────────────────────────────────────────
export const FESTIVAL_SEED_DATA: Omit<FestivalData, 'id'>[] = [
  // ── 2026 ──────────────────────────────────────────────────────────────────
  { date: '2026-01-14', name: 'Makar Sankranti', type: 'major', description: 'Sun enters Capricorn' },
  { date: '2026-01-14', name: 'Pongal', type: 'major', description: 'South Indian harvest festival' },
  { date: '2026-01-26', name: 'Republic Day', type: 'auspicious', description: 'National holiday' },
  { date: '2026-02-01', name: 'Basant Panchami', type: 'major', description: 'Saraswati Puja — Magha Shukla 5' },
  { date: '2026-02-04', name: 'Ratha Saptami', type: 'auspicious', description: 'Sun worship — Magha Shukla 7' },
  { date: '2026-02-15', name: 'Magha Purnima', type: 'auspicious', description: 'Magha full moon' },
  { date: '2026-02-18', name: 'Maha Shivaratri', type: 'major', description: 'Great night of Shiva — Phalguna Krishna 13' },
  { date: '2026-03-02', name: 'Phalguna Amavasya', type: 'fast', description: 'New moon — Darsha Amavasya' },
  { date: '2026-03-14', name: 'Holi', type: 'major', description: 'Festival of colors — Phalguna Purnima' },
  { date: '2026-03-13', name: 'Holika Dahan', type: 'major', description: 'Holika bonfire — Phalguna Chaturdashi' },
  { date: '2026-03-27', name: 'Ram Navami', type: 'major', description: 'Birthday of Lord Rama — Chaitra Shukla 9' },
  { date: '2026-04-02', name: 'Hanuman Jayanti', type: 'major', description: 'Birthday of Lord Hanuman — Chaitra Purnima' },
  { date: '2026-04-02', name: 'Chaitra Purnima', type: 'auspicious', description: 'Chaitra full moon' },
  { date: '2026-04-11', name: 'Akshaya Tritiya', type: 'major', description: 'Most auspicious day of the year — Vaishakha Shukla 3' },
  { date: '2026-05-12', name: 'Buddha Purnima', type: 'major', description: 'Birth of Gautama Buddha — Vaishakha Purnima' },
  { date: '2026-07-01', name: 'Guru Purnima', type: 'major', description: 'Honour to gurus — Ashadha Purnima' },
  { date: '2026-08-01', name: 'Nag Panchami', type: 'auspicious', description: 'Worship of serpents — Shravana Shukla 5' },
  { date: '2026-08-09', name: 'Raksha Bandhan', type: 'major', description: 'Festival of sibling bond — Shravana Purnima' },
  { date: '2026-08-16', name: 'Janmashtami', type: 'major', description: 'Birthday of Lord Krishna — Bhadrapada Krishna 8' },
  { date: '2026-08-22', name: 'Ganesh Chaturthi', type: 'major', description: 'Birthday of Lord Ganesha — Bhadrapada Shukla 4' },
  { date: '2026-09-07', name: 'Ganesh Visarjan', type: 'major', description: 'Anant Chaturdashi — end of Ganesh festival' },
  { date: '2026-09-22', name: 'Pitru Paksha begins', type: 'auspicious', description: 'Fortnight for ancestors' },
  { date: '2026-09-30', name: 'Navratri begins', type: 'major', description: 'Nine nights of Durga — Ashwina Shukla 1' },
  { date: '2026-10-06', name: 'Saraswati Puja', type: 'major', description: 'Ashwina Shukla 7' },
  { date: '2026-10-07', name: 'Durga Ashtami', type: 'major', description: 'Mahaashtami' },
  { date: '2026-10-08', name: 'Maha Navami', type: 'major', description: 'Maha Navami' },
  { date: '2026-10-09', name: 'Dussehra', type: 'major', description: 'Victory of Ram over Ravana — Ashwina Shukla 10' },
  { date: '2026-10-20', name: 'Karva Chauth', type: 'fast', description: 'Fast for husbands — Kartika Krishna 4' },
  { date: '2026-10-24', name: 'Dhanteras', type: 'major', description: 'Dhanvantari Trayodashi — Kartika Krishna 13' },
  { date: '2026-10-25', name: 'Narak Chaturdashi', type: 'major', description: 'Choti Diwali — Kartika Krishna 14' },
  { date: '2026-10-26', name: 'Diwali', type: 'major', description: 'Festival of lights — Kartika Amavasya' },
  { date: '2026-10-27', name: 'Govardhan Puja', type: 'major', description: 'Kartika Shukla 1' },
  { date: '2026-10-28', name: 'Bhai Dooj', type: 'major', description: 'Sibling festival — Kartika Shukla 2' },
  { date: '2026-11-04', name: 'Chhath Puja', type: 'major', description: 'Sun worship festival' },
  { date: '2026-11-11', name: 'Dev Uthani Ekadashi', type: 'major', description: 'Vishnu wakes up — Kartika Shukla 11' },
  { date: '2026-11-13', name: 'Kartika Purnima', type: 'major', description: 'Kartika full moon — very auspicious' },
  { date: '2026-12-25', name: 'Christmas', type: 'auspicious', description: 'National holiday' },

  // Monthly Ekadashi 2026
  { date: '2026-01-11', name: 'Putrada Ekadashi', type: 'fast', description: 'Pausha Shukla Ekadashi' },
  { date: '2026-01-26', name: 'Shattila Ekadashi', type: 'fast', description: 'Magha Krishna Ekadashi' },
  { date: '2026-02-09', name: 'Jaya Ekadashi', type: 'fast', description: 'Magha Shukla Ekadashi' },
  { date: '2026-02-24', name: 'Vijaya Ekadashi', type: 'fast', description: 'Phalguna Krishna Ekadashi' },
  { date: '2026-03-11', name: 'Amalaki Ekadashi', type: 'fast', description: 'Phalguna Shukla Ekadashi' },
  { date: '2026-03-25', name: 'Papamocha Ekadashi', type: 'fast', description: 'Chaitra Krishna Ekadashi' },
  { date: '2026-04-09', name: 'Kamada Ekadashi', type: 'fast', description: 'Chaitra Shukla Ekadashi' },
  { date: '2026-04-24', name: 'Varuthini Ekadashi', type: 'fast', description: 'Vaishakha Krishna Ekadashi' },
  { date: '2026-05-09', name: 'Mohini Ekadashi', type: 'fast', description: 'Vaishakha Shukla Ekadashi' },
  { date: '2026-05-23', name: 'Apara Ekadashi', type: 'fast', description: 'Jyeshtha Krishna Ekadashi' },
  { date: '2026-06-07', name: 'Nirjala Ekadashi', type: 'major', description: 'Jyeshtha Shukla Ekadashi — major fast' },
  { date: '2026-06-22', name: 'Yogini Ekadashi', type: 'fast', description: 'Ashadha Krishna Ekadashi' },
  { date: '2026-07-07', name: 'Devshayani Ekadashi', type: 'major', description: 'Ashadha Shukla Ekadashi — Vishnu sleeps' },
  { date: '2026-07-22', name: 'Kamika Ekadashi', type: 'fast', description: 'Shravana Krishna Ekadashi' },
  { date: '2026-08-05', name: 'Shravana Putrada Ekadashi', type: 'fast', description: 'Shravana Shukla Ekadashi' },
  { date: '2026-08-20', name: 'Aja Ekadashi', type: 'fast', description: 'Bhadrapada Krishna Ekadashi' },
  { date: '2026-09-03', name: 'Parsva Ekadashi', type: 'fast', description: 'Bhadrapada Shukla Ekadashi' },
  { date: '2026-09-18', name: 'Indira Ekadashi', type: 'fast', description: 'Ashwina Krishna Ekadashi' },
  { date: '2026-10-03', name: 'Papankusha Ekadashi', type: 'fast', description: 'Ashwina Shukla Ekadashi' },
  { date: '2026-10-18', name: 'Rama Ekadashi', type: 'fast', description: 'Kartika Krishna Ekadashi' },
  { date: '2026-11-01', name: 'Prabodhini Ekadashi', type: 'fast', description: 'Kartika Shukla Ekadashi' },
  { date: '2026-11-17', name: 'Utpanna Ekadashi', type: 'fast', description: 'Margashirsha Krishna Ekadashi' },
  { date: '2026-12-01', name: 'Mokshada Ekadashi', type: 'fast', description: 'Margashirsha Shukla Ekadashi' },
  { date: '2026-12-16', name: 'Saphala Ekadashi', type: 'fast', description: 'Pausha Krishna Ekadashi' },
  { date: '2026-12-31', name: 'Pausha Putrada Ekadashi', type: 'fast', description: 'Pausha Shukla Ekadashi' },

  // Monthly Purnima 2026
  { date: '2026-01-14', name: 'Pausha Purnima', type: 'auspicious', description: 'Pausha full moon' },
  { date: '2026-02-15', name: 'Magha Purnima', type: 'auspicious', description: 'Magha full moon' },
  { date: '2026-03-14', name: 'Phalguna Purnima (Holi)', type: 'major', description: 'Holi Purnima' },
  { date: '2026-04-02', name: 'Chaitra Purnima', type: 'auspicious', description: 'Hanuman Jayanti' },
  { date: '2026-05-12', name: 'Vaishakha Purnima (Buddha Purnima)', type: 'major' },
  { date: '2026-06-11', name: 'Jyeshtha Purnima', type: 'auspicious' },
  { date: '2026-07-01', name: 'Ashadha Purnima (Guru Purnima)', type: 'major' },
  { date: '2026-07-31', name: 'Shravana Purnima (Raksha Bandhan)', type: 'major' },
  { date: '2026-08-29', name: 'Bhadrapada Purnima', type: 'auspicious' },
  { date: '2026-09-28', name: 'Ashwina Purnima (Sharad Purnima)', type: 'major', description: 'Kojagari Purnima' },
  { date: '2026-10-27', name: 'Kartika Purnima', type: 'major' },
  { date: '2026-11-25', name: 'Margashirsha Purnima', type: 'auspicious' },
  { date: '2026-12-25', name: 'Pausha Purnima', type: 'auspicious' },

  // Monthly Amavasya 2026
  { date: '2026-01-29', name: 'Magha Amavasya', type: 'fast' },
  { date: '2026-02-28', name: 'Phalguna Amavasya', type: 'fast' },
  { date: '2026-03-29', name: 'Chaitra Amavasya', type: 'fast' },
  { date: '2026-04-27', name: 'Vaishakha Amavasya', type: 'fast' },
  { date: '2026-05-27', name: 'Jyeshtha Amavasya', type: 'fast' },
  { date: '2026-06-25', name: 'Ashadha Amavasya', type: 'fast' },
  { date: '2026-07-25', name: 'Shravana Amavasya', type: 'fast' },
  { date: '2026-08-23', name: 'Bhadrapada Amavasya', type: 'fast' },
  { date: '2026-09-22', name: 'Ashwina Amavasya (Pitru Amavasya)', type: 'fast' },
  { date: '2026-10-21', name: 'Kartika Amavasya (Diwali)', type: 'major' },
  { date: '2026-11-20', name: 'Margashirsha Amavasya', type: 'fast' },
  { date: '2026-12-20', name: 'Pausha Amavasya', type: 'fast' },

  // ── 2027 ──────────────────────────────────────────────────────────────────
  { date: '2027-01-14', name: 'Makar Sankranti', type: 'major' },
  { date: '2027-01-22', name: 'Basant Panchami', type: 'major', description: 'Saraswati Puja' },
  { date: '2027-02-08', name: 'Maha Shivaratri', type: 'major' },
  { date: '2027-03-03', name: 'Holi', type: 'major', description: 'Phalguna Purnima' },
  { date: '2027-03-17', name: 'Ram Navami', type: 'major' },
  { date: '2027-04-01', name: 'Hanuman Jayanti', type: 'major', description: 'Chaitra Purnima' },
  { date: '2027-04-30', name: 'Akshaya Tritiya', type: 'major' },
  { date: '2027-05-02', name: 'Buddha Purnima', type: 'major' },
  { date: '2027-07-20', name: 'Guru Purnima', type: 'major' },
  { date: '2027-08-04', name: 'Janmashtami', type: 'major' },
  { date: '2027-08-09', name: 'Raksha Bandhan', type: 'major' },
  { date: '2027-08-19', name: 'Ganesh Chaturthi', type: 'major' },
  { date: '2027-09-29', name: 'Navratri begins', type: 'major' },
  { date: '2027-10-08', name: 'Dussehra', type: 'major' },
  { date: '2027-10-14', name: 'Dhanteras', type: 'major' },
  { date: '2027-10-15', name: 'Diwali', type: 'major' },
  { date: '2027-11-02', name: 'Kartika Purnima', type: 'major' },
]
