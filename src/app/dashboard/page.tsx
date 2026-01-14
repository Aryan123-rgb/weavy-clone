import { DashboardHeader } from "~/components/dashboard/DashboardHeader";
import { EmptyState } from "~/components/dashboard/EmptyState";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader />
      <div className="flex flex-1 flex-col items-center justify-center pt-16">
        <EmptyState />
      </div>
    </main>
  );
}
