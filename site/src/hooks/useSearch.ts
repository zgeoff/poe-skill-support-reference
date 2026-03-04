import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { SkillGem, GemColor } from '@/types';
import { buildSearchIndex } from '@/lib/search';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  colorFilter: GemColor | 'all';
  setColorFilter: (color: GemColor | 'all') => void;
  results: SkillGem[];
}

export function useSearch(skills: SkillGem[]): UseSearchReturn {
  const [query, setQueryRaw] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<GemColor | 'all'>('all');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(q), 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fuse = useMemo(() => buildSearchIndex(skills), [skills]);

  const results = useMemo(() => {
    let filtered: SkillGem[];

    if (debouncedQuery.trim()) {
      const fuseResults = fuse.search(debouncedQuery);
      const matchedNames = new Set(fuseResults.map((r) => r.item.name));
      filtered = skills.filter((s) => matchedNames.has(s.name));
      // Preserve fuse sort order
      filtered.sort((a, b) => {
        const aIdx = fuseResults.findIndex((r) => r.item.name === a.name);
        const bIdx = fuseResults.findIndex((r) => r.item.name === b.name);
        return aIdx - bIdx;
      });
    } else {
      filtered = [...skills];
    }

    if (colorFilter !== 'all') {
      filtered = filtered.filter((s) => s.color === colorFilter);
    }

    return filtered;
  }, [skills, debouncedQuery, colorFilter, fuse]);

  return { query, setQuery, colorFilter, setColorFilter, results };
}
