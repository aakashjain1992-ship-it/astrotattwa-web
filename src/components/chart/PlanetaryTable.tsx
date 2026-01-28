import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function PlanetaryTable({ planets }: PlanetaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planetary Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Planet</th>
                <th className="text-left p-2 font-medium">Sign</th>
                <th className="text-right p-2 font-medium">Degree</th>
                <th className="text-left p-2 font-medium">Nakshatra</th>
                <th className="text-left p-2 font-medium">Star Ld</th>
                <th className="text-left p-2 font-medium">Sub Ld</th>
                <th className="text-left p-2 font-medium">SS Ld</th>
                <th className="text-left p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(planets).map(([name, data]) => (
                <tr key={name} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-2 font-semibold">{name}</td>
                  <td className="p-2">{data.sign}</td>
                  <td className="p-2 text-right font-mono text-xs">
                    {data.degreeInSign.toFixed(2)}°
                  </td>
                  <td className="p-2">
                    <div className="text-xs">
                      <div>{data.kp.nakshatraName}</div>
                      <div className="text-muted-foreground">
                        Pada {data.kp.nakshatraPada}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{data.kp.nakshatraLord}</td>
                  <td className="p-2">{data.kp.subLord}</td>
                  <td className="p-2">{data.kp.subSubLord}</td>
                  <td className="p-2">
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
      </CardContent>
    </Card>
  );
}
