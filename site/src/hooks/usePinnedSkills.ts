import { useCallback, useState } from 'react';

const STORAGE_KEY = 'imbued-pinned';

function loadPinned(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function savePinned(pinned: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...pinned]));
}

interface UsePinnedSkillsReturn {
  pinnedNames: Set<string>;
  pin: (name: string) => void;
  unpin: (name: string) => void;
  togglePin: (name: string) => void;
  isPinned: (name: string) => boolean;
}

export function usePinnedSkills(): UsePinnedSkillsReturn {
  const [pinnedNames, setPinnedNames] = useState<Set<string>>(loadPinned);

  const pin = useCallback((name: string) => {
    setPinnedNames((prev) => {
      const next = new Set(prev);
      next.add(name);
      savePinned(next);
      return next;
    });
  }, []);

  const unpin = useCallback((name: string) => {
    setPinnedNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      savePinned(next);
      return next;
    });
  }, []);

  const togglePin = useCallback((name: string) => {
    setPinnedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      savePinned(next);
      return next;
    });
  }, []);

  const isPinned = useCallback((name: string) => pinnedNames.has(name), [pinnedNames]);

  return { pinnedNames, pin, unpin, togglePin, isPinned };
}
