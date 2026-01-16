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
  imageUrl?: string; // The output url (Cloudinary URL)
};

type MyNode = Node<CropImageNodeData>;

// Utility function to crop Cloudinary Image
async function getImageDimensions(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Set crossOrigin if needed for CORS
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

async function cropCloudinaryImage(
  imageUrl: string,
  xPercent: number,
  yPercent: number,
  widthPercent: number,
  heightPercent: number,
): Promise<string> {
  // Check if it's a valid Cloudinary URL
  if (!imageUrl.includes("cloudinary.com")) {
    throw new Error("Invalid Cloudinary URL");
  }

  // Get image dimensions
  const { width: imgWidth, height: imgHeight } =
    await getImageDimensions(imageUrl);

  // Calculate actual pixel values from percentages
  const x = Math.round((xPercent / 100) * imgWidth);
  const y = Math.round((yPercent / 100) * imgHeight);
  const width = Math.round((widthPercent / 100) * imgWidth);
  const height = Math.round((heightPercent / 100) * imgHeight);

  // Build the crop transformation string
  const cropTransform = `c_crop,x_${x},y_${y},w_${width},h_${height}`;

  // Split at /upload/
  const parts = imageUrl.split("/upload/");

  if (parts.length !== 2) {
    throw new Error("Invalid Cloudinary URL format");
  }

  // Remove any existing transformations from the second part
  const afterUpload = parts[1]?.replace(/^[^/]+\//, "");

  // Reconstruct URL with new transformation
  return `${parts[0]}/upload/${cropTransform}/${afterUpload}`;
}
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

  // Local state to store the processed Image URL for display/output
  const [processedImageUrl, setProcessedImageUrl] = useState<
    string | undefined
  >(data.imageUrl);

  // Input connection tracking
  const connections = useHandleConnections({ type: "target", id: "image" });

  // Get live input from the connected node
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
      // Support imageUrl (standard) or image (legacy)
      const img = (sourceData.imageUrl ?? sourceData.image) as
        | string
        | undefined;
      return img;
    }

    // Fallback? usually flowStore has it.
    return undefined;
  };

  const inputUrl = getInputImage();
  const hasValidInput =
    !!inputUrl && inputUrl.includes("cloudinary.com") && inputUrl.length > 0;

  // Auto-update preview if input changes (optional, but good UX if we want to show the source image before cropping?)
  // The user requirement said: "as soon as the image gets uploaded it will flow the live cloudinary url to cropimagenode and use that url to show the preview of the image"
  // So we should show the *Input* image if we haven't cropped yet? Or show the *Cropped* image?
  // "when the input parameters are provided run them through the crop function and display the new cropped image"
  // Let's show inputUrl if processedImageUrl is empty, or just rely on manual crop.
  // Actually, let's keep it simple: We have a "Crop" button.

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
      console.log("processedImageUrl", processedImageUrl);
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processedImageUrl || inputUrl} // Show result if available, else show input
                alt="Preview"
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
