"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import React, { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import axios from "axios";
import { X, Upload, CloudUpload } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFlowStore } from "~/store/flowStore";
import { toast } from "sonner";
import { env } from "~/env";

// Define the data type for our node
type UploadImageNodeData = {
  label?: string;
  imageUrl?: string;
};

type MyNode = Node<UploadImageNodeData>;

export function UploadImageNode({ data, selected, id }: NodeProps<MyNode>) {
  const { updateNodeData } = useFlowStore();
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data?.imageUrl || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  // Dropzone callback
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Handle rejections
      if (fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const errorCode = rejection.errors[0]?.code;
          if (errorCode === "file-too-large") {
            toast.error("File is too large", {
              description: "Image must be less than 10MB",
            });
          } else if (errorCode === "file-invalid-type") {
            toast.error("Invalid file type", {
              description: "Only JPG, PNG, WEBP, and GIF are allowed",
            });
          } else {
            const message = rejection.errors[0]?.message ?? "Unknown error";
            toast.error(`Upload Failed: ${message}`);
          }
        });
        return;
      }

      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        // Clear the node data url until uploaded to avoid stale/base64 data
        updateNodeData(id, { imageUrl: "" });
      }
    },
    [id, updateNodeData],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    multiple: false,
  });

  const handleCloudUpload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file) return;

    setIsUploading(true);
    toast.info("Uploading to cloud...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    );

    try {
      const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );

      const resultUrl = response.data.secure_url;
      
      updateNodeData(id, {
        imageUrl: resultUrl,
      });
      
      // Update preview and clear local file
      setPreviewUrl(resultUrl);
      setFile(null);
      toast.success("Upload Successful");
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Upload Failed: ${error.response?.data?.error?.message || error.message}`);
      } else {
        toast.error("Upload Failed: Unknown error");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    updateNodeData(id, { imageUrl: undefined });
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
          {data.label ?? "Upload Image"}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex min-h-[150px] flex-col items-center justify-center p-4">
        {previewUrl ? (
          <div className="group/image relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
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
            <p className="mt-1 text-[10px] text-gray-600">Max 10MB</p>
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

       {/* Footer / Actions */}
       {file && !isUploading && (
        <div className="flex items-center justify-center border-t border-white/5 bg-[#222] p-2">
          <button
            onClick={handleCloudUpload}
            className="flex items-center gap-2 rounded bg-[#E0FC00] px-3 py-1.5 text-xs font-bold text-black uppercase transition-colors hover:bg-[#cbe600]"
          >
            <CloudUpload className="h-3 w-3" />
            Upload to Cloud
          </button>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center border-t border-white/5 bg-[#222] p-2">
          <span className="flex items-center gap-2 text-xs text-[#E0FC00]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Uploading...
          </span>
        </div>
      )}
    </div>
  );
}
