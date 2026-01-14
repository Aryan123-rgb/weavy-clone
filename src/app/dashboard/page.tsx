import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4 text-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the protected dashboard!</p>
      <UserButton />
    </div>
  );
}
