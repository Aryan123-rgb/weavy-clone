"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import React, { useState } from "react";
import type { Node, NodeProps, Connection, Edge } from "@xyflow/react";
import { Smartphone, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";
import { extractVideoFrame } from "~/lib/cloudinary";
import Image from "next/image";

// Define the data type for our node
type ExtractVideoFrameNodeData = {
  label?: string;
  imageUrl?: string; //  The output extracted frame (Cloudinary URL)
};

type MyNode = Node<ExtractVideoFrameNodeData>;

/**
 * ExtractVideoFrameNode Component
 *
 * This custom React Flow node allows users to extract a single frame from a video
 * hosted on Cloudinary. It takes a Cloudinary video URL as input (via a connection)
 * and a user-specified timestamp.
 *
 * It interacts with the backend tRPC procedure `workflow.extractFrame` to perform
 * the extraction using Cloudinary's on-the-fly transformation capabilities. by mutating the cloudinary url
 */
export function ExtractVideoFrameNode({
  data,
  selected,
  id,
}: NodeProps<MyNode>) {
  const { updateNodeData, nodeData } = useFlowStore();
  const { getEdges, getNodes } = useReactFlow();

  // State to hold the timestamp input by the user (in seconds)
  const [timestamp, setTimestamp] = useState<number>(0);

  // State to track if the extraction request is in progress
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Local state to display the result immediately after extraction
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(
    null,
  );

  // tRPC Mutation removed in favor of client-side utility
  // const extractMutation = api.workflow.extractFrame.useMutation();

  // Track connections to the 'video' input handle to show status indicators
  const connections = useHandleConnections({ type: "target", id: "video" });

  /**
   * Helper function to retrieve the input video URL from the connected source node.
   * It checks the global store for live data first, then falls back to the node's initial data.
   */
  const getInputVideo = () => {
    const edges = getEdges();
    const nodes = getNodes();

    // Find edge connected to our 'video' handle
    const edge = edges.find(
      (e) => e.target === id && e.targetHandle === "video",
    );
    if (!edge) return null;

    // Try store first (live data passed between nodes)
    if (nodeData[edge.source]) {
      const sourceData = nodeData[edge.source] as Record<string, unknown>;
      return (sourceData.mediaUrl ?? sourceData.video) as string | undefined;
    }

    // Fallback to static node data if live data isn't available
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const sData = sourceNode?.data;
    return (sData?.mediaUrl ?? sData?.video) as string | undefined;
  };

  const liveVideoUrl = getInputVideo();
  const isValidInput =
    !!liveVideoUrl &&
    (liveVideoUrl.startsWith("http") || liveVideoUrl.startsWith("blob:"));

  // Requirement: Enable button only when a valid Cloudinary URL is provided and not currently processing.
  const canExtract =
    isValidInput && liveVideoUrl.includes("cloudinary.com") && !isProcessing;

  /**
   * Validates if a connection can be made to the video handle.
   */
  const validateInput = (connection: Connection | Edge) => {
    return connection.sourceHandle === "video";
  };

  /**
   * Handles the click event for the "Extract Frame" button.
   * It performs validation and then calls the `extractVideoFrame` utility.
   */
  const handleExtract = async () => {
    if (!canExtract) {
      if (!liveVideoUrl?.includes("cloudinary.com")) {
        toast.error("Video must be uploaded to Cloudinary first.");
      }
      return;
    }

    // Timestamp validation to ensure positive value
    if (timestamp < 0) {
      toast.error("Invalid Timestamp. Must be non-negative.");
      return;
    }

    setIsProcessing(true);
    toast.info("Extracting frame...");

    try {
      // Client-side extraction (URL manipulation)
      // We wrap in a small timeout if we want to simulate async or just run it.
      // Since it's synchronous string manip, it's instant.
      const newUrl = extractVideoFrame(liveVideoUrl, timestamp);

      // Simulating a brief delay for UX (optional, but requested in behavior)
      // or just proceed directly.
      await new Promise((resolve) => setTimeout(resolve, 500));

      setExtractedImageUrl(newUrl);
      updateNodeData(id, { imageUrl: newUrl });
      toast.success("Frame Extracted Successfully");
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(`Failed to extract frame: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
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
          <Smartphone className="h-4 w-4 text-[#E0FC00]" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {data.label ?? "Extract Frame"}
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
              id="video"
              className={cn(
                "!relative !left-0 !h-3 !w-3 !border-2 !border-[#1A1A1A]",
                connections.length > 0 ? "!bg-green-500" : "!bg-indigo-500",
              )}
              isValidConnection={validateInput}
              title="Input Video (Cloudinary URL)"
            />
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[10px] whitespace-nowrap text-gray-500">
              Input Video
            </span>
          </div>
        </div>
        <div className="rounded bg-white/5 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-400">
            Extraction Settings
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">
              Timestamp (Seconds)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-[#E0FC00]"
              value={timestamp}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setTimestamp(val);
                else setTimestamp(0);
              }}
            />
          </div>
        </div>
        <button
          onClick={handleExtract}
          disabled={!canExtract}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded py-2 text-xs font-bold tracking-wider uppercase transition-colors",
            !canExtract
              ? "cursor-not-allowed bg-gray-700 text-gray-400"
              : "bg-[#E0FC00] text-black hover:bg-[#cbe600]",
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Frame"
          )}
        </button>
        {!isValidInput && connections.length > 0 && (
          <p className="text-center text-[10px] text-red-400">
            Video not loaded or invalid.
          </p>
        )}
        {isValidInput && !liveVideoUrl?.includes("cloudinary.com") && (
          <p className="text-center text-[10px] text-orange-400">
            Output must be Cloudinary URL.
          </p>
        )}
        {/* Result Preview */}
        {extractedImageUrl && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Result
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded border border-white/10 bg-black/50">
              <Image
                src={extractedImageUrl}
                alt="Extracted"
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
