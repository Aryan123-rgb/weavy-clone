"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Bot, Image as ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";

type RunLLMNodeData = {
  label?: string;
  result?: string;
};

type MyNode = Node<RunLLMNodeData>;

export function RunLLMNode({ data, selected, id }: NodeProps<MyNode>) {
  const { getEdges, getNodes } = useReactFlow();

  // Track connections
  const systemConnections = useHandleConnections({ type: "target", id: "system" });
  const promptConnections = useHandleConnections({ type: "target", id: "prompt" });
  const imageConnections = useHandleConnections({ type: "target", id: "image1" });

  const { setExecutionState, executionState, updateNodeData } = useFlowStore();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isRunning = executionState[id] === "running";
  const result = data.result;

  const validateInput = (
    connection: any,
    expectedSourceType: "text" | "image",
  ) => {
    if (expectedSourceType === "text") {
      if (
        connection.sourceHandle !== "text" &&
        connection.sourceHandle !== "prompt" &&
        connection.sourceHandle !== "system"
      ) {
        return false;
      }
    } else if (expectedSourceType === "image") {
      if (
        connection.sourceHandle === "text" ||
        connection.sourceHandle === "prompt"
      ) {
        return false;
      }
    }
    return true;
  };

  const handleRun = async () => {
    const edges = getEdges();
    const nodes = getNodes();

    const getSourceData = (handleId: string) => {
      const edge = edges.find(
        (e) => e.target === id && e.targetHandle === handleId,
      );
      if (!edge) return null;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return sourceNode?.data;
    };

    const systemData = getSourceData("system");
    const promptData = getSourceData("prompt");
    const imageData = getSourceData("image1");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const systemText = (systemData ? (systemData as any).text : "") as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const promptText = (promptData ? (promptData as any).text : "") as string;

    setExecutionState(id, "running");

    try {
      const { triggerLLMRun } = await import("~/app/actions");

      await triggerLLMRun({
        system: systemText,
        prompt: promptText,
        image: imageData,
      });

      await new Promise((r) => setTimeout(r, 2000));

      updateNodeData(id, { result: "Hello, this is the response form AI" });
      setExecutionState(id, "completed");
    } catch (error) {
      console.error(error);
      setExecutionState(id, "failed");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex w-80 flex-col rounded-xl border-2 bg-[#1A1A1A] text-white shadow-2xl transition-all",
        selected
          ? "border-[#E0FC00] shadow-[#E0FC00]/20"
          : "border-white/10 hover:border-white/20",
      )}
    >
      {/* Header */}
      <div className="flex h-10 items-center justify-between rounded-t-xl border-b border-white/5 bg-[#222] px-4 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#E0FC00]" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {data.label ?? "Run LLM"}
          </span>
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={cn(
            "rounded px-2 py-1 text-[10px] font-bold uppercase transition-colors",
            isRunning
              ? "cursor-not-allowed bg-gray-700 text-gray-400"
              : "bg-[#E0FC00] text-black hover:bg-[#cbe600]",
          )}
        >
          {isRunning ? "Running..." : "Run"}
        </button>
      </div>

      {/* Main Body */}
      <div className="relative flex min-h-[120px] flex-col p-4">
        
        {/* Input Handles - Positioned absolutely on the left to "plug in" */}
        {/* We stack them vertically: System, User, Image */}
        <div className="absolute -left-3 top-4 flex flex-col gap-6"> 
           {/* Gap 6 approximates spacing for connections if wires are coming in */}
           
           {/* System Prompt Handle */}
           <Handle
            type="target"
            position={Position.Left}
            id="system"
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-gray-500"
            isValidConnection={(c) => validateInput(c, "text")}
            isConnectable={systemConnections.length === 0}
          />
          
          {/* User Prompt Handle */}
           <Handle
            type="target"
            position={Position.Left}
            id="prompt"
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-gray-500"
            isValidConnection={(c) => validateInput(c, "text")}
            isConnectable={promptConnections.length === 0}
          />

          {/* Image Handle */}
           <Handle
            type="target"
            position={Position.Left}
            id="image1"
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-indigo-500"
            isValidConnection={(c) => validateInput(c, "image")}
            isConnectable={imageConnections.length === 0}
          />
        </div>

        {/* Content Area */}
        <div className={cn(
            "h-full w-full rounded bg-black/50 p-3 font-mono text-sm leading-relaxed",
            result ? "text-gray-300" : "text-gray-600 italic"
        )}>
            {result ?? "AI response"}
        </div>

      </div>

      {/* Footer / Output Handle */}
      <div className="relative flex items-center justify-end rounded-b-xl border-t border-white/5 bg-[#222] p-2">
        <span className="mr-2 text-[10px] text-gray-500">result</span>
        <Handle
          type="source"
          position={Position.Right}
          id="result"
          className="!h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-[#E0FC00]"
        />
      </div>
    </div>
  );
}
