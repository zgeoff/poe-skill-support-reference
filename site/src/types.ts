export type GemColor = 'red' | 'green' | 'blue';

export interface SkillGem {
  name: string;
  color: GemColor;
  supports: string[];
}

export interface SearchableSkill {
  name: string;
  color: GemColor;
  supports: string;
}

export type GemData = Record<GemColor, Record<string, string[]>>;
