import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(2, "Property title must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  projectId: z.string().optional().nullable().or(z.literal("")),
  builderId: z.string().optional().nullable().or(z.literal("")),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  category: z.enum(["FLAT", "VILLA", "PLOT", "SHOP", "OFFICE"]),
  price: z.coerce.number().optional().nullable(),
  rent: z.coerce.number().optional().nullable(),
  deposit: z.coerce.number().optional().nullable(),
  maintenance: z.coerce.number().optional().nullable(),
  bhk: z.string().optional().nullable(),
  baths: z.coerce.number().optional().nullable(),
  area: z.coerce.number().optional().nullable(),
  areaUnit: z.string().optional().nullable(),
  floor: z.coerce.number().optional().nullable(),
  totalFloors: z.coerce.number().optional().nullable(),
  facing: z.string().optional().nullable(),
  furnishing: z.string().optional().nullable(),
  ageYears: z.coerce.number().optional().nullable(),
  possession: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  description: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  ownerPhone: z.string().optional().nullable(),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED", "UNDER_OFFER", "WITHDRAWN"]).default("AVAILABLE"),
  featured: z.preprocess(
    (val) => val === true || val === "true" || val === "on" || val === 1 || val === "1",
    z.boolean()
  ).default(false),
  verified: z.preprocess(
    (val) => val === true || val === "true" || val === "on" || val === 1 || val === "1",
    z.boolean()
  ).default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
