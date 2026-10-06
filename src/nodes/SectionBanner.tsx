import { Handle, Position, type NodeProps } from '@xyflow/react';
import { memo } from 'react';
import WidthResizer from './WidthResizer';
import type { BannerNode } from '../types';

function SectionBanner({ data, selected }: NodeProps<BannerNode>) {
  return (
    <div className="section-banner" style={{ backgroundColor: data.color }}>
      <WidthResizer visible={selected} minWidth={120} />
      <Handle type="target" position={Position.Top} />
      <span>{data.text}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(SectionBanner);
