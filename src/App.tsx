import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import Inspector from './components/Inspector';
import Toolbar from './components/Toolbar';
import { nodeTypes } from './nodes';
import { useTreeStore } from './store/treeStore';

const CANVAS_BACKGROUND = '#2e2723';
const GRID = 10;

// A small offset keeps step edges from detouring when nodes sit close together.
const defaultEdgeOptions: DefaultEdgeOptions = { type: 'step', pathOptions: { offset: 8 } } as DefaultEdgeOptions;

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

function Editor() {
  const nodes = useTreeStore((s) => s.nodes);
  const edges = useTreeStore((s) => s.edges);
  const { onNodesChange, onEdgesChange, onConnect, checkpoint, addTalent, addBanner } =
    useTreeStore.getState();
  const { screenToFlowPosition } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);

  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const centerPosition = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const p = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 });
    return { x: snap(p.x - 80), y: snap(p.y) };
  }, [screenToFlowPosition]);

  const onDoubleClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains('react-flow__pane')) return;
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addTalent({ x: snap(p.x - 80), y: snap(p.y - 20) });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const { undo, redo, deleteSelected, duplicateNode, nodes } = useTreeStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (key === 'y' || (key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (mod && key === 'd') {
        e.preventDefault();
        const sel = nodes.filter((n) => n.selected);
        if (sel.length === 1) duplicateNode(sel[0].id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app">
      <Toolbar
        onAddTalent={() => addTalent(centerPosition())}
        onAddBanner={() => addBanner(centerPosition())}
        canvasBackground={CANVAS_BACKGROUND}
      />
      <div className="workspace">
        <div className="canvas" ref={canvasRef} onDoubleClick={onDoubleClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={checkpoint}
            onSelectionDragStart={checkpoint}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Step}
            deleteKeyCode={null}
            zoomOnDoubleClick={false}
            snapToGrid
            snapGrid={[GRID, GRID]}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
            minZoom={0.2}
            maxZoom={3}
            style={{ backgroundColor: CANVAS_BACKGROUND }}
          >
            <Background variant={BackgroundVariant.Dots} gap={GRID * 2} size={1} color="#4a403a" />
            <Controls showInteractive={false} />
            <Panel position="bottom-center" className="disclaimer">
              This is unofficial fan content, created and shared for non-commercial use. It has not
              been reviewed by Dragonsteel Entertainment, LLC or Brotherwise Games, LLC.
            </Panel>
          </ReactFlow>
        </div>
        <Inspector />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  );
}
