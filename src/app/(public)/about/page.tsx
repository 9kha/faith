import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
  MapPin,
  Shield,
  Star,
  ArrowRight,
  Heart,
  Handshake,
  Eye,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Us — Faith Venture Realty | Trusted Real Estate Partner",
  description:
    "10+ years of experience helping families find their dream homes in Central India. RERA verified, transparent pricing, complete support.",
};

const stats = [
  { label: "Happy Families", value: "5000+", icon: Heart },
  { label: "Years Experience", value: "10+", icon: Award },
  { label: "Builder Partners", value: "50+", icon: Handshake },
  { label: "Cities Covered", value: "15+", icon: MapPin },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Every listing is RERA-verified. We share all property details upfront—no hidden charges, no fake listings.",
  },
  {
    icon: Eye,
    title: "Expert Guidance",
    desc: "Our team has deep knowledge of Central India's real estate market, ensuring you make the best investment decisions.",
  },
  {
    icon: TrendingUp,
    title: "Best Value",
    desc: "Direct builder pricing with complete transparency. We negotiate on your behalf to get you the best deal possible.",
  },
  {
    icon: Users,
    title: "Customer First",
    desc: "From your first inquiry to registry—we're with you at every step, making the process smooth and stress-free.",
  },
];

const team = [
  {
    name: "Amit Singh",
    role: "Founder – Faith Venture Realty",
    dept: "Executive Leadership & Strategy",
    exp: "10+ Years Advisory",
    image: "/images/founder-portrait.png",
    specialties: ["Strategic Growth Corridors", "Builder Alliances", "Investment Advisory"],
  },
  {
    name: "Priya Patel",
    role: "Head of Residential & Acquisitions",
    dept: "Client Advisory & Portfolio",
    exp: "10+ Years Experience",
    specialties: ["Luxury Villas & High-Rise", "Builder Negotiations", "Market Due Diligence"],
  },
  {
    name: "Adv. Amit Verma",
    role: "Head of Legal & Title Due Diligence",
    dept: "Legal & RERA Compliance",
    exp: "12+ Years Experience",
    specialties: ["RERA Title Clearance", "Registry Documentation", "Banking Sanctions"],
  },
  {
    name: "Sunita Joshi",
    role: "Director of VIP Client Experience",
    dept: "Client Relations & NRI Desk",
    exp: "8+ Years Experience",
    specialties: ["NRI Investment Desk", "Chauffeur Site Visits", "After-Sales Care"],
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative mesh-bg grid-overlay overflow-hidden pb-20 pt-24 lg:pb-28 lg:pt-32">
        <div className="container-page relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Award className="h-4 w-4" />
            RERA Registered Real Estate Advisory
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Trusted Real Estate{" "}
            <span className="gradient-heading">Partner Since 2014</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We&apos;ve helped over 5,000 families find their dream homes across
            Central India. RERA-verified listings, transparent pricing, and
            genuine end-to-end support.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-background py-16 border-b border-border transition-colors">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {s.value}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-muted/30 py-16 lg:py-24 transition-colors">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div
                className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 60%, #020617) 100%)",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-white">
                  <Building2 className="h-20 w-20 text-white/80" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">Faith Venture Realty</p>
                    <p className="mt-1 text-white/80">
                      Established 2014 · Indore, MP
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["RERA Reg.", "ISO Certified", "Award Winning"].map(
                      (badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                        >
                          {badge}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">
                    4.9/5
                  </span>
                  <span className="text-xs text-muted-foreground">
                    from 1200+ reviews
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Our Story
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                Who We Are
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-justify">
                Faith Venture Realty started in 2014 with a simple mission: make
                property buying transparent and hassle-free for every Indian
                family. Founded in Indore, we have grown to serve customers
                across Central India.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed text-justify">
                We work directly with RERA-registered builders to bring you
                genuine listings at builder-direct prices. No middlemen, no
                inflated quotes—just honest advice and genuine support from
                inquiry to registry.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "RERA-registered real estate advisory",
                  "Direct builder pricing with complete transparency",
                  "Legal and loan assistance included",
                  "Dedicated relationship manager",
                  "Site visit coordination & follow-up",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground transition shadow-md"
              >
                Talk to Our Team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-16 lg:py-24 border-b border-border transition-colors">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Our Values
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Why Clients Choose Us
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our core principles guide every interaction and decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Vision */}
      <section className="bg-background py-16 lg:py-24 border-b border-border transition-colors">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary/30 to-amber-500/20 blur-xl opacity-75" />
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-2xl">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src="/images/founder-portrait.png"
                      alt="Amit Singh - Founder of Faith Venture Realty"
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                        <Award className="h-3.5 w-3.5" /> Founder & Visionary
                      </span>
                      <h3 className="mt-2 text-2xl font-bold text-white">Amit Singh</h3>
                      <p className="text-xs text-white/80">Founder – Faith Venture Realty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Founder&apos;s Vision
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                &ldquo;Where Faith Meets the Right Investment&rdquo;
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
                &ldquo;When I founded Faith Venture Realty, my goal was clear: give property seekers and investors the honest, unvarnished truth. In an industry often clouded by false promises, we wanted Faith Venture to be the benchmark for integrity, legal transparency, and genuine guidance.&rdquo;
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Under Amit Singh&apos;s leadership, Faith Venture Realty has grown into a trusted real estate advisory firm, guiding over 5,000 families and corporate investors into prime residential, commercial, and township assets across Raipur, Naya Raipur, Indore, and Central India.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                >
                  Book Private Consultation <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  Explore Verified Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted/30 py-16 lg:py-24 transition-colors">
        <div className="container-page">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Users className="h-3.5 w-3.5" />
              Leadership & Advisory Team
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Experienced Professionals
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Dedicated real estate strategists, legal counsels, and relationship directors committed to your peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  {/* Avatar / Portrait Header */}
                  <div className="flex justify-center mb-5">
                    {"image" in member && member.image ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20 shadow-md">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="120px"
                          className="object-cover object-top transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent border border-primary/20 text-primary shadow-xs">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Name & Titles */}
                  <div className="text-center">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <div className="mt-1.5 flex justify-center">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {member.role}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      {member.dept}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {member.exp}
                    </p>
                  </div>

                  {/* Core Specialties */}
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                      Core Expertise
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="inline-block rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[10px] text-foreground/80"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3">
                  <Link
                    href="/contact"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 py-2 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
                  >
                    <span>Connect on Desk</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 lg:py-24 transition-colors">
        <div className="container-page">
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl md:p-14 border border-white/10"
            style={{
              background:
                "radial-gradient(ellipse 120% 120% at 30% -10%, color-mix(in srgb, var(--primary) 32%, #0b0f19) 0%, #080c14 100%)",
            }}
          >
            {/* Subtle luxury mesh grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            {/* Soft ambient glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full blur-3xl opacity-25"
              style={{ background: "var(--primary)" }}
            />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Private Real Estate Advisory
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-white">
                Ready to Find Your Dream Property?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85 text-sm sm:text-base leading-relaxed">
                Get transparent guidance from our verified advisory team — from shortlisting prime residential &amp; commercial assets to title vetting and final registry.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/buy"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition hover:opacity-95"
                  style={{ backgroundColor: "#ffffff", color: "#020617" }}
                >
                  Browse Properties
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Schedule Private Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
