import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Calendar, MessageCircle, Print, QrCode } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Project - ChannelPartner Pro",
  description: "Explore this project in detail.",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug, deletedAt: null },
    include: {
      builder: true,
      amenities: { include: { amenity: true } },
      units: {
        where: { deletedAt: null },
        take: 50,
        orderBy: [{ tower: { name: "asc" } }, { unitNo: "asc" }],
      },
    },
  });

  if (!project) notFound();

  const pricePerSqFt = project.priceMin && project.areaMin
    ? Math.round(project.priceMin / project.areaMin)
    : 0;

  return (
    <div className="space-y-0">
      <ProjectHeroGallery project={project} />
      <ProjectQuickFacts project={project} pricePerSqFt={pricePerSqFt} />
      <ProjectOverview project={project} />
      <ProjectConfigurations project={project} />
      <ProjectAmenities project={project} />
      <ProjectSpecifications project={project} />
      <ProjectLocation project={project} />
      <ProjectBuilderCard project={project} />
      <ProjectFaqs project={project} />
      <ProjectSimilar project={project} />
      <MobileStickyBar project={project} />
    </div>
  );
}

function ProjectHeroGallery({ project }: { project: any }) {
  return (
    <section className="relative bg-gray-50">
      <div className="relative h-[500px] lg:h-[700px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=700&fit=crop"
          alt={project.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded bg-primary text-white text-xs font-medium">
              {project.status}
            </span>
            <span className="px-3 py-1 rounded bg-black/50 text-white text-xs font-medium">
              RERA Registered
            </span>
            {project.featured && (
              <span className="px-3 py-1 rounded bg-yellow-500 text-black text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            {project.name}
          </h1>
          <div className="flex items-center gap-4 text-gray-200">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{project.city}, {project.locality}</span>
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

function ProjectQuickFacts({
  project,
  pricePerSqFt,
}: {
  project: any;
  pricePerSqFt: number;
}) {
  return (
    <section className="bg-white border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sticky top-[80px] z-20 bg-white/95 backdrop-blur">
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Price Range</p>
            <p className="font-bold text-gray-900">
              ₹{project.priceMin ? (project.priceMin / 10000000).toFixed(1) : 0}Cr - ₹{project.priceMax ? (project.priceMax / 10000000).toFixed(1) : 0}Cr
            </p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Price per Sq Ft</p>
            <p className="font-bold text-gray-900">₹{pricePerSqFt}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Total Units</p>
            <p className="font-bold text-gray-900">{project.totalUnits}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Possession</p>
            <p className="font-bold text-gray-900">
              {project.possessionDate ? new Date(project.possessionDate).toLocaleDateString("en-IN", { year: "numeric" }) : "TBD"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/contact">Schedule Site Visit</Link>
          </Button>
          <Button asChild className="flex-1">
            <a href="https://wa.me/919876543210?text=Hi, I'm interested in {project.name}" target="_blank" rel="noopener noreferrer">
              WhatsApp Us
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/projects/${slug}`}>Share</Link>
          </Button>
        </div>
      </div>
    </section>
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

function ProjectOverview({ project }: { project: any }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {project.description || "Premium residential project offering modern living spaces with world-class amenities."}
            </p>
            <div className="space-y-4">
              {[
                { label: "Project Type", value: project.type },
                { label: "Status", value: project.status },
                { label: "Total Towers", value: project.towers },
                { label: "Total Units", value: project.totalUnits },
                { label: "RERA Number", value: project.reraNo },
                { label: "Launch Date", value: project.launchDate ? new Date(project.launchDate).toLocaleDateString("en-IN") : "TBD" },
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

function ProjectConfigurations({ project }: { project: any }) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Configurations & Price List
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-500">Configuration</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-500">Carpet Area</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-500">Super Area</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-500">Price</th>
                <th className="pb-3 text-right text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { config: "1 BHK", carpet: "450 sq ft", super: "520 sq ft", price: "₹45 Lakhs", status: "Available" },
                { config: "2 BHK", carpet: "850 sq ft", super: "980 sq ft", price: "₹72 Lakhs", status: "Available" },
                { config: "3 BHK", carpet: "1250 sq ft", super: "1450 sq ft", price: "₹1.1 Cr", status: "Available" },
                { config: "3 BHK + Study", carpet: "1500 sq ft", super: "1750 sq ft", price: "₹1.35 Cr", status: "Sold Out" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">{row.config}</td>
                  <td className="py-3 text-sm text-gray-600">{row.carpet}</td>
                  <td className="py-3 text-sm text-gray-600">{row.super}</td>
                  <td className="py-3 text-sm font-medium text-gray-900">{row.price}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProjectAmenities({ project }: { project: any }) {
  const amenities = project.amenities?.map((a: any) => a.amenity) || [];
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Amenities
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            "24x7 Security",
            "Power Backup",
            "Swimming Pool",
            "Gymnasium",
            "Landscaped Garden",
            "Children's Play Area",
            "Club House",
            "Car Parking",
            "CCTV Surveillance",
            "Intercom",
            "Gas Pipeline",
            "WiFi Enabled",
          ].map((amenity, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{amenity}</span>
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSpecifications({ project }: { project: any }) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Structure</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Flooring</span>
                <span>Vitrified Tiles</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kitchen</span>
                <span>Granite Countertop</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bathroom</span>
                <span>Premium Sanitary Ware</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Windows</span>
                <span>UPVC Frames</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Utilities</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Power Backup</span>
                <span>100% Backup</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Water Supply</span>
                <span>24x7 Supply</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Security</span>
                <span>CCTV + Guards</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Parking</span>
                <span>Covered + Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectLocation({ project }: { project: any }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Location & Nearby Landmarks
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <MapPin className="h-24 w-24 text-gray-300" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Nearby Places</h3>
            <div className="space-y-3">
              {[
                { name: "Vijay Nagar Metro Station", type: "Metro", distance: "0.5 km" },
                { name: "Apollo Hospital", type: "Hospital", distance: "1.2 km" },
                { name: "Delhi Public School", type: "School", distance: "0.8 km" },
                { name: "Central Mall", type: "Shopping", distance: "1.5 km" },
              ].map((place, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{place.name}</span>
                    <p className="text-xs text-gray-500">{place.type}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{place.distance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectBuilderCard({ project }: { project: any }) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Home className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{project.builder?.name || "Builder Name"}</h3>
            <p className="text-sm text-gray-500">RERA Registered Builder</p>
            <div className="mt-4 flex gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href={`/builders/${project.builder?.slug || ""}`}>View Builder Profile</Link>
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

function ProjectFaqs({ project }: { project: any }) {
  const faqs = project.faqs || [
    { question: "What is the RERA number?", answer: project.reraNo || "TBD" },
    { question: "When is possession?", answer: project.possessionDate ? new Date(project.possessionDate).toLocaleDateString("en-IN", { year: "numeric" }) : "TBD" },
    { question: "What configurations are available?", answer: "2 BHK and 3 BHK" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          FAQs
        </h2>
        <div className="space-y-3">
          {faqs.map((faq: any, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                <span className="text-gray-400">+</span>
              </button>
              <div className="px-4 pb-3 text-sm text-gray-600">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSimilar({ project }: { project: any }) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Similar Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Similar Project 1", location: "Vijay Nagar", price: "₹50 Lakhs", bhk: "2 BHK" },
            { name: "Similar Project 2", location: "Bhawarkua", price: "₹65 Lakhs", bhk: "3 BHK" },
            { name: "Similar Project 3", location: "Scheme 54", price: "₹58 Lakhs", bhk: "2 BHK" },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="h-32 rounded-lg bg-gray-200 mb-4">
                <Home className="h-10 w-10 text-gray-400 mx-auto mt-10" />
              </div>
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.location}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">{p.bhk}</span>
                <span className="font-bold text-gray-900">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileStickyBar({ project }: { project: any }) {
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
