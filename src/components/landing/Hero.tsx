import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#030303] pt-20 text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Floating Cards Container - Absolute positioning relative to center */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {/* Card 1: Top Left */}
        <div className="animate-in fade-in zoom-in absolute top-[20%] left-[10%] h-40 w-64 rotate-[-6deg] transform rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md transition-transform delay-300 duration-1000 hover:scale-105">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="h-20 w-full rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20" />
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
          </div>
        </div>

        {/* Card 2: Top Right */}
        <div className="animate-in fade-in zoom-in absolute top-[25%] right-[12%] h-72 w-56 rotate-[12deg] rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md delay-500 duration-1000">
          <div className="flex h-full flex-col gap-3 p-3">
            <div className="relative flex-1 overflow-hidden rounded-lg border border-white/5 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20">
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="font-mono text-xs text-white/70">
                  Generation complete...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Bottom Left */}
        <div className="animate-in fade-in zoom-in absolute bottom-[20%] left-[15%] h-48 w-72 rotate-[6deg] rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md delay-700 duration-1000">
          <div className="flex h-full items-center gap-4 p-4">
            <div className="flex size-16 items-center justify-center rounded-full border border-indigo-500/50 bg-indigo-500/30">
              <div className="size-8 rounded-full bg-indigo-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-5/6 rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Card 4: Bottom Right */}
        <div className="animate-in fade-in zoom-in absolute right-[20%] bottom-[25%] h-40 w-40 rotate-[-12deg] rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md delay-100 duration-1000">
          <div className="flex h-full items-center justify-center text-4xl">
            ✨
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-in slide-in-from-bottom-8 fade-in z-10 flex max-w-5xl flex-col items-center px-4 text-center duration-1000">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          <span>Weavy AI v2.0 is now live</span>
          <ArrowRight className="h-3.5 w-3.5 opacity-50" />
        </div>

        <h1 className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text pb-6 text-6xl leading-[0.9] font-bold tracking-tighter text-transparent sm:text-7xl md:text-9xl">
          Artistic
          <br />
          Intelligence
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed font-light text-gray-400 sm:text-xl md:text-2xl">
          The all-in-one platform for creative professionals. Generate, edit,
          and iterate with the world's best AI models.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Button
            size="lg"
            className="h-16 rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:scale-105 hover:bg-gray-100 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
          >
            Start Creating for Free
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-16 rounded-full border border-white/10 px-10 text-lg font-medium text-white hover:bg-white/10"
          >
            View Showreel
          </Button>
        </div>

        {/* Floating UI Element at Bottom Center */}
        <div className="mt-20 w-full max-w-4xl rounded-t-3xl border-t border-r border-l border-white/10 bg-[#0A0A0A]/80 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 border-b border-white/5 px-2 pb-4">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full border border-red-500/50 bg-red-500/20" />
              <div className="size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
              <div className="size-3 rounded-full border border-green-500/50 bg-green-500/20" />
            </div>
            <div className="ml-4 h-6 w-64 rounded-md bg-white/5" />
          </div>
          <div className="grid h-64 grid-cols-3 gap-4">
            <div className="group relative col-span-2 overflow-hidden rounded-lg border border-white/5 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
