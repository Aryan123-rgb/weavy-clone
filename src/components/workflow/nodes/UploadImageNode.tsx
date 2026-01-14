"use client";

import { Handle, Position } from "@xyflow/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { Node, NodeProps } from "@xyflow/react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";

// Define the data type for our node
type UploadImageNodeData = {
  label?: string;
  imageUrl?: string;
};

type MyNode = Node<UploadImageNodeData>;

export function UploadImageNode({ data, selected }: NodeProps<MyNode>) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(data.imageUrl);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create a local object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // In a real implementation, you might want to upload this file here
      // and then update the node data with the remote URL.
      // For now, we stick to the local preview as requested by the switch to dropzone.
      console.log("File dropped:", file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(undefined);
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
          {data.label || "Upload Image"}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex min-h-[150px] flex-col items-center justify-center p-4">
        {imageUrl ? (
          <div className="group/image relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded"
              className="h-full w-full object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1 opacity-0 transition-colors group-hover/image:opacity-100 hover:bg-red-500/80"
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
            )}
          >
            <input {...getInputProps()} />
            <Upload
              className={cn(
                "mb-2 h-8 w-8 text-gray-400",
                isDragActive && "text-[#E0FC00]",
              )}
            />
            <p className="px-4 text-center text-xs text-gray-400">
              {isDragActive
                ? "Drop image here..."
                : "Drag & drop or click to upload"}
            </p>
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
