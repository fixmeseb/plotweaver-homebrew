import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { GLYPHS, TITLE_ICONS, type GlyphKey } from '../lib/glyphs';
import { useTreeStore } from '../store/treeStore';
import type { BannerNode, TalentNode } from '../types';

const SKILLS = [
  'Agility', 'Athletics', 'Heavy Weaponry', 'Light Weaponry', 'Stealth', 'Thievery',
  'Crafting', 'Deduction', 'Discipline', 'Intimidation', 'Lore', 'Medicine',
  'Deception', 'Insight', 'Leadership', 'Perception', 'Persuasion', 'Survival',
];

const BANNER_COLORS = [
  { name: 'Slate', value: '#6f6c6a' },
  { name: 'Plum', value: '#4f3a3d' },
  { name: 'Gold', value: '#c49a52' },
  { name: 'Maroon', value: '#6b1d24' },
  { name: 'Teal', value: '#2f5a5c' },
];

export default function Inspector() {
  const selected = useTreeStore(useShallow((s) => s.nodes.filter((n) => n.selected)));

  if (selected.length !== 1) {
    return (
      <aside className="inspector">
        <h2>Editor</h2>
        <p className="hint">
          {selected.length === 0 ? 'Select a node to edit it.' : `${selected.length} nodes selected.`}
        </p>
        <Help />
      </aside>
    );
  }

  const node = selected[0];
  return (
    <aside className="inspector">
      {node.type === 'talent' ? <TalentEditor key={node.id} node={node} /> : <BannerEditor key={node.id} node={node} />}
      <NodeActions id={node.id} />
    </aside>
  );
}

function TalentEditor({ node }: { node: TalentNode }) {
  const update = useTreeStore((s) => s.updateTalent);
  const checkpoint = useTreeStore((s) => s.checkpoint);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [skill, setSkill] = useState('');
  const [rank, setRank] = useState(1);
  const { data } = node;

  const set = (patch: Partial<TalentNode['data']>) => update(node.id, patch);

  const applyPrereq = (mode: 'set' | 'or') => {
    if (!skill.trim()) return;
    const req = `${skill.trim()} ${rank}+`;
    checkpoint();
    const current = data.subtitle.trim();
    set({
      subtitle: mode === 'or' && current ? `${current} or ${req}` : `Prerequisite: ${req}`,
    });
  };

  const insertGlyph = (key: GlyphKey) => {
    const el = bodyRef.current;
    const token = `:${key}:`;
    const start = el?.selectionStart ?? data.body.length;
    const end = el?.selectionEnd ?? data.body.length;
    checkpoint();
    set({ body: data.body.slice(0, start) + token + data.body.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <>
      <h2>Talent</h2>

      <label className="field-label">Icon</label>
      <div className="glyph-picker" role="radiogroup">
        {TITLE_ICONS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={data.icon === key}
            className={data.icon === key ? 'active' : ''}
            title={key === 'none' ? 'No icon' : GLYPHS[key].label}
            onClick={() => {
              checkpoint();
              set({ icon: key });
            }}
          >
            {key === 'none' ? <span className="none">∅</span> : <span className="glyph">{GLYPHS[key].char}</span>}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="talent-title">Title</label>
      <input
        id="talent-title"
        value={data.title}
        onFocus={checkpoint}
        onChange={(e) => set({ title: e.target.value })}
      />

      <label className="field-label" htmlFor="talent-subtitle">
        Second line <span className="optional">(optional)</span>
      </label>
      <input
        id="talent-subtitle"
        value={data.subtitle}
        placeholder="e.g. Prerequisite: Persuasion 2+"
        onFocus={checkpoint}
        onChange={(e) => set({ subtitle: e.target.value })}
      />
      <div className="prereq-builder">
        <input
          list="skill-list"
          placeholder="Skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          aria-label="Prerequisite skill"
        />
        <datalist id="skill-list">
          {SKILLS.map((s) => <option key={s} value={s} />)}
        </datalist>
        <select value={rank} onChange={(e) => setRank(Number(e.target.value))} aria-label="Prerequisite rank">
          {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}+</option>)}
        </select>
        <button type="button" onClick={() => applyPrereq('set')} disabled={!skill.trim()}>Set</button>
        <button type="button" onClick={() => applyPrereq('or')} disabled={!skill.trim() || !data.subtitle.trim()}>
          + or
        </button>
        {data.subtitle && (
          <button
            type="button"
            onClick={() => {
              checkpoint();
              set({ subtitle: '' });
            }}
          >
            Clear
          </button>
        )}
      </div>

      <label className="field-label" htmlFor="talent-body">Body</label>
      <div className="glyph-insert">
        {(Object.keys(GLYPHS) as GlyphKey[]).map((key) => (
          <button key={key} type="button" title={`Insert ${GLYPHS[key].label}`} onClick={() => insertGlyph(key)}>
            <span className="glyph">{GLYPHS[key].char}</span>
          </button>
        ))}
      </div>
      <textarea
        id="talent-body"
        ref={bodyRef}
        rows={8}
        value={data.body}
        onFocus={checkpoint}
        onChange={(e) => set({ body: e.target.value })}
      />
      <p className="hint">**bold**, *italic*, blank line for a new paragraph.</p>
    </>
  );
}

function BannerEditor({ node }: { node: BannerNode }) {
  const update = useTreeStore((s) => s.updateBanner);
  const checkpoint = useTreeStore((s) => s.checkpoint);
  const { data } = node;

  return (
    <>
      <h2>Section Banner</h2>
      <label className="field-label" htmlFor="banner-text">Text</label>
      <input
        id="banner-text"
        value={data.text}
        onFocus={checkpoint}
        onChange={(e) => update(node.id, { text: e.target.value })}
      />
      <label className="field-label">Color</label>
      <div className="swatches">
        {BANNER_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            className={data.color === c.value ? 'active' : ''}
            style={{ backgroundColor: c.value }}
            onClick={() => {
              checkpoint();
              update(node.id, { color: c.value });
            }}
          />
        ))}
        <input
          type="color"
          value={data.color}
          title="Custom color"
          onFocus={checkpoint}
          onChange={(e) => update(node.id, { color: e.target.value })}
        />
      </div>
    </>
  );
}

function NodeActions({ id }: { id: string }) {
  const duplicateNode = useTreeStore((s) => s.duplicateNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);
  return (
    <div className="node-actions">
      <button type="button" onClick={() => duplicateNode(id)}>Duplicate</button>
      <button type="button" className="danger" onClick={() => deleteNode(id)}>Delete</button>
    </div>
  );
}

function Help() {
  return (
    <div className="help">
      <h3>How to</h3>
      <ul>
        <li><b>Add a talent:</b> double-click the canvas or use the toolbar.</li>
        <li><b>Connect:</b> drag from a node's bottom dot to another node's top dot.</li>
        <li><b>Delete:</b> select a node or line and press Delete.</li>
        <li><b>Resize:</b> select a node and drag its left or right edge.</li>
        <li><b>Undo / redo:</b> Ctrl+Z / Ctrl+Y.</li>
        <li><b>Duplicate:</b> Ctrl+D.</li>
      </ul>
    </div>
  );
}
