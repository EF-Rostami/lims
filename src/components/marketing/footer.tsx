import Link from "next/link";
import { Lock, Globe, Building2 } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-bold text-white">BLIMS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Laboratory Information Management System for accredited testing and calibration labs.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Live demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} BLIMS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> SSL Secured</div>
            <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global CDN</div>
            <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Multi-tenant</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
