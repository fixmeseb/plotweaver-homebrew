import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_EDGES, SAMPLE_NODES } from '../lib/sampleTree';
import type { BannerData, TalentData, TreeEdge, TreeFile, TreeNode } from '../types';

type Snapshot = { nodes: TreeNode[]; edges: TreeEdge[] };

const HISTORY_LIMIT = 100;

type TreeState = {
  name: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  past: Snapshot[];
  future: Snapshot[];

  onNodesChange: (changes: NodeChange<TreeNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TreeEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  addTalent: (position: XYPosition) => void;
  addBanner: (position: XYPosition) => void;
  updateTalent: (id: string, data: Partial<TalentData>) => void;
  updateBanner: (id: string, data: Partial<BannerData>) => void;
  duplicateNode: (id: string) => void;
  deleteNode: (id: string) => void;
  deleteSelected: () => void;
  clearSelection: () => void;

  setName: (name: string) => void;
  loadTree: (file: TreeFile) => void;
  newTree: () => void;
  toFile: () => TreeFile;

  /** Record the current state so the next edit can be undone. */
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
};

/**
 * Height always follows content. Earlier versions let width resizes pin a fixed
 * height, which left the bottom handle behind when text reflowed, so drop it.
 */
function unpinHeight(node: TreeNode): TreeNode {
  const { height: _h, ...rest } = node;
  return rest as TreeNode;
}

function clean(nodes: TreeNode[], edges: TreeEdge[]): Snapshot {
  return {
    nodes: nodes.map(({ selected: _s, dragging: _d, ...n }) => unpinHeight(n as TreeNode)),
    edges: edges.map(({ selected: _s, ...e }) => e),
  };
}

export const useTreeStore = create<TreeState>()(
  persist(
    (set, get) => {
      const commit = (next: Partial<Pick<TreeState, 'nodes' | 'edges' | 'name'>>) => {
        get().checkpoint();
        set(next);
      };

      return {
        name: 'Untitled Tree',
        nodes: SAMPLE_NODES,
        edges: SAMPLE_EDGES,
        past: [],
        future: [],

        onNodesChange: (changes) => {
          if (changes.some((c) => c.type === 'remove')) get().checkpoint();
          set({ nodes: applyNodeChanges(changes, get().nodes) });
        },

        onEdgesChange: (changes) => {
          if (changes.some((c) => c.type === 'remove')) get().checkpoint();
          set({ edges: applyEdgeChanges(changes, get().edges) });
        },

        onConnect: (connection) => {
          const { edges } = get();
          if (connection.source === connection.target) return;
          const exists = edges.some(
            (e) => e.source === connection.source && e.target === connection.target,
          );
          if (exists) return;
          commit({ edges: addEdge({ ...connection, id: `e-${nanoid(8)}` }, edges) });
        },

        addTalent: (position) => {
          const node: TreeNode = {
            id: nanoid(10),
            type: 'talent',
            position,
            selected: true,
            data: { icon: 'passive', title: 'New Talent', subtitle: '', body: 'Describe the talent here.' },
          };
          commit({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node] });
        },

        addBanner: (position) => {
          const node: TreeNode = {
            id: nanoid(10),
            type: 'banner',
            position,
            width: 360,
            selected: true,
            data: { text: 'New Section', color: '#6f6c6a' },
          };
          commit({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node] });
        },

        updateTalent: (id, data) =>
          set({
            nodes: get().nodes.map((n) =>
              n.id === id && n.type === 'talent' ? { ...n, data: { ...n.data, ...data } } : n,
            ),
          }),

        updateBanner: (id, data) =>
          set({
            nodes: get().nodes.map((n) =>
              n.id === id && n.type === 'banner' ? { ...n, data: { ...n.data, ...data } } : n,
            ),
          }),

        duplicateNode: (id) => {
          const original = get().nodes.find((n) => n.id === id);
          if (!original) return;
          const copy = {
            ...original,
            id: nanoid(10),
            selected: true,
            position: { x: original.position.x + 30, y: original.position.y + 30 },
            data: { ...original.data },
          } as TreeNode;
          commit({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), copy] });
        },

        deleteNode: (id) =>
          commit({
            nodes: get().nodes.filter((n) => n.id !== id),
            edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          }),

        deleteSelected: () => {
          const { nodes, edges } = get();
          const removed = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
          const keptEdges = edges.filter(
            (e) => !e.selected && !removed.has(e.source) && !removed.has(e.target),
          );
          if (removed.size === 0 && keptEdges.length === edges.length) return;
          commit({ nodes: nodes.filter((n) => !removed.has(n.id)), edges: keptEdges });
        },

        clearSelection: () =>
          set({
            nodes: get().nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
            edges: get().edges.map((e) => (e.selected ? { ...e, selected: false } : e)),
          }),

        setName: (name) => set({ name }),

        loadTree: (file) =>
          commit({
            name: file.name,
            nodes: file.nodes.map((n) => ({ ...unpinHeight(n), selected: false })),
            edges: file.edges,
          }),

        newTree: () => commit({ name: 'Untitled Tree', nodes: [], edges: [] }),

        toFile: () => {
          const { name, nodes, edges } = get();
          return { app: 'plotweaver-homebrew', version: 1, name, ...clean(nodes, edges) };
        },

        checkpoint: () => {
          const { nodes, edges, past } = get();
          const snap = clean(nodes, edges);
          const last = past[past.length - 1];
          if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
          set({ past: [...past, snap].slice(-HISTORY_LIMIT), future: [] });
        },

        undo: () => {
          const { past, future, nodes, edges } = get();
          const prev = past[past.length - 1];
          if (!prev) return;
          set({
            ...prev,
            past: past.slice(0, -1),
            future: [clean(nodes, edges), ...future],
          });
        },

        redo: () => {
          const { past, future, nodes, edges } = get();
          const next = future[0];
          if (!next) return;
          set({
            ...next,
            past: [...past, clean(nodes, edges)],
            future: future.slice(1),
          });
        },
      };
    },
    {
      name: 'plotweaver-homebrew:tree',
      version: 1,
      partialize: ({ name, nodes, edges }) => ({ name, ...clean(nodes, edges) }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<TreeState> | undefined;
        return {
          ...current,
          ...saved,
          nodes: (saved?.nodes ?? current.nodes).map(unpinHeight),
        };
      },
    },
  ),
);
