import { z } from "zod";

export const builderSchema = z.object({
  name: z.string().min(2, "Builder name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  about: z.string().optional().nullable(),
  reraNo: z.string().optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  commissionTerms: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  featured: z.preprocess(
    (val) => val === true || val === "true" || val === "on" || val === 1 || val === "1",
    z.boolean()
  ).default(false),
  sortOrder: z.coerce.number().default(0),
  videos: z.any().optional(),
  bannerConfig: z.any().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export type BuilderFormValues = z.infer<typeof builderSchema>;
