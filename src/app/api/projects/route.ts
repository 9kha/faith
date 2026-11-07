import { NextResponse } from "next/server";
import { getProjects } from "@/modules/project/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const builderId = searchParams.get("builderId") || undefined;

    const { projects, total } = await getProjects({
      search,
      status,
      builderId,
      limit: 100,
    });

    return NextResponse.json({ projects, total });
  } catch {
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}
