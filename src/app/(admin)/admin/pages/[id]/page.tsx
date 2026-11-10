import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PageBuilderForm from "../page-form";

export const metadata = {
  title: "Edit Custom Page | Admin",
  description: "Edit content and SEO for custom pages",
};

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page || page.deletedAt) {
    notFound();
  }

  return (
    <PageBuilderForm
      initialData={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        template: page.template,
        content: page.content,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
      }}
      isEdit={true}
    />
  );
}
