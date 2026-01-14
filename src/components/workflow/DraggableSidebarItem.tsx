"use client";

import { useDraggable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  onClick: () => void;
}

export function DraggableSidebarItem({
  id,
  label,
  icon: Icon,
  type = "prompt",
  onClick,
}: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      type: type, // Use dynamic type
      label: label,
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex cursor-grab flex-col items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 p-4 text-gray-300 transition-all active:cursor-grabbing",
        "hover:border-white/20 hover:bg-white/10 hover:text-white",
        isDragging && "border-transparent opacity-50 ring-2 ring-[#E0FC00]",
      )}
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-gray-400 transition-colors group-hover:text-indigo-400" />
      <span className="text-center text-xs font-medium select-none">
        {label}
      </span>
    </button>
  );
}
