import { Search, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  searchSupports: boolean;
  onSearchSupportsChange: (value: boolean) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  searchSupports,
  onSearchSupportsChange,
}: SearchBarProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={searchSupports ? 'Search supports…' : 'Search skills…'}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-12 sm:h-11 pl-9 bg-[#12121a] border-[#1e1e2e]"
          aria-label={searchSupports ? 'Search supports' : 'Search skills'}
          name="search"
          autoComplete="off"
          spellCheck={false}
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
      <div className="flex items-center gap-2">
        <Checkbox
          id="search-supports"
          checked={searchSupports}
          onCheckedChange={(checked) => onSearchSupportsChange(checked === true)}
        />
        <label
          htmlFor="search-supports"
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          Search by support gem
        </label>
      </div>
    </div>
  );
}
