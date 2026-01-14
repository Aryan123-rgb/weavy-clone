import {
  Crop,
  Brush,
  Maximize2,
  FlipHorizontal,
  Scan,
  Layers,
  MessageSquare,
  Sliders,
  Palette,
  Sun,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";

const tools = [
  {
    name: "Inpaint",
    icon: Brush,
    description: "Edit specific areas with generative fill",
  },
  {
    name: "Outpaint",
    icon: Maximize2,
    description: "Extend images beyond their borders",
  },
  {
    name: "Crop",
    icon: Crop,
    description: "Smart cropping with subject detection",
  },
  { name: "Upscale", icon: Scan, description: "Enhance resolution up to 4x" },
  {
    name: "Relight",
    icon: Sun,
    description: "Adjust lighting and shadows in post",
  },
  {
    name: "Painter",
    icon: Palette,
    description: "Draw coherence masks and guides",
  },
  {
    name: "Channels",
    icon: Sliders,
    description: "Advanced color channel manipulation",
  },
  {
    name: "Z-Depth",
    icon: Layers,
    description: "Extract depth maps for 3D composition",
  },
  {
    name: "Describe",
    icon: MessageSquare,
    description: "Generate prompts from images",
  },
  {
    name: "Invert",
    icon: FlipHorizontal,
    description: "Create negative masks instantly",
  },
  {
    name: "Remix",
    icon: Wand2,
    description: "Generate variations of your work",
  },
  {
    name: "Masking",
    icon: ImageIcon,
    description: "Auto-segmentation of objects",
  },
];

export function ToolsGrid() {
  return (
    <section className="bg-[#050505] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
            With all the{" "}
            <span className="text-indigo-400">professional tools</span> you rely
            on.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                <tool.icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-gray-300 group-hover:text-white">
                {tool.name}
              </span>

              {/* Tooltip-ish description on hover (optional enhancement) */}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/90 p-4 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <p className="text-xs text-gray-300">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
