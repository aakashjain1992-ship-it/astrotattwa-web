import path from 'path';

let swisseph: any = null;

async function loadSwisseph() {
  if (!swisseph) {
    swisseph = await import('swisseph');
    
    const ephePath = '/var/www/astrotattwa-web/public/ephe';
    console.log('[SWISSEPH] Setting ephemeris path to:', ephePath);
    
    swisseph.swe_set_ephe_path(ephePath);
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    
    console.log('[SWISSEPH] Loaded successfully');
  }
  return swisseph;
}

export async function calculateSunPosition(date: Date) {
  const swe = await loadSwisseph();
  
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;

    const jd = swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);
    const flags = swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
    
    const result: any = swe.swe_calc_ut(jd, swe.SE_SUN, flags);
    
    console.log('[SUN] Result:', result);

    // Version 0.5.17 returns object with longitude property, not data array
    if (!result || typeof result.longitude === 'undefined') {
      throw new Error(`Invalid result: ${JSON.stringify(result)}`);
    }

    if (result.rflag < 0) {
      throw new Error(`Calculation error: ${result.error || 'Unknown error'}`);
    }

    const longitude = result.longitude;
    const speed = result.longitudeSpeed;

    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;

    return {
      longitude: longitude.toFixed(6),
      sign: signs[signIndex],
      degree: degree.toFixed(2),
      speed: speed.toFixed(6),
      nakshatra: await calculateNakshatra(longitude)
    };

  } catch (error) {
    console.error('[SUN] Error:', error);
    throw error;
  }
}

export async function calculateMoonPosition(date: Date) {
  const swe = await loadSwisseph();
  
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;

    const jd = swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);
    const flags = swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
    const result: any = swe.swe_calc_ut(jd, swe.SE_MOON, flags);

    console.log('[MOON] Result:', result);

    if (!result || typeof result.longitude === 'undefined') {
      throw new Error(`Invalid Moon result: ${JSON.stringify(result)}`);
    }

    if (result.rflag < 0) {
      throw new Error(`Moon error: ${result.error || 'Unknown'}`);
    }

    const longitude = result.longitude;
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;

    return {
      longitude: longitude.toFixed(6),
      sign: signs[signIndex],
      degree: degree.toFixed(2),
      nakshatra: await calculateNakshatra(longitude)
    };

  } catch (error) {
    console.error('[MOON] Error:', error);
    throw error;
  }
}

async function calculateNakshatra(longitude: number) {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const nakshatraIndex = Math.floor(longitude / 13.333333333);
  const nakshatraDegree = (longitude % 13.333333333);
  const pada = Math.floor(nakshatraDegree / 3.333333333) + 1;

  return {
    name: nakshatras[nakshatraIndex],
    pada: pada,
    lord: getNakshatraLord(nakshatraIndex)
  };
}

function getNakshatraLord(index: number) {
  const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  return lords[index % 9];
}

export async function testCalculations() {
  console.log('\n[TEST] === TESTING SWISS EPHEMERIS ===\n');
  
  const testDate = new Date(1992, 2, 25, 11, 55, 0);
  
  const sun = await calculateSunPosition(testDate);
  const moon = await calculateMoonPosition(testDate);
  
  console.log('\n[TEST] === TEST COMPLETE ===\n');
  
  return { sun, moon };
}
