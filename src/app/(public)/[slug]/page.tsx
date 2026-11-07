import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60;

export const metadata = {
  title: "Page - ChannelPartner Pro",
  description: "Custom page content.",
};

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
  });

  if (!page) notFound();

  return (
    <div className="space-y-0">
      <section className="relative bg-gray-50 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
            {page.seoTitle || page.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {page.seoDescription || "Welcome to our custom page."}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-gray-700 leading-relaxed">
            {page.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: typeof page.content === "string"
                    ? page.content
                    : JSON.stringify(page.content),
                }}
              />
            ) : (
              <p className="text-gray-600">
                No content available for this page. Please contact the
                administrator to add content.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
