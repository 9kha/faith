import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="px-4 py-8 md:px-8 lg:px-12">
        {/* Top section: company info + contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                ChannelPartner Pro
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-6 max-w-xs">
              Independent channel partner helping you buy, rent, and invest in
              properties across Central India. RERA compliant, transparent, and
              customer-first.
            </p>
            <div className="flex gap-4">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com" label="Twitter">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6 0a2.78 2.78 0 001.94-2A29 29 0 0023 11.75a29 29 0 00.46-5.33A2.78 2.78 0 0022.54 6.42z" />
                  <polyline points="10 15 15 12 10 9" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-primary" />
                <span>+91 98765 43210 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <a href="mailto:sales@channelpartner.example.com" className="hover:text-primary transition-colors">
                  sales@channelpartner.example.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-primary" />
                <span>123, Scheme 54, Vijay Nagar, Indore, MP 452010</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-primary" />
                <span>Mon–Sat: 10:00 AM – 7:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/buy" className="hover:text-primary transition-colors">
                  Buy Properties
                </Link>
              </li>
              <li>
                <Link href="/rent" className="hover:text-primary transition-colors">
                  Rent Properties
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors">
                  New Projects
                </Link>
              </li>
              <li>
                <Link href="/builders" className="hover:text-primary transition-colors">
                  Builders
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/emi-calculator" className="hover:text-primary transition-colors">
                  EMI Calculator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/partner-program" className="hover:text-primary transition-colors">
                  Partner Program
                </Link>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: copyright + powered by */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ChannelPartner Pro. All rights reserved.</p>
          <p>
            RERA Registered Real Estate Channel Partner
            <span className="ml-1">·</span>
            <a href="#" className="hover:text-primary transition-colors">
              Verify RERA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white text-sm hover:bg-primary transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}
