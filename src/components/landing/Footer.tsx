import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-10 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[1fr_200px_200px_200px]">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-md bg-white" />
               <span className="text-xl font-bold">Weavy</span>
            </Link>
            <p className="max-w-xs text-sm text-gray-400">
              Artificial Intelligence + Human Creativity.
              <br />
              The complete platform for professional AI generation.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Instagram} href="#" />
            </div>
            
            <div className="mt-8 inline-block rounded border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
               SOC 2 Type II Certified
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-6 font-semibold">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">Models</Link></li>
              <li><Link href="#" className="hover:text-white">Workflows</Link></li>
              <li><Link href="#" className="hover:text-white">Tools</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white">Enterprise</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-6 font-semibold">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white">API Reference</Link></li>
              <li><Link href="#" className="hover:text-white">Community</Link></li>
              <li><Link href="#" className="hover:text-white">Showcase</Link></li>
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="mb-6 font-semibold">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-8 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Weavy AI Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
  return (
    <Link href={href} className="text-gray-400 transition-colors hover:text-white">
      <Icon className="h-5 w-5" />
    </Link>
  );
}
