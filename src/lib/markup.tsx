import type { ReactNode } from 'react';
import { GLYPHS, isGlyphKey } from './glyphs';

/**
 * Tiny body-text markup:
 *   **bold**   *italic*   :action1: (any GLYPHS key)   blank line = paragraph
 * Anything unrecognised is rendered literally.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|:[a-z0-9]+:)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith(':') && part.endsWith(':')) {
      const name = part.slice(1, -1);
      if (isGlyphKey(name)) {
        return (
          <span key={key} className={`glyph glyph-${name}`} title={GLYPHS[name].label}>
            {GLYPHS[name].char}
          </span>
        );
      }
    }
    return part;
  });
}

export function renderBody(body: string): ReactNode {
  return body
    .split(/\n\s*\n/)
    .filter((p) => p.trim() !== '')
    .map((para, i) => (
      <p key={i}>
        {para.split('\n').flatMap((line, j) =>
          j === 0
            ? renderInline(line, `${i}-${j}`)
            : [<br key={`br-${i}-${j}`} />, ...renderInline(line, `${i}-${j}`)],
        )}
      </p>
    ));
}
