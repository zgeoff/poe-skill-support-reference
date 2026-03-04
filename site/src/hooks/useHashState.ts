import { useState, useEffect, useCallback, useRef } from 'react';
import type { GemColor } from '@/types';

interface HashState {
  query: string;
  expanded: Set<string>;
  colorFilter: GemColor | 'all';
}

interface UseHashStateReturn {
  hashState: HashState;
  setQuery: (query: string) => void;
  toggleExpanded: (name: string) => void;
  setExpanded: (names: Set<string>) => void;
  setColorFilter: (color: GemColor | 'all') => void;
  isExpanded: (name: string) => boolean;
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

export function useHashState(): UseHashStateReturn {
  const [state, setState] = useState<HashState>(parseHash);
  const replaceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onHashChange = () => setState(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const updateHash = useCallback((newState: HashState, replace: boolean) => {
    const hash = buildHash(newState);
    if (replace) {
      if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
      replaceTimerRef.current = setTimeout(() => {
        window.history.replaceState(null, '', hash || window.location.pathname);
      }, 150);
    } else {
      window.history.pushState(null, '', hash || window.location.pathname);
    }
  }, []);

  const setQuery = useCallback(
    (query: string) => {
      setState((prev) => {
        const next = { ...prev, query };
        updateHash(next, true);
        return next;
      });
    },
    [updateHash],
  );

  const toggleExpanded = useCallback(
    (name: string) => {
      setState((prev) => {
        const expanded = new Set(prev.expanded);
        if (expanded.has(name)) {
          expanded.delete(name);
        } else {
          expanded.add(name);
        }
        const next = { ...prev, expanded };
        updateHash(next, false);
        return next;
      });
    },
    [updateHash],
  );

  const setExpanded = useCallback(
    (names: Set<string>) => {
      setState((prev) => {
        const next = { ...prev, expanded: names };
        updateHash(next, false);
        return next;
      });
    },
    [updateHash],
  );

  const setColorFilter = useCallback(
    (colorFilter: GemColor | 'all') => {
      setState((prev) => {
        const next = { ...prev, colorFilter };
        updateHash(next, false);
        return next;
      });
    },
    [updateHash],
  );

  const isExpanded = useCallback(
    (name: string) => state.expanded.has(name),
    [state.expanded],
  );

  return { hashState: state, setQuery, toggleExpanded, setExpanded, setColorFilter, isExpanded };
}
