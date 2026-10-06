import { useRef } from 'react';
import { exportJson, exportPng, readTreeFile } from '../lib/io';
import { useTreeStore } from '../store/treeStore';

type Props = {
  onAddTalent: () => void;
  onAddBanner: () => void;
  canvasBackground: string;
};

export default function Toolbar({ onAddTalent, onAddBanner, canvasBackground }: Props) {
  const name = useTreeStore((s) => s.name);
  const setName = useTreeStore((s) => s.setName);
  const canUndo = useTreeStore((s) => s.past.length > 0);
  const canRedo = useTreeStore((s) => s.future.length > 0);
  const { undo, redo, newTree, loadTree, toFile, checkpoint } = useTreeStore.getState();
  const fileInput = useRef<HTMLInputElement>(null);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      loadTree(await readTreeFile(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  return (
    <header className="toolbar">
      <input
        className="tree-name"
        value={name}
        onFocus={checkpoint}
        onChange={(e) => setName(e.target.value)}
        aria-label="Tree name"
      />

      <div className="group">
        <button type="button" onClick={onAddTalent}>+ Talent</button>
        <button type="button" onClick={onAddBanner}>+ Banner</button>
      </div>

      <div className="group">
        <button type="button" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">Undo</button>
        <button type="button" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">Redo</button>
      </div>

      <div className="group right">
        <button
          type="button"
          onClick={() => {
            if (confirm('Start a new, empty tree? (You can undo this.)')) newTree();
          }}
        >
          New
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>Import JSON</button>
        <button type="button" onClick={() => exportJson(toFile())}>Export JSON</button>
        <button
          type="button"
          onClick={async () => {
            useTreeStore.getState().clearSelection();
            // Let React re-render without selection outlines before capturing.
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            await exportPng(useTreeStore.getState().nodes, name, canvasBackground);
          }}
        >
          Export PNG
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            void onImport(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}
