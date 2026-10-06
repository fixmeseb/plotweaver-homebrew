import { getNodesBounds, type Node } from '@xyflow/react';
import { domToPng } from 'modern-screenshot';
import type { TreeFile } from '../types';

function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

function slug(name: string) {
  return name.trim().replace(/[^\w-]+/g, '_') || 'tree';
}

export function exportJson(file: TreeFile) {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(url, `${slug(file.name)}.json`);
  URL.revokeObjectURL(url);
}

export async function readTreeFile(file: File): Promise<TreeFile> {
  const parsed = JSON.parse(await file.text()) as Partial<TreeFile>;
  if (parsed.app !== 'plotweaver-homebrew' || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('This file is not a Plotweaver Homebrew tree.');
  }
  if (parsed.version !== 1) {
    throw new Error(`Unsupported tree file version: ${String(parsed.version)}`);
  }
  return {
    app: 'plotweaver-homebrew',
    version: 1,
    name: typeof parsed.name === 'string' ? parsed.name : 'Imported Tree',
    nodes: parsed.nodes,
    edges: parsed.edges,
  };
}

const EXPORT_PADDING = 40;
const EXCLUDED_CLASSES = ['react-flow__resize-control', 'react-flow__handle'];

/**
 * Renders every node (not just the visible area) to a PNG at 2x scale.
 * Callers should clear the selection first so outlines don't appear.
 */
export async function exportPng(nodes: Node[], name: string, background: string) {
  const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewportEl || nodes.length === 0) return;

  const bounds = getNodesBounds(nodes);
  const left = bounds.x - EXPORT_PADDING;
  const top = bounds.y - EXPORT_PADDING;
  const width = Math.ceil(bounds.width + EXPORT_PADDING * 2);
  const height = Math.ceil(bounds.height + EXPORT_PADDING * 2);

  const dataUrl = await domToPng(viewportEl, {
    backgroundColor: background,
    width,
    height,
    scale: 2,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${-left}px, ${-top}px) scale(1)`,
    },
    filter: (el) =>
      !(el instanceof Element && EXCLUDED_CLASSES.some((c) => el.classList.contains(c))),
    // Edge SVGs are 300x150 and draw outside that box via overflow: visible,
    // which the clone drops as a default, so it has to be set explicitly.
    onCloneNode: (clone) => {
      (clone as Element).querySelectorAll<SVGSVGElement>('.react-flow__edges svg').forEach((svg) => {
        svg.style.overflow = 'visible';
      });
    },
  });
  download(dataUrl, `${slug(name)}.png`);
}
