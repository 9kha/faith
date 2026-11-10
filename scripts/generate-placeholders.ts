import { mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "images");

type Job = {
  name: string;
  width: number;
  height: number;
  from: string;
  to: string;
  label: string;
  sub?: string;
};

const PALETTES = {
  navy: ["#0f172a", "#1e3a5f"],
  indigo: ["#1e293b", "#3b4cca"],
  teal: ["#0f766e", "#14b8a6"],
  amber: ["#92400e", "#f59e0b"],
  rose: ["#881337", "#e11d48"],
  sky: ["#0c4a6e", "#38bdf8"],
  violet: ["#4c1d95", "#a78bfa"],
  green: ["#064e3b", "#34d399"],
  slate: ["#111827", "#4b5563"],
  gold: ["#78350f", "#fbbf24"],
};

const jobs: Job[] = [
  { name: "hero", width: 1600, height: 900, from: "#0b1220", to: "#1e3a5f", label: "Dream Home", sub: "ChannelPartner Pro" },
  { name: "about", width: 1200, height: 800, from: "#0f172a", to: "#334155", label: "About Us" },
  { name: "contact", width: 1200, height: 700, from: "#1e293b", to: "#3b4cca", label: "Contact" },

  { name: "property-1", width: 800, height: 600, from: PALETTES.navy[0], to: PALETTES.navy[1], label: "3 BHK Apartment" },
  { name: "property-2", width: 800, height: 600, from: PALETTES.indigo[0], to: PALETTES.indigo[1], label: "2 BHK Flat" },
  { name: "property-3", width: 800, height: 600, from: PALETTES.teal[0], to: PALETTES.teal[1], label: "Villa" },
  { name: "property-4", width: 800, height: 600, from: PALETTES.amber[0], to: PALETTES.amber[1], label: "Penthouse" },
  { name: "property-5", width: 800, height: 600, from: PALETTES.rose[0], to: PALETTES.rose[1], label: "Studio" },
  { name: "property-6", width: 800, height: 600, from: PALETTES.sky[0], to: PALETTES.sky[1], label: "Row House" },
  { name: "property-7", width: 800, height: 600, from: PALETTES.violet[0], to: PALETTES.violet[1], label: "4 BHK Duplex" },
  { name: "property-8", width: 800, height: 600, from: PALETTES.green[0], to: PALETTES.green[1], label: "Plot" },
  { name: "property-9", width: 800, height: 600, from: PALETTES.slate[0], to: PALETTES.slate[1], label: "Office Space" },
  { name: "property-10", width: 800, height: 600, from: PALETTES.gold[0], to: PALETTES.gold[1], label: "Shop" },

  { name: "project-1", width: 1200, height: 750, from: "#0f172a", to: "#2563eb", label: "Green Valley" },
  { name: "project-2", width: 1200, height: 750, from: "#134e4a", to: "#14b8a6", label: "Sunrise Heights" },
  { name: "project-3", width: 1200, height: 750, from: "#3b0764", to: "#a78bfa", label: "Royal Enclave" },
  { name: "project-4", width: 1200, height: 750, from: "#7c2d12", to: "#fb923c", label: "Lakeview Park" },
  { name: "project-5", width: 1200, height: 750, from: "#083344", to: "#22d3ee", label: "Skyline Towers" },
  { name: "project-6", width: 1200, height: 750, from: "#3f1d0b", to: "#f97316", label: "Sunshine Residency" },

  { name: "blog-1", width: 800, height: 500, from: "#1e293b", to: "#0ea5e9", label: "Market Insights" },
  { name: "blog-2", width: 800, height: 500, from: "#312e81", to: "#818cf8", label: "RERA Guide" },
  { name: "blog-3", width: 800, height: 500, from: "#134e4a", to: "#2dd4bf", label: "Home Loans" },
  { name: "blog-4", width: 800, height: 500, from: "#4c1d95", to: "#c084fc", label: "Investment Tips" },
  { name: "blog-5", width: 800, height: 500, from: "#7f1d1d", to: "#f87171", label: "Interior Ideas" },
  { name: "blog-6", width: 800, height: 500, from: "#1e3a8a", to: "#60a5fa", label: "Legal Checklist" },

  { name: "builder-1", width: 400, height: 400, from: "#0f172a", to: "#334155", label: "SC" },
  { name: "builder-2", width: 400, height: 400, from: "#065f46", to: "#10b981", label: "SR" },
  { name: "builder-3", width: 400, height: 400, from: "#7c2d12", to: "#f59e0b", label: "RD" },
  { name: "builder-4", width: 400, height: 400, from: "#1e40af", to: "#60a5fa", label: "GB" },
  { name: "builder-5", width: 400, height: 400, from: "#581c87", to: "#c084fc", label: "PG" },
  { name: "builder-6", width: 400, height: 400, from: "#831843", to: "#fb7185", label: "OS" },

  { name: "testimonial-1", width: 200, height: 200, from: "#1e293b", to: "#475569", label: "RK" },
  { name: "testimonial-2", width: 200, height: 200, from: "#3b0764", to: "#7c3aed", label: "PS" },
  { name: "testimonial-3", width: 200, height: 200, from: "#064e3b", to: "#059669", label: "AV" },
];

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function skyline(width: number, height: number, seed: number) {
  const blocks: string[] = [];
  let x = -20;
  let i = seed;
  const base = height;
  while (x < width + 20) {
    i = (i * 1103515245 + 12345) % 2147483648;
    const w = 40 + (i % 70);
    i = (i * 1103515245 + 12345) % 2147483648;
    const h = 80 + (i % Math.floor(height * 0.55));
    blocks.push(
      `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" rx="4" fill="rgba(255,255,255,0.07)"/>`
    );
    // windows
    for (let wy = base - h + 12; wy < base - 14; wy += 20) {
      for (let wx = x + 8; wx < x + w - 10; wx += 16) {
        i = (i * 1103515245 + 12345) % 2147483648;
        if (i % 3 === 0) {
          blocks.push(
            `<rect x="${wx}" y="${wy}" width="7" height="9" fill="rgba(255,255,255,0.16)"/>`
          );
        }
      }
    }
    x += w + 6;
  }
  return blocks.join("");
}

function buildSvg(job: Job): string {
  const { width, height, from, to, label, sub } = job;
  const seed = label.split("").reduce((a, c) => a + c.charCodeAt(0), 7);
  const fontSize = Math.round(Math.min(width, height) * (label.length > 14 ? 0.085 : 0.11));
  const subSize = Math.round(fontSize * 0.42);
  const cy = Math.round(height * 0.46);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <circle cx="${Math.round(width * 0.82)}" cy="${Math.round(height * 0.2)}" r="${Math.round(
    Math.min(width, height) * 0.3
  )}" fill="rgba(255,255,255,0.06)"/>
  <circle cx="${Math.round(width * 0.15)}" cy="${Math.round(height * 0.78)}" r="${Math.round(
    Math.min(width, height) * 0.24
  )}" fill="rgba(255,255,255,0.05)"/>
  ${skyline(width, height, seed)}
  <rect width="${width}" height="${height}" fill="url(#fade)"/>
  <text x="50%" y="${cy}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" letter-spacing="1">${escapeXml(
    label
  )}</text>
  ${
    sub
      ? `<text x="50%" y="${cy + Math.round(fontSize * 0.9)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${subSize}" font-weight="400" fill="rgba(255,255,255,0.8)" letter-spacing="3">${escapeXml(
          sub
        )}</text>`
      : ""
  }
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const job of jobs) {
    const svg = Buffer.from(buildSvg(job));
    const target = join(OUT, `${job.name}.jpg`);
    await sharp(svg, { density: 96 })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(target);
    process.stdout.write(`✓ ${job.name}.jpg\n`);
  }

  // A dedicated wide hero used by several sections
  await sharp(Buffer.from(buildSvg({
    name: "cta",
    width: 1400,
    height: 560,
    from: "#0f172a",
    to: "#1d4ed8",
    label: "Find Your Dream Home",
    sub: "Verified · Transparent · Trusted",
  })))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, "cta.jpg"));
  process.stdout.write("✓ cta.jpg\n");

  console.log(`\nGenerated ${jobs.length + 1} images in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
