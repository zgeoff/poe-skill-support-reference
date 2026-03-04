import type { SkillGem, GemData, GemColor } from '@/types';

export function flattenGemData(data: GemData): SkillGem[] {
  const skills: SkillGem[] = [];
  for (const color of ['red', 'green', 'blue'] as GemColor[]) {
    const colorData = data[color];
    if (colorData) {
      for (const [name, supports] of Object.entries(colorData)) {
        skills.push({ name, color, supports });
      }
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export async function loadGemData(): Promise<SkillGem[]> {
  const res = await fetch(import.meta.env.BASE_URL + 'data.json');
  const data: GemData = await res.json();
  return flattenGemData(data);
}
