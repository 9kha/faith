import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PropertyForm, type PropertyInitialData } from "./form";

export const dynamic = "force-dynamic";

export default async function PropertyFormPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  let initialData: PropertyInitialData | null = null;

  if (edit) {
    const property = await db.property.findUnique({ where: { id: edit } });
    if (!property) notFound();
    initialData = property as unknown as PropertyInitialData;
  }

  return <PropertyForm initialData={initialData} />;
}
