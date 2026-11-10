import { db } from "../src/lib/db";

async function main() {
  console.log("🏢 Seeding dynamic mixed-use inventory and floor structures...");

  // 1. Get all projects
  const projects = await db.project.findMany();
  console.log(`Found ${projects.length} projects`);

  // Clean old units and towers to prevent duplicates
  await db.unit.deleteMany();
  await db.tower.deleteMany();

  for (const project of projects) {
    console.log(`Setting up towers and units for: ${project.name}`);

    if (project.slug === "shree-green-valley") {
      // Mixed-use flagship project with 2 towers: Tower A (Mixed-Use Commercial + Residential) & Tower B (Residential Luxury)
      const towerA = await db.tower.create({
        data: {
          projectId: project.id,
          name: "Tower A (Mixed-Use Podium)",
          floors: 5,
          sortOrder: 1,
        },
      });

      const towerB = await db.tower.create({
        data: {
          projectId: project.id,
          name: "Tower B (Residential Wing)",
          floors: 6,
          sortOrder: 2,
        },
      });

      // Tower A:
      // Floor 1: Retail Shopping & Showrooms
      const floor1Units = [
        { no: "Shop 101", bhk: "Retail Shop", area: 450, facing: "East", price: 4500000, status: "AVAILABLE" as const },
        { no: "Shop 102", bhk: "Retail Showroom", area: 720, facing: "North-East", price: 7200000, status: "SOLD" as const },
        { no: "Shop 103", bhk: "F&B Cafe Space", area: 550, facing: "East", price: 5500000, status: "HOLD" as const },
        { no: "Shop 104", bhk: "Pharmacy / Clinic", area: 480, facing: "North", price: 4800000, status: "RENTED" as const },
      ];

      // Floor 2: Commercial Office Suites
      const floor2Units = [
        { no: "Office 201", bhk: "Commercial Office", area: 950, facing: "North-East", price: 8500000, status: "AVAILABLE" as const },
        { no: "Office 202", bhk: "Corporate Suite", area: 1100, facing: "East", price: 9800000, status: "AVAILABLE" as const },
        { no: "Office 203", bhk: "Co-working Bay", area: 1350, facing: "West", price: 12000000, status: "SOLD" as const },
      ];

      // Floor 3: Residential 2 BHK & 3 BHK
      const floor3Units = [
        { no: "Flat 301", bhk: "2 BHK Flat", area: 1050, facing: "East", price: 5800000, status: "AVAILABLE" as const },
        { no: "Flat 302", bhk: "2 BHK Flat", area: 1080, facing: "West", price: 6000000, status: "AVAILABLE" as const },
        { no: "Flat 303", bhk: "3 BHK Flat", area: 1450, facing: "North-East", price: 8200000, status: "HOLD" as const },
        { no: "Flat 304", bhk: "3 BHK Flat", area: 1500, facing: "North", price: 8500000, status: "AVAILABLE" as const },
      ];

      // Floor 4: Residential 3 BHK Premium
      const floor4Units = [
        { no: "Flat 401", bhk: "3 BHK Flat", area: 1520, facing: "East", price: 8800000, status: "SOLD" as const },
        { no: "Flat 402", bhk: "3 BHK Flat", area: 1520, facing: "West", price: 8800000, status: "AVAILABLE" as const },
        { no: "Flat 403", bhk: "3 BHK Flat", area: 1550, facing: "North", price: 9000000, status: "AVAILABLE" as const },
        { no: "Flat 404", bhk: "3 BHK Flat", area: 1550, facing: "East", price: 9000000, status: "BLOCKED" as const },
      ];

      // Floor 5: Sky Villas & Penthouses
      const floor5Units = [
        { no: "Penthouse 501", bhk: "4 BHK Sky Villa", area: 2800, facing: "North-East", price: 18500000, status: "HOLD" as const },
        { no: "Penthouse 502", bhk: "4 BHK Sky Villa", area: 3100, facing: "East", price: 21000000, status: "AVAILABLE" as const },
      ];

      const allA = [
        ...floor1Units.map(u => ({ ...u, floor: 1 })),
        ...floor2Units.map(u => ({ ...u, floor: 2 })),
        ...floor3Units.map(u => ({ ...u, floor: 3 })),
        ...floor4Units.map(u => ({ ...u, floor: 4 })),
        ...floor5Units.map(u => ({ ...u, floor: 5 })),
      ];

      for (const u of allA) {
        await db.unit.create({
          data: {
            projectId: project.id,
            towerId: towerA.id,
            unitNo: u.no,
            floor: u.floor,
            bhk: u.bhk,
            area: u.area,
            facing: u.facing,
            price: u.price,
            status: u.status,
            sortOrder: u.floor,
          },
        });
      }

      // Tower B: Residential floors 1 to 4
      for (let f = 1; f <= 4; f++) {
        for (let u = 1; u <= 3; u++) {
          const isBhk3 = u === 3;
          await db.unit.create({
            data: {
              projectId: project.id,
              towerId: towerB.id,
              unitNo: `B-${f}0${u}`,
              floor: f,
              bhk: isBhk3 ? "3 BHK Luxury" : "2 BHK Executive",
              area: isBhk3 ? 1420 : 1100,
              facing: u === 1 ? "East" : u === 2 ? "North" : "West",
              price: isBhk3 ? 8400000 : 6200000,
              status: f === 1 && u === 1 ? "SOLD" : f === 2 && u === 2 ? "HOLD" : "AVAILABLE",
              sortOrder: f,
            },
          });
        }
      }
    } else {
      // For other projects (e.g. Sunrise Heights, Royal Enclave, Skyline Towers):
      const tower = await db.tower.create({
        data: {
          projectId: project.id,
          name: "Main Tower",
          floors: 4,
          sortOrder: 1,
        },
      });

      // Mixed structure: Floor 1 is commercial retail, Floor 2-4 are residential
      // Floor 1 (Commercial)
      await db.unit.create({
        data: {
          projectId: project.id,
          towerId: tower.id,
          unitNo: "Shop 101",
          floor: 1,
          bhk: "Retail Commercial Shop",
          area: 500,
          facing: "East",
          price: 5200000,
          status: "AVAILABLE",
          sortOrder: 1,
        },
      });
      await db.unit.create({
        data: {
          projectId: project.id,
          towerId: tower.id,
          unitNo: "Shop 102",
          floor: 1,
          bhk: "Retail Showroom",
          area: 750,
          facing: "North",
          price: 7800000,
          status: "RENTED",
          sortOrder: 1,
        },
      });

      // Floor 2 to 4 (Residential)
      for (let f = 2; f <= 4; f++) {
        for (let u = 1; u <= 2; u++) {
          await db.unit.create({
            data: {
              projectId: project.id,
              towerId: tower.id,
              unitNo: `${f}0${u}`,
              floor: f,
              bhk: u === 1 ? "2 BHK Flat" : "3 BHK Flat",
              area: u === 1 ? 1050 : 1450,
              facing: u === 1 ? "East" : "North-East",
              price: u === 1 ? 5500000 : 7900000,
              status: f === 2 && u === 1 ? "SOLD" : "AVAILABLE",
              sortOrder: f,
            },
          });
        }
      }
    }
  }

  const finalCount = await db.unit.count();
  console.log(`✅ Successfully seeded ${finalCount} dynamic units with mixed-use structures!`);
}

main().catch(console.error);
