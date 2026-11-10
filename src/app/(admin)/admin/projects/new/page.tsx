import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getEntityImages } from "@/lib/media";
import { ProjectForm, type ProjectInitialData } from "./form";

export const dynamic = "force-dynamic";

export default async function ProjectFormPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  let initialData: ProjectInitialData | null = null;

  if (edit) {
    const project = await db.project.findUnique({ where: { id: edit } });
    if (!project) notFound();
    const gallery = await getEntityImages("Project", project.id);
    const resolvedImages =
      Array.isArray((project as any).images) && (project as any).images.length > 0
        ? (project as any).images
        : gallery;

    initialData = {
      ...project,
      images: resolvedImages,
    } as unknown as ProjectInitialData;
  }

  return <ProjectForm initialData={initialData} />;
}
