import type { GemColor } from '@/types';
import { GEM_COLORS } from '@/types';

interface ColorFilterProps {
  activeColor: GemColor | 'all';
  onColorChange: (color: GemColor | 'all') => void;
}

const FILTERS: { label: string; value: GemColor | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
];

const ACTIVE_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  all: { backgroundColor: '#8b7a2e', color: '#e8e4d8' },
  red: { backgroundColor: GEM_COLORS.red, color: 'white' },
  green: { backgroundColor: GEM_COLORS.green, color: 'white' },
  blue: { backgroundColor: GEM_COLORS.blue, color: 'white' },
};

export function ColorFilter({ activeColor, onColorChange }: ColorFilterProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          type="button"
          key={f.value}
          onClick={() => onColorChange(f.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeColor !== f.value ? 'text-muted-foreground hover:text-foreground' : ''
          }`}
          style={activeColor === f.value ? ACTIVE_STYLES[f.value] : undefined}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
