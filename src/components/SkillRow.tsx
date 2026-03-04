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
      const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      contentRef.current.scrollIntoView({
        behavior: motionOk ? 'smooth' : 'auto',
        block: 'nearest',
      });
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
              className="flex-1 flex items-center justify-between py-3 sm:py-2.5 px-4 hover:bg-[#1a1a2a] transition-colors text-left min-w-0 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  aria-hidden="true"
                  className="text-muted-foreground w-4 h-4 shrink-0 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : undefined }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
                <span className="text-[#c8c4b8] font-medium truncate">{skill.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground text-sm tabular-nums">
                  [{skill.supports.length}]
                </span>
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
            className={`px-2 py-1 shrink-0 focus-visible:ring-2 focus-visible:ring-ring ${isPinned ? 'text-[#8b7a2e]' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label={isPinned ? 'Unpin' : 'Pin'}
          >
            <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              {isPinned ? (
                <>
                  <path d="M14 4v5c0 .55.22 1.05.59 1.41L18 14v2H6v-2l3.41-3.59C9.78 10.05 10 9.55 10 9V4h4M17 2H7a1 1 0 000 2h1v5L4.59 12.41A2 2 0 003 14v2a1 1 0 001 1h7v5l1 1 1-1v-5h7a1 1 0 001-1v-2a2 2 0 00-.59-1.59L17 9V4h1a1 1 0 000-2z" />
                  <line
                    x1="3"
                    y1="21"
                    x2="21"
                    y2="3"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <path d="M14 4v5c0 .55.22 1.05.59 1.41L18 14v2H6v-2l3.41-3.59C9.78 10.05 10 9.55 10 9V4h4M17 2H7a1 1 0 000 2h1v5L4.59 12.41A2 2 0 003 14v2a1 1 0 001 1h7v5l1 1 1-1v-5h7a1 1 0 001-1v-2a2 2 0 00-.59-1.59L17 9V4h1a1 1 0 000-2z" />
              )}
            </svg>
          </button>
        </div>
        <CollapsibleContent>
          <div ref={contentRef} className="px-4 pt-2 pb-3">
            <SupportPills supports={skill.supports} color={skill.color} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});
