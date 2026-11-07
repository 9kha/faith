import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  builderId: z.string().min(1, "Builder is required"),
  type: z.enum(["APARTMENT", "VILLA", "PLOTTED", "COMMERCIAL", "TOWNSHIP"]),
  status: z.enum(["UPCOMING", "NEW_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE", "SOLD_OUT"]),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  pincode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  reraNo: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  possessionDate: z.string().optional(),
  launchDate: z.string().optional(),
  totalUnits: z.number().optional(),
  towers: z.number().optional(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const smartAddTemplates = {
  APARTMENT: {
    amenities: ["24x7 Security", "Power Backup", "Lift", "Car Parking", "CCTV Surveillance"],
    specifications: { flooring: "Vitrified Tiles", kitchen: "Granite Countertop", bathroom: "Premium Sanitary Ware" },
    configurations: [
      { bhk: "1 BHK", area: 450, pricePerSqFt: 5000 },
      { bhk: "2 BHK", area: 850, pricePerSqFt: 5200 },
      { bhk: "3 BHK", area: 1200, pricePerSqFt: 5400 },
    ],
    paymentPlan: [
      { stage: "Booking", percentage: 10 },
      { stage: "Foundation", percentage: 15 },
      { stage: "Structure", percentage: 25 },
      { stage: "Plastering", percentage: 20 },
      { stage: "Possession", percentage: 30 },
    ],
    faqs: [
      { question: "What is the RERA number?", answer: "" },
      { question: "When is possession?", answer: "" },
    ],
  },
  VILLA: {
    amenities: ["24x7 Security", "Power Backup", "Car Parking", "CCTV Surveillance", "Landscaped Garden"],
    specifications: { flooring: "Marble", kitchen: "Modular Kitchen", bathroom: "Premium Sanitary Ware" },
    configurations: [
      { bhk: "3 BHK", area: 1500, pricePerSqFt: 6000 },
      { bhk: "4 BHK", area: 2200, pricePerSqFt: 6200 },
    ],
    paymentPlan: [
      { stage: "Booking", percentage: 10 },
      { stage: "Foundation", percentage: 20 },
      { stage: "Structure", percentage: 30 },
      { stage: "Finishing", percentage: 25 },
      { stage: "Possession", percentage: 15 },
    ],
    faqs: [
      { question: "What is the RERA number?", answer: "" },
      { question: "When is possession?", answer: "" },
    ],
  },
  PLOTTED: {
    amenities: ["24x7 Security", "Power Backup", "Car Parking", "CCTV Surveillance", "Water Supply"],
    specifications: { boundaryWall: "RCC Boundary", roadWidth: "30 ft Road" },
    configurations: [
      { bhk: "Plot", area: 1200, pricePerSqFt: 3500 },
      { bhk: "Plot", area: 1800, pricePerSqFt: 3300 },
      { bhk: "Plot", area: 2400, pricePerSqFt: 3100 },
    ],
    paymentPlan: [
      { stage: "Booking", percentage: 20 },
      { stage: "Registration", percentage: 80 },
    ],
    faqs: [
      { question: "What is the RERA number?", answer: "" },
      { question: "When is possession?", answer: "" },
    ],
  },
  COMMERCIAL: {
    amenities: ["24x7 Security", "Power Backup", "Car Parking", "CCTV Surveillance", "Lift"],
    specifications: { flooring: "Vitrified Tiles", powerBackup: "100% Power Backup" },
    configurations: [
      { bhk: "Shop", area: 300, pricePerSqFt: 7000 },
      { bhk: "Office", area: 800, pricePerSqFt: 6500 },
    ],
    paymentPlan: [
      { stage: "Booking", percentage: 15 },
      { stage: "Construction", percentage: 35 },
      { stage: "Completion", percentage: 30 },
      { stage: "Possession", percentage: 20 },
    ],
    faqs: [
      { question: "What is the RERA number?", answer: "" },
      { question: "When is possession?", answer: "" },
    ],
  },
  TOWNSHIP: {
    amenities: ["24x7 Security", "Power Backup", "Swimming Pool", "Gymnasium", "Landscaped Garden", "Club House", "Car Parking", "CCTV Surveillance"],
    specifications: { flooring: "Vitrified Tiles", clubHouse: "Fully Equipped Club House" },
    configurations: [
      { bhk: "2 BHK", area: 850, pricePerSqFt: 4800 },
      { bhk: "3 BHK", area: 1250, pricePerSqFt: 5000 },
      { bhk: "4 BHK Villa", area: 2000, pricePerSqFt: 5500 },
    ],
    paymentPlan: [
      { stage: "Booking", percentage: 10 },
      { stage: "Foundation", percentage: 15 },
      { stage: "Structure", percentage: 25 },
      { stage: "Finishing", percentage: 25 },
      { stage: "Possession", percentage: 25 },
    ],
    faqs: [
      { question: "What is the RERA number?", answer: "" },
      { question: "When is possession?", answer: "" },
    ],
  },
} as const;
