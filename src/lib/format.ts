const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹8,50,00,000 */
export function formatINR(value: number | null | undefined): string {
  if (value == null) return "—";
  return inr.format(value);
}

/** ₹8.50 Cr / ₹52.0 L / ₹24,500 */
export function formatCompactINR(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 10000000) return `₹${trim((value / 10000000).toFixed(2))} Cr`;
  if (value >= 100000) return `₹${trim((value / 100000).toFixed(1))} L`;
  if (value >= 1000) return `₹${trim((value / 1000).toFixed(1))} K`;
  return `₹${value}`;
}

function trim(v: string): string {
  return v.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "just now", "12 min ago", "3 h ago", "2 d ago" */
export function timeAgo(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(d);
}

/** Human status label: NEW_LAUNCH -> "New Launch" */
export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
