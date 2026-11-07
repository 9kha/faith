import { db } from "@/lib/db";
import { AmenityGroup } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@faithventure.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";

const modules: string[] = [
  "dashboard",
  "builders",
  "projects",
  "properties",
  "inventory",
  "leads",
  "clients",
  "sales",
  "payments",
  "commissions",
  "partners",
  "staff",
  "media",
  "pages",
  "menus",
  "branding",
  "seo",
  "blog",
  "settings",
];

const actions: string[] = ["view", "create", "edit", "delete", "export"];

const roleLevels: Record<string, number> = {
  "Super Admin": 0,
  Manager: 1,
  "Sales Executive": 2,
  "Content Manager": 2,
  Accountant: 2,
  Partner: 3,
};

const rolePermissions: Record<string, string[]> = {
  "Super Admin": modules.flatMap((m) => actions.map((a) => `${m}:${a}`)),
  Manager: [
    "dashboard:view",
    "builders:view",
    "builders:create",
    "builders:edit",
    "projects:view",
    "projects:create",
    "projects:edit",
    "properties:view",
    "properties:create",
    "properties:edit",
    "inventory:view",
    "inventory:edit",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:export",
    "clients:view",
    "clients:create",
    "clients:edit",
    "sales:view",
    "sales:create",
    "sales:edit",
    "payments:view",
    "payments:create",
    "payments:edit",
    "commissions:view",
    "partners:view",
    "partners:edit",
    "staff:view",
    "staff:create",
    "staff:edit",
    "media:view",
    "media:create",
    "media:edit",
    "pages:view",
    "pages:create",
    "pages:edit",
    "menus:view",
    "menus:create",
    "menus:edit",
    "branding:view",
    "branding:edit",
    "seo:view",
    "seo:edit",
    "blog:view",
    "blog:create",
    "blog:edit",
    "settings:view",
  ],
  "Sales Executive": [
    "dashboard:view",
    "projects:view",
    "properties:view",
    "inventory:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "clients:view",
    "clients:create",
    "clients:edit",
    "sales:view",
    "sales:create",
    "sales:edit",
    "payments:view",
    "media:view",
    "media:create",
    "blog:view",
  ],
  "Content Manager": [
    "dashboard:view",
    "projects:view",
    "properties:view",
    "builders:view",
    "media:view",
    "media:create",
    "media:edit",
    "media:delete",
    "pages:view",
    "pages:create",
    "pages:edit",
    "pages:delete",
    "menus:view",
    "menus:create",
    "menus:edit",
    "menus:delete",
    "branding:view",
    "seo:view",
    "seo:edit",
    "blog:view",
    "blog:create",
    "blog:edit",
    "blog:delete",
  ],
  Accountant: [
    "dashboard:view",
    "leads:view",
    "clients:view",
    "sales:view",
    "payments:view",
    "payments:create",
    "payments:edit",
    "commissions:view",
    "commissions:edit",
    "commissions:export",
    "builders:view",
    "builders:edit",
    "settings:view",
  ],
  Partner: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "commissions:view",
  ],
};

const amenities = [
  { name: "24x7 Security", icon: "Shield", group: "SECURITY" },
  { name: "CCTV Surveillance", icon: "Video", group: "SECURITY" },
  { name: "Power Backup", icon: "Zap", group: "COMFORT" },
  { name: "Water Supply", icon: "Droplet", group: "COMFORT" },
  { name: "Swimming Pool", icon: "Pool", group: "RECREATION" },
  { name: "Gymnasium", icon: "Dumbbell", group: "RECREATION" },
  { name: "Landscaped Garden", icon: "Tree", group: "RECREATION" },
  { name: "Children's Play Area", icon: "Activity", group: "RECREATION" },
  { name: "Club House", icon: "Building", group: "RECREATION" },
  { name: "Car Parking", icon: "Car", group: "PARKING" },
  { name: "Visitor Parking", icon: "Car", group: "PARKING" },
  { name: "Lift", icon: "ArrowUp", group: "COMFORT" },
  { name: "Intercom", icon: "Phone", group: "SECURITY" },
  { name: "Gas Pipeline", icon: "Flame", group: "COMFORT" },
  { name: "WiFi Enabled", icon: "Wifi", group: "COMFORT" },
  { name: "Jogging Track", icon: "Map", group: "RECREATION" },
  { name: "Basketball Court", icon: "Landmark", group: "RECREATION" },
  { name: "Rainwater Harvesting", icon: "Droplet", group: "LOCATION" },
  { name: "Solar Heating", icon: "Sun", group: "COMFORT" },
];

const cities = [
  {
    name: "Indore",
    slug: "indore",
    state: "Madhya Pradesh",
    localities: [
      { name: "Vijay Nagar", pincode: "452010", avgPriceSqFt: 5500 },
      { name: "Bhawarkua", pincode: "452002", avgPriceSqFt: 6200 },
      { name: "Palasia", pincode: "452001", avgPriceSqFt: 7500 },
      { name: "Rau", pincode: "453331", avgPriceSqFt: 4800 },
      { name: "Scheme 54", pincode: "452010", avgPriceSqFt: 6800 },
      { name: "Bicholi Mardana", pincode: "452016", avgPriceSqFt: 5200 },
      { name: "Annupurna", pincode: "452009", avgPriceSqFt: 6000 },
    ],
  },
  {
    name: "Bhopal",
    slug: "bhopal",
    state: "Madhya Pradesh",
    localities: [
      { name: "MP Nagar", pincode: "462011", avgPriceSqFt: 5800 },
      { name: "Arera Colony", pincode: "462016", avgPriceSqFt: 6500 },
      { name: "Eklavya", pincode: "462026", avgPriceSqFt: 4500 },
    ],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create roles
  const roles: Record<string, { id: string }> = {};
  for (const [name, level] of Object.entries(roleLevels)) {
    const role = await db.role.upsert({
      where: { name },
      update: { level, isSystem: true },
      create: { name, level, isSystem: true },
    });
    roles[name] = role;
  }

  // 2. Create permissions
  const permissions: Record<string, { id: string }> = {};
  for (const mod of modules) {
    for (const action of actions) {
      const name = `${mod}:${action}`;
      const perm = await db.permission.upsert({
        where: { name },
        update: {},
        create: { name, module: mod, action },
      });
      permissions[name] = perm;
    }
  }

  // 3. Assign permissions to roles
  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = roles[roleName];
    if (!role) {
      console.warn(`⚠️  Role not found: ${roleName}`);
      continue;
    }
    for (const permKey of perms) {
      const [mod, act] = permKey.split(":");
      const perm = permissions[`${mod}:${act}` as `${string}:${string}`];
      if (!perm) {
        console.warn(`⚠️  Permission not found: ${permKey}`);
        continue;
      }
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: { granted: true },
        create: { roleId: role.id, permissionId: perm.id, granted: true },
      });
    }
  }

  // 4. Create amenities
  for (const a of amenities) {
    await db.amenity.upsert({
      where: { name: a.name },
      update: {},
      create: { name: a.name, icon: a.icon, group: a.group as AmenityGroup },
    });
  }

  // 5. Create cities and localities
  for (const c of cities) {
    const city = await db.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug, state: c.state },
    });
    for (const l of c.localities) {
      await db.locality.upsert({
        where: { slug: `${c.slug}-${l.name.toLowerCase().replace(/\s+/g, "-")}` },
        update: {},
        create: {
          name: l.name,
          slug: `${c.slug}-${l.name.toLowerCase().replace(/\s+/g, "-")}`,
          cityId: city.id,
          pincode: l.pincode,
          avgPriceSqFt: l.avgPriceSqFt,
        },
      });
    }
  }

  // 6. Create admin user
  const superAdminRole = roles["Super Admin"];
  const passwordHash = await hash(ADMIN_PASSWORD);

  await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: "+91 98765 43210",
      passwordHash,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);

  // 7. Create sample builder
  const builder = await db.builder.upsert({
    where: { slug: "shree-constructions" },
    update: {},
    create: {
      name: "Shree Constructions",
      slug: "shree-constructions",
      about: "Leading builder in Central India with 20+ years of experience.",
      reraNo: "RERA-MP-1234",
      website: "https://shreeconstructions.example.com",
      contactName: "Rajesh Sharma",
      contactPhone: "+91 98765 43210",
      contactEmail: "sales@shreeconstructions.example.com",
      address: "123, Scheme 54, Vijay Nagar, Indore, MP 452010",
      commissionTerms: "5% on booking value",
      status: "active",
      featured: true,
    },
  });

  console.log(`✅ Sample builder created: ${builder.name}`);

  // 8. Create sample project
  const indore = await db.city.findUnique({ where: { slug: "indore" } });
  await db.locality.findFirst({
    where: { name: "Vijay Nagar", cityId: indore?.id },
  });

  const project = await db.project.upsert({
    where: { slug: "shree-green-valley" },
    update: {},
    create: {
      builderId: builder.id,
      name: "Shree Green Valley",
      slug: "shree-green-valley",
      type: "APARTMENT",
      status: "NEW_LAUNCH",
      city: "Indore",
      locality: "Vijay Nagar",
      pincode: "452010",
      reraNo: "RERA-MP-5678",
      priceMin: 450000000, // 4.5 Cr in paisa
      priceMax: 850000000, // 8.5 Cr in paisa
      areaMin: 850,
      areaMax: 1800,
      possessionDate: new Date("2027-12-31"),
      launchDate: new Date("2025-11-01"),
      totalUnits: 200,
      towers: 4,
      description:
        "Premium residential apartments in the heart of Vijay Nagar, Indore. World-class amenities, excellent connectivity, and modern architecture.",
      highlights: [
        "RERA Registered",
        "24x7 Security",
        "Swimming Pool",
        "Gymnasium",
        "Power Backup",
        "Near Metro Station",
      ],
      specifications: {
        flooring: "Vitrified Tiles",
        kitchen: "Granite Countertop",
        bathroom: "Premium Sanitary Ware",
        windows: "UPVC Frames",
        wiring: "Copper Wiring",
      },
      paymentPlan: [
        { stage: "Booking", percentage: 10, description: "At the time of booking" },
        { stage: "Foundation", percentage: 15, description: "On foundation completion" },
        { stage: "Structure", percentage: 25, description: "On structure completion" },
        { stage: "Plastering", percentage: 20, description: "On plastering completion" },
        { stage: "Possession", percentage: 30, description: "At the time of possession" },
      ],
      faqs: [
        { question: "What is the RERA number?", answer: "RERA-MP-5678" },
        { question: "When is possession?", answer: "December 2027" },
        { question: "What configurations are available?", answer: "2 BHK and 3 BHK" },
      ],
      videoUrls: ["https://youtube.com/watch?v=example1"],
      virtualTourUrl: "https://example.com/virtual-tour",
      featured: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Sample project created: ${project.name}`);

  // 9. Create sample units
  const sampleUnits = [
    { unitNo: "101", floor: 1, bhk: "2 BHK", area: 850, price: 450000000 },
    { unitNo: "102", floor: 1, bhk: "2 BHK", area: 870, price: 460000000 },
    { unitNo: "201", floor: 2, bhk: "3 BHK", area: 1250, price: 650000000 },
    { unitNo: "202", floor: 2, bhk: "3 BHK", area: 1300, price: 680000000 },
    { unitNo: "301", floor: 3, bhk: "3 BHK", area: 1400, price: 720000000 },
  ];

  // Create a tower first
  const tower = await db.tower.create({
    data: {
      projectId: project.id,
      name: "Tower A",
      floors: 5,
      sortOrder: 1,
    },
  });

  for (const u of sampleUnits) {
    await db.unit.create({
      data: {
        projectId: project.id,
        towerId: tower.id,
        unitNo: u.unitNo,
        floor: u.floor,
        bhk: u.bhk,
        area: u.area,
        facing: u.floor % 2 === 0 ? "East" : "West",
        price: u.price,
        status: "AVAILABLE",
        sortOrder: u.floor,
      },
    });
  }

  console.log(`✅ Sample units created: ${sampleUnits.length}`);

  // 10. Create default settings
  const defaultSettings = [
    {
      key: "site.title",
      value: { value: "ChannelPartner Pro" },
      group: "BRANDING" as const,
    },
    {
      key: "site.tagline",
      value: { value: "Your Trusted Real Estate Partner" },
      group: "BRANDING" as const,
    },
    {
      key: "brand.primaryColor",
      value: { value: "#0f172a" },
      group: "BRANDING" as const,
    },
    {
      key: "brand.secondaryColor",
      value: { value: "#1e293b" },
      group: "BRANDING" as const,
    },
    {
      key: "brand.accentColor",
      value: { value: "#2563eb" },
      group: "BRANDING" as const,
    },
    {
      key: "currency",
      value: { value: "INR" },
      group: "SYSTEM" as const,
    },
    {
      key: "timezone",
      value: { value: "Asia/Kolkata" },
      group: "SYSTEM" as const,
    },
  ];

  for (const s of defaultSettings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("✅ Default settings created");
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
