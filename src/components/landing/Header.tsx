import Link from "next/link";
import { Button } from "~/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="relative flex size-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
             <div className="absolute inset-0 bg-black/20" />
             <div className="z-10 h-4 w-4 rounded-full bg-white/90 shadow-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Weavy</span>
        </Link>
      </div>

      <nav className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-black transition-transform hover:scale-105 hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              Start Now
            </Button>
          </SignUpButton>
        </SignedOut>
        
        <SignedIn>
          <Button variant="ghost" asChild className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 mr-2">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "size-9 border-2 border-white/10"
              }
            }}
          />
        </SignedIn>
      </nav>
    </header>
  );
}
