import { useMemo } from 'react';
import { PinnedSection } from '@/components/PinnedSection';
import { SkillRow } from '@/components/SkillRow';
import type { GemColor, SkillGem } from '@/types';

interface SkillListProps {
  skills: SkillGem[];
  pinnedSkills: SkillGem[];
  isExpanded: (name: string) => boolean;
  onToggleExpand: (name: string) => void;
  isPinned: (name: string) => boolean;
  onTogglePin: (name: string) => void;
  onUnpin: (name: string) => void;
  colorFilter: GemColor | 'all';
  matchedSupports: Map<string, Record<GemColor, string[]>> | null;
}

export function SkillList({
  skills,
  pinnedSkills,
  isExpanded,
  onToggleExpand,
  isPinned,
  onTogglePin,
  onUnpin,
  colorFilter,
  matchedSupports,
}: SkillListProps) {
  const filteredSkills = useMemo(() => skills.filter((s) => !isPinned(s.name)), [skills, isPinned]);
  const hasAnyResults = filteredSkills.length > 0 || pinnedSkills.length > 0;

  return (
    <div>
      <span className="sr-only" aria-live="polite">
        {filteredSkills.length + pinnedSkills.length} results
      </span>
      <PinnedSection
        pinnedSkills={pinnedSkills}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onUnpin={onUnpin}
        colorFilter={colorFilter}
      />
      {pinnedSkills.length > 0 && filteredSkills.length > 0 && (
        <div className="border-t border-[#2a2a3a] my-2" />
      )}
      {filteredSkills.length === 0 && !hasAnyResults ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No matching skills found</p>
          <p className="text-sm mt-1">Try a different search term or color filter</p>
        </div>
      ) : (
        filteredSkills.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            isExpanded={isExpanded(skill.name)}
            onToggleExpand={onToggleExpand}
            isPinned={isPinned(skill.name)}
            onTogglePin={onTogglePin}
            colorFilter={colorFilter}
            matchedSupports={matchedSupports?.get(skill.name)}
          />
        ))
      )}
    </div>
  );
}
