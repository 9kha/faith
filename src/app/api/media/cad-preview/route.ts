import { NextResponse } from "next/server";
import {
  CadPreviewError,
  loadCadPreviewDxf,
} from "@/lib/cad-convert";

export const runtime = "nodejs";
export const maxDuration = 60;

const STATUS_BY_CODE: Record<string, number> = {
  "bad-request": 400,
  "not-found": 404,
  "unsupported-format": 415,
  "conversion-failed": 422,
  "converter-missing": 501,
};

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");

  if (!src) {
    return NextResponse.json(
      { error: "Missing required query parameter: src" },
      { status: 400 }
    );
  }

  try {
    const preview = await loadCadPreviewDxf(src);
    return new NextResponse(preview.dxf, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cad-Source": preview.source,
      },
    });
  } catch (error) {
    if (error instanceof CadPreviewError) {
      const status = STATUS_BY_CODE[error.code] ?? 500;
      return NextResponse.json(
        {
          code: error.code,
          error: error.message,
          detail: error.detail,
        },
        { status, headers: { "X-Cad-Error": error.code } }
      );
    }
    console.error("CAD preview error:", error);
    return NextResponse.json(
      { error: "CAD preview failed unexpectedly." },
      { status: 500 }
    );
  }
}
