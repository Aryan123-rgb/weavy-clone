"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { CreateWorkflowDialog } from "./CreateWorkflowDialog";

export function DashboardHeader() {
  const { user, isLoaded } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0A0A]/95 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-gray-200">
          {isLoaded && user ? `${user.firstName || user.username}'s Workspace` : "Workspace"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <CreateWorkflowDialog />
        <div className="h-6 w-[1px] bg-white/10" />
        <UserButton 
            appearance={{
              elements: {
                avatarBox: "size-8 border border-white/10"
              }
            }}
        />
      </div>
    </header>
  );
}
