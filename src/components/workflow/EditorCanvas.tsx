"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * Props for the EditorCanvas component.
 * @property {NodeTypes} [nodeTypes] - Custom node types to register with React Flow.
 */
interface EditorCanvasProps {
  nodeTypes?: NodeTypes;
}

/**
 * The main workflow canvas component using React Flow.
 * 
 * Configuration:
 * - Infinite Canvas: Enabled by default in React Flow.
 * - Zoom/Pan: Controlled by `minZoom`, `maxZoom`, `panOnScroll`, etc.
 * - Styling: Uses a dark theme with 'Dots' background.
 * - Controls: Native React Flow controls for zoom/fit.
 * 
 * Maintainability:
 * - This component accepts `nodeTypes` as a prop to decouple it from specific node implementations.
 * - Keep layout-specific configurations (colors, snap-to-grid) here.
 */
export function EditorCanvas({ nodeTypes }: EditorCanvasProps) {
  return (
    <div className="h-full w-full bg-[#111]">
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
