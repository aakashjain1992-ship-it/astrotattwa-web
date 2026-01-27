export function degToDMS(deg: number) {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  let s = Math.round((minFloat - m) * 60);
  if (s === 60) s = 59;
  return `${d}°${m.toString().padStart(2, "0")}'${s.toString().padStart(2, "0")}"`;
}

export function shortSign(sign: string) {
  return sign.slice(0, 3);
}

export function shortPlanet(key: string) {
  const map: Record<string, string> = {
    Sun: "Sun",
    Moon: "Mon",
    Mercury: "Mer",
    Venus: "Ven",
    Mars: "Mar",
    Jupiter: "Jup",
    Saturn: "Sat",
    Rahu: "Rah",
    Ketu: "Ket",
    Ascendant: "Asc",
  };
  return map[key] || key;
}
