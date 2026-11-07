import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, MapPin, Calendar, Home } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Property - ChannelPartner Pro",
  description: "Explore this property in detail.",
};

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

  const priceDisplay = property.listingType === "RENT"
    ? `₹${(property.rent || 0) / 100000}/mo`
    : `₹${(property.price || 0) / 10000000}Cr`;

  return (
    <div className="space-y-0">
      <PropertyHeroGallery property={property} />
      <PropertyQuickFacts property={property} priceDisplay={priceDisplay} />
      <PropertyOverview property={property} />
      <PropertyLocation property={property} />
      <PropertyBuilderCard property={property} />
      <MobileStickyBar property={property} />
    </div>
  );
}

function PropertyHeroGallery({ property }: { property: any }) {
  return (
    <section className="relative bg-gray-50">
      <div className="relative h-[500px] lg:h-[700px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1502672260266-1c1ef1d8837f?w=1200&h=700&fit=crop"
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded bg-black/50 text-white text-xs font-medium">
              {property.listingType === "RENT" ? "For Rent" : "For Sale"}
            </span>
            <span className="px-3 py-1 rounded bg-black/50 text-white text-xs font-medium">
              {property.category}
            </span>
            {property.verified && (
              <span className="px-3 py-1 rounded bg-green-500 text-black text-xs font-medium">
                Verified
              </span>
            )}
            {property.featured && (
              <span className="px-3 py-1 rounded bg-yellow-500 text-black text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            {property.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-200">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{property.city}, {property.locality}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyQuickFacts({
  property,
  priceDisplay,
}: {
  property: any;
  priceDisplay: string;
}) {
  return (
    <section className="bg-white border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sticky top-[80px] z-20 bg-white/95 backdrop-blur">
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Price / Rent</p>
            <p className="font-bold text-gray-900">{priceDisplay}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Configuration</p>
            <p className="font-bold text-gray-900">{property.bhk || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Area</p>
            <p className="font-bold text-gray-900">
              {property.area ? `${property.area} sq ft` : "N/A"}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Baths</p>
            <p className="font-bold text-gray-900">{property.baths || "N/A"}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/contact">Schedule Site Visit</Link>
          </Button>
          <Button asChild className="flex-1">
            <a href="https://wa.me/919876543210?text=Hi, I'm interested in {property.title}" target="_blank" rel="noopener noreferrer">
              WhatsApp Us
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/properties/${slug}`}>Share</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PropertyOverview({ property }: { property: any }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {property.description || "A well-maintained property in a prime location with excellent connectivity and amenities."}
            </p>
            <div className="space-y-4">
              {[
                { label: "Listing Type", value: property.listingType },
                { label: "Category", value: property.category },
                { label: "BHK", value: property.bhk || "N/A" },
                { label: "Baths", value: property.baths || "N/A" },
                { label: "Area", value: property.area ? `${property.area} sq ft` : "N/A" },
                { label: "Furnishing", value: property.furnishing || "Unfurnished" },
                { label: "Facing", value: property.facing || "N/A" },
                { label: "Age", value: property.ageYears ? `${property.ageYears} years` : "N/A" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 sticky top-[100px]">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Enquiry</h3>
              <form className="space-y-3">
                <input type="text" placeholder="Full Name" className="w-full px-3 py-2 rounded border border-input" />
                <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 rounded border border-input" />
                <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded border border-input" />
                <button className="w-full py-2 rounded bg-primary text-white font-medium">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyLocation({ property }: { property: any }) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Location Map
        </h2>
        <div className="h-[500px] rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <MapPin className="h-24 w-24 text-gray-300" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyBuilderCard({ property }: { property: any }) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Home className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {property.builder?.name || "Builder Name"}
            </h3>
            <p className="text-sm text-gray-500">{property.builder?.reraNo || "RERA Registered"}</p>
            <div className="mt-4 flex gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href={`/builders/${property.builder?.slug || ""}`}>View Builder Profile</Link>
              </Button>
              <Button asChild size="sm">
                <a href="tel:+919876543210">Contact Builder</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileStickyBar({ property }: { property: any }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        <button className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-primary">
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-primary">
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-primary">
          <Calendar className="h-4 w-4" />
          <span>Site Visit</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-primary bg-primary text-white rounded-lg">
          <Share2 className="h-4 w-4" />
          <span>Enquire</span>
        </button>
      </div>
    </div>
  );
}

function Button({ children, className, asChild, variant = "default", ...props }: any) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp className={`inline-flex items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${className}`} {...props} asChild={asChild}>
      {children}
    </Comp>
  );
}

function Share2() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}
