import type { Edge, Node } from '@xyflow/react';

/** Keys into GLYPHS (see lib/glyphs.ts). 'none' hides the title icon. */
export type TitleIcon =
  | 'none'
  | 'passive'
  | 'special'
  | 'free'
  | 'action1'
  | 'action2'
  | 'action3'
  | 'reaction';

export type TalentData = {
  icon: TitleIcon;
  title: string;
  /** Optional second header line, typically "Prerequisite: Skill N+". */
  subtitle: string;
  /** Body text using the lightweight markup in lib/markup.tsx. */
  body: string;
};

export type BannerData = {
  text: string;
  color: string;
};

export type TalentNode = Node<TalentData, 'talent'>;
export type BannerNode = Node<BannerData, 'banner'>;
export type TreeNode = TalentNode | BannerNode;
export type TreeEdge = Edge;

export type TreeFile = {
  app: 'plotweaver-homebrew';
  version: 1;
  name: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
};
