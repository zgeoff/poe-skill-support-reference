import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSearchIndex } from '@/lib/search';
import type { GemColor, SkillGem, SortBy, SortDir } from '@/types';

interface HashState {
  query: string;
  expanded: Set<string>;
  colorFilter: GemColor | 'all';
  sortBy: SortBy;
  sortDir: SortDir;
  searchSupports: boolean;
}

export interface UseSkillSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  colorFilter: GemColor | 'all';
  setColorFilter: (color: GemColor | 'all') => void;
  sortBy: SortBy;
  sortDir: SortDir;
  setSortBy: (sort: SortBy) => void;
  results: SkillGem[];
  isExpanded: (name: string) => boolean;
  toggleExpanded: (name: string) => void;
  expandedCount: number;
  collapseAll: () => void;
  searchSupports: boolean;
  setSearchSupports: (value: boolean) => void;
  matchedSupports: Map<string, Record<GemColor, string[]>> | null;
}

function parseHash(): HashState {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash.startsWith('?') ? hash : `?${hash}`);
  return {
    query: params.get('q') ?? '',
    expanded: new Set(params.getAll('e')),
    colorFilter: (params.get('c') as GemColor | 'all') ?? 'all',
    sortBy: (params.get('sort') as SortBy) ?? 'name',
    sortDir: (params.get('dir') as SortDir) ?? 'asc',
    searchSupports: params.get('ss') === '1',
  };
}

function buildHash(state: HashState): string {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  for (const e of state.expanded) params.append('e', e);
  if (state.colorFilter !== 'all') params.set('c', state.colorFilter);
  if (state.sortBy !== 'name') params.set('sort', state.sortBy);
  if (state.sortDir !== 'asc') params.set('dir', state.sortDir);
  if (state.searchSupports) params.set('ss', '1');
  const str = params.toString();
  return str ? `#?${str}` : '';
}

export function useSkillSearch(skills: SkillGem[]): UseSkillSearchReturn {
  // Initialize from URL hash (parse once, share across state initializers)
  const [initial] = useState(parseHash);
  const [query, setQueryRaw] = useState(initial.query);
  const [debouncedQuery, setDebouncedQuery] = useState(initial.query);
  const [colorFilter, setColorFilterRaw] = useState<GemColor | 'all'>(initial.colorFilter);
  const [sortBy, setSortByRaw] = useState<SortBy>(initial.sortBy);
  const [sortDir, setSortDirRaw] = useState<SortDir>(initial.sortDir);
  const [expanded, setExpanded] = useState<Set<string>>(initial.expanded);
  const [searchSupports, setSearchSupportsRaw] = useState(initial.searchSupports);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const replaceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep a ref to expanded set for use in callbacks (setQuery, setColorFilter, toggleExpanded)
  const expandedRef = useRef(expanded);
  useEffect(() => {
    expandedRef.current = expanded;
  });

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
    };
  }, []);

  // Helper: update URL hash
  const updateHash = useCallback((state: HashState, replace: boolean) => {
    const hash = buildHash(state);
    if (replace) {
      if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
      replaceTimerRef.current = setTimeout(() => {
        window.history.replaceState(null, '', hash || window.location.pathname);
      }, 150);
    } else {
      window.history.pushState(null, '', hash || window.location.pathname);
    }
  }, []);

  // We need refs for the latest state so the hashchange listener always sees current values
  const queryRef = useRef(query);
  const colorFilterRef = useRef(colorFilter);
  const sortByRef = useRef(sortBy);
  const sortDirRef = useRef(sortDir);
  const searchSupportsRef = useRef(searchSupports);
  useEffect(() => {
    queryRef.current = query;
    colorFilterRef.current = colorFilter;
    sortByRef.current = sortBy;
    sortDirRef.current = sortDir;
    searchSupportsRef.current = searchSupports;
  });

  // Listen for popstate/hashchange (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      setQueryRaw(parsed.query);
      setDebouncedQuery(parsed.query);
      setColorFilterRaw(parsed.colorFilter);
      setSortByRaw(parsed.sortBy);
      setSortDirRaw(parsed.sortDir);
      setExpanded(parsed.expanded);
      setSearchSupportsRaw(parsed.searchSupports);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => startTransition(() => setDebouncedQuery(q)), 150);

      // replaceState for query changes (they're frequent)
      const state: HashState = {
        query: q,
        expanded: expandedRef.current,
        colorFilter: colorFilterRef.current,
        sortBy: sortByRef.current,
        sortDir: sortDirRef.current,
        searchSupports: searchSupportsRef.current,
      };
      updateHash(state, true);
    },
    [updateHash],
  );

  const setColorFilter = useCallback(
    (color: GemColor | 'all') => {
      setColorFilterRaw(color);
      const state: HashState = {
        query: queryRef.current,
        expanded: expandedRef.current,
        colorFilter: color,
        sortBy: sortByRef.current,
        sortDir: sortDirRef.current,
        searchSupports: searchSupportsRef.current,
      };
      updateHash(state, false);
    },
    [updateHash],
  );

  const toggleExpanded = useCallback(
    (name: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(name)) {
          next.delete(name);
        } else {
          next.add(name);
        }
        const state: HashState = {
          query: queryRef.current,
          expanded: next,
          colorFilter: colorFilterRef.current,
          sortBy: sortByRef.current,
          sortDir: sortDirRef.current,
          searchSupports: searchSupportsRef.current,
        };
        updateHash(state, false);
        return next;
      });
    },
    [updateHash],
  );

  const setSortBy = useCallback(
    (sort: SortBy) => {
      let newDir: SortDir;
      if (sort === sortByRef.current) {
        // Same button: toggle direction
        newDir = sortDirRef.current === 'asc' ? 'desc' : 'asc';
      } else {
        // Different button: sensible default
        newDir = sort === 'name' ? 'asc' : 'desc';
      }
      setSortByRaw(sort);
      setSortDirRaw(newDir);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const state: HashState = {
        query: queryRef.current,
        expanded: expandedRef.current,
        colorFilter: colorFilterRef.current,
        sortBy: sort,
        sortDir: newDir,
        searchSupports: searchSupportsRef.current,
      };
      updateHash(state, false);
    },
    [updateHash],
  );

  const setSearchSupports = useCallback(
    (value: boolean) => {
      setSearchSupportsRaw(value);
      const state: HashState = {
        query: queryRef.current,
        expanded: expandedRef.current,
        colorFilter: colorFilterRef.current,
        sortBy: sortByRef.current,
        sortDir: sortDirRef.current,
        searchSupports: value,
      };
      updateHash(state, false);
    },
    [updateHash],
  );

  const isExpanded = useCallback((name: string) => expanded.has(name), [expanded]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
    const state: HashState = {
      query: queryRef.current,
      expanded: new Set(),
      colorFilter: colorFilterRef.current,
      sortBy: sortByRef.current,
      sortDir: sortDirRef.current,
      searchSupports: searchSupportsRef.current,
    };
    updateHash(state, false);
  }, [updateHash]);

  // Fuse.js search — lazy-loaded
  const [fuse, setFuse] = useState<Awaited<ReturnType<typeof buildSearchIndex>> | null>(null);
  const fuseSkillsRef = useRef(skills);
  useEffect(() => {
    fuseSkillsRef.current = skills;
    let cancelled = false;
    buildSearchIndex(skills).then((index) => {
      if (!cancelled && fuseSkillsRef.current === skills) {
        setFuse(index);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [skills]);

  // Support search: case-insensitive substring match on support names
  const supportSearchData = useMemo(() => {
    if (!searchSupports || !debouncedQuery.trim()) return null;
    const q = debouncedQuery.toLowerCase();
    const matchMap = new Map<string, Record<GemColor, string[]>>();
    const matched: SkillGem[] = [];
    const colors: GemColor[] = ['red', 'green', 'blue'];

    for (const skill of skills) {
      const hits: Record<GemColor, string[]> = { red: [], green: [], blue: [] };
      let hasMatch = false;
      for (const c of colors) {
        if (colorFilter !== 'all' && colorFilter !== c) continue;
        for (const name of skill.supports[c]) {
          if (name.toLowerCase().includes(q)) {
            hits[c].push(name);
            hasMatch = true;
          }
        }
      }
      if (hasMatch) {
        matchMap.set(skill.name, hits);
        matched.push(skill);
      }
    }
    return { matchMap, matched };
  }, [searchSupports, debouncedQuery, skills, colorFilter]);

  const results = useMemo(() => {
    let filtered: SkillGem[];

    if (supportSearchData) {
      filtered = supportSearchData.matched;
    } else if (debouncedQuery.trim() && fuse) {
      const fuseResults = fuse.search(debouncedQuery);
      const skillMap = new Map(skills.map((s) => [s.name, s]));
      filtered = fuseResults
        .map((r) => skillMap.get(r.item.name))
        .filter((s): s is SkillGem => s !== undefined);
    } else {
      filtered = [...skills];
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'count') {
      filtered.sort((a, b) => {
        let aCount: number;
        let bCount: number;
        if (colorFilter !== 'all') {
          aCount = a.supports[colorFilter].length;
          bCount = b.supports[colorFilter].length;
        } else {
          aCount = a.supports.red.length + a.supports.green.length + a.supports.blue.length;
          bCount = b.supports.red.length + b.supports.green.length + b.supports.blue.length;
        }
        return dir * (aCount - bCount) || a.name.localeCompare(b.name);
      });
    } else if (!debouncedQuery.trim() || supportSearchData) {
      filtered.sort((a, b) => dir * a.name.localeCompare(b.name));
    }

    return filtered;
  }, [skills, debouncedQuery, fuse, sortBy, sortDir, colorFilter, supportSearchData]);

  const matchedSupports = supportSearchData?.matchMap ?? null;

  return {
    query,
    setQuery,
    colorFilter,
    setColorFilter,
    sortBy,
    sortDir,
    setSortBy,
    results,
    isExpanded,
    toggleExpanded,
    expandedCount: expanded.size,
    collapseAll,
    searchSupports,
    setSearchSupports,
    matchedSupports,
  };
}
