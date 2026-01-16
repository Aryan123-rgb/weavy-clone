"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import React, { useState, useEffect } from "react";
import type { Node, NodeProps, Connection, Edge } from "@xyflow/react";
import { Crop as CropIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";

// Define the data type for our node
type CropImageNodeData = {
  label?: string;
  imageUrl?: string; // The output url (Base64)
};

type MyNode = Node<CropImageNodeData>;

export function CropImageNode({ data, selected, id }: NodeProps<MyNode>) {
  const { updateNodeData, nodeData } = useFlowStore();
  const { getEdges, getNodes } = useReactFlow();

  // Inputs for crop percentages
  const [cropParams, setCropParams] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Input connection tracking
  const connections = useHandleConnections({ type: "target", id: "image" });
  
  // Helper to get input image URL from connection
  const getInputImage = () => {
    const edges = getEdges();
    const nodes = getNodes();

    // Find edge connected to our 'image' handle
    const edge = edges.find(
      (e) => e.target === id && e.targetHandle === "image",
    );
    if (!edge) return null;

    // Try store first (live data)
    if (nodeData[edge.source]) {
      const sourceData = nodeData[edge.source] as any;
      // Support imageUrl (standard) or image (legacy)
      return sourceData.imageUrl || sourceData.image; 
    }

    // Fallback to node data
    const sourceNode = nodes.find((n) => n.id === edge.source);
    return sourceNode?.data?.imageUrl || (sourceNode?.data as any)?.image;
  };

  const validateInput = (connection: Connection | Edge) => {
    // connection.sourceHandle is the ID of the handle on the source node
    const sourceHandleId = connection.sourceHandle;

    // Only allow connection if the source handle is explicitly an image output
    // We assume nodes outputting images use id="image"
    if (sourceHandleId === "image") return true;
    return false;
  };

  const handleCrop = async () => {
    const inputUrl = getInputImage();
    
    if (!inputUrl || typeof inputUrl !== "string") {
      toast.error("No input image detected", {
        description: "Please connect an image output (like Upload Image) to this node.",
      });
      return;
    }

    if (!inputUrl.startsWith("data:image/")) {
        toast.error("Invalid Input Format", {
            description: "The connected node must provide a Base64 Data URL."
        });
        return;
    }

    setIsProcessing(true);
    try {
      const { cropImage } = await import("~/app/actions");

      toast.promise(cropImage(inputUrl, cropParams), {
        loading: "Cropping image...",
        success: (result) => {
          // Update local data and global store with result
          updateNodeData(id, { imageUrl: result.url });
          return "Image Cropped Successfully";
        },
        error: (err) => {
          console.error("Crop error", err);
          return "Crop Failed";
        },
      });
    } catch (error) {
      console.error("Action import failed", error);
      toast.error("Failed to start crop process");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParamChange = (field: keyof typeof cropParams, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCropParams((prev) => ({ ...prev, [field]: num }));
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
      <div className="flex h-10 items-center justify-between border-b border-white/5 bg-[#222] px-4 py-2">
        <div className="flex items-center gap-2">
          <CropIcon className="h-4 w-4 text-[#E0FC00]" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {data.label || "Crop Image"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Input Handle Visualization */}
        <div className="relative">
          <div className="absolute top-1/2 -left-7 -translate-y-1/2">
            <Handle
              type="target"
              position={Position.Left}
              id="image"
              className={cn(
                  "!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A]",
                  connections.length > 0 ? "!bg-green-500" : "!bg-indigo-500"
              )}
              isValidConnection={validateInput}
              title="Input Image (Base64)"
            />
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[10px] whitespace-nowrap text-gray-500">
              Input Image
            </span>
          </div>
        </div>

        <div className="rounded bg-white/5 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-400">
            Crop Percentages
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">
                X Position (%)
              </label>
              <input
                type="number"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.x}
                onChange={(e) => handleParamChange("x", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">
                Y Position (%)
              </label>
              <input
                type="number"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.y}
                onChange={(e) => handleParamChange("y", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Width (%)</label>
              <input
                type="number"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.width}
                onChange={(e) => handleParamChange("width", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Height (%)</label>
              <input
                type="number"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.height}
                onChange={(e) => handleParamChange("height", e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCrop}
          disabled={isProcessing}
          className={cn(
            "w-full rounded py-2 text-xs font-bold tracking-wider uppercase transition-colors",
            isProcessing
              ? "cursor-not-allowed bg-gray-700 text-gray-400"
              : "bg-[#E0FC00] text-black hover:bg-[#cbe600]",
          )}
        >
          {isProcessing ? "Cropping..." : "Crop Image"}
        </button>

        {/* Result Preview */}
        {data.imageUrl && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Result
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded border border-white/10 bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt="Cropped"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <div className="relative flex h-10 items-center justify-end border-t border-white/5 bg-[#222] px-4">
        <span className="mr-2 text-xs text-gray-500">image</span>
        <Handle
          type="source"
          position={Position.Right}
          id="image"
          className="!h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-[#E0FC00]"
        />
      </div>
    </div>
  );
}
