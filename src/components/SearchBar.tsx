import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Search skills or supports..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="h-12 sm:h-11 pl-9 bg-[#12121a] border-[#1e1e2e]"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}
