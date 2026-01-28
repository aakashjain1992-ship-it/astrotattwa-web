import { Badge } from '@/components/ui/badge';

interface StatusBadgesProps {
  retrograde?: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  exhausted?: boolean;
}

export function StatusBadges({
  retrograde,
  combust,
  exalted,
  debilitated,
  exhausted
}: StatusBadgesProps) {
  if (!retrograde && !combust && !exalted && !debilitated && !exhausted) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {retrograde && (
        <Badge variant="destructive" className="text-xs px-1.5 py-0">
          R
        </Badge>
      )}
      {combust && (
        <Badge variant="secondary" className="text-xs px-1.5 py-0">
          C
        </Badge>
      )}
      {exalted && (
        <Badge variant="default" className="text-xs px-1.5 py-0">
          E+
        </Badge>
      )}
      {debilitated && (
        <Badge variant="outline" className="text-xs px-1.5 py-0">
          D-
        </Badge>
      )}
      {exhausted && (
        <Badge variant="outline" className="text-xs px-1.5 py-0">
          Ex
        </Badge>
      )}
    </div>
  );
}
