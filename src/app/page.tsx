import { FeatureShowcase } from "~/components/landing/FeatureShowcase";
import { Footer } from "~/components/landing/Footer";
import { Header } from "~/components/landing/Header";
import { Hero } from "~/components/landing/Hero";
import { ModelsCarousel } from "~/components/landing/ModelsCarousel";
import { ToolsGrid } from "~/components/landing/ToolsGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <Header />
      <Hero />
      <ModelsCarousel />
      <FeatureShowcase />
      <ToolsGrid />
      <Footer />
    </main>
  );
}
