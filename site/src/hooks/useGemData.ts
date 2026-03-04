import { useEffect, useState } from 'react';
import { loadGemData } from '@/lib/data';
import type { SkillGem } from '@/types';

interface UseGemDataReturn {
  skills: SkillGem[];
  loading: boolean;
  error: string | null;
}

export function useGemData(): UseGemDataReturn {
  const [skills, setSkills] = useState<SkillGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGemData()
      .then((allSkills) => {
        setSkills(allSkills);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });
  }, []);

  return { skills, loading, error };
}
