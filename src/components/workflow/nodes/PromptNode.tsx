"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Move, GripHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

// Define the data type for our node
type PromptNodeData = {
  label?: string;
  prompt?: string;
};

type MyNode = Node<PromptNodeData>;

export function PromptNode({ data, selected }: NodeProps<MyNode>) {
  const [prompt, setPrompt] = useState(data.prompt || "Default Prompt");

  return (
    <div
      className={cn(
        "group relative flex w-80 flex-col overflow-hidden rounded-xl border-2 bg-[#1A1A1A] text-white shadow-2xl transition-all",
        selected
          ? "border-[#E0FC00] shadow-[#E0FC00]/20"
          : "border-white/10 hover:border-white/20",
      )}
    >
      {/* Header Strip with Handle for Dragging (optional visual cue) */}
      <div className="flex h-10 items-center justify-between border-b border-white/5 bg-[#222] px-4 py-2">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {data.label || "Prompt"}
        </span>
        {/* Visual grip handle */}
        <GripHorizontal className="h-4 w-4 text-gray-600" />
      </div>

      {/* Content Area */}
      <div className="p-4">
        <label className="mb-2 block text-xs text-gray-500">Prompt Text</label>
        <textarea
          className="nodrag w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-gray-200 placeholder-gray-600 transition-all focus:border-[#E0FC00]/50 focus:ring-1 focus:ring-[#E0FC00]/50 focus:outline-none"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
        />
      </div>

      {/* Output Handle */}
      <div className="relative flex h-10 items-center justify-end border-t border-white/5 bg-[#222] px-4">
        <span className="mr-2 text-xs text-gray-500">prompt</span>
        <Handle
          type="source"
          position={Position.Right}
          id="prompt"
          className="!h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-[#E0FC00]"
        />
      </div>
    </div>
  );
}
