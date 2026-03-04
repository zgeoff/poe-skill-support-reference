import { useRef, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SupportPills } from '@/components/SupportPills';
import type { SkillGem } from '@/types';

interface SkillRowProps {
  skill: SkillGem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export function SkillRow({ skill, isExpanded, onToggleExpand, isPinned, onTogglePin }: SkillRowProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && contentRef.current && contentRef.current.scrollIntoView) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className={`relative border-l-4 ${
        skill.color === 'red' ? 'border-l-[#c24b38]' :
        skill.color === 'green' ? 'border-l-[#3b9b47]' :
        'border-l-[#4169c9]'
      }`}>
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <button className="flex-1 flex items-center justify-between py-3 sm:py-2.5 px-4 hover:bg-[#1a1a2a] transition-colors text-left min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground text-xs">{isExpanded ? '\u25be' : '\u25b8'}</span>
                <span className="text-[#c8c4b8] font-medium truncate">{skill.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground text-sm">[{skill.supports.length}]</span>
                <span className={`w-2 h-2 rounded-full ${
                  skill.color === 'red' ? 'bg-[#c24b38]' :
                  skill.color === 'green' ? 'bg-[#3b9b47]' :
                  'bg-[#4169c9]'
                }`} />
              </div>
            </button>
          </CollapsibleTrigger>
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
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
}
