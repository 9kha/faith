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
  about: z.string().optional(),
  reraNo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  commissionTerms: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type BuilderFormValues = z.infer<typeof builderSchema>;
