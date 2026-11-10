import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Award,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const SHOW_FOUNDER_INSTAGRAM = false; // Hidden per user request; enable when ready

export function FounderSpotlightSection({ whatsapp = "+91 98765 43210" }: { whatsapp?: string }) {
  const cleanPhone = whatsapp.replace(/\D/g, "");
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28 border-b border-border transition-colors">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Leadership & Vision
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Where Faith Meets the{" "}
            <span className="gradient-heading">Right Investment</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Smart investment decisions backed by trusted guidance, ground-level market intelligence,
            and unmatched integrity across Raipur, Naya Raipur & Central India.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Founder Portrait & Badge Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary/30 via-amber-500/20 to-primary/10 blur-xl opacity-75" />

              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-2xl">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/40">
                  <Image
                    src="/images/founder-portrait.png"
                    alt="Amit Singh - Founder of Faith Venture Realty"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
                    className="object-cover object-top transition duration-500 hover:scale-[1.02]"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Overlaid Badges */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                      <Award className="h-3.5 w-3.5" />
                      Founder – Faith Venture Realty
                    </div>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                      Amit Singh
                    </h3>
                    <p className="text-xs text-white/80">
                      Real Estate Strategist • Investment Advisor
                    </p>
                  </div>
                </div>

                {/* Executive Strip under image */}
                {SHOW_FOUNDER_INSTAGRAM ? (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">Instagram Updates</p>
                        <p className="text-muted-foreground">@justbelieve_7</p>
                      </div>
                    </div>
                    <a
                      href="https://www.instagram.com/justbelieve_7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                    >
                      Follow
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">Founder & Managing Director</p>
                        <p className="text-muted-foreground">Raipur • Naya Raipur & Central India</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Direct Advisory Desk
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Founder's Story & Strategic Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="text-4xl text-primary font-serif font-black leading-none block select-none">
                &ldquo;
              </span>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground -mt-3 italic">
                Real estate is never just about square feet and concrete; it is about protecting your hard-earned wealth and securing your family&apos;s future. At Faith Venture Realty, our word is our bond.
              </p>
              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amit Singh · Founder Desk
                </span>
              </div>
            </div>

            {/* 3 Core Verticals */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Investment Guidance
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  High-appreciation opportunities mapped across Raipur, Naya Raipur & Central India.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Property Updates
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Unbiased ground reality inspections, RERA compliance checks, and legal verification.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                  <Building2 className="h-5 w-5" />
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Builder Direct Access
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Direct official inventory pricing with 100% price transparency & zero hidden markups.
                </p>
              </div>
            </div>

            {/* Key Assurance Points */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Why Central India Trusts Faith Venture Realty
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Personalized portfolio advisory directly by Amit Singh</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Complimentary VIP AC Site Visit chauffeur assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Direct official builder pricing — transparent and verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>End-to-end legal title checks & banking loan tie-ups</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition"
              >
                Schedule Consultation with Founder
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${cleanPhone || "919876543210"}?text=Hello%20Amit%20ji%2C%20I%20would%20like%20to%20consult%20regarding%20property%20investment%20in%20Raipur%20%2F%20Naya%20Raipur.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Direct Desk
              </a>
              {SHOW_FOUNDER_INSTAGRAM && (
                <a
                  href="https://www.instagram.com/justbelieve_7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  <svg
                    className="h-4 w-4 text-pink-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>@justbelieve_7</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
