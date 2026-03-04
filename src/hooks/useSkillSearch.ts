import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSearchIndex } from '@/lib/search';
import type { GemColor, SkillGem } from '@/types';

interface HashState {
  query: string;
  expanded: Set<string>;
  colorFilter: GemColor | 'all';
}

export interface UseSkillSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  colorFilter: GemColor | 'all';
  setColorFilter: (color: GemColor | 'all') => void;
  results: SkillGem[];
  isExpanded: (name: string) => boolean;
  toggleExpanded: (name: string) => void;
}

function parseHash(): HashState {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash.startsWith('?') ? hash : `?${hash}`);
  return {
    query: params.get('q') ?? '',
    expanded: new Set(params.getAll('e')),
    colorFilter: (params.get('c') as GemColor | 'all') ?? 'all',
  };
}

function buildHash(state: HashState): string {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  for (const e of state.expanded) params.append('e', e);
  if (state.colorFilter !== 'all') params.set('c', state.colorFilter);
  const str = params.toString();
  return str ? `#?${str}` : '';
}

export function useSkillSearch(skills: SkillGem[]): UseSkillSearchReturn {
  // Initialize from URL hash (parse once, share across state initializers)
  const [initial] = useState(parseHash);
  const [query, setQueryRaw] = useState(initial.query);
  const [debouncedQuery, setDebouncedQuery] = useState(initial.query);
  const [colorFilter, setColorFilterRaw] = useState<GemColor | 'all'>(initial.colorFilter);
  const [expanded, setExpanded] = useState<Set<string>>(initial.expanded);

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
  useEffect(() => {
    queryRef.current = query;
    colorFilterRef.current = colorFilter;
  });

  // Listen for popstate/hashchange (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      setQueryRaw(parsed.query);
      setDebouncedQuery(parsed.query);
      setColorFilterRaw(parsed.colorFilter);
      setExpanded(parsed.expanded);
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
        };
        updateHash(state, false);
        return next;
      });
    },
    [updateHash],
  );

  const isExpanded = useCallback((name: string) => expanded.has(name), [expanded]);

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

  const results = useMemo(() => {
    let filtered: SkillGem[];

    if (debouncedQuery.trim() && fuse) {
      const fuseResults = fuse.search(debouncedQuery);
      const skillMap = new Map(skills.map((s) => [s.name, s]));
      filtered = fuseResults
        .map((r) => skillMap.get(r.item.name))
        .filter((s): s is SkillGem => s !== undefined);
    } else {
      filtered = [...skills];
    }

    if (colorFilter !== 'all') {
      filtered = filtered.filter((s) => s.color === colorFilter);
    }

    return filtered;
  }, [skills, debouncedQuery, colorFilter, fuse]);

  return { query, setQuery, colorFilter, setColorFilter, results, isExpanded, toggleExpanded };
}
