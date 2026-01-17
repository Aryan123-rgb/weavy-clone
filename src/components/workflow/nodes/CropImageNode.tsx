"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import React, { useState } from "react";
import type { Node, NodeProps, Connection, Edge } from "@xyflow/react";
import { Crop as CropIcon } from "lucide-react";
import { cropCloudinaryImage } from "~/lib/cloudinary";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";
import Image from "next/image";

// Define the data type for our node
type CropImageNodeData = {
  label?: string;
  imageUrl?: string; // The output url (Cloudinary URL)
};

type MyNode = Node<CropImageNodeData>;

/**
 * CropImageNode Component
 * 
 * This custom React Flow node provides an interface for cropping images hosted on Cloudinary.
 * It accepts a Cloudinary image URL as input and allows the user to specify crop parameters
 * (x, y, width, height in percentages). The cropping is performed by generating a new 
 * Cloudinary transformation URL using the `cropCloudinaryImage` utility.
 * 
 * The node outputs the URL of the cropped image.
 */
export function CropImageNode({ data, selected, id }: NodeProps<MyNode>) {
  const { updateNodeData, nodeData } = useFlowStore();
  const { getEdges, getNodes } = useReactFlow();

  // Inputs for crop percentages
  // These determine the region of the image to crop.
  const [cropParams, setCropParams] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  // Local state to store the processed Image URL for display/output
  // Initialized with data.imageUrl if available.
  const [processedImageUrl, setProcessedImageUrl] = useState<
    string | null
  >(data.imageUrl ?? null);

  // Input connection tracking
  const connections = useHandleConnections({ type: "target", id: "image" });

  /**
   * Helper function to retrieve the input image URL from the connected source node.
   * Checks the global flow store for live data passed from the upstream node.
   * 
   * @returns {string | undefined} The URL of the input image, or undefined if not found.
   */
  const getInputImage = (): string | undefined => {
    const edges = getEdges();
    // Find edge connected to our 'image' handle
    const edge = edges.find(
      (e) => e.target === id && e.targetHandle === "image",
    );
    if (!edge) return undefined;

    // Try store first (live data)
    if (nodeData[edge.source]) {
      const sourceData = nodeData[edge.source] as Record<string, unknown>;
      // Support imageUrl (standard)
      const img = (sourceData.imageUrl) as string | undefined;
      return img;
    }

    // Fallback? usually flowStore has it.
    return undefined;
  };

  const inputUrl = getInputImage();
  const hasValidInput =
    inputUrl?.includes("cloudinary.com") && inputUrl.length > 0;

  /**
   * Handles the image cropping logic.
   * Validates the input URL and crop parameters, then calls `cropCloudinaryImage` 
   * to generate the new URL. Updates local state and global node data upon success.
   */
  const handleCrop = async () => {
    if (!hasValidInput || !inputUrl) {
      toast.error("Invalid Input", {
        description: "Waiting for a Cloudinary image...",
      });
      return;
    }

    try {
      const newUrl = await cropCloudinaryImage(
        inputUrl,
        cropParams.x,
        cropParams.y,
        cropParams.width,
        cropParams.height,
      );

      setProcessedImageUrl(newUrl);
      updateNodeData(id, { imageUrl: newUrl });
      toast.success("Image Cropped successfully");
    } catch (error) {
      console.error(error);
      toast.error("Crop Failed", { description: (error as Error).message });
    }
  };

  const handleParamChange = (field: keyof typeof cropParams, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCropParams((prev) => ({ ...prev, [field]: num }));
    }
  };

  const validateInput = (connection: Connection | Edge) => {
    // Only allow connection to handles named "image" (or similar convention)
    return connection.sourceHandle === "image";
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
            {data.label ?? "Crop Image"}
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
                connections.length > 0 ? "!bg-green-500" : "!bg-indigo-500",
              )}
              isValidConnection={validateInput}
              title="Input Image (Cloudinary URL)"
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
                min="0"
                max="100"
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
                min="0"
                max="100"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.y}
                onChange={(e) => handleParamChange("y", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Width (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.width}
                onChange={(e) => handleParamChange("width", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Height (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
                value={cropParams.height}
                onChange={(e) => handleParamChange("height", e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCrop}
          disabled={!hasValidInput}
          className={cn(
            "w-full rounded py-2 text-xs font-bold tracking-wider uppercase transition-colors",
            !hasValidInput
              ? "cursor-not-allowed bg-gray-700 text-gray-400"
              : "bg-[#E0FC00] text-black hover:bg-[#cbe600]",
          )}
        >
          {hasValidInput ? "Crop Image" : "Waiting for Image..."}
        </button>

        {/* Result Preview or Input Preview */}
        {(processedImageUrl || hasValidInput) && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              {processedImageUrl ? "Cropped Result" : "Input Preview"}
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded border border-white/10 bg-black/50">
              <Image
                src={processedImageUrl ?? inputUrl ?? ""} // Show result if available, else show input
                alt="Preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
