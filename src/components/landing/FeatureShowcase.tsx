import { Button } from "~/components/ui/button";

export function FeatureShowcase() {
  return (
    <section className="relative overflow-hidden bg-black py-32 text-white">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Control the{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Outcome
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Stop gambling with prompts. Get precise control over every pixel
            with our node-based creative environment.
          </p>
        </div>

        {/* Feature 1: The Interface */}
        <div className="relative mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl">
          <div className="absolute -top-1 -right-1 -left-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[#050505]">
            {/* UI Mockup Placeholder */}
            <div className="absolute inset-0 grid grid-cols-[250px_1fr_300px] gap-1 p-2 opacity-80">
              {/* Left Sidebar */}
              <div className="space-y-2 rounded bg-white/5 p-2">
                <div className="h-4 w-20 rounded bg-white/10" />
                <div className="h-8 w-full rounded bg-white/5" />
                <div className="h-8 w-full rounded bg-white/5" />
                <div className="h-8 w-full rounded bg-white/5" />
              </div>
              {/* Center Canvas */}
              <div className="relative flex items-center justify-center rounded border border-dashed border-white/5 bg-white/5">
                <span className="font-mono text-white/20">Workflow Canvas</span>
                {/* Nodes */}
                <div className="absolute top-1/4 left-1/4 h-24 w-32 rounded border border-indigo-500/50 bg-indigo-500/20" />
                <div className="absolute top-1/2 left-1/2 h-24 w-32 rounded border border-purple-500/50 bg-purple-500/20" />
                {/* Connection Line */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  <path
                    d="M 300 150 L 500 300"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
              {/* Right Sidebar */}
              <div className="space-y-4 rounded bg-white/5 p-2">
                <div className="h-32 w-full rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-20 w-full rounded bg-white/5" />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
          </div>

          <div className="absolute right-0 bottom-10 left-0 text-center">
            <Button
              variant="outline"
              className="border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white/10"
            >
              Explore Interface
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
