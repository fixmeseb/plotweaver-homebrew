/**
 * Character mapping for the Cosmere Dingbats font. Each glyph can be used
 * as a title icon and/or inline in body text as `:key:`.
 */
export const GLYPHS = {
  passive: { char: '8', label: 'Passive (∞)' },
  special: { char: '*', label: 'Special (★)' },
  free: { char: '0', label: 'Free action (▷)' },
  action1: { char: '1', label: '1 action (▶)' },
  action2: { char: '2', label: '2 actions (▶▶)' },
  action3: { char: '3', label: '3 actions (▶▶▶)' },
  reaction: { char: 'R', label: 'Reaction (↺)' },
  opportunity: { char: 'O', label: 'Opportunity' },
  complication: { char: 'C', label: 'Complication' },
  sparkle: { char: 'S', label: 'Sparkle' },
} as const;

export type GlyphKey = keyof typeof GLYPHS;

export const TITLE_ICONS = [
  'none',
  'passive',
  'special',
  'free',
  'action1',
  'action2',
  'action3',
  'reaction',
] as const;

export function isGlyphKey(key: string): key is GlyphKey {
  return Object.hasOwn(GLYPHS, key);
}
