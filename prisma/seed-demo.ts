import { stat } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";

const IMAGES_DIR = join(process.cwd(), "public", "images");

type ImageSpec = { file: string; alt: string };

const IMAGE_SPECS: ImageSpec[] = [
  { file: "hero.jpg", alt: "Modern apartment building at dusk" },
  { file: "about.jpg", alt: "Real estate team at work" },
  { file: "contact.jpg", alt: "Contact our property advisors" },
  { file: "cta.jpg", alt: "Find your dream home" },
  ...Array.from({ length: 10 }, (_, i) => ({
    file: `property-${i + 1}.jpg`,
    alt: `Property listing photo ${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    file: `project-${i + 1}.jpg`,
    alt: `Project elevation ${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    file: `blog-${i + 1}.jpg`,
    alt: `Blog cover ${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    file: `builder-${i + 1}.jpg`,
    alt: `Builder logo ${i + 1}`,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    file: `testimonial-${i + 1}.jpg`,
    alt: `Client portrait ${i + 1}`,
  })),
];

const BUILDERS = [
  {
    name: "Shree Constructions",
    slug: "shree-constructions",
    reraNo: "RERA-MP-1234",
    logo: "builder-1.jpg",
    about:
      "Leading builder in Central India with 20+ years of experience delivering premium residential townships.",
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Sunshine Realty",
    slug: "sunshine-realty",
    reraNo: "RERA-MP-2245",
    logo: "builder-2.jpg",
    about:
      "Affordable plotted developments and high-rise apartments across Indore and Bhopal.",
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Royal Developers",
    slug: "royal-developers",
    reraNo: "RERA-MP-3311",
    logo: "builder-3.jpg",
    about:
      "Luxury villas and boutique commercial spaces with a focus on sustainable design.",
    featured: true,
    sortOrder: 3,
  },
  {
    name: "Green City Builders",
    slug: "green-city-builders",
    reraNo: "RERA-MP-4477",
    logo: "builder-4.jpg",
    about:
      "Green-certified townships with rainwater harvesting, solar power and large open spaces.",
    featured: false,
    sortOrder: 4,
  },
  {
    name: "Prestige Group",
    slug: "prestige-group",
    reraNo: "RERA-MP-5599",
    logo: "builder-5.jpg",
    about:
      "Nationally recognised developer known for landmark residential and retail projects.",
    featured: false,
    sortOrder: 5,
  },
  {
    name: "OM Sai Builders",
    slug: "om-sai-builders",
    reraNo: "RERA-MP-6612",
    logo: "builder-6.jpg",
    about:
      "Mid-segment homes engineered for first-time buyers with transparent, all-inclusive pricing.",
    featured: false,
    sortOrder: 6,
  },
];

const PROJECTS = [
  {
    name: "Shree Green Valley",
    slug: "shree-green-valley",
    builder: "shree-constructions",
    type: "APARTMENT",
    status: "NEW_LAUNCH",
    city: "Indore",
    locality: "Vijay Nagar",
    pincode: "452010",
    reraNo: "RERA-MP-5678",
    priceMin: 450000000,
    priceMax: 850000000,
    areaMin: 850,
    areaMax: 1800,
    image: "project-1.jpg",
    featured: true,
    sortOrder: 1,
    towers: 4,
    totalUnits: 200,
  },
  {
    name: "Sunrise Heights",
    slug: "sunrise-heights",
    builder: "sunshine-realty",
    type: "APARTMENT",
    status: "UNDER_CONSTRUCTION",
    city: "Indore",
    locality: "Bhawarkua",
    pincode: "452002",
    reraNo: "RERA-MP-7712",
    priceMin: 320000000,
    priceMax: 620000000,
    areaMin: 720,
    areaMax: 1450,
    image: "project-2.jpg",
    featured: true,
    sortOrder: 2,
    towers: 3,
    totalUnits: 144,
  },
  {
    name: "Royal Enclave",
    slug: "royal-enclave",
    builder: "royal-developers",
    type: "VILLA",
    status: "READY_TO_MOVE",
    city: "Indore",
    locality: "Palasia",
    pincode: "452001",
    reraNo: "RERA-MP-8891",
    priceMin: 850000000,
    priceMax: 1950000000,
    areaMin: 2400,
    areaMax: 4200,
    image: "project-3.jpg",
    featured: true,
    sortOrder: 3,
    towers: 1,
    totalUnits: 48,
  },
  {
    name: "Lakeview Park",
    slug: "lakeview-park",
    builder: "green-city-builders",
    type: "TOWNSHIP",
    status: "UNDER_CONSTRUCTION",
    city: "Bhopal",
    locality: "Arera Colony",
    pincode: "462016",
    reraNo: "RERA-MP-9923",
    priceMin: 380000000,
    priceMax: 780000000,
    areaMin: 900,
    areaMax: 1900,
    image: "project-4.jpg",
    featured: false,
    sortOrder: 4,
    towers: 6,
    totalUnits: 360,
  },
  {
    name: "Skyline Towers",
    slug: "skyline-towers",
    builder: "prestige-group",
    type: "APARTMENT",
    status: "UPCOMING",
    city: "Bhopal",
    locality: "MP Nagar",
    pincode: "462011",
    reraNo: "RERA-MP-1024",
    priceMin: 550000000,
    priceMax: 990000000,
    areaMin: 1100,
    areaMax: 2100,
    image: "project-5.jpg",
    featured: false,
    sortOrder: 5,
    towers: 5,
    totalUnits: 250,
  },
  {
    name: "Sunshine Residency",
    slug: "sunshine-residency",
    builder: "om-sai-builders",
    type: "APARTMENT",
    status: "NEW_LAUNCH",
    city: "Indore",
    locality: "Rau",
    pincode: "453331",
    reraNo: "RERA-MP-1135",
    priceMin: 250000000,
    priceMax: 480000000,
    areaMin: 650,
    areaMax: 1250,
    image: "project-6.jpg",
    featured: false,
    sortOrder: 6,
    towers: 2,
    totalUnits: 96,
  },
];

const PROPERTIES = [
  { title: "Spacious 3 BHK with Garden View", slug: "spacious-3-bhk-garden-view", listingType: "SALE", category: "FLAT", price: 85000000, rent: null, bhk: "3 BHK", baths: 3, area: 1250, city: "Indore", locality: "Vijay Nagar", image: "property-1.jpg", featured: true, verified: true, project: "shree-green-valley", builder: "shree-constructions", status: "AVAILABLE", furnishing: "SEMI_FURNISHED", floor: 4, totalFloors: 12 },
  { title: "Compact 2 BHK Near Metro", slug: "compact-2-bhk-near-metro", listingType: "SALE", category: "FLAT", price: 52000000, rent: null, bhk: "2 BHK", baths: 2, area: 950, city: "Indore", locality: "Bhawarkua", image: "property-2.jpg", featured: true, verified: true, project: "sunrise-heights", builder: "sunshine-realty", status: "AVAILABLE", furnishing: "UNFURNISHED", floor: 2, totalFloors: 11 },
  { title: "Luxury 4 BHK Independent Villa", slug: "luxury-4-bhk-independent-villa", listingType: "SALE", category: "VILLA", price: 215000000, rent: null, bhk: "4 BHK", baths: 5, area: 3600, city: "Indore", locality: "Palasia", image: "property-3.jpg", featured: true, verified: true, project: "royal-enclave", builder: "royal-developers", status: "AVAILABLE", furnishing: "FULLY_FURNISHED", floor: 1, totalFloors: 2 },
  { title: "Sea-facing Style Penthouse", slug: "skyline-penthouse", listingType: "SALE", category: "FLAT", price: 165000000, rent: null, bhk: "4 BHK", baths: 4, area: 2450, city: "Bhopal", locality: "MP Nagar", image: "property-4.jpg", featured: false, verified: true, project: "skyline-towers", builder: "prestige-group", status: "UNDER_OFFER", furnishing: "FULLY_FURNISHED", floor: 14, totalFloors: 18 },
  { title: "Affordable Studio for Investors", slug: "affordable-studio-investors", listingType: "SALE", category: "FLAT", price: 24500000, rent: null, bhk: "1 BHK", baths: 1, area: 480, city: "Indore", locality: "Rau", image: "property-5.jpg", featured: false, verified: false, project: "sunshine-residency", builder: "om-sai-builders", status: "AVAILABLE", furnishing: "UNFURNISHED", floor: 3, totalFloors: 9 },
  { title: "4 BHK Duplex with Terrace", slug: "4-bhk-duplex-with-terrace", listingType: "SALE", category: "FLAT", price: 142000000, rent: null, bhk: "4 BHK", baths: 4, area: 2750, city: "Indore", locality: "Scheme 54", image: "property-7.jpg", featured: false, verified: true, project: "shree-green-valley", builder: "shree-constructions", status: "AVAILABLE", furnishing: "SEMI_FURNISHED", floor: 9, totalFloors: 12 },
  { title: "Prime Residential Plot", slug: "prime-residential-plot-rau", listingType: "SALE", category: "PLOT", price: 38000000, rent: null, bhk: null, baths: null, area: 1800, city: "Indore", locality: "Rau", image: "property-8.jpg", featured: false, verified: true, project: null, builder: "sunshine-realty", status: "AVAILABLE", furnishing: null, floor: null, totalFloors: null },
  { title: "Corner Shop in Market Complex", slug: "corner-shop-market-complex", listingType: "SALE", category: "SHOP", price: 68000000, rent: null, bhk: null, baths: 1, area: 520, city: "Indore", locality: "Palasia", image: "property-10.jpg", featured: false, verified: false, project: null, builder: null, status: "AVAILABLE", furnishing: null, floor: 1, totalFloors: 3 },
  { title: "Fully Furnished 2 BHK on Rent", slug: "fully-furnished-2-bhk-rent", listingType: "RENT", category: "FLAT", price: null, rent: 24000, bhk: "2 BHK", baths: 2, area: 980, city: "Indore", locality: "Vijay Nagar", image: "property-6.jpg", featured: true, verified: true, project: "shree-green-valley", builder: "shree-constructions", status: "AVAILABLE", furnishing: "FULLY_FURNISHED", floor: 6, totalFloors: 12 },
  { title: "Family 3 BHK Semi-Furnished Rent", slug: "family-3-bhk-semi-furnished-rent", listingType: "RENT", category: "FLAT", price: null, rent: 38000, bhk: "3 BHK", baths: 3, area: 1450, city: "Indore", locality: "Scheme 54", image: "property-9.jpg", featured: false, verified: true, project: "sunrise-heights", builder: "sunshine-realty", status: "AVAILABLE", furnishing: "SEMI_FURNISHED", floor: 7, totalFloors: 11 },
  { title: "Budget 1 BHK for Students", slug: "budget-1-bhk-students", listingType: "RENT", category: "FLAT", price: null, rent: 12000, bhk: "1 BHK", baths: 1, area: 520, city: "Bhopal", locality: "Eklavya", image: "property-2.jpg", featured: false, verified: false, project: null, builder: null, status: "AVAILABLE", furnishing: "UNFURNISHED", floor: 2, totalFloors: 6 },
  { title: "Office Space on Main Road", slug: "office-space-main-road", listingType: "LEASE", category: "OFFICE", price: null, rent: 95000, bhk: null, baths: 2, area: 2200, city: "Bhopal", locality: "Arera Colony", image: "property-9.jpg", featured: false, verified: true, project: null, builder: null, status: "AVAILABLE", furnishing: "FULLY_FURNISHED", floor: 3, totalFloors: 8 },
];

const BLOG_POSTS = [
  {
    title: "Top 5 Localities for Investment in Indore 2026",
    slug: "top-5-localities-investment-indore-2026",
    excerpt:
      "Discover the fastest appreciating neighbourhoods in Indore with strong rental yields and infrastructure growth.",
    image: "blog-1.jpg",
    category: "Investment",
    categorySlug: "investment",
    featured: true,
  },
  {
    title: "RERA Explained: What Every Home Buyer Should Know",
    slug: "rera-explained-home-buyer-guide",
    excerpt:
      "A plain-English guide to RERA registration, your rights as a buyer, and the documents you must verify.",
    image: "blog-2.jpg",
    category: "Legal",
    categorySlug: "legal",
    featured: true,
  },
  {
    title: "Home Loan vs Personal Loan: Which Is Better?",
    slug: "home-loan-vs-personal-loan",
    excerpt:
      "Compare interest rates, tenures and tax benefits to decide which financing route suits your purchase.",
    image: "blog-3.jpg",
    category: "Finance",
    categorySlug: "finance",
    featured: false,
  },
  {
    title: "6 Checks Before Signing a Sale Agreement",
    slug: "checks-before-sale-agreement",
    excerpt:
      "Title verification, encumbrance certificate, approval plans — the checklist that protects your deposit.",
    image: "blog-6.jpg",
    category: "Legal",
    categorySlug: "legal",
    featured: false,
  },
  {
    title: "Rental Yield Hotspots Across Central India",
    slug: "rental-yield-hotspots-central-india",
    excerpt:
      "Where tenants are paying the most per square foot, and how to model your net yield after maintenance.",
    image: "blog-4.jpg",
    category: "Investment",
    categorySlug: "investment",
    featured: false,
  },
  {
    title: "Small Upgrades That Add Resale Value",
    slug: "upgrades-that-add-resale-value",
    excerpt:
      "Kitchen refacing, lighting, and flooring choices that return the most when you sell.",
    image: "blog-5.jpg",
    category: "Tips",
    categorySlug: "tips",
    featured: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Home Buyer",
    content:
      "Found my dream 3 BHK in Vijay Nagar within a week. The process was smooth, transparent and completely brokerage-free.",
    rating: 5,
    image: "testimonial-1.jpg",
    sortOrder: 1,
  },
  {
    name: "Priya Sharma",
    role: "Investor",
    content:
      "Excellent service and genuine RERA-verified projects. Their data on rental yields helped me pick the right unit.",
    rating: 5,
    image: "testimonial-2.jpg",
    sortOrder: 2,
  },
  {
    name: "Amit Verma",
    role: "Tenant",
    content:
      "Rented a beautiful 2 BHK quickly. The team was professional and responsive throughout the paperwork.",
    rating: 4,
    image: "testimonial-3.jpg",
    sortOrder: 3,
  },
];

const LEADS = [
  { name: "Neha Gupta", phone: "+91 90000 11111", email: "neha.gupta@example.com", source: "WEBSITE", status: "NEW", message: "Looking for a 3 BHK in Vijay Nagar, budget around 85 Lakhs.", budget: 85000000 },
  { name: "Rahul Mehta", phone: "+91 90000 22222", email: "rahul.mehta@example.com", source: "WHATSAPP", status: "CONTACTED", message: "Is Sunshine Residency RERA approved? Please share the brochure.", budget: 30000000 },
  { name: "Sneha Iyer", phone: "+91 90000 33333", email: "sneha.iyer@example.com", source: "REFERRAL", status: "SITE_VISIT_SCHEDULED", message: "Want to visit Royal Enclave villas this Saturday morning.", budget: 200000000 },
  { name: "Arun Patel", phone: "+91 90000 44444", email: null, source: "CALL", status: "NEW", message: "Need a 2 BHK on rent near Bhawarkua, family of three.", budget: null },
  { name: "Kavita Nair", phone: "+91 90000 55555", email: "kavita.nair@example.com", source: "CAMPAIGN", status: "NEGOTIATION", message: "Interested in the 4 BHK duplex. Can we discuss the payment plan?", budget: 140000000 },
  { name: "Mohit Bansal", phone: "+91 90000 66666", email: "mohit.bansal@example.com", source: "WEBSITE", status: "BOOKED", message: "Booking 202 in Sunrise Heights. Already paid the token amount.", budget: 52000000 },
  { name: "Divya Reddy", phone: "+91 90000 77777", email: "divya.reddy@example.com", source: "WALK_IN", status: "CLOSED_WON", message: "Purchased a 3 BHK at Shree Green Valley. Thanks for the support!", budget: 88000000 },
  { name: "Sanjay Kulkarni", phone: "+91 90000 88888", email: "sanjay.k@example.com", source: "PARTNER", status: "SITE_VISIT_DONE", message: "Visited Lakeview Park, Bhopal. Comparing with one more township.", budget: 60000000 },
  { name: "Pooja Desai", phone: "+91 90000 99999", email: "pooja.desai@example.com", source: "WEBSITE", status: "CONTACTED", message: "Looking for a corner shop in Palasia for a pharmacy.", budget: 70000000 },
  { name: "Vikram Singh", phone: "+91 91111 12345", email: "vikram.singh@example.com", source: "WHATSAPP", status: "CLOSED_LOST", message: "Finalised a property with another broker. Maybe next time.", budget: null },
  { name: "Anita Joshi", phone: "+91 91111 23456", email: "anita.joshi@example.com", source: "WEBSITE", status: "NEW", message: "Do you have any ready-to-move 1 BHK in Bhopal under 25 Lakhs?", budget: 25000000 },
  { name: "Farhan Qureshi", phone: "+91 91111 34567", email: "farhan.q@example.com", source: "CAMPAIGN", status: "NEGOTIATION", message: "Interested in office space lease at Arera Colony, 2000+ sq ft.", budget: null },
];

const PAGES = [
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    seoTitle: "Privacy Policy - ChannelPartner Pro",
    seoDescription: "How ChannelPartner Pro collects, uses and protects your personal information.",
    content: `<h2>Privacy Policy</h2><p>Last updated: November 2026</p><p>ChannelPartner Pro ("we", "our") respects your privacy. This policy explains what information we collect when you browse our website, submit an enquiry, or speak with our team — and how we use it.</p><h3>Information we collect</h3><ul><li>Contact details you submit through enquiry forms: name, phone number and email address.</li><li>Property preferences such as budget, location and configuration.</li><li>Standard technical data: IP address, browser type and pages viewed, collected through cookies.</li></ul><h3>How we use it</h3><ul><li>To respond to your enquiry and share relevant property options.</li><li>To schedule site visits and send follow-up reminders.</li><li>To improve our website and measure the performance of our campaigns.</li></ul><h3>Sharing</h3><p>We share your details with the builder or property owner only when you explicitly ask us to arrange a visit or booking. We never sell your data.</p><h3>Your rights</h3><p>You may request a copy of your data, ask for corrections, or ask us to delete it by writing to sales@channelpartner.example.com.</p><h3>Contact</h3><p>123, Scheme 54, Vijay Nagar, Indore, MP 452010 · +91 98765 43210</p>`,
  },
  {
    title: "Terms of Service",
    slug: "terms-of-service",
    seoTitle: "Terms of Service - ChannelPartner Pro",
    seoDescription: "The terms that govern your use of the ChannelPartner Pro website and services.",
    content: `<h2>Terms of Service</h2><p>Last updated: November 2026</p><p>By using the ChannelPartner Pro website you agree to the following terms.</p><h3>1. Informational purpose</h3><p>Listing details, prices, areas and possession dates are provided by builders and owners. While we verify RERA registration, all figures should be confirmed independently before any payment.</p><h3>2. No brokerage for buyers</h3><p>We are an independent channel partner compensated by the builder. Buyers transacting through us do not pay a brokerage fee.</p><h3>3. Enquiries</h3><p>Submitting an enquiry permits us to contact you by phone, WhatsApp or email about matching properties.</p><h3>4. Intellectual property</h3><p>Site content, logos and photographs may not be reproduced without written permission.</p><h3>5. Limitation of liability</h3><p>To the extent permitted by law, we are not liable for losses arising from reliance on third-party listing information.</p><h3>6. Governing law</h3><p>These terms are governed by the laws of India, with jurisdiction in Indore, Madhya Pradesh.</p>`,
  },
];

async function ensureMedia(file: string, alt: string) {
  const url = `/images/${file}`;
  const existing = await db.media.findFirst({ where: { url, deletedAt: null } });
  if (existing) return existing;

  let size = 0;
  try {
    size = (await stat(join(IMAGES_DIR, file))).size;
  } catch {
    size = 0;
  }

  return db.media.create({
    data: {
      type: "IMAGE",
      url,
      path: url,
      mime: "image/jpeg",
      size,
      alt,
    },
  });
}

async function attachImage(
  entityType: string,
  entityId: string,
  mediaId: string,
  role = "image",
  sortOrder = 0
) {
  const existing = await db.mediable.findFirst({
    where: { entityType, entityId, role, sortOrder },
  });
  if (existing) return;
  await db.mediable.create({
    data: { mediaId, entityType, entityId, role, sortOrder },
  });
}

export async function seedDemo() {
  console.log("🎨 Seeding media library...");

  const mediaByFile = new Map<string, string>();
  for (const spec of IMAGE_SPECS) {
    const media = await ensureMedia(spec.file, spec.alt);
    mediaByFile.set(spec.file, media.id);
  }

  console.log(`✅ ${mediaByFile.size} media assets registered`);

  console.log("🏗️  Seeding builders...");
  const builderBySlug = new Map<string, string>();
  for (const b of BUILDERS) {
    const logoId = mediaByFile.get(b.logo) ?? null;
    const row = await db.builder.upsert({
      where: { slug: b.slug },
      update: { name: b.name, about: b.about, reraNo: b.reraNo, featured: b.featured, sortOrder: b.sortOrder, logoId },
      create: {
        name: b.name,
        slug: b.slug,
        about: b.about,
        reraNo: b.reraNo,
        logoId,
        status: "active",
        featured: b.featured,
        sortOrder: b.sortOrder,
        contactName: "Sales Head",
        contactPhone: "+91 98765 43210",
        contactEmail: `sales@${b.slug}.example.com`,
        address: "Indore, Madhya Pradesh",
      },
    });
    builderBySlug.set(b.slug, row.id);
    if (logoId) await attachImage("Builder", row.id, logoId, "logo");
  }
  console.log(`✅ ${BUILDERS.length} builders`);

  console.log("🏛️  Seeding projects...");
  const projectBySlug = new Map<string, string>();
  for (const p of PROJECTS) {
    const builderId = builderBySlug.get(p.builder)!;
    const row = await db.project.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        type: p.type as never,
        status: p.status as never,
        city: p.city,
        locality: p.locality,
        pincode: p.pincode,
        reraNo: p.reraNo,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        areaMin: p.areaMin,
        areaMax: p.areaMax,
        towers: p.towers,
        totalUnits: p.totalUnits,
        featured: p.featured,
        sortOrder: p.sortOrder,
        publishedAt: new Date(),
        description: `${p.name} is a ${p.type.toLowerCase()} project in ${p.locality}, ${p.city}. RERA registered with ${p.towers} towers and ${p.totalUnits} units, offering ${p.areaMin}–${p.areaMax} sq ft homes.`,
        highlights: ["RERA Registered", "24x7 Security", "Power Backup", "Club House", "Car Parking", "Lift"],
        faqs: [
          { question: "What is the RERA number?", answer: p.reraNo },
          { question: "Where is the project located?", answer: `${p.locality}, ${p.city} — ${p.pincode}` },
          { question: "What configurations are available?", answer: `${p.areaMin} to ${p.areaMax} sq ft` },
        ],
      },
      create: {
        name: p.name,
        slug: p.slug,
        builderId,
        type: p.type as never,
        status: p.status as never,
        city: p.city,
        locality: p.locality,
        pincode: p.pincode,
        reraNo: p.reraNo,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        areaMin: p.areaMin,
        areaMax: p.areaMax,
        towers: p.towers,
        totalUnits: p.totalUnits,
        featured: p.featured,
        sortOrder: p.sortOrder,
        publishedAt: new Date(),
        description: `${p.name} is a ${p.type.toLowerCase()} project in ${p.locality}, ${p.city}. RERA registered with ${p.towers} towers and ${p.totalUnits} units, offering ${p.areaMin}–${p.areaMax} sq ft homes.`,
        highlights: ["RERA Registered", "24x7 Security", "Power Backup", "Club House", "Car Parking", "Lift"],
        faqs: [
          { question: "What is the RERA number?", answer: p.reraNo },
          { question: "Where is the project located?", answer: `${p.locality}, ${p.city} — ${p.pincode}` },
          { question: "What configurations are available?", answer: `${p.areaMin} to ${p.areaMax} sq ft` },
        ],
      },
    });
    projectBySlug.set(p.slug, row.id);
    const mediaId = mediaByFile.get(p.image);
    if (mediaId) await attachImage("Project", row.id, mediaId, "image", 0);
  }
  console.log(`✅ ${PROJECTS.length} projects`);

  console.log("🏠 Seeding properties...");
  let propertyCount = 0;
  for (const p of PROPERTIES) {
    const projectId = p.project ? projectBySlug.get(p.project) ?? null : null;
    const builderId = p.builder ? builderBySlug.get(p.builder) ?? null : null;
    const row = await db.property.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        listingType: p.listingType as never,
        category: p.category as never,
        status: p.status as never,
        price: p.price,
        rent: p.rent,
        bhk: p.bhk,
        baths: p.baths,
        area: p.area,
        city: p.city,
        locality: p.locality,
        projectId,
        builderId,
        featured: p.featured,
        verified: p.verified,
        furnishing: p.furnishing,
        floor: p.floor,
        totalFloors: p.totalFloors,
        publishedAt: new Date(),
        description: `${p.title} in ${p.locality}, ${p.city}. ${p.bhk ? p.bhk + ", " : ""}${p.area} sq ft, ${p.furnishing ? p.furnishing.toLowerCase().replace("_", " ") + ", " : ""}verified listing with transparent pricing.`,
      },
      create: {
        title: p.title,
        slug: p.slug,
        listingType: p.listingType as never,
        category: p.category as never,
        status: p.status as never,
        price: p.price,
        rent: p.rent,
        bhk: p.bhk,
        baths: p.baths,
        area: p.area,
        areaUnit: "sqft",
        city: p.city,
        locality: p.locality,
        projectId,
        builderId,
        featured: p.featured,
        verified: p.verified,
        furnishing: p.furnishing,
        floor: p.floor,
        totalFloors: p.totalFloors,
        publishedAt: new Date(),
        ownerName: "Property Owner",
        ownerPhone: "+91 98765 43210",
        description: `${p.title} in ${p.locality}, ${p.city}. ${p.bhk ? p.bhk + ", " : ""}${p.area} sq ft, ${p.furnishing ? p.furnishing.toLowerCase().replace("_", " ") + ", " : ""}verified listing with transparent pricing.`,
      },
    });
    const mediaId = mediaByFile.get(p.image);
    if (mediaId) {
      await attachImage("Property", row.id, mediaId, "image", 0);
      // a couple of gallery images so detail pages have more than one photo
      const others = ["property-1.jpg", "property-4.jpg", "property-7.jpg"].filter(
        (f) => f !== p.image
      );
      for (let i = 0; i < others.length; i++) {
        const g = mediaByFile.get(others[i]);
        if (g) await attachImage("Property", row.id, g, "gallery", i + 1);
      }
    }
    propertyCount++;
  }
  console.log(`✅ ${propertyCount} properties`);

  console.log("📝 Seeding blog...");
  const admin = await db.user.findFirst({ where: { email: process.env.ADMIN_EMAIL || "admin@faithventure.com" } });
  for (const [i, b] of BLOG_POSTS.entries()) {
    const category = await db.blogCategory.upsert({
      where: { slug: b.categorySlug },
      update: { name: b.category },
      create: { name: b.category, slug: b.categorySlug },
    });
    const featuredImageId = mediaByFile.get(b.image) ?? null;
    await db.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        excerpt: b.excerpt,
        featuredImageId,
        categoryId: category.id,
        status: "PUBLISHED",
        featured: b.featured,
        publishedAt: new Date(Date.now() - i * 86400000 * 4),
        readingTime: 4,
      },
      create: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: `<p>${b.excerpt}</p><p>Property decisions in Central India move fast — new launches, shifting circle rates and evolving infrastructure all reshape what a location is worth. In this article we break down the numbers behind the headlines so you can decide with confidence.</p><h3>What the data shows</h3><p>Across Indore and Bhopal, micro-markets with completed civic infrastructure continue to outperform newer peripheral layouts on both capital appreciation and rental uptake. Ticket sizes remain accessible for first-time buyers, while ready-to-move stock attracts end-users who want zero construction risk.</p><h3>How to act on it</h3><ul><li>Shortlist two or three localities rather than one — inventory depth matters.</li><li>Verify RERA registration and approval plans before any token payment.</li><li>Model your EMI against realistic rent, not aspirational rent.</li></ul><p>Talk to our channel partner team for a data-backed shortlist matched to your budget.</p>`,
        featuredImageId,
        authorId: admin?.id ?? null,
        categoryId: category.id,
        status: "PUBLISHED",
        featured: b.featured,
        publishedAt: new Date(Date.now() - i * 86400000 * 4),
        readingTime: 4,
      },
    });
  }
  console.log(`✅ ${BLOG_POSTS.length} blog posts`);

  console.log("💬 Seeding testimonials...");
  for (const t of TESTIMONIALS) {
    const imageId = mediaByFile.get(t.image) ?? null;
    const existing = await db.testimonial.findFirst({ where: { name: t.name } });
    if (existing) {
      await db.testimonial.update({
        where: { id: existing.id },
        data: { content: t.content, rating: t.rating, imageId, featured: true, sortOrder: t.sortOrder },
      });
    } else {
      await db.testimonial.create({
        data: {
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          imageId,
          featured: true,
          sortOrder: t.sortOrder,
          status: "active",
        },
      });
    }
  }
  console.log(`✅ ${TESTIMONIALS.length} testimonials`);

  console.log("📇 Seeding leads...");
  const projectIds = [...projectBySlug.values()];
  const properties = await db.property.findMany({ select: { id: true }, take: 12 });
  let leadCount = 0;
  for (const [i, l] of LEADS.entries()) {
    const existing = await db.lead.findFirst({ where: { phone: l.phone, deletedAt: null } });
    if (existing) continue;
    await db.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        email: l.email,
        source: l.source as never,
        status: l.status as never,
        message: l.message,
        budget: l.budget,
        projectId: projectIds[i % projectIds.length] ?? null,
        propertyId: properties[i % (properties.length || 1)]?.id ?? null,
        createdAt: new Date(Date.now() - i * 3600000 * 9),
        nextFollowUpAt:
          l.status === "NEW" || l.status === "CONTACTED"
            ? new Date(Date.now() + 86400000 * 2)
            : null,
      },
    });
    leadCount++;
  }
  console.log(`✅ ${leadCount} leads`);

  console.log("📄 Seeding static pages...");
  for (const p of PAGES) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content, status: "PUBLISHED", seoTitle: p.seoTitle, seoDescription: p.seoDescription },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        status: "PUBLISHED",
        publishedAt: new Date(),
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      },
    });
  }
  console.log(`✅ ${PAGES.length} static pages`);
}
