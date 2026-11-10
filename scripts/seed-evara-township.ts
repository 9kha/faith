import { db } from "../src/lib/db";

async function main() {
  console.log("🌟 Checking and seeding Evara 27-Acre Luxury Township...");

  const builder = await db.builder.findFirst();
  if (!builder) {
    console.error("No builder found");
    return;
  }

  // Create or find Evara Project
  const evara = await db.project.upsert({
    where: { slug: "evara-27-acre-luxury-township" },
    update: {
      name: "Evara 27-Acre Luxury Township",
      type: "TOWNSHIP",
      status: "NEW_LAUNCH",
      city: "Indore",
      locality: "Super Corridor / Bypass Road",
      priceMin: 19500000,
      priceMax: 165000000,
      areaMin: 2450,
      areaMax: 12000,
      description:
        "Super-luxury 27-acre integrated township featuring exclusive Presidential Bungalows (4 BHK to 8 BHK) and 4 iconic high-rise towers (T1, T2, T3, T4 - G+23 floors) with alternating Odd-Even double-height sky terrace architectural design.",
      highlights: [
        "27-Acre Master Township",
        "4 BHK to 8 BHK Presidential Bungalows with Private Lawns",
        "4 High-Rise Towers (T1 to T4, G+23 Floors)",
        "Odd-Even Double-Height Sky Balconies",
        "Olympic Sized Pool & 50,000 sq ft Clubhouse",
        "Private Helipad & High-Street Retail Boulevard",
      ],
      featured: true,
      sortOrder: 0,
      publishedAt: new Date(),
    },
    create: {
      builderId: builder.id,
      name: "Evara 27-Acre Luxury Township",
      slug: "evara-27-acre-luxury-township",
      type: "TOWNSHIP",
      status: "NEW_LAUNCH",
      city: "Indore",
      locality: "Super Corridor / Bypass Road",
      pincode: "452010",
      reraNo: "RERA-MP-EVARA-2025-099",
      priceMin: 19500000,
      priceMax: 165000000,
      areaMin: 2450,
      areaMax: 12000,
      description:
        "Super-luxury 27-acre integrated township featuring exclusive Presidential Bungalows (4 BHK to 8 BHK) and 4 iconic high-rise towers (T1, T2, T3, T4 - G+23 floors) with alternating Odd-Even double-height sky terrace architectural design.",
      highlights: [
        "27-Acre Master Township",
        "4 BHK to 8 BHK Presidential Bungalows with Private Lawns",
        "4 High-Rise Towers (T1 to T4, G+23 Floors)",
        "Odd-Even Double-Height Sky Balconies",
        "Olympic Sized Pool & 50,000 sq ft Clubhouse",
        "Private Helipad & High-Street Retail Boulevard",
      ],
      featured: true,
      sortOrder: 0,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Evara Project ready: ${evara.name} (ID: ${evara.id})`);

  // Check if units already exist
  const count = await db.unit.count({ where: { projectId: evara.id } });
  if (count === 0) {
    console.log("Generating full Evara 27-Acre inventory via database generator...");

    // 1. Zone 1: Presidential Bungalows (4 BHK to 8 BHK)
    const bungalowTower = await db.tower.create({
      data: {
        projectId: evara.id,
        name: "Presidential Bungalows & Villas (27-Acre Enclave)",
        floors: 1,
        sortOrder: 1,
      },
    });

    const villaConfigs = [
      { type: "4 BHK Signature Bungalow", area: 3800, price: 42000000, facing: "East Lawn" },
      { type: "5 BHK Royal Villa", area: 5200, price: 65000000, facing: "North Garden" },
      { type: "6 BHK Heritage Mansion", area: 7500, price: 98000000, facing: "North-East Pool Facing" },
      { type: "8 BHK Presidential Palace", area: 12000, price: 165000000, facing: "East Private Lake" },
    ];

    for (let v = 1; v <= 16; v++) {
      const cfg =
        v <= 5 ? villaConfigs[0] : v <= 10 ? villaConfigs[1] : v <= 14 ? villaConfigs[2] : villaConfigs[3];
      const vNum = v < 10 ? `Villa 0${v}` : `Villa ${v}`;

      await db.unit.create({
        data: {
          projectId: evara.id,
          towerId: bungalowTower.id,
          unitNo: vNum,
          floor: 0,
          bhk: cfg.type,
          area: cfg.area,
          facing: cfg.facing,
          price: cfg.price,
          status: v === 3 ? "SOLD" : v === 7 ? "HOLD" : v === 15 ? "BLOCKED" : "AVAILABLE",
          sortOrder: 0,
        },
      });
    }

    // 2. Zone 2: Towers T1, T2, T3, T4 with G+23 Floors and Odd-Even concept
    const evaraTowers = ["Tower T1 (G+23)", "Tower T2 (G+23)", "Tower T3 (G+23)", "Tower T4 (G+23)"];

    for (let tIdx = 0; tIdx < evaraTowers.length; tIdx++) {
      const tName = evaraTowers[tIdx];
      const tower = await db.tower.create({
        data: {
          projectId: evara.id,
          name: tName,
          floors: 23,
          sortOrder: tIdx + 2,
        },
      });

      // Generate floors 1 to 23 with Odd-Even alternating concept
      for (let f = 1; f <= 23; f++) {
        const isOdd = f % 2 !== 0;
        const floorBhk = isOdd
          ? "3 BHK + Extended Sky Balcony"
          : "4 BHK Sky Mansion (Double-Height Terrace)";
        const floorUnitsCount = isOdd ? 4 : 3;
        const floorArea = isOdd ? 2450 : 3250;
        const floorPrice = isOdd ? 19500000 : 26500000;
        const floorFacing = isOdd ? "East Open Sky" : "West Sunset Deck";

        for (let u = 1; u <= floorUnitsCount; u++) {
          const uPad = u < 10 ? `0${u}` : `${u}`;
          const tCode = `T${tIdx + 1}`;
          const uNo = `${tCode}-${f}${uPad}`;

          await db.unit.create({
            data: {
              projectId: evara.id,
              towerId: tower.id,
              unitNo: uNo,
              floor: f,
              bhk: floorBhk,
              area: floorArea,
              facing: floorFacing,
              price: floorPrice,
              status: (f === 3 && u === 1) || (f === 12 && u === 2) ? "SOLD" : f === 8 && u === 1 ? "HOLD" : "AVAILABLE",
              sortOrder: f,
            },
          });
        }
      }
    }

    console.log("✅ Seeded full Evara 27-Acre township with 4 towers (T1-T4) and Bungalows!");
  } else {
    console.log(`Evara already has ${count} units`);
  }
}

main().catch(console.error);
