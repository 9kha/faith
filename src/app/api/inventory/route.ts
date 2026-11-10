import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma, UnitStatus } from "@prisma/client";

export const runtime = "nodejs";

// GET: Load inventory, towers, and comprehensive metrics for a project
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const status = searchParams.get("status") || undefined;
    const keyword = searchParams.get("search") || undefined;
    const floor = searchParams.get("floor") || undefined;
    const towerId = searchParams.get("towerId") || undefined;

    // If projectId is provided, load all towers and units for that project
    const where: Prisma.UnitWhereInput = {
      deletedAt: null,
      ...(projectId ? { projectId } : {}),
      ...(towerId ? { towerId } : {}),
      ...(status ? { status: status as UnitStatus } : {}),
      ...(floor ? { floor: parseInt(floor, 10) } : {}),
      ...(keyword
        ? {
            OR: [
              { unitNo: { contains: keyword } },
              { bhk: { contains: keyword } },
              { tower: { name: { contains: keyword } } },
              { project: { name: { contains: keyword } } },
            ],
          }
        : {}),
    };

    const [units, towers, total] = await Promise.all([
      db.unit.findMany({
        where,
        include: {
          tower: { select: { id: true, name: true, floors: true } },
          project: { select: { id: true, name: true, slug: true, type: true } },
        },
        orderBy: [
          { tower: { name: "asc" } },
          { floor: "desc" }, // Highest floor first (architectural view)
          { unitNo: "asc" },
        ],
      }),
      projectId
        ? db.tower.findMany({
            where: { projectId },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          })
        : [],
      db.unit.count({ where }),
    ]);

    // Calculate dynamic stats
    const stats = {
      total: units.length,
      available: units.filter((u) => u.status === "AVAILABLE").length,
      sold: units.filter((u) => u.status === "SOLD").length,
      hold: units.filter((u) => u.status === "HOLD").length,
      blocked: units.filter((u) => u.status === "BLOCKED").length,
      rented: units.filter((u) => u.status === "RENTED").length,
      commercial: units.filter((u) =>
        /shop|retail|showroom|office|commercial|kiosk/i.test(u.bhk || "")
      ).length,
      residential: units.filter(
        (u) => !/shop|retail|showroom|office|commercial|kiosk/i.test(u.bhk || "")
      ).length,
    };

    return NextResponse.json({
      units,
      towers,
      total,
      stats,
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { error: "Failed to load inventory" },
      { status: 500 }
    );
  }
}

// POST: Create single unit, create tower, or batch generate floor structures
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Create a new Tower / Wing / Block
    if (action === "create_tower") {
      const { projectId, name, floors } = body;
      if (!projectId || !name) {
        return NextResponse.json(
          { error: "Project and Tower name are required" },
          { status: 400 }
        );
      }

      const tower = await db.tower.create({
        data: {
          projectId,
          name: name.trim(),
          floors: parseInt(floors, 10) || 5,
        },
      });

      return NextResponse.json({ tower, message: "Tower created successfully" });
    }

    // 2. Batch Smart Floor Generator (supports Odd-Even, Evara 27-acre township, multi-tower, bungalows)
    if (action === "batch_generate") {
      const {
        projectId,
        generatorMode = "STANDARD",
        towerId,
        towerName,
        targetTowers, // array of tower names or comma separated e.g. ["Tower T1", "Tower T2", "Tower T3", "Tower T4"]
        startFloor = 1,
        endFloor = 23,
        unitsPerFloor = 4,
        bhkType = "2 BHK Luxury",
        prefix = "",
        baseArea = 1200,
        basePrice = 6500000,
        facing = "East",
        // Odd-Even Alternating Specifics
        oddBhk = "3 BHK + Sky Balcony Deck",
        oddUnits = 4,
        oddArea = 2450,
        oddPrice = 19500000,
        oddFacing = "East Open Sky",
        evenBhk = "4 BHK Sky Mansion (Double-Height Terrace)",
        evenUnits = 3,
        evenArea = 3250,
        evenPrice = 26500000,
        evenFacing = "West Sunset Deck",
        // Bungalow specifics
        villaCount = 20,
        villaTowerName = "Presidential Bungalows & Villas (27-Acre Enclave)",
      } = body;

      if (!projectId) {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
      }

      const createdUnits = [];

      // A. Special 1-Click Evara 27-Acre Township Model
      if (generatorMode === "EVARA_27ACRE") {
        // 1. Create Presidential Bungalow Enclave (4 BHK to 8 BHK)
        const bungalowTower = await db.tower.create({
          data: {
            projectId,
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

          const existing = await db.unit.findFirst({
            where: { projectId, unitNo: vNum },
          });
          if (!existing) {
            const unit = await db.unit.create({
              data: {
                projectId,
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
            createdUnits.push(unit);
          }
        }

        // 2. Create High-Rise Towers T1, T2, T3, T4 with G+23 Floors and Odd-Even concept
        const evaraTowers = ["Tower T1 (G+23)", "Tower T2 (G+23)", "Tower T3 (G+23)", "Tower T4 (G+23)"];

        for (let tIdx = 0; tIdx < evaraTowers.length; tIdx++) {
          const tName = evaraTowers[tIdx];
          const tower = await db.tower.create({
            data: {
              projectId,
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

              const existing = await db.unit.findFirst({
                where: { projectId, unitNo: uNo },
              });
              if (!existing) {
                const unit = await db.unit.create({
                  data: {
                    projectId,
                    towerId: tower.id,
                    unitNo: uNo,
                    floor: f,
                    bhk: floorBhk,
                    area: floorArea,
                    facing: floorFacing,
                    price: floorPrice,
                    status: (f === 3 && u === 1) || (f === 12 && u === 2) ? "SOLD" : f === 8 ? "HOLD" : "AVAILABLE",
                    sortOrder: f,
                  },
                });
                createdUnits.push(unit);
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          count: createdUnits.length,
          message: `Evara 27-Acre Model successfully created: 16 Presidential Bungalows (4-8 BHK) + 4 Towers (T1 to T4, G+23 Odd-Even floors) with ${createdUnits.length} total units!`,
        });
      }

      // B. Bungalow Enclave Only
      if (generatorMode === "BUNGALOWS") {
        let bTower = await db.tower.findFirst({
          where: { projectId, name: villaTowerName.trim() },
        });
        if (!bTower) {
          bTower = await db.tower.create({
            data: {
              projectId,
              name: villaTowerName.trim(),
              floors: 1,
              sortOrder: 1,
            },
          });
        }

        const count = parseInt(villaCount, 10) || 12;
        const bConfigs = [
          { type: "4 BHK Luxury Bungalow", area: 3600, price: 38000000, facing: "East" },
          { type: "5 BHK Royal Villa", area: 4800, price: 58000000, facing: "North-East" },
          { type: "6 BHK Heritage Mansion", area: 6800, price: 85000000, facing: "North" },
          { type: "8 BHK Presidential Estate", area: 11500, price: 155000000, facing: "East" },
        ];

        for (let v = 1; v <= count; v++) {
          const cfg =
            v <= 4 ? bConfigs[0] : v <= 8 ? bConfigs[1] : v <= 10 ? bConfigs[2] : bConfigs[3];
          const vNum = v < 10 ? `Villa 0${v}` : `Villa ${v}`;

          const existing = await db.unit.findFirst({
            where: { projectId, unitNo: vNum },
          });
          if (!existing) {
            const unit = await db.unit.create({
              data: {
                projectId,
                towerId: bTower.id,
                unitNo: vNum,
                floor: 0,
                bhk: cfg.type,
                area: cfg.area,
                facing: cfg.facing,
                price: cfg.price,
                status: "AVAILABLE",
                sortOrder: 0,
              },
            });
            createdUnits.push(unit);
          }
        }

        return NextResponse.json({
          success: true,
          count: createdUnits.length,
          message: `Created ${createdUnits.length} Bungalows & Villas (4 BHK to 8 BHK) successfully!`,
        });
      }

      // C. Odd-Even Alternating Multi-Tower High-Rise or Standard Towers
      // Determine list of towers to populate
      let towerList: string[] = [];
      if (Array.isArray(targetTowers) && targetTowers.length > 0) {
        towerList = targetTowers;
      } else if (typeof targetTowers === "string" && targetTowers.trim()) {
        towerList = targetTowers.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (towerName) {
        towerList = [towerName.trim()];
      } else {
        towerList = ["Tower A"];
      }

      const sFloor = parseInt(startFloor, 10);
      const eFloor = parseInt(endFloor, 10);

      for (const tName of towerList) {
        // Resolve or create tower
        let curTower = await db.tower.findFirst({
          where: { projectId, name: tName },
        });
        if (!curTower) {
          curTower = await db.tower.create({
            data: {
              projectId,
              name: tName,
              floors: Math.max(eFloor, 1),
            },
          });
        }

        for (let f = sFloor; f <= eFloor; f++) {
          let floorBhk = bhkType;
          let floorUnits = parseInt(unitsPerFloor, 10) || 4;
          let floorArea = parseFloat(baseArea) || 1200;
          let floorPrice = parseInt(basePrice, 10) || 6500000;
          let floorFacing = facing;

          if (generatorMode === "ODD_EVEN") {
            const isOdd = f % 2 !== 0;
            if (isOdd) {
              floorBhk = oddBhk;
              floorUnits = parseInt(oddUnits, 10) || 4;
              floorArea = parseFloat(oddArea) || 2450;
              floorPrice = parseInt(oddPrice, 10) || 19500000;
              floorFacing = oddFacing;
            } else {
              floorBhk = evenBhk;
              floorUnits = parseInt(evenUnits, 10) || 3;
              floorArea = parseFloat(evenArea) || 3250;
              floorPrice = parseInt(evenPrice, 10) || 26500000;
              floorFacing = evenFacing;
            }
          }

          for (let u = 1; u <= floorUnits; u++) {
            const floorStr = f < 10 ? `0${f}` : `${f}`;
            const unitIndexStr = u < 10 ? `0${u}` : `${u}`;
            const customPrefix = prefix ? prefix.trim() : "";
            const unitNumber = customPrefix
              ? `${customPrefix}-${f}${unitIndexStr}`
              : `${f}${unitIndexStr}`;

            const existing = await db.unit.findFirst({
              where: { projectId, unitNo: unitNumber },
            });

            if (!existing) {
              const unit = await db.unit.create({
                data: {
                  projectId,
                  towerId: curTower.id,
                  unitNo: unitNumber,
                  floor: f,
                  bhk: floorBhk,
                  area: floorArea,
                  facing: floorFacing,
                  price: floorPrice,
                  status: "AVAILABLE",
                  sortOrder: f,
                },
              });
              createdUnits.push(unit);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        count: createdUnits.length,
        message: `Generated ${createdUnits.length} dynamic units across ${towerList.length} tower(s) successfully!`,
      });
    }

    // 3. Single Custom Unit Creation
    const {
      projectId,
      towerId,
      unitNo,
      floor,
      bhk,
      area,
      facing,
      price,
      status,
      holdUntil,
    } = body;

    if (!projectId || !unitNo) {
      return NextResponse.json(
        { error: "Project and Unit Number are required" },
        { status: 400 }
      );
    }

    const unit = await db.unit.create({
      data: {
        projectId,
        towerId: towerId || null,
        unitNo: unitNo.trim(),
        floor: floor !== undefined && floor !== "" ? parseInt(floor, 10) : null,
        bhk: bhk ? bhk.trim() : "2 BHK",
        area: area ? parseFloat(area) : null,
        facing: facing ? facing.trim() : "East",
        price: price ? parseInt(price, 10) : null,
        status: (status as UnitStatus) || "AVAILABLE",
        holdUntil: holdUntil ? new Date(holdUntil) : null,
      },
      include: {
        tower: true,
        project: true,
      },
    });

    return NextResponse.json({ unit, message: "Unit created successfully" });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { error: "Failed to create unit or tower structure" },
      { status: 500 }
    );
  }
}

// PUT: Full update of an existing unit
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      unitNo,
      floor,
      bhk,
      area,
      facing,
      price,
      status,
      holdUntil,
      towerId,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    const unit = await db.unit.update({
      where: { id },
      data: {
        ...(unitNo ? { unitNo: unitNo.trim() } : {}),
        floor: floor !== undefined && floor !== "" ? parseInt(floor, 10) : null,
        ...(bhk ? { bhk: bhk.trim() } : {}),
        area: area !== undefined ? parseFloat(area) : null,
        ...(facing ? { facing: facing.trim() } : {}),
        price: price !== undefined ? parseInt(price, 10) : null,
        ...(status ? { status: status as UnitStatus } : {}),
        holdUntil: holdUntil ? new Date(holdUntil) : null,
        ...(towerId !== undefined ? { towerId: towerId || null } : {}),
      },
      include: {
        tower: true,
      },
    });

    return NextResponse.json({ unit, message: "Unit updated successfully" });
  } catch (error) {
    console.error("Inventory PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// PATCH: Quick status change
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { unitId, status, holdUntil } = body;

    if (!unitId || !status) {
      return NextResponse.json(
        { error: "unitId and status are required" },
        { status: 400 }
      );
    }

    const unit = await db.unit.update({
      where: { id: unitId },
      data: {
        status: status as UnitStatus,
        holdUntil: holdUntil ? new Date(holdUntil) : null,
      },
    });

    return NextResponse.json({ unit, message: "Status updated" });
  } catch (error) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete unit or tower
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("id");
    const towerId = searchParams.get("towerId");

    if (unitId) {
      await db.unit.delete({
        where: { id: unitId },
      });
      return NextResponse.json({ message: "Unit deleted successfully" });
    }

    if (towerId) {
      // Check if tower has units
      const unitCount = await db.unit.count({ where: { towerId } });
      if (unitCount > 0) {
        // Disassociate units or delete them
        await db.unit.deleteMany({ where: { towerId } });
      }
      await db.tower.delete({ where: { id: towerId } });
      return NextResponse.json({ message: "Tower deleted successfully" });
    }

    return NextResponse.json(
      { error: "Unit ID or Tower ID required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Inventory DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
