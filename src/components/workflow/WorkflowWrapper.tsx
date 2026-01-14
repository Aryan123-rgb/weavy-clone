"use client";

import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { LeftSidebar } from "./LeftSidebar";
import { EditorCanvas } from "./EditorCanvas";
import { PromptNode } from "./nodes/PromptNode";
import { UploadImageNode } from "./nodes/UploadImageNode";
import { useState } from "react";
import { createPortal } from "react-dom";

// Register custom node types
const nodeTypes = {
  prompt: PromptNode,
  "upload-image": UploadImageNode,
};

function DroppableCanvasArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div ref={setNodeRef} className="relative flex-1 flex flex-col h-full">
      {children}
    </div>
  );
}

function WorkflowEditorContent({ workflowName }: { workflowName: string }) {
  const { screenToFlowPosition, addNodes } = useReactFlow();
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const handleDragStart = (event: any) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: any) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (over && over.id === 'canvas-droppable') {
      const type = active.data.current?.type || 'prompt';
      const label = active.data.current?.label || 'New Node';

      // We need client coordinates to project to flow coordinates
      // dnd-kit provides coordinates in event.delta (relative) or activatorEvent
      // But we can check if event.activatorEvent is a pointer event
      // However, a simpler way with React Flow is to use the mouse position relative to window
      // But dnd-kit provides 'event.active.rect' etc.
      
      // Better approach: Use the center of the dropped element?
      // Or just map the drop position from the event if available.
      // Dnd-kit's event.over doesn't give precise coordinates easily for the drop *point* relative to container without some math.
      // BUT `event.active.rect.current.translated` gives the final position on screen.
      
      const droppedRect = event.active.rect.current.translated;
      if (!droppedRect) return;

      // Calculate center of dropped item
      const x = droppedRect.left + droppedRect.width / 2;
      const y = droppedRect.top + droppedRect.height / 2;

      const position = screenToFlowPosition({ x, y });

      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label, prompt: "Editable prompt text..." },
      };

      addNodes(newNode);
    }
  };

  const onPaneDoubleClick = (event: React.MouseEvent) => {
      // Add a node at the double-clicked position
      const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
      });

      const newNode = {
          id: crypto.randomUUID(),
          type: 'prompt',
          position,
          data: { label: 'New Prompt', prompt: "Double-clicked node..." },
      };
      
      addNodes(newNode);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-screen w-full bg-black text-white overflow-hidden">
             <LeftSidebar />
             
             <DroppableCanvasArea>
                 {/* Top Bar showing Workflow Name */}
                 <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-md border border-white/10 pointer-events-none">
                     <span className="text-sm font-medium text-gray-300">{workflowName}</span>
                 </div>
                 
                 <EditorCanvas 
                    nodeTypes={nodeTypes} 
                    onPaneDoubleClick={onPaneDoubleClick}
                 />
             </DroppableCanvasArea>
        </div>
        
        {/* Optional: Drag Overlay for smoother visuals (portaled) */}
        {createPortal(
            <DragOverlay>
                {activeDragItem ? (
                     <div className="flex items-center justify-center gap-2 rounded-lg bg-[#E0FC00] p-4 border border-white/20 shadow-2xl opacity-80 text-black">
                        <span className="font-bold">{activeDragItem.label}</span>
                     </div>
                ) : null}
            </DragOverlay>,
            document.body
        )}
    </DndContext>
  );
}

export function WorkflowWrapper({ workflowName, workflowId }: { workflowName: string; workflowId: string }) {
  return (
    <ReactFlowProvider>
        <WorkflowEditorContent workflowName={workflowName} />
    </ReactFlowProvider>
  );
}
