import type Fuse from 'fuse.js';
import type { SearchableSkill, SkillGem } from '@/types';

export async function buildSearchIndex(skills: SkillGem[]): Promise<Fuse<SearchableSkill>> {
  const { default: Fuse } = await import('fuse.js');

  const searchableSkills: SearchableSkill[] = skills.map((s) => ({
    name: s.name,
    color: s.color,
    supports: [...s.supports.red, ...s.supports.green, ...s.supports.blue].join(' '),
  }));

  return new Fuse(searchableSkills, {
    keys: [{ name: 'name', weight: 2 }],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
    shouldSort: true,
  });
}
