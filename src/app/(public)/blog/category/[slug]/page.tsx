import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

export const metadata = {
  title: "Blog Category - ChannelPartner Pro",
  description: "Blog posts by category.",
};

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await db.blogCategory.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { deletedAt: null, status: "PUBLISHED" },
        take: 12,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-0">
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              {category.name}
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              {category.description || `Articles about ${category.name.toLowerCase()}`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.posts.length > 0 ? (
              category.posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-500">
                No posts in this category yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function BlogCard({ post }: { post: any }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {post.featuredImageId ? (
          <Image
            src={`/uploads/${post.featuredImageId}`}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <Home />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-gray-700">
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
      <div className="p-4">
        {post.category && (
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {post.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {post.excerpt || "Read the latest insights about real estate market trends."}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">By {post.author?.name || "Admin"}</span>
        </div>
      </div>
    </Link>
  );
}

function Home() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
