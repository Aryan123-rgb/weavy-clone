"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import type { Node, NodeProps, Connection, Edge } from "@xyflow/react";
import { Bot, Image as ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";

type RunLLMNodeData = {
  label?: string;
  result?: string;
  systemUsed?: string;
  promptUsed?: string;
  imageUsed?: string; // Storing the image URL used
};

type MyNode = Node<RunLLMNodeData>;

export function RunLLMNode({ data, selected, id }: NodeProps<MyNode>) {
  const { getEdges, getNodes } = useReactFlow();

  // Track connections to enable/disable handles or show status
  const systemConnections = useHandleConnections({
    type: "target",
    id: "system",
  });
  const promptConnections = useHandleConnections({
    type: "target",
    id: "prompt",
  });
  const imageConnections = useHandleConnections({
    type: "target",
    id: "image1",
  });

  const { setExecutionState, executionState, updateNodeData, nodeData } =
    useFlowStore();
  const isRunning = executionState[id] === "running";

  // Merge initial data (props) with live store data
  const currentStoreData = (nodeData[id] ?? {}) as Partial<RunLLMNodeData>;
  const currentData = { ...data, ...currentStoreData };
  const { result, systemUsed, promptUsed, imageUsed } = currentData;

  const validateInput = (
    connection: Connection | Edge,
    expectedSourceType: "text" | "image",
  ) => {
    // connection.sourceHandle is the ID of the handle on the source node
    const sourceHandleId = connection.sourceHandle;

    if (expectedSourceType === "image") {
      // Only allow connection if the source handle is explicitly an image output
      // We assume nodes outputting images use id="image"
      if (sourceHandleId === "image") return true;
      return false;
    }

    if (expectedSourceType === "text") {
      // Allow text inputs from text-like handles
      // We assume nodes outputting text use id="text" (TextNode) or "result" (RunLLMNode) or "prompt" (RunLLMNode pass-through)
      // Explicitly ban "image" handle
      if (sourceHandleId === "image") return false;
      return true;
    }

    return true;
  };

  const handleRun = async () => {
    const edges = getEdges();
    const nodes = getNodes();

    // Gather inputs from connected nodes
    const getSourceData = (handleId: string) => {
      const edge = edges.find(
        (e) => e.target === id && e.targetHandle === handleId,
      );
      if (!edge) return null;

      // Try to get data from global store first (live updates)
      if (nodeData[edge.source]) {
        return nodeData[edge.source];
      }

      // Fallback to ReactFlow node data
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return sourceNode?.data;
    };

    const systemData = getSourceData("system");
    const promptData = getSourceData("prompt");
    const imageData = getSourceData("image1");

    // Helper safely extract text string
    const safeGetText = (obj: unknown): string => {
      if (typeof obj === "object" && obj !== null && "text" in obj) {
        const val = (obj as Record<string, unknown>).text;
        return typeof val === "string" ? val : "";
      }
      return "";
    };

    const safeGetImage = (obj: unknown): string | undefined => {
      if (typeof obj === "object" && obj !== null) {
        // Check for imageUrl (new convention) or image (legacy)
        if ("imageUrl" in obj) {
          const val = (obj as Record<string, unknown>).imageUrl;
          return typeof val === "string" ? val : undefined;
        }
        if ("image" in obj) {
          const val = (obj as Record<string, unknown>).image;
          return typeof val === "string" ? val : undefined;
        }
      }
      return undefined;
    };

    const systemText = safeGetText(systemData);
    const promptText = safeGetText(promptData);
    const imageUrl = safeGetImage(imageData);

    setExecutionState(id, "running");

    // Update the node data with what we are about to allow user inspection
    updateNodeData(id, {
      systemUsed: systemText,
      promptUsed: promptText,
      imageUsed: imageUrl,
      result: undefined, // clear previous result
    });

    // Validation
    if (imageUrl) {
      // Simple check for URL extension
      // User requirements: "validation will be easy as input will be url ending with .jpg..."
      const lowerUrl = imageUrl.toLowerCase();
      const isDataUrl = lowerUrl.startsWith("data:image/");

      if (!isDataUrl) {
        toast.error("Invalid Image Input", {
          description: "Input must be a Base64 Data URL (data:image/...).",
        });
        setExecutionState(id, "failed");
        return;
      }
    }

    try {
      const { triggerLLMRun } = await import("~/app/actions");

      // Trigger and Poll for result
      const runResult = await triggerLLMRun({
        system: systemText,
        prompt: promptText,
        image: imageUrl,
      });

      // Check if task failed or has error
      if (runResult.error) {
        const err = runResult.error as { message?: string };
        const errorMessage = err.message ?? "Task failed";
        throw new Error(errorMessage);
      }

      const output = runResult.output as { result?: string } | undefined;

      // Check for valid output
      if (!output?.result) {
        console.warn("AI returned empty result", runResult);
        toast.error("AI response generation failed: Recieved empty response", {
          description: "Please try again or check your prompt.",
        });
        setExecutionState(id, "failed");
        return;
      }

      const aiText = output.result;

      updateNodeData(id, {
        result: aiText,
        // Keeping inputs in data so they persist in UI
        systemUsed: systemText,
        promptUsed: promptText,
        imageUsed: imageUrl,
      });
      setExecutionState(id, "completed");
      toast.success("AI Generation Complete");
    } catch (error) {
      console.error("RunLLM execution error:", error);
      let message = "Unknown error occurred";
      if (error instanceof Error) message = error.message;

      toast.error("AI Generation Failed", {
        description: message,
      });
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
      <div className="relative flex min-h-[120px] flex-col gap-3 p-4">
        {/* Input Handles */}
        <div className="absolute top-4 -left-3 flex flex-col gap-6">
          <Handle
            type="target"
            position={Position.Left}
            id="prompt"
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-gray-500"
            isValidConnection={(c) => validateInput(c, "text")}
            isConnectable={promptConnections.length === 0}
            title="User Prompt"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="system"
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-gray-500"
            isValidConnection={(c) => validateInput(c, "text")}
            isConnectable={systemConnections.length === 0}
            title="System Prompt"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="image1" // Kept as image1 based on previous code, mapped to image payload
            className="!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-indigo-500"
            isValidConnection={(c) => validateInput(c, "image")}
            isConnectable={imageConnections.length === 0}
            title="Image"
          />
        </div>

        {/* Info Section (System & User Used) */}
        {(!!systemUsed || !!promptUsed || !!imageUsed) && (
          <div className="mb-2 flex flex-col gap-2 rounded bg-white/5 p-2 text-xs">
            {systemUsed && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">
                  System
                </span>
                <span className="line-clamp-2 text-gray-300" title={systemUsed}>
                  {systemUsed}
                </span>
              </div>
            )}
            {promptUsed && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">
                  User
                </span>
                <span className="line-clamp-2 text-gray-300" title={promptUsed}>
                  {promptUsed}
                </span>
              </div>
            )}
            {imageUsed && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 text-indigo-400" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">
                    Image
                  </span>
                </div>
                <a
                  href={imageUsed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-1 break-all text-indigo-300 underline hover:text-indigo-200"
                  title={imageUsed}
                >
                  {imageUsed}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Result Area */}
        <div
          className={cn(
            "h-full w-full rounded bg-black/50 p-3 font-mono text-sm leading-relaxed",
            result ? "text-gray-300" : "text-gray-600 italic",
          )}
        >
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
