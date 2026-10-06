import { Handle, Position, type NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { GLYPHS } from '../lib/glyphs';
import { renderBody } from '../lib/markup';
import WidthResizer from './WidthResizer';
import type { TalentNode } from '../types';

function TalentCard({ data, selected }: NodeProps<TalentNode>) {
  return (
    <div className="talent-card">
      <WidthResizer visible={selected} minWidth={120} />
      <Handle type="target" position={Position.Top} />
      <div className="talent-title">
        {data.icon !== 'none' && <span className="glyph title-glyph">{GLYPHS[data.icon].char}</span>}
        <span>{data.title}</span>
      </div>
      {data.subtitle.trim() !== '' && <div className="talent-subtitle">{data.subtitle}</div>}
      <div className="talent-body">{renderBody(data.body)}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(TalentCard);
