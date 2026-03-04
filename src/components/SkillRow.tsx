import { memo, useEffect, useRef } from 'react';
import { SupportPills } from '@/components/SupportPills';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { SkillGem } from '@/types';
import { GEM_COLORS } from '@/types';

interface SkillRowProps {
  skill: SkillGem;
  isExpanded: boolean;
  onToggleExpand: (name: string) => void;
  isPinned: boolean;
  onTogglePin: (name: string) => void;
}

export const SkillRow = memo(function SkillRow({
  skill,
  isExpanded,
  onToggleExpand,
  isPinned,
  onTogglePin,
}: SkillRowProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && contentRef.current?.scrollIntoView) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  return (
    <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(skill.name)}>
      <div
        className="skill-row relative border-l-4"
        style={{ borderLeftColor: GEM_COLORS[skill.color] }}
      >
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex-1 flex items-center justify-between py-3 sm:py-2.5 px-4 hover:bg-[#1a1a2a] transition-colors text-left min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground text-xs">
                  {isExpanded ? '\u25be' : '\u25b8'}
                </span>
                <span className="text-[#c8c4b8] font-medium truncate">{skill.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground text-sm">[{skill.supports.length}]</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: GEM_COLORS[skill.color] }}
                />
              </div>
            </button>
          </CollapsibleTrigger>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(skill.name);
            }}
            className={`px-3 py-1 text-xs shrink-0 ${isPinned ? 'text-[#8b7a2e]' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? 'pinned' : 'pin'}
          </button>
        </div>
        <CollapsibleContent>
          <div ref={contentRef} className="px-4 pb-3">
            <SupportPills supports={skill.supports} color={skill.color} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});
