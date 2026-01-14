"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import type { NodeTypes, ReactFlowProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface EditorCanvasProps {
  nodeTypes?: NodeTypes;
  onPaneDoubleClick?: (event: React.MouseEvent) => void;
}

export function EditorCanvas({
  nodeTypes,
  onPaneDoubleClick,
}: EditorCanvasProps) {
  return (
    <div className="h-full w-full bg-[#111]" onDoubleClick={onPaneDoubleClick}>
      <ReactFlow
        defaultNodes={[]}
        defaultEdges={[]}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-right"
        // Selection & Pan Configuration
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]} // Pan only with Middle (1) or Right (2) mouse buttons
        selectionKeyCode={null} // Allow selection box without holding Shift
        zoomOnScroll={false} // Zoom with Ctrl + Scroll (default behavior with panOnScroll)
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="#333"
        />
        <Controls className="border-white/10 bg-[#1a1a1a] fill-gray-400 text-gray-400" />
        <MiniMap
          className="border border-white/10 bg-[#1a1a1a]"
          maskColor="#000000aa"
          nodeColor="#333"
        />
      </ReactFlow>
    </div>
  );
}
