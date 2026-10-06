# Plotweaver Homebrew

A local-only editor for Cosmere RPG–style talent trees: white talent cards with an
icon + title, an optional second line (usually a prerequisite), and a body, joined by
right-angle connectors and grouped under section banners.

## Running

```sh
npm install
npm run dev      # http://localhost:5173/plotweaver-homebrew/
npm run build    # static build in dist/
```

## Using it

- **Add a talent:** double-click empty canvas, or **+ Talent**. **+ Banner** adds a section header.
- **Connect:** drag from a node's bottom dot to another node's top dot.
- **Edit:** select a node; the panel on the right edits icon, title, second line and body.
  The prerequisite builder fills the second line (`Prerequisite: Persuasion 2+`, `+ or` to chain).
- **Body markup:** `**bold**`, `*italic*`, blank line for a new paragraph, and glyph tokens
  such as `:action1:`, `:reaction:`, `:opportunity:` (buttons above the textarea insert them).
- **Resize:** select a node and drag its left or right edge (height follows the text).
- **Keyboard:** Delete/Backspace removes the selection, Ctrl+Z / Ctrl+Y undo/redo, Ctrl+D duplicates.

The tree autosaves to the browser's localStorage. **Export JSON** / **Import JSON** move trees
between browsers or back them up; **Export PNG** renders the whole tree at 2x.

## Code map

| Path | Purpose |
|---|---|
| `src/App.tsx` | React Flow canvas, keyboard shortcuts |
| `src/store/treeStore.ts` | Zustand store: nodes, edges, undo history, localStorage persistence |
| `src/nodes/` | `TalentCard` and `SectionBanner` node components |
| `src/components/` | Toolbar and the right-hand editor panel |
| `src/lib/glyphs.ts` | Cosmere Dingbats character map |
| `src/lib/markup.tsx` | Body-text markup renderer |
| `src/lib/io.ts` | JSON import/export, PNG export |
| `src/fonts/` | Source Sans 3, Trirong (OFL) and Cosmere Dingbats |

This is unofficial fan content, created and shared for non-commercial use. It has not been reviewed by Dragonsteel Entertainment, LLC or Brotherwise Games, LLC.