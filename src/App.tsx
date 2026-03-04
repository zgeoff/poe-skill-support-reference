import { useMemo } from 'react';
import { ColorFilter } from '@/components/ColorFilter';
import { SearchBar } from '@/components/SearchBar';
import { SkillList } from '@/components/SkillList';
import { useGemData } from '@/hooks/useGemData';
import { usePinnedSkills } from '@/hooks/usePinnedSkills';
import { useSkillSearch } from '@/hooks/useSkillSearch';

export default function App() {
  const { skills, loading, error } = useGemData();
  const { query, setQuery, colorFilter, setColorFilter, results, isExpanded, toggleExpanded } =
    useSkillSearch(skills);
  const { pinnedNames, isPinned, togglePin, unpin } = usePinnedSkills();

  const pinnedSkills = useMemo(
    () => skills.filter((s) => pinnedNames.has(s.name)),
    [skills, pinnedNames],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-[#6b6a63]" aria-live="polite">
          Loading gem data…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-red-400" aria-live="polite">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-2xl mx-auto px-4">
        <header className="py-6">
          <h1 className="text-2xl font-semibold text-[#e8e4d8] text-balance">
            Imbued Gem Reference
          </h1>
          <p className="text-sm text-[#6b6a63]">
            Below is a list of skill gems and their possible imbuement outcomes. No guarantees on
            accuracy of the data.
          </p>
        </header>
        <div className="sticky top-0 z-10 bg-[#0a0a0f] pt-3 pb-3 space-y-3">
          <SearchBar query={query} onQueryChange={setQuery} />
          <ColorFilter activeColor={colorFilter} onColorChange={setColorFilter} />
        </div>
        <main>
          <SkillList
            skills={results}
            pinnedSkills={pinnedSkills}
            isExpanded={isExpanded}
            onToggleExpand={toggleExpanded}
            isPinned={isPinned}
            onTogglePin={togglePin}
            onUnpin={unpin}
          />
        </main>
        <footer className="py-6 text-center text-xs text-[#6b6a63]">
          Data sourced from Path of Exile
        </footer>
      </div>
    </div>
  );
}
