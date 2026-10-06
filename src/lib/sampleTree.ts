import type { TreeEdge, TreeNode } from '../types';

/** Starter content shown on first launch, modelled on the Officer column. */
export const SAMPLE_NODES: TreeNode[] = [
  {
    id: 'banner-officer',
    type: 'banner',
    position: { x: 0, y: 0 },
    width: 360,
    data: { text: 'Officer', color: '#6f6c6a' },
  },
  {
    id: 'composed',
    type: 'talent',
    position: { x: 0, y: 80 },
    data: {
      icon: 'passive',
      title: 'Composed',
      subtitle: '',
      body: 'Increase your max and current focus by your tier.',
    },
  },
  {
    id: 'through-the-fray',
    type: 'talent',
    position: { x: 190, y: 80 },
    data: {
      icon: 'action1',
      title: 'Through the Fray',
      subtitle: 'Prerequisite: Persuasion 1+',
      body: 'An ally within 20 feet can Disengage or Gain Advantage as :reaction:.',
    },
  },
  {
    id: 'well-supplied',
    type: 'talent',
    position: { x: 0, y: 240 },
    data: {
      icon: 'special',
      title: 'Well Supplied',
      subtitle: 'Prerequisite: Persuasion 2+',
      body: 'Gain Military Logistics expertise. Spend 2 focus to add :opportunity: to your test to requisition resources.',
    },
  },
  {
    id: 'customary-garb',
    type: 'talent',
    position: { x: 190, y: 240 },
    data: {
      icon: 'passive',
      title: 'Customary Garb',
      subtitle: '',
      body: 'While wearing Presentable armor or appropriate clothing, increase your Physical and Spiritual defenses by 2.',
    },
  },
];

const edge = (source: string, target: string): TreeEdge => ({
  id: `e-${source}-${target}`,
  source,
  target,
});

export const SAMPLE_EDGES: TreeEdge[] = [
  edge('banner-officer', 'composed'),
  edge('banner-officer', 'through-the-fray'),
  edge('composed', 'well-supplied'),
  edge('through-the-fray', 'customary-garb'),
];
