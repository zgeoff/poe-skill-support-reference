import { Badge } from '@/components/ui/badge';
import type { GemColor } from '@/types';

interface SupportPillsProps {
  supports: string[];
  color: GemColor;
}

export function SupportPills({ supports, color }: SupportPillsProps) {
  if (supports.length === 0) {
    return <p className="text-muted-foreground text-sm">No compatible supports</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {supports.map((support) => (
        <Badge key={support} variant="secondary" className={`gem-pill-${color}`}>
          {support.replace(/ Support$/, '')}
        </Badge>
      ))}
    </div>
  );
}
