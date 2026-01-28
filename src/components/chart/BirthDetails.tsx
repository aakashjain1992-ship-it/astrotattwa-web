import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BirthDetailsProps {
  input: {
    localDateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  ayanamsha: string;
}

export function BirthDetails({ input, ayanamsha }: BirthDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Birth Chart - KP System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Date:</span>
            <p className="font-medium">
              {new Date(input.localDateTime).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span>
            <p className="font-medium">
              {new Date(input.localDateTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <p className="font-medium">
              {input.latitude.toFixed(4)}°N, {input.longitude.toFixed(4)}°E
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Timezone:</span>
            <p className="font-medium">{input.timezone}</p>
          </div>
          <div className="col-span-full">
            <span className="text-muted-foreground">Ayanamsha:</span>
            <p className="font-medium">{ayanamsha}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
