import { Badge } from '@/components/ui/badge';
import type { GemColor } from '@/types';

interface SupportPillsProps {
  supports: Record<GemColor, string[]>;
  colorFilter: GemColor | 'all';
}

const COLOR_ORDER: GemColor[] = ['red', 'green', 'blue'];

export function SupportPills({ supports, colorFilter }: SupportPillsProps) {
  const visibleColors = colorFilter === 'all' ? COLOR_ORDER : [colorFilter];
  const hasAny = visibleColors.some((c) => supports[c].length > 0);

  if (!hasAny) {
    return <p className="text-muted-foreground text-sm">No compatible supports</p>;
  }

  return (
    <div className="space-y-2">
      {visibleColors.map((color) => {
        if (supports[color].length === 0) return null;
        return (
          <div key={color} className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {supports[color].map((support) => (
              <Badge key={support} variant="secondary" className={`gem-pill-${color}`}>
                {support.replace(/ Support$/, '')}
              </Badge>
            ))}
          </div>
        );
      })}
    </div>
  );
}
