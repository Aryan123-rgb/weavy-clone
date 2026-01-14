import { Button } from "~/components/ui/button";
import { Box } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl">
         <Box className="h-10 w-10 text-white/50" strokeWidth={1.5} />
      </div>
      
      <h2 className="mb-2 text-xl font-semibold text-white">Nothing here yet!</h2>
      <p className="mb-8 text-sm text-gray-400">
        Start weaving to bring your ideas to life.
      </p>

      <Button className="rounded-lg bg-white/10 px-6 py-6 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/20 hover:scale-105">
        Create New File
      </Button>
    </div>
  );
}
