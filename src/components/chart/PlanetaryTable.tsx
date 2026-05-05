import { StatusBadges } from './StatusBadges';

interface Planet {
  key: string;
  sign: string;
  degreeInSign: number;
  speed: number;
  retrograde: boolean;
  combust: boolean;
  exalted: boolean;
  debilitated: boolean;
  exhausted: boolean;
  kp: {
    rasiLord: string;
    nakshatraName: string;
    nakshatraPada: number;
    nakshatraLord: string;
    subLord: string;
    subSubLord: string;
  };
}

interface PlanetaryTableProps {
  planets: Record<string, Planet>;
}

const ORDER = ['Ascendant','Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu'];

export function PlanetaryTable({ planets }: PlanetaryTableProps) {
  const rows = [
    ...ORDER.filter(k => planets[k]).map(k => [k, planets[k]] as [string, Planet]),
    ...Object.entries(planets).filter(([k]) => !ORDER.includes(k)),
  ];

  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-5">Planetary Positions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">Planet</th>
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">Sign</th>
              <th className="text-right pb-3 pr-4 font-medium text-muted-foreground">Degree</th>
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">Nakshatra</th>
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">Star Ld</th>
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">Sub Ld</th>
              <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">SS Ld</th>
              <th className="text-left pb-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, data]) => (
              <tr
                key={name}
                className="border-b border-border last:border-0 hover:bg-white/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4 font-semibold">{name}</td>
                <td className="py-3 pr-4">{data.sign}</td>
                <td className="py-3 pr-4 text-right font-mono text-xs tabular-nums">
                  {data.degreeInSign.toFixed(2)}°
                </td>
                <td className="py-3 pr-4">
                  <div className="text-xs">
                    <div>{data.kp.nakshatraName}</div>
                    <div className="text-muted-foreground">Pada {data.kp.nakshatraPada}</div>
                  </div>
                </td>
                <td className="py-3 pr-4">{data.kp.nakshatraLord}</td>
                <td className="py-3 pr-4">{data.kp.subLord}</td>
                <td className="py-3 pr-4">{data.kp.subSubLord}</td>
                <td className="py-3">
                  <StatusBadges
                    retrograde={data.retrograde}
                    combust={data.combust}
                    exalted={data.exalted}
                    debilitated={data.debilitated}
                    exhausted={data.exhausted}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
