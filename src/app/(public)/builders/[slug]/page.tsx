import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Building2, Home, Phone, Mail, MapPin } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Builder - ChannelPartner Pro",
  description: "Builder profile and projects.",
};

export default async function BuilderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = await db.builder.findUnique({
    where: { slug, deletedAt: null },
    include: {
      projects: {
        where: { deletedAt: null, status: { not: "ARCHIVED" as any } },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!builder) notFound();

  return (
    <div className="space-y-0">
      <BuilderHero builder={builder} />
      <BuilderProjects builder={builder} />
    </div>
  );
}

function BuilderHero({ builder }: { builder: any }) {
  return (
    <section className="relative bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-12 w-12 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded bg-primary text-white text-xs font-medium">
                Verified Builder
              </span>
              {builder.featured && (
                <span className="px-3 py-1 rounded bg-yellow-500 text-black text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              {builder.name}
            </h1>
            {builder.reraNo && (
              <p className="text-sm text-primary font-medium">
                RERA No: {builder.reraNo}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-500">Projects</p>
            <p className="font-bold text-gray-900">{builder.projects.length}</p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-500">Contact</p>
            <p className="font-bold text-gray-900">
              {builder.contactName || "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-500">Phone</p>
            <p className="font-bold text-gray-900">
              {builder.contactPhone || "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-bold text-gray-900">
              {builder.contactEmail || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderProjects({ builder }: { builder: any }) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
          Projects by {builder.name}
        </h2>
        {builder.projects.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No projects available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builder.projects.map((p: any) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop"
          alt={project.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
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
        <p className="text-sm text-gray-500 mt-1">
          {project.city}, {project.locality}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{project.type}</span>
          <span className="font-bold text-gray-900">
            ₹{project.priceMin ? (project.priceMin / 10000000).toFixed(1) : 0}Cr
          </span>
        </div>
      </div>
    </Link>
  );
}
