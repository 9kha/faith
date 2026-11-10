"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onChange,
  total,
  label = "results",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  total?: number;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = buildWindow(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
      {typeof total === "number" ? (
        <p className="text-sm text-muted-foreground">
          {total} {label} · page {page} of {totalPages}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Prev
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="min-w-9 px-2"
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function buildWindow(page: number, totalPages: number): (number | "…")[] {
  const set = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
