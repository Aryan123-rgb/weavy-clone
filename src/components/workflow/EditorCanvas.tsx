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

import { useFlowStore } from "~/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
    })),
  );

  const { undo, redo } = useFlowStore.temporal.getState();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Meta (Mac)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-full w-full bg-[#111]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        onConnect={onConnect}
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
