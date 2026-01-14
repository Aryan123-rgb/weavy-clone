"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Card, CardContent } from "~/components/ui/card";
import Autoplay from "embla-carousel-autoplay";

const models = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    color: "from-green-500 to-emerald-700",
  },
  {
    name: "Stable Diffusion 3.5",
    provider: "Stability AI",
    color: "from-purple-500 to-indigo-700",
  },
  {
    name: "Runway Gen-4",
    provider: "Runway",
    color: "from-pink-500 to-rose-700",
  },
  {
    name: "Imagen 3",
    provider: "Google DeepMind",
    color: "from-blue-500 to-cyan-700",
  },
  {
    name: "Veo 3",
    provider: "Google DeepMind",
    color: "from-teal-500 to-blue-700",
  },
  {
    name: "Claude 3.5",
    provider: "Anthropic",
    color: "from-orange-500 to-amber-700",
  },
  {
    name: "Wan",
    provider: "Weavy Native",
    color: "from-indigo-500 to-purple-700",
  },
  {
    name: "ControlNet",
    provider: "Open Source",
    color: "from-gray-500 to-slate-700",
  },
];

export function ModelsCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  return (
    <section className="w-full bg-black py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            Use all AI models,
            <br /> <span className="text-gray-500">together at last.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Access the world's most powerful creative models in a single,
            unified workflow.
          </p>
        </div>

        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {models.map((model, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="p-1">
                  <Card className="group cursor-pointer overflow-hidden border-white/10 bg-[#0A0A0A] transition-colors hover:bg-white/5">
                    <CardContent className="relative flex aspect-[4/3] flex-col justify-between p-6">
                      {/* Background Gradient */}
                      <div
                        className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${model.color} translate-x-10 -translate-y-10 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30`}
                      />

                      <div className="z-10 w-fit rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium tracking-wider text-gray-400 uppercase">
                        {model.provider}
                      </div>

                      <div className="z-10">
                        <div
                          className={`size-12 rounded-lg bg-gradient-to-br ${model.color} mb-4 shadow-lg`}
                        />
                        <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-indigo-400">
                          {model.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="left-4 h-12 w-12 border-none bg-white/10 text-white hover:bg-white/20" />
            <CarouselNext className="right-4 h-12 w-12 border-none bg-white/10 text-white hover:bg-white/20" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
