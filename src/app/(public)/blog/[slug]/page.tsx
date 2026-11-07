import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Blog Post - ChannelPartner Pro",
  description: "Read the latest blog post.",
};

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-0">
      <section className="relative bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] -z-10" />
          {post.featuredImageId ? (
            <Image
              src={`/uploads/${post.featuredImageId}`}
              alt={post.title}
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          ) : null}
          <div className="text-center">
            {post.category && (
              <span className="px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-medium mb-4 inline-block">
                {post.category.name}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span>•</span>
              <span>By {post.author?.name || "Admin"}</span>
              <span>•</span>
              <span>{Math.ceil((post.content || "").length / 200)} min read</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 md:p-8">
            <div>
              <h3 className="font-semibold text-gray-900">Related Articles</h3>
              <p className="text-sm text-gray-500 mt-1">More insights for you</p>
            </div>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
              View all articles →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
