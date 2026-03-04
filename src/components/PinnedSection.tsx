import { useState } from 'react';
import { SkillRow } from '@/components/SkillRow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { SkillGem } from '@/types';

interface PinnedSectionProps {
  pinnedSkills: SkillGem[];
  isExpanded: (name: string) => boolean;
  onToggleExpand: (name: string) => void;
  onUnpin: (name: string) => void;
}

const COLLAPSED_KEY = 'imbued-pinned-collapsed';

export function PinnedSection({
  pinnedSkills,
  isExpanded,
  onToggleExpand,
  onUnpin,
}: PinnedSectionProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (pinnedSkills.length === 0) return null;

  const handleOpenChange = (open: boolean) => {
    setCollapsed(!open);
    localStorage.setItem(COLLAPSED_KEY, String(!open));
  };

  return (
    <Collapsible open={!collapsed} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="w-full flex items-center gap-2 py-2 px-4 text-sm font-medium text-[#8b7a2e]">
        <span>{collapsed ? '\u25b8' : '\u25be'}</span>
        Pinned ({pinnedSkills.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        {pinnedSkills.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            isExpanded={isExpanded(skill.name)}
            onToggleExpand={onToggleExpand}
            isPinned={true}
            onTogglePin={onUnpin}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
