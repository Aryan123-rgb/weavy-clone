import { auth } from "@clerk/nextjs/server";
import { DashboardHeader } from "~/components/dashboard/DashboardHeader";
import { EmptyState } from "~/components/dashboard/EmptyState";
import { db } from "~/server/db";

async function getWorkflows(userId: string) {
  return await db.workflow.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null; // Or redirect
  }

  const workflows = await getWorkflows(userId);

  console.log(workflows)

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader workflows={workflows} />
      <div className="flex flex-1 flex-col pt-20 pb-12 w-full">
        <div className="mx-auto w-full max-w-7xl px-6">
           <EmptyState workflows={workflows} />
        </div>
      </div>
    </main>
  );
}
