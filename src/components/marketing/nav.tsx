import Link from "next/link";
import { Play } from "lucide-react";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">BLIMS</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-gray-900 transition-colors">How it works</Link>
          <Link href="/#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign in
          </Link>
          <Link
            href="/demo"
            className="hidden sm:flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            <Play className="w-3 h-3 fill-blue-600" /> Live demo
          </Link>
          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
