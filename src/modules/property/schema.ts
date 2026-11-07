import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(2, "Property title must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  projectId: z.string().optional(),
  builderId: z.string().optional(),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  category: z.enum(["FLAT", "VILLA", "PLOT", "SHOP", "OFFICE"]),
  price: z.number().optional(),
  rent: z.number().optional(),
  deposit: z.number().optional(),
  maintenance: z.number().optional(),
  bhk: z.string().optional(),
  baths: z.number().optional(),
  area: z.number().optional(),
  areaUnit: z.string().optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  facing: z.string().optional(),
  furnishing: z.string().optional(),
  ageYears: z.number().optional(),
  possession: z.string().optional(),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED", "UNDER_OFFER", "WITHDRAWN"]).default("AVAILABLE"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
