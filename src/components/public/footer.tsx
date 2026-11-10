"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Home,
  ShieldCheck,
  Send,
  Building2,
  Heart,
} from "lucide-react";
import { defaultFooterConfig, type FooterConfig } from "@/lib/settings";

const quickLinks = [
  { label: "Buy Properties", href: "/buy" },
  { label: "Rent Properties", href: "/rent" },
  { label: "Featured Projects", href: "/projects" },
  { label: "Verified Builders", href: "/builders" },
  { label: "Real Estate Blog", href: "/blog" },
  { label: "EMI Calculator", href: "/emi-calculator" },
];

const propertyTypes = [
  { label: "Flats & Apartments", href: "/buy?category=FLAT" },
  { label: "Luxury Villas", href: "/buy?category=VILLA" },
  { label: "Residential Plots", href: "/buy?category=PLOT" },
  { label: "Commercial Shops", href: "/buy?category=SHOP" },
  { label: "Office Spaces", href: "/buy?category=OFFICE" },
  { label: "Ready to Move", href: "/buy?status=AVAILABLE" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Partner Program", href: "/partner-program" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export function PublicFooter({ initialConfig }: { initialConfig?: FooterConfig }) {
  const [config, setConfig] = useState<FooterConfig>(initialConfig || defaultFooterConfig);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (initialConfig) setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<Partial<FooterConfig>>) => {
      if (e.detail) {
        setConfig((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("footer-config-updated" as any, handleUpdate as any);
    return () => window.removeEventListener("footer-config-updated" as any, handleUpdate as any);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card text-foreground transition-colors">
      {/* Top Newsletter & Assistance Strip */}
      {config.showNewsletter && (
        <div className="border-b border-border bg-muted/30 py-10 transition-colors">
          <div className="container-page flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Mail className="h-3.5 w-3.5" /> Market Insights
              </span>
              <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                {config.newsletterHeading}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {config.newsletterSubheading}
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <span>Thank you for subscribing! We&apos;ll keep you posted.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full max-w-md items-center gap-2"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 cursor-pointer shadow-xs"
                >
                  <span>Subscribe</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="container-page py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {config.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logoUrl}
                  alt={config.brandName}
                  className="h-10 w-auto max-w-[170px] object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                  <Home size={20} />
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {config.brandName}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {config.tagline?.replace(/channelpartner\s*pro/gi, "Your Trusted Real Estate Partner")?.replace(/channelpartner/gi, "Faith Venture Realty")}
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {config.description?.replace(/channel\s*partner/gi, "real estate consultancy")}
            </p>

            {/* Trust Badges */}
            {config.showTrustBadges && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> {config.badge1Text}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Building2 className="h-3.5 w-3.5" /> {config.badge2Text}
                </span>
              </div>
            )}

            {/* Social Icons */}
            {config.showSocialLinks && (
              <div className="flex flex-wrap gap-2 pt-2">
                <SocialIcon href="https://www.instagram.com/justbelieve_7" label="Instagram (@justbelieve_7)">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </SocialIcon>
                <SocialIcon href="https://youtube.com/@faithventurerealty" label="YouTube">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6 0a2.78 2.78 0 001.94-2A29 29 0 0023 11.75a29 29 0 00.46-5.33A2.78 2.78 0 0022.54 6.42z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </SocialIcon>
                <SocialIcon href="https://facebook.com/faithventurerealty" label="Facebook">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </SocialIcon>
                <SocialIcon href="https://linkedin.com/company/faithventurerealty" label="LinkedIn">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </SocialIcon>
                <SocialIcon href="https://x.com/faithventure" label="X (Twitter)">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </SocialIcon>
                <SocialIcon href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} label="WhatsApp Channel">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </SocialIcon>
              </div>
            )}
          </div>

          {/* Quick Links */}
          {config.showQuickLinks && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Explore Properties
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition hover:text-foreground hover:translate-x-0.5 inline-block"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Property Categories */}
          {config.showPropertyTypes && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Property Categories
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {propertyTypes.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition hover:text-foreground hover:translate-x-0.5 inline-block"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company & Support */}
          {config.showCompanyLinks && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Company & Help
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {companyLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition hover:text-foreground hover:translate-x-0.5 inline-block"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-border">
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition hover:bg-emerald-600 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info Row */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Direct Helpline</p>
              <a href={`tel:${config.phone.replace(/\s+/g, "")}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                {config.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp Support</p>
              <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {config.whatsapp}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Email Inquiries</p>
              <a href={`mailto:${config.email}`} className="font-semibold text-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                {config.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Head Office</p>
              <p className="font-medium text-foreground text-xs leading-relaxed">
                {config.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            {config.copyright}
          </p>
          <p className="flex items-center gap-1.5">
            <span>RERA Reg: {config.reraNumber}</span>
            <span>·</span>
            <span>{config.bottomNote}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="grid size-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition hover:border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-2xs"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        aria-hidden="true"
      >
        {children}
      </svg>
    </a>
  );
}
