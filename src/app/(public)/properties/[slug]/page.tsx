import type { ElementType, HTMLAttributes, ButtonHTMLAttributes } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  Home,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Car,
  Compass,
  ArrowRight,
  Calculator,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";
import { InquiryForm } from "@/components/public/inquiry-form";
import { FloatingCTA } from "@/components/public/floating-cta";
import { getEntityImages } from "@/lib/media";

type PropertyRecord = Prisma.PropertyGetPayload<{
  include: { builder: true; project: true };
}>;

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await db.property.findUnique({
    where: { slug, deletedAt: null },
    select: { title: true, locality: true, city: true },
  });
  if (!property) return { title: "Property Not Found — Faith Venture Realty" };
  return {
    title: `${property.title} in ${property.locality}, ${property.city} — Faith Venture Realty`,
    description: `Explore detailed floor plans, pricing, RERA verification, and schedule a VIP site visit for ${property.title}. RERA verified direct builder partner.`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await db.property.findUnique({
    where: { slug, deletedAt: null },
    include: {
      builder: true,
      project: true,
    },
  });

  if (!property) notFound();

  const isRent = property.listingType === "RENT";
  const priceDisplay = isRent
    ? `₹${((property.rent || 0)).toLocaleString("en-IN")}/mo`
    : property.price && property.price >= 10000000
    ? `₹${(property.price / 10000000).toFixed(2)} Cr`
    : property.price && property.price >= 100000
    ? `₹${(property.price / 100000).toFixed(1)} Lakh`
    : `₹${(property.price || 0).toLocaleString("en-IN")}`;

  const gallery = await getEntityImages("Property", property.id);
  const heroImage = gallery[0] || "/images/property-1.jpg";

  return (
    <div className="space-y-0 bg-background text-foreground transition-colors">
      <PropertyHeroGallery
        property={property}
        heroImage={heroImage}
        gallery={gallery}
      />
      <PropertyQuickFacts property={property} priceDisplay={priceDisplay} isRent={isRent} />

      {/* Main Content with Single Unified Sidebar Form */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: Property Details */}
            <div className="space-y-10 lg:col-span-8 2xl:col-span-9">
              <PropertyOverview property={property} />
              <PropertyAmenities />
              <PropertyEMISection property={property} isRent={isRent} />
              <PropertyLocationConnectivity property={property} />
              <PropertyBuilderCard property={property} />
            </div>

            {/* Right Column: Sticky Single High-Converting Inquiry Form */}
            <div className="lg:col-span-4 2xl:col-span-3">
              <div className="sticky top-24 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-xl dark:shadow-slate-950/60 transition-colors">
                <div className="mb-5 flex items-center justify-between border-b border-border dark:border-slate-800 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <Sparkles className="h-3 w-3" /> Direct Builder Desk
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-foreground">
                      Book Visit & Enquire
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">Offered at</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{priceDisplay}</p>
                  </div>
                </div>

                {/* Single unified enquiry form without duplication */}
                <InquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  propertyPrice={priceDisplay}
                  builderName={property.builder?.name}
                  prefillMessage={`Hello, I want complete details and a site visit slot for ${property.title}.`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileStickyBar property={property} priceDisplay={priceDisplay} />
      <FloatingCTA propertyTitle={property.title} />
    </div>
  );
}

function PropertyHeroGallery({
  property,
  heroImage,
  gallery,
}: {
  property: PropertyRecord;
  heroImage: string;
  gallery: string[];
}) {
  return (
    <section className="relative bg-slate-950 text-white">
      <div className="relative h-[440px] md:h-[540px] lg:h-[620px] overflow-hidden">
        <Image
          src={heroImage}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1400px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-[1720px]">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-md bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur">
                {property.listingType === "RENT" ? "For Rent" : "For Sale"}
              </span>
              <span className="rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {property.category}
              </span>
              {property.verified && (
                <span className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {property.featured && (
                <span className="rounded-md bg-amber-400 text-amber-950 px-3 py-1 text-xs font-bold">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>
                  {property.locality}, {property.city}
                </span>
              </div>
              {property.builder && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>By {property.builder.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-400" />
                <a href="tel:+919876543210" className="hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Gallery Thumbnail preview strip */}
            {gallery.length > 1 && (
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {gallery.slice(0, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-white/40 shadow-sm"
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyQuickFacts({
  property,
  priceDisplay,
  isRent,
}: {
  property: PropertyRecord;
  priceDisplay: string;
  isRent: boolean;
}) {
  return (
    <section className="border-b border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 py-5 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <div className="rounded-xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/50 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              {isRent ? "Monthly Rent" : "Asking Price"}
            </p>
            <p className="mt-0.5 text-lg font-bold text-blue-600 dark:text-blue-400">
              {priceDisplay}
            </p>
          </div>
          <div className="rounded-xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/50 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">Configuration</p>
            <p className="mt-0.5 text-lg font-bold text-foreground">
              {property.bhk || "Independent"}
            </p>
          </div>
          <div className="rounded-xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/50 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">Super Built-up Area</p>
            <p className="mt-0.5 text-lg font-bold text-foreground">
              {property.area ? `${property.area} sq ft` : "Contact for Area"}
            </p>
          </div>
          <div className="rounded-xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/50 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">Furnishing & Baths</p>
            <p className="mt-0.5 text-lg font-bold text-foreground">
              {property.baths ? `${property.baths} Baths` : "2+ Baths"} ·{" "}
              {property.furnishing || "Semi"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyOverview({ property }: { property: PropertyRecord }) {
  const specs = [
    { label: "Listing Type", value: property.listingType === "RENT" ? "Rental" : "Outright Sale" },
    { label: "Property Type", value: property.category },
    { label: "Configuration", value: property.bhk || "Multi-unit" },
    { label: "Bathrooms", value: property.baths ? `${property.baths} Attached` : "2 Baths" },
    { label: "Super Area", value: property.area ? `${property.area} sq ft` : "On Request" },
    { label: "Furnishing Status", value: property.furnishing || "Semi-Furnished" },
    { label: "Facing", value: property.facing || "North-East (Vaastu Compliant)" },
    { label: "Property Age", value: property.ageYears ? `${property.ageYears} Years` : "Brand New Launch" },
    { label: "Possession Status", value: property.status || "Ready to Move" },
    { label: "Water Supply", value: "24/7 Narmada + Borewell" },
  ];

  return (
    <div className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Property Overview & Highlights
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground text-justify">
        {property.description ||
          "This premium residence has been curated for families looking for superior quality construction, abundance of natural light, excellent cross ventilation, and prime connectivity in Central India."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-8">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-dashed border-border dark:border-slate-800 py-2.5 text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyAmenities() {
  const amenities = [
    { name: "24/7 Security & CCTV", icon: ShieldCheck },
    { name: "Clubhouse & Gym", icon: Building2 },
    { name: "Covered Car Parking", icon: Car },
    { name: "100% Power Backup", icon: Sparkles },
    { name: "Vaastu Compliant Layout", icon: Compass },
    { name: "High Speed Lifts", icon: ArrowRight },
    { name: "Children Play Area", icon: Home },
    { name: "Landscaped Gardens", icon: CheckCircle2 },
  ];

  return (
    <div className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 md:p-8 shadow-sm">
      <h3 className="text-xl font-bold text-foreground">
        Amenities & Features
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        All essential lifestyle amenities verified for ready possession.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {amenities.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border dark:border-slate-800 bg-muted/30 dark:bg-slate-800/40 p-3.5 transition-colors hover:border-primary/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <a.icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium text-foreground">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyEMISection({
  property,
  isRent,
}: {
  property: PropertyRecord;
  isRent: boolean;
}) {
  const price = property.price || 4500000;
  // Standard 20-year loan calculation at 8.5% on 80% loan amount
  const loanAmount = price * 0.8;
  const monthlyRate = 0.085 / 12;
  const tenureMonths = 240;
  const emiEstimate = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return (
    <div className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <Calculator className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Financial Advisory
        </span>
      </div>
      <h3 className="mt-2 text-xl font-bold text-foreground">
        {isRent ? "Rental ROI & Lease Advisory" : "Home Loan & EMI Estimate"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {isRent
          ? "Standard 11-month registered lease agreement assistance with 2 months security deposit."
          : "Pre-approved home loans available from SBI, HDFC Bank, ICICI Bank, and Axis Bank with zero processing fee."}
      </p>

      {!isRent && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-4">
            <span className="text-xs text-muted-foreground">Estimated Monthly EMI</span>
            <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹{emiEstimate.toLocaleString("en-IN")}/mo*
            </p>
            <span className="text-[11px] text-muted-foreground">@ 8.50% interest for 20 yrs</span>
          </div>
          <div className="rounded-2xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-4">
            <span className="text-xs text-muted-foreground">Max Loan Eligibility</span>
            <p className="mt-1 text-2xl font-black text-foreground">
              Up to 80%
            </p>
            <span className="text-[11px] text-muted-foreground">₹{(loanAmount / 100000).toFixed(1)} Lakh approx.</span>
          </div>
          <div className="rounded-2xl border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 p-4">
            <span className="text-xs text-muted-foreground">Direct Assistance</span>
            <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
              Doorstep Loan Desk
            </p>
            <span className="text-[11px] text-muted-foreground">No extra charges for buyers</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyLocationConnectivity({
  property,
}: {
  property: PropertyRecord;
}) {
  const routes = [
    { place: "Nearest Metro / Bus Rapid Transit (BRTS)", time: "3 mins" },
    { place: "Top International Schools (DPS / Emerald)", time: "8 mins" },
    { place: "Major Hospitals (Medanta / Bombay Hospital)", time: "10 mins" },
    { place: "IT Park & Commercial Business District", time: "12 mins" },
    { place: "Devi Ahilya Bai Holkar International Airport", time: "25 mins" },
  ];

  return (
    <div className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <MapPin className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Connectivity & Neighbourhood
        </span>
      </div>
      <h3 className="mt-2 text-xl font-bold text-foreground">
        Strategic Location in {property.locality}, {property.city}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Central India&apos;s fastest growing residential corridor with robust physical and social infrastructure.
      </p>

      <div className="mt-6 space-y-3">
        {routes.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border dark:border-slate-800 bg-muted/30 dark:bg-slate-800/40 px-4 py-3"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{r.place}</span>
            </div>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              {r.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyBuilderCard({ property }: { property: PropertyRecord }) {
  return (
    <div className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Building2 className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">
              {property.builder?.name || "Verified Developer"}
            </h3>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              RERA Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            RERA ID: {property.builder?.reraNo || "P-IND-24-9843"} · Direct Authorized Builder Relationship
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {property.builder?.about ||
              "Reputed developer known for uncompromising engineering standards, on-time possession track record, and prime land selection in Central India."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {property.builder?.slug && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/builders/${property.builder.slug}`}>
                  View All Builder Projects
                </Link>
              </Button>
            )}
            <Button asChild size="sm">
              <a href="tel:+919876543210">Speak with Relationship Desk</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStickyBar({
  property,
  priceDisplay,
}: {
  property: PropertyRecord;
  priceDisplay: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border dark:border-slate-800 bg-card/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Price</p>
          <p className="text-base font-black text-blue-600 dark:text-blue-400">{priceDisplay}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:+919876543210"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border dark:border-slate-800 bg-muted/60 text-foreground"
            aria-label="Call Now"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I am interested in ${property.title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Button({
  children,
  className,
  asChild,
  variant = "default",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: string;
  size?: string;
}) {
  const Comp: ElementType = asChild ? "span" : "button";
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none";
  const sizeClasses =
    size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const variantClasses =
    variant === "outline"
      ? "border border-border dark:border-slate-800 bg-transparent text-foreground hover:bg-muted dark:hover:bg-slate-800"
      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow";

  return (
    <Comp
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className || ""}`}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Comp>
  );
}
