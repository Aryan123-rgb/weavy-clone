"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { X, FileVideo, FileAudio, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";

// Define the data type for our node
type UploadVideoNodeData = {
  label?: string;
  mediaUrl?: string;
  mediaType?: string;
};

type MyNode = Node<UploadVideoNodeData>;

export function UploadVideoNode({ data, selected, id }: NodeProps<MyNode>) {
  const { updateNodeData } = useFlowStore();
  // Manage video URL and type state locally
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(data.mediaUrl);
  const [mediaType, setMediaType] = useState<string | undefined>(
    data.mediaType,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync local state with data prop if it changes externally
  useEffect(() => {
    setMediaUrl(data.mediaUrl);
    setMediaType(data.mediaType);
  }, [data.mediaUrl, data.mediaType]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      void (async () => {
        // Handle rejections
        if (fileRejections.length > 0) {
          fileRejections.forEach((rejection) => {
            const errorMessage = rejection.errors[0]?.message ?? "Unknown error";
            toast.error(`Upload Failed: ${errorMessage}`);
          });
          return;
        }

        const file = acceptedFiles[0];
        if (file) {
          setIsProcessing(true);
          // Create a local object URL for preview immediately
          const objectUrl = URL.createObjectURL(file);
          setMediaUrl(objectUrl);
          setMediaType(file.type);

          toast.info("Processing file...");

          try {
            // Convert to Base64 Data URL
            const reader = new FileReader();
            reader.onerror = () => {
              toast.error("Failed to read file");
              setIsProcessing(false);
            };
            reader.onload = () => {
              const base64String = reader.result as string;
              // Update global flow store with the base64 string
              updateNodeData(id, {
                mediaUrl: base64String,
                mediaType: file.type,
              });
              toast.success("File processed successfully");
              setIsProcessing(false);
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error("File reading error:", error);
            toast.error("Failed to process file");
            setIsProcessing(false);
          }

          console.log("File dropped:", file);
        }
      })();
    },
    [id, updateNodeData],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [],
      "audio/mpeg": [],
      "image/webp": [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
    disabled: isProcessing,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const errorCode = rejection.errors[0]?.code;
        if (errorCode === "file-too-large") {
          toast.error("File is too large");
        } else {
          const message = rejection.errors[0]?.message ?? "Unknown error";
          toast.error(`Upload Failed: ${message}`);
        }
      });
    },
  });

  const clearMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaUrl(undefined);
    setMediaType(undefined);
    updateNodeData(id, { mediaUrl: undefined, mediaType: undefined });
  };

  const renderMediaPreview = () => {
    if (!mediaUrl) return null;

    // Check media type (either from state or sniff from data url)
    // ensure type is always a string
    const mimeFromData = mediaUrl.startsWith("data:")
      ? mediaUrl.split(";")[0]?.split(":")[1]
      : "";
    const type = mediaType ?? mimeFromData ?? "";

    if (type.startsWith("video/")) {
      return (
        <video
          src={mediaUrl}
          controls
          className="h-full w-full bg-black object-contain"
        />
      )
    } else if (type.startsWith("audio/")) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#111]">
          <audio src={mediaUrl} controls className="w-[90%]" />
        </div>
      );
    } else if (type.startsWith("image/")) {
      return (
        <Image
          src={mediaUrl}
          alt="Uploaded"
          fill
          className="object-contain"
          unoptimized
        />
      );
    }

    // Fallback
    return <div className="text-white">Unsupported media type</div>;
  };

  return (
    <div
      className={cn(
        "group relative flex w-80 flex-col overflow-hidden rounded-xl border-2 bg-[#1A1A1A] text-white shadow-2xl transition-all",
        selected
          ? "border-[#E0FC00] shadow-[#E0FC00]/20"
          : "border-white/10 hover:border-white/20",
      )}
    >
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-white/5 bg-[#222] px-4 py-2">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {data.label ?? "Upload Video"}
        </span>
        {isProcessing && (
          <span className="animate-pulse text-xs text-[#E0FC00]">
            Processing...
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex min-h-[150px] flex-col items-center justify-center bg-black/20 p-4">
        {mediaUrl ? (
          <div className="group/image relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
            {renderMediaPreview()}
            <button
              onClick={clearMedia}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1 opacity-0 transition-colors group-hover/image:opacity-100 hover:bg-red-500/80"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/5 transition-colors",
              isDragActive
                ? "border-[#E0FC00] bg-[#E0FC00]/5"
                : "hover:border-white/20 hover:bg-white/10",
              isProcessing && "cursor-not-allowed opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <div className="mb-2 flex gap-2">
              <FileVideo
                className={cn(
                  "h-6 w-6 text-gray-400",
                  isDragActive && "text-[#E0FC00]",
                )}
              />
              <FileAudio
                className={cn(
                  "h-6 w-6 text-gray-400",
                  isDragActive && "text-[#E0FC00]",
                )}
              />
              <ImageIcon
                className={cn(
                  "h-6 w-6 text-gray-400",
                  isDragActive && "text-[#E0FC00]",
                )}
              />
            </div>

            <p className="px-4 text-center text-xs text-gray-400">
              {isDragActive
                ? "Drop file here..."
                : "Drag & drop mp4, mp3 or webp"}
            </p>
            <p className="mt-1 text-[10px] text-gray-600">Max 100MB</p>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <div className="relative flex h-10 items-center justify-end border-t border-white/5 bg-[#222] px-4">
        <span className="mr-2 text-xs text-gray-500">video</span>
        <Handle
          type="source"
          position={Position.Right}
          id="video"
          className="!h-3 !w-3 !border-2 !border-[#1A1A1A] !bg-[#E0FC00]"
        />
      </div>
    </div>
  );
}
