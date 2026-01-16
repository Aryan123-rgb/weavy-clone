"use client";
/**
 * Wrapper component for the Workflow Editor.
 * Provides the ReactFlow context and handles the Drag and Drop (DnD) context initialization.
 *
 * Key Responsibilities:
 * 1. Sets up the `ReactFlowProvider` to share flow state (nodes, edges, viewport) across children.
 * 2. Wraps the editor in `WorkflowEditorContent`.
 *
 * Maintainability Note:
 * - Keep this component thin. It should strictly handle Context Providers.
 * - Logic for DnD and Nodes should be in `WorkflowEditorContent`.
 *
 * @property {string} workflowName - Name to display in the editor.
 */
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { LeftSidebar } from "./LeftSidebar";
import { EditorCanvas } from "./EditorCanvas";
import { TextNode } from "./nodes/TextNode";
import { UploadImageNode } from "./nodes/UploadImageNode";
import { CropImageNode } from "./nodes/CropImageNode";
import { RunLLMNode } from "./nodes/RunLLMNode";
import { UploadVideoNode } from "./nodes/UploadVideoNode";
import { ExtractVideoFrameNode } from "./nodes/ExtractVideoFrameNode";
import { useState } from "react";
import { createPortal } from "react-dom";

// Register custom node types
// Mapped by the 'type' field in node data
const nodeTypes = {
  text: TextNode,
  "upload-image": UploadImageNode,
  "crop-image": CropImageNode,
  "run-llm": RunLLMNode,
  "upload-video": UploadVideoNode,
  "extract-frame": ExtractVideoFrameNode,
};

/**
 * Droppable area for the canvas.
 * Allows handling of drop events from the sidebar using @dnd-kit.
 */
function DroppableCanvasArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: "canvas-droppable",
  });

  return (
    <div ref={setNodeRef} className="relative flex h-full flex-1 flex-col">
      {children}
    </div>
  );
}

/**
 * Main content of the workflow editor.
 * Handles drag and drop logic converting screen coordinates to flow coordinates.
 *
 * Data Flow:
 * - DndContext captures drag events from LeftSidebar.
 * - onDragEnd calculates the drop position and uses instance.screenToFlowPosition().
 * - verify nodeTypes match the `type` passed from sidebar items.
 *
 * @property {string} workflowName - The name of the current workflow.
 */
function WorkflowEditorContent({ workflowName }: { workflowName: string }) {
  const { screenToFlowPosition, addNodes } = useReactFlow();
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const handleDragStart = (event: any) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: any) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (over && over.id === "canvas-droppable") {
      const type = active.data.current?.type || "text";
      const label = active.data.current?.label || "New Node";

      // Calculate position
      const droppedRect = event.active.rect.current.translated;
      if (!droppedRect) return;

      const x = droppedRect.left + droppedRect.width / 2;
      const y = droppedRect.top + droppedRect.height / 2;

      // Convert Screen Coords -> Flow Coords
      const position = screenToFlowPosition({ x, y });

      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label, text: "" }, // Default data for TextNode
      };

      addNodes(newNode);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-full overflow-hidden bg-black text-white">
        <LeftSidebar />

        <DroppableCanvasArea>
          {/* Top Bar showing Workflow Name */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md">
            <span className="text-sm font-medium text-gray-300">
              {workflowName}
            </span>
          </div>

          <EditorCanvas nodeTypes={nodeTypes} />
        </DroppableCanvasArea>
      </div>

      {/* Drag Overlay for smoother visuals (portaled to body) */}
      {createPortal(
        <DragOverlay>
          {activeDragItem ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#E0FC00] p-4 text-black opacity-80 shadow-2xl">
              <span className="font-bold">{activeDragItem.label}</span>
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

/**
 * Wrapper component for the Workflow Editor.
 * Provides the ReactFlow context.
 *
 * @property {string} workflowName - Name to display in the editor.
 */
export function WorkflowWrapper({ workflowName }: { workflowName: string }) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent workflowName={workflowName} />
    </ReactFlowProvider>
  );
}
