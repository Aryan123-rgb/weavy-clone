"use client";

import {
  Handle,
  Position,
  useReactFlow,
  useHandleConnections,
} from "@xyflow/react";
import React, { useState, useEffect } from "react";
import type { Node, NodeProps, Connection, Edge } from "@xyflow/react";
import { Smartphone, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";
import { api } from "~/trpc/react";

// Define the data type for our node
type ExtractVideoFrameNodeData = {
  label?: string;
  imageUrl?: string; // The output extracted frame (Cloudinary URL)
};

type MyNode = Node<ExtractVideoFrameNodeData>;

export function ExtractVideoFrameNode({
  data,
  selected,
  id,
}: NodeProps<MyNode>) {
  const { updateNodeData, nodeData } = useFlowStore();
  const { getEdges, getNodes } = useReactFlow();

  // Timestamp input (seconds)
  const [timestamp, setTimestamp] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [triggerId, setTriggerId] = useState<string | null>(null);

  // TRPC Mutations
  const extractMutation = api.workflow.extractFrame.useMutation();

  // Polling Status
  // We use useQuery with refetchInterval to handle polling automatically
  const { data: statusData, error: statusError } =
    api.workflow.getExtractionStatus.useQuery(
      { triggerId: triggerId! },
      {
        enabled: !!triggerId,
        refetchInterval: (data) => {
          // Stop polling if completed or failed
          if (!data) return false;
          return 3000; // Poll every 3 seconds
        },
      },
    );

  // Input connection tracking
  const connections = useHandleConnections({ type: "target", id: "video" });

  // Helper to get input video URL from connection
  const getInputVideo = () => {
    const edges = getEdges();
    const nodes = getNodes();

    // Find edge connected to our 'video' handle
    const edge = edges.find(
      (e) => e.target === id && e.targetHandle === "video",
    );
    if (!edge) return null;

    // Try store first (live data)
    if (nodeData[edge.source]) {
      const sourceData = nodeData[edge.source] as Record<string, unknown>;
      return (sourceData.mediaUrl ?? sourceData.video) as string | undefined;
    }

    // Fallback to node data
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const sData = sourceNode?.data;
    return (sData?.mediaUrl ?? sData?.video) as string | undefined;
  };

  const liveVideoUrl = getInputVideo();
  const isValidInput =
    !!liveVideoUrl &&
    (liveVideoUrl.startsWith("http") || liveVideoUrl.startsWith("blob:"));

  // Requirement: Enable button only when URL is provided.
  const canExtract =
    isValidInput && liveVideoUrl.includes("cloudinary.com") && !isProcessing;

  const validateInput = (connection: Connection | Edge) => {
    return connection.sourceHandle === "video";
  };

  // Handle Polling Results via Effect
  useEffect(() => {
    if (!statusData) return;

    console.log("Polling status:", statusData);

    if (statusData.status === "COMPLETED") {
      setIsProcessing(false);
      setTriggerId(null);

      if (
        statusData.output &&
        typeof statusData.output === "object" &&
        "imageUrl" in statusData.output
      ) {
        const resultUrl = (statusData.output as { imageUrl: string }).imageUrl;
        updateNodeData(id, { imageUrl: resultUrl });
        toast.success("Frame Extracted Successfully");
      } else {
        toast.error("Task completed but no image URL returned");
      }
    } else if (
      statusData.status === "FAILED" ||
      statusData.status === "CANCELED" ||
      statusData.status === "TIMED_OUT" ||
      statusData.status === "CRASHED"
    ) {
      setIsProcessing(false);
      setTriggerId(null);
      const errorMessage = statusData.error?.message || "Unknown error";
      toast.error(`Extraction Failed: ${errorMessage}`);
    }
    // If QUEUED/EXECUTING/WAITING_FOR_DEPLOY, do nothing, just wait for next poll
  }, [statusData, id, updateNodeData]);

  // Handle manual polling errors
  useEffect(() => {
    if (statusError) {
      console.error("Polling error", statusError);
      // Optional: Retry logic or just log
    }
  }, [statusError]);

  const handleExtract = async () => {
    if (!canExtract) {
      if (!liveVideoUrl?.includes("cloudinary.com")) {
        toast.error("Video must be uploaded to Cloudinary first.");
      }
      return;
    }

    // Timestamp validation
    if (timestamp < 0) {
      toast.error("Invalid Timestamp. Must be non-negative.");
      return;
    }

    setIsProcessing(true);
    toast.info("Starting extraction...");

    extractMutation.mutate(
      { liveVideoUrl, timestamp },
      {
        onSuccess: (data) => {
          console.log("Task initiated, triggerId:", data.triggerId);
          setTriggerId(data.triggerId);
          toast.loading("Extracting frame via Trigger.dev...");
        },
        onError: (error) => {
          console.error("Trigger error:", error);
          toast.error(`Failed to start extraction: ${error.message}`);
          setIsProcessing(false);
        },
      },
    );
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
        {data.imageUrl && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Result
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded border border-white/10 bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt="Extracted"
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
