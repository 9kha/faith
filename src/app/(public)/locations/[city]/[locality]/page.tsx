import type { ButtonHTMLAttributes, ElementType, HTMLAttributes } from "react";
import type { Property } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Home, MapPin } from "lucide-react";
import { getPrimaryImages } from "@/lib/media";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; locality: string }>;
}): Promise<Metadata> {
  const { city, locality } = await params;
  const cityName = city.replace(/-/g, " ");
  const localityName = locality.replace(/-/g, " ");

  return {
    title: `Flats for Sale in ${localityName}, ${cityName} | Faith Venture Realty`,
    description: `Find the best flats for sale in ${localityName}, ${cityName}. Verified listings, best prices, RERA registered builders.`,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ city: string; locality: string }>;
}) {
  const { city, locality } = await params;
  const cityName = city.replace(/-/g, " ");
  const localityName = locality.replace(/-/g, " ");

  const properties = await db.property.findMany({
    where: {
      deletedAt: null,
      status: "AVAILABLE",
      city: cityName,
      locality: localityName,
    },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      builder: { select: { name: true, slug: true } },
    },
  });

  if (properties.length === 0 && !cityName) {
    notFound();
  }

  const propertyImages = await getPrimaryImages(
    "Property",
    properties.map((p) => p.id)
  );

  const avgPrice = properties.length > 0
    ? Math.round(
        properties.reduce((sum, p) => sum + (p.price || 0), 0) /
          properties.length /
          100000
      )
    : 0;

  return (
    <div className="space-y-0">
      <LocationHero city={cityName} locality={localityName} avgPrice={avgPrice} />
      <LocationProperties
        properties={properties}
        images={propertyImages}
        city={cityName}
        locality={localityName}
      />
      <LocationInfo city={cityName} locality={localityName} />
    </div>
  );
}

function LocationHero({
  city,
  locality,
  avgPrice,
}: {
  city: string;
  locality: string;
  avgPrice: number;
}) {
  return (
    <section className="relative bg-background border-b border-border py-16 lg:py-24 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            {city}, {locality}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight mb-6 leading-tight">
            Flats for Sale in <span className="text-primary">{`${locality}, ${city}`}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Find verified flats and apartments for sale in {locality}, {city}.
            RERA registered builders, transparent pricing, and expert guidance.
            {avgPrice > 0 ? ` Average price: ₹${avgPrice} Cr` : ""}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="px-8 py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/buy">
                <Home className="mr-2 h-4 w-4" />
                Search Properties
              </Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted">
              <a href="tel:+919876543210" className="flex items-center gap-2">
                <PhoneSVG className="h-4 w-4" />
                Call Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
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
  void variant;
  void size;
  const Comp: ElementType = asChild ? "span" : "button";
  return (
    <Comp className={`inline-flex items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${className}`} {...(props as HTMLAttributes<HTMLElement>)}>
      {children}
    </Comp>
  );
}

function PhoneSVG({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function LocationProperties({
  properties,
  images,
  city,
  locality,
}: {
  properties: Property[];
  images: Map<string, string>;
  city: string;
  locality: string;
}) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
              Properties in {locality}, {city}
            </h2>
            <p className="text-gray-600 mt-1">
              {properties.length} property(ies) available
            </p>
          </div>
          <Link href="/buy" className="text-sm font-medium text-primary hover:underline">
            View all in {city} <span className="ml-1">→</span>
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No properties available in {locality}, {city} at the moment.</p>
            <p className="mt-2">Check back soon or explore other locations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} image={images.get(p.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PropertyCard({
  property,
  image,
}: {
  property: Property;
  image?: string;
}) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image || "/images/property-1.jpg"}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <span className="absolute top-2 right-2 px-2 py-1 rounded bg-green-900 text-white text-xs font-medium">
          Available
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{property.bhk || "N/A"} • {property.area || "N/A"} sq ft</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-bold text-gray-900 text-lg">
            ₹{property.price ? (property.price / 10000000).toFixed(1) : 0}Cr
          </span>
        </div>
      </div>
    </Link>
  );
}

function LocationInfo({ city, locality }: { city: string; locality: string }) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">About {locality}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {locality} is a prominent residential locality in {city}, known for its excellent connectivity, social infrastructure, and real estate growth potential.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Why Invest Here?</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                Good connectivity to city center
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                Schools, hospitals, and markets nearby
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                RERA registered projects
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                Good appreciation potential
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Nearby Localities</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href={`/locations/${city.toLowerCase().replace(/\s+/g, "-")}/other`} className="hover:text-primary transition-colors">
                  Explore more in {city}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
