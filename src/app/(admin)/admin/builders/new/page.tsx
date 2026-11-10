import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BuilderForm, type BuilderInitialData } from "./form";

export const dynamic = "force-dynamic";

export default async function BuilderFormPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  let initialData: BuilderInitialData | null = null;

  if (edit) {
    const builder = await db.builder.findUnique({ where: { id: edit } });
    if (!builder) notFound();
    initialData = builder as unknown as BuilderInitialData;
  }

  return <BuilderForm initialData={initialData} />;
}
