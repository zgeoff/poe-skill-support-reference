import type { GemColor } from '@/types';

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

const ACTIVE_COLORS: Record<string, string> = {
  all: 'bg-[#8b7a2e] text-[#e8e4d8]',
  red: 'bg-[#c24b38] text-white',
  green: 'bg-[#3b9b47] text-white',
  blue: 'bg-[#4169c9] text-white',
};

export function ColorFilter({ activeColor, onColorChange }: ColorFilterProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onColorChange(f.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeColor === f.value
              ? ACTIVE_COLORS[f.value]
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
