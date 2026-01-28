import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AscendantCardProps {
  ascendant: {
    sign: string;
    degreeInSign: number;
    kp: {
      rasiLord: string;
      nakshatraName: string;
      nakshatraPada: number;
      nakshatraLord: string;
      subLord: string;
      subSubLord: string;
    };
  };
}

export function AscendantCard({ ascendant }: AscendantCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ascendant (Lagna)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold">
              {ascendant.sign} {ascendant.degreeInSign.toFixed(2)}°
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Rasi Lord</p>
              <p className="font-medium">{ascendant.kp.rasiLord}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Nakshatra</p>
              <p className="font-medium">
                {ascendant.kp.nakshatraName} ({ascendant.kp.nakshatraPada})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Star Lord</p>
              <p className="font-medium">{ascendant.kp.nakshatraLord}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Sub Lord</p>
              <p className="font-medium">{ascendant.kp.subLord}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Sub-Sub Lord</p>
              <p className="font-medium">{ascendant.kp.subSubLord}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
