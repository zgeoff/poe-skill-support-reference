export type GemColor = 'red' | 'green' | 'blue';

export const GEM_COLORS: Record<GemColor, string> = {
  red: '#c24b38',
  green: '#3b9b47',
  blue: '#4169c9',
};

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
