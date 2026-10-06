import { NodeResizeControl, ResizeControlVariant } from '@xyflow/react';
import { useTreeStore } from '../store/treeStore';

/** Left/right drag lines that change width only; height always follows content. */
export default function WidthResizer({ visible, minWidth }: { visible: boolean; minWidth: number }) {
  const checkpoint = useTreeStore((s) => s.checkpoint);
  if (!visible) return null;

  return (
    <>
      {(['left', 'right'] as const).map((position) => (
        <NodeResizeControl
          key={position}
          position={position}
          variant={ResizeControlVariant.Line}
          minWidth={minWidth}
          maxWidth={800}
          onResizeStart={checkpoint}
          className="width-resizer"
        />
      ))}
    </>
  );
}
