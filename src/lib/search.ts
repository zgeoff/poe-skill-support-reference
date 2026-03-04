import Fuse from 'fuse.js';
import type { SearchableSkill, SkillGem } from '@/types';

export function buildSearchIndex(skills: SkillGem[]): Fuse<SearchableSkill> {
  const searchableSkills: SearchableSkill[] = skills.map((s) => ({
    name: s.name,
    color: s.color,
    supports: s.supports.join(' '),
  }));

  return new Fuse(searchableSkills, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'supports', weight: 1 },
    ],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
    shouldSort: true,
  });
}
