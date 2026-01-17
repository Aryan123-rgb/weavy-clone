import { Button } from "~/components/ui/button";
import { Box, FileText, Calendar } from "lucide-react";
import { CreateWorkflowDialog } from "./CreateWorkflowDialog";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface EmptyStateProps {
  workflows?: any[];
}

export function EmptyState({ workflows = [] }: EmptyStateProps) {
  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
      {workflows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center py-20">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-2xl">
            <Box className="h-10 w-10 text-white/50" strokeWidth={1.5} />
          </div>
          
          <h2 className="mb-3 text-2xl font-semibold text-white/90">Nothing here yet!</h2>
          <p className="mb-8 max-w-md text-sm text-white/50">
            Start weaving to bring your ideas to life.
          </p>

          <CreateWorkflowDialog 
            trigger={
              <Button className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/15 hover:ring-white/30 hover:scale-105 cursor-pointer shadow-lg">
                Create New File
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white/90">Your Workflows</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflows.map((workflow) => (
              <Link 
                key={workflow.id} 
                href={`/flow/${workflow.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                 
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-300 group-hover:scale-105">
                    <FileText className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                    
                  <h3 className="mb-3 line-clamp-1 text-lg font-semibold text-white/90 transition-colors group-hover:text-white">
                    {workflow.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-white/40 transition-colors group-hover:text-white/60">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(workflow.updatedAt || workflow.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            <CreateWorkflowDialog 
              trigger={
                <button className="group relative flex h-full min-h-[160px] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/[0.03] hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:scale-110">
                    <Box className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-white/50 transition-colors group-hover:text-blue-400">Create New Workflow</span>
                </button>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}