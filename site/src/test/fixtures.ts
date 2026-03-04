import type { GemData } from '@/types';

export const testGemData: GemData = {
  red: {
    Cleave: ['Melee Physical Damage Support', 'Multistrike Support', 'Ruthless Support'],
    'Shield Charge': ['Faster Attacks Support', 'Fortify Support'],
    Automation: [],
  },
  green: {
    Cyclone: ['Melee Physical Damage Support', 'Multistrike Support', 'Faster Attacks Support'],
    Poisonstrike: ['Added Chaos Damage Support', 'Void Manipulation Support'],
    'Rain of Arrows': ['Added Lightning Damage Support', 'Faster Attacks Support'],
  },
  blue: {
    Arc: [
      'Added Lightning Damage Support',
      'Spell Echo Support',
      'Faster Casting Support',
      'Inspiration Support',
      'Controlled Destruction Support',
      'Lightning Penetration Support',
    ],
    'Ball Lightning': [
      'Spell Echo Support',
      'Slower Projectiles Support',
      'Controlled Destruction Support',
    ],
    'Maelstr\u00f6m': ['Concentrated Effect Support'],
    Frostbolt: ['Faster Casting Support', 'Greater Multiple Projectiles Support'],
  },
};
