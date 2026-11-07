import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowRight, MapPin, Star, ShieldCheck, Home, Building2, Phone, DollarSign } from "lucide-react";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata = {
  title: "Home - ChannelPartner Pro",
  description: "Find your dream home with ChannelPartner Pro. Buy, rent, and invest in properties across Central India.",
};

async function getFeaturedProjects() {
  return db.project.findMany({
    where: { deletedAt: null, featured: true, status: { not: "ARCHIVED" as any } },
    include: {
      builder: { select: { name: true, slug: true } },
      _count: { select: { units: true } },
    },
    take: 6,
    orderBy: { sortOrder: "asc" },
  });
}

async function getFeaturedProperties() {
  return db.property.findMany({
    where: { deletedAt: null, featured: true, status: "AVAILABLE" },
    include: {
      builder: { select: { name: true, slug: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getFeaturedBuilders() {
  return db.builder.findMany({
    where: { deletedAt: null, status: "active", featured: true },
    take: 6,
    orderBy: { sortOrder: "asc" },
  });
}

async function getTestimonials() {
  return db.testimonial.findMany({
    where: { featured: true, status: "active" },
    take: 6,
    orderBy: { sortOrder: "asc" },
  });
}

async function getRecentBlog() {
  return db.blogPost.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });
}

type ProjectWithBuilder = Awaited<ReturnType<typeof getFeaturedProjects>>[number];

export default function HomePage() {
  // This is a server component - data fetched at build time / ISR
  // In production, data would come from Puck content JSON stored in Page/Setting
  // For now we fetch directly from DB for demo content
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturedProjectsSection />
      <FeaturedPropertiesSection />
      <BuildersStripSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <LatestBlogSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            RERA Registered • Verified Builders Only
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight mb-6 leading-tight">
            Find Your Dream Home in<span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{' '}</span>
            Central India
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Premium residential and commercial properties from trusted builders.
            Transparent pricing, zero hidden charges, and end-to-end support from
            search to registry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button
              asChild
              className="w-full sm:w-auto px-8 py-3 text-lg bg-white text-gray-900 hover:bg-gray-100"
            >
              <Link href="/buy">
                <Home className="mr-2 h-5 w-5" />
                Buy a Property
              </Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto px-8 py-3 text-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/rent">
                <Home className="mr-2 h-5 w-5" />
                Rent a Property
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectsSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Featured Projects</h2>
            <p className="text-gray-600 mt-2">New launches and ready-to-move-in homes</p>
          </div>
          <Link href="/projects" className="text-sm font-medium text-primary hover:underline">
            View all projects <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Shree Green Valley",
              builder: "Shree Constructions",
              location: "Vijay Nagar, Indore",
              price: "₹4.5 Cr",
              bhk: "2 & 3 BHK",
              status: "New Launch",
              image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
            },
            {
              name: "Green Valley Towers",
              builder: "Shree Constructions",
              location: "Bhawarkua, Indore",
              price: "₹6.2 Cr",
              bhk: "3 & 4 BHK",
              status: "Under Construction",
              image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
            },
            {
              name: "Sunshine Plots",
              builder: "Sunshine Realty",
              location: "Rau, Indore",
              price: "₹25 Lakhs",
              bhk: "Plots",
              status: "Ready to Move",
              image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
            },
          ].map((p) => (
            <ProjectCard key={p.name} project={p as any} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link
      href={`/projects/${project.slug || project.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <span className="absolute top-2 right-2 px-2 py-1 rounded bg-green-900 text-white text-xs font-medium">
          {project.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{project.builder}</p>
        <p className="text-xs text-gray-400 mt-1">
          <MapPin className="h-3 w-3 mr-1" /> {project.location}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900">{project.price}</span>
          </div>
          <span className="text-xs font-medium text-gray-600">{project.bhk}</span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedPropertiesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Featured Properties
          </h2>
          <Link href="/buy" className="text-sm font-medium text-primary hover:underline">
            View all properties <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "3 BHK Luxury Flat",
              location: "Vijay Nagar, Indore",
              price: "₹85 Lakhs",
              bhk: "3 BHK",
              area: "1250 sq ft",
              image: "https://images.unsplash.com/photo-1502672260266-1c1ef1d8837f?w=600&h=400&fit=crop",
            },
            {
              title: "2 BHK Apartment",
              location: "Scheme 54, Indore",
              price: "₹18,000/mo",
              bhk: "2 BHK",
              area: "950 sq ft",
              image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
            },
          ].map((p, i) => (
            <PropertyCard key={i} property={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyCard({ property }: { property: any }) {
  return (
    <Link
      href="/properties/sample-property"
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
        <span className="absolute top-2 left-2 px-2 py-1 rounded bg-white/90 text-gray-900 text-xs font-medium backdrop-blur">
          {property.bhk}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{property.location}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span>{property.bhk}</span>
          <span>•</span>
          <span>{property.area}</span>
        </div>
        <div className="mt-4">
          <span className="font-bold text-gray-900 text-lg">{property.price}</span>
        </div>
      </div>
    </Link>
  );
}

function BuildersStripSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-10">
          Trusted Builders
        </h2>
        <div className="flex flex-wrap gap-8 justify-center items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {[
            "Shree Constructions",
            "Sunshine Realty",
            "Royal Developers",
            "Green City Builders",
            "Prestige Group",
            "OM Sai Builders",
          ].map((name, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border border-gray-200 rounded-lg hover:border-primary transition-colors min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Why Choose Us?
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Independent channel partner with deep market knowledge and builder
            relationships across Central India.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "RERA Verified",
              desc: "All projects and builders are RERA registered for your protection.",
              icon: ShieldCheck,
            },
            {
              title: "Best Prices",
              desc: "Direct builder pricing with no hidden charges or brokerage.",
              icon: DollarSign,
            },
            {
              title: "End-to-End Support",
              desc: "From site visit to registry, we handle every step for you.",
              icon: Star,
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <item.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Rajesh Kumar",
              role: "Home Buyer",
              content: "Found my dream 3 BHK in Vijay Nagar within a week. The process was smooth and transparent.",
              rating: 5,
            },
            {
              name: "Priya Sharma",
              role: "Investor",
              content: "Excellent service and genuine RERA-verified projects. Highly recommend ChannelPartner Pro.",
              rating: 5,
            },
            {
              name: "Amit Verma",
              role: "Tenant",
              content: "Rented a beautiful 2 BHK quickly. The team was professional and responsive throughout.",
              rating: 4,
            },
          ].map((t, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1 text-yellow-400 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className={star <= t.rating ? "fill-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                "{t.content}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-[10px] font-bold">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestBlogSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Latest from Our Blog
          </h2>
          <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
            Read all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Top 5 Localities for Investment in Indore 2025",
              excerpt: "Discover the best areas for property investment with high ROI potential.",
              date: "Nov 5, 2026",
              image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
            },
            {
              title: "RERA Explained: What Every Home Buyer Should Know",
              excerpt: "A complete guide to understanding RERA regulations and your rights.",
              date: "Oct 28, 2026",
              image: "https://images.unsplash.com/photo-1589829085413-5648f8af4f7a?w=600&h=400&fit=crop",
            },
            {
              title: "Home Loan vs Personal Loan: Which is Better?",
              excerpt: "Compare financing options for your property purchase.",
              date: "Oct 20, 2026",
              image: "https://images.unsplash.com/photo-1556740738-9a61f09a452f?w=600&h=400&fit=crop",
            },
          ].map((b, i) => (
            <article key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
              <div className="h-32 overflow-hidden">
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-primary font-medium mb-1">{b.date}</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {b.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Looking for Your Dream Home?
          </h2>
          <p className="text-primary-50 mb-8 max-w-md mx-auto">
            Get personalized property recommendations and expert guidance from
            our channel partner team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="px-8 py-3 text-lg bg-white text-primary hover:bg-gray-100"
            >
              <Link href="/buy">
                <Home className="mr-2 h-5 w-5" />
                Find Properties
              </Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-white text-white hover:bg-white/10"
            >
              <Phone className="mr-2 h-5 w-5" />
              +91 98765 43210
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Button({ children, className, asChild, ...props }: any) {
  const Comp = asChild ? Link : "button";
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
