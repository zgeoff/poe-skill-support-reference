import { PinnedSection } from '@/components/PinnedSection';
import { SkillRow } from '@/components/SkillRow';
import type { SkillGem } from '@/types';

interface SkillListProps {
  skills: SkillGem[];
  pinnedSkills: SkillGem[];
  isExpanded: (name: string) => boolean;
  onToggleExpand: (name: string) => void;
  isPinned: (name: string) => boolean;
  onTogglePin: (name: string) => void;
  onUnpin: (name: string) => void;
}

export function SkillList({
  skills,
  pinnedSkills,
  isExpanded,
  onToggleExpand,
  isPinned,
  onTogglePin,
  onUnpin,
}: SkillListProps) {
  const filteredSkills = skills.filter((s) => !isPinned(s.name));
  const hasAnyResults = filteredSkills.length > 0 || pinnedSkills.length > 0;

  return (
    <div>
      <PinnedSection
        pinnedSkills={pinnedSkills}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onUnpin={onUnpin}
      />
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
            onToggleExpand={() => onToggleExpand(skill.name)}
            isPinned={isPinned(skill.name)}
            onTogglePin={() => onTogglePin(skill.name)}
          />
        ))
      )}
    </div>
  );
}
