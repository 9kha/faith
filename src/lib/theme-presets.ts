export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  gradient?: string;
  light: ThemePalette;
  dark: ThemePalette;
}

export interface ThemeTokens {
  preset: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  compactMode?: boolean;
  light: ThemePalette;
  dark: ThemePalette;
  // Legacy / convenience flat properties:
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  spacing: string;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  default: {
    id: "default",
    name: "Modern Sapphire",
    description: "Executive royal blue with crisp whites and deep midnight dark mode",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    radius: "0.5rem",
    light: {
      primary: "#2563eb",
      secondary: "#f1f5f9",
      accent: "#3b82f6",
      background: "#ffffff",
      card: "#ffffff",
      foreground: "#0f172a",
      muted: "#f8fafc",
      border: "#e2e8f0",
    },
    dark: {
      primary: "#3b82f6",
      secondary: "#1e293b",
      accent: "#60a5fa",
      background: "#090d16",
      card: "#111827",
      foreground: "#f8fafc",
      muted: "#1f2937",
      border: "#1e293b",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald Luxury",
    description: "Prestigious botanical green tailored for high-end villas & luxury townships",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.5rem",
    light: {
      primary: "#059669",
      secondary: "#ecfdf5",
      accent: "#10b981",
      background: "#f7fbf8",
      card: "#ffffff",
      foreground: "#064e3b",
      muted: "#f0fdf4",
      border: "#d1fae5",
    },
    dark: {
      primary: "#10b981",
      secondary: "#064e3b",
      accent: "#34d399",
      background: "#061a14",
      card: "#0d281e",
      foreground: "#f0fdf4",
      muted: "#13382b",
      border: "#143e2e",
    },
  },
  royal: {
    id: "royal",
    name: "Royal Violet & Indigo",
    description: "Majestic purple & indigo with velvet dark undertones",
    headingFont: "Outfit",
    bodyFont: "Inter",
    radius: "0.75rem",
    light: {
      primary: "#6366f1",
      secondary: "#f5f3ff",
      accent: "#8b5cf6",
      background: "#faf8ff",
      card: "#ffffff",
      foreground: "#1e1b4b",
      muted: "#f3e8ff",
      border: "#e9d5ff",
    },
    dark: {
      primary: "#818cf8",
      secondary: "#312e81",
      accent: "#a78bfa",
      background: "#0b0914",
      card: "#151128",
      foreground: "#faf5ff",
      muted: "#221c3d",
      border: "#281e4a",
    },
  },
  sunset: {
    id: "sunset",
    name: "Warm Amber & Terracotta",
    description: "Earthy warmth with golden amber accents and rich espresso darks",
    headingFont: "Outfit",
    bodyFont: "DM Sans",
    radius: "0.5rem",
    light: {
      primary: "#d97706",
      secondary: "#fffbeb",
      accent: "#ea580c",
      background: "#fdfbf7",
      card: "#ffffff",
      foreground: "#451a03",
      muted: "#fef3c7",
      border: "#fed7aa",
    },
    dark: {
      primary: "#f59e0b",
      secondary: "#78350f",
      accent: "#fb923c",
      background: "#160f08",
      card: "#24180d",
      foreground: "#fef3c7",
      muted: "#36210f",
      border: "#3d2511",
    },
  },
  crimson: {
    id: "crimson",
    name: "Ruby Rose & Wine",
    description: "Refined crimson elegance with dark wine aesthetic",
    headingFont: "Lora",
    bodyFont: "Inter",
    radius: "0.5rem",
    light: {
      primary: "#e11d48",
      secondary: "#fff1f2",
      accent: "#f43f5e",
      background: "#fff9f9",
      card: "#ffffff",
      foreground: "#4c0519",
      muted: "#ffe4e6",
      border: "#fecdd3",
    },
    dark: {
      primary: "#fb7185",
      secondary: "#4c0519",
      accent: "#fda4af",
      background: "#14090c",
      card: "#220e14",
      foreground: "#fff1f2",
      muted: "#36141e",
      border: "#3a1520",
    },
  },
  minimal: {
    id: "minimal",
    name: "Monochrome Onyx",
    description: "Pure architectural minimalism with crisp black, zinc, and pure white",
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: "0.375rem",
    light: {
      primary: "#18181b",
      secondary: "#f4f4f5",
      accent: "#3f3f46",
      background: "#fafafa",
      card: "#ffffff",
      foreground: "#09090b",
      muted: "#f4f4f5",
      border: "#e4e4e7",
    },
    dark: {
      primary: "#fafafa",
      secondary: "#27272a",
      accent: "#a1a1aa",
      background: "#09090b",
      card: "#18181b",
      foreground: "#fafafa",
      muted: "#27272a",
      border: "#27272a",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean Teal & Marine",
    description: "Vibrant coastal cyan and marine teal with deep oceanic dark mode",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.75rem",
    light: {
      primary: "#0891b2",
      secondary: "#ecfeff",
      accent: "#0284c7",
      background: "#f6fcfd",
      card: "#ffffff",
      foreground: "#164e63",
      muted: "#e0f2fe",
      border: "#bae6fd",
    },
    dark: {
      primary: "#22d3ee",
      secondary: "#164e63",
      accent: "#38bdf8",
      background: "#051319",
      card: "#0a222e",
      foreground: "#ecfeff",
      muted: "#0f3345",
      border: "#133f54",
    },
  },
  nordic: {
    id: "nordic",
    name: "Nordic Sage & Earth",
    description: "Calm sage green and warm earth tones inspired by Scandinavian architecture",
    headingFont: "Poppins",
    bodyFont: "Inter",
    radius: "0.5rem",
    light: {
      primary: "#4d7c0f",
      secondary: "#f7fee7",
      accent: "#65a30d",
      background: "#fbfcf8",
      card: "#ffffff",
      foreground: "#1a2e05",
      muted: "#ecfccb",
      border: "#d9f99d",
    },
    dark: {
      primary: "#a3e635",
      secondary: "#1a2e05",
      accent: "#84cc16",
      background: "#0c1404",
      card: "#142207",
      foreground: "#f7fee7",
      muted: "#1e330a",
      border: "#223b0c",
    },
  },
  "dubai-gold": {
    id: "dubai-gold",
    name: "Dubai Luxe Gold & Obsidian",
    description: "Signature warm champagne gold and dark obsidian luxury",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #b45309 100%)",
    light: {
      primary: "#b45309",
      secondary: "#fef3c7",
      accent: "#d97706",
      background: "#fffdfa",
      card: "#ffffff",
      foreground: "#451a03",
      muted: "#fef9c3",
      border: "#fde68a",
    },
    dark: {
      primary: "#fbbf24",
      secondary: "#78350f",
      accent: "#f59e0b",
      background: "#0c0a06",
      card: "#17130b",
      foreground: "#fef9c3",
      muted: "#231c11",
      border: "#382a17",
    },
  },
  "cyber-violet": {
    id: "cyber-violet",
    name: "Cyber Neon Violet Gradient",
    description: "Electric violet blending into radiant fuchsia with deep space darks",
    headingFont: "Outfit",
    bodyFont: "Inter",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    light: {
      primary: "#7c3aed",
      secondary: "#fdf4ff",
      accent: "#d946ef",
      background: "#faf7ff",
      card: "#ffffff",
      foreground: "#2e1065",
      muted: "#f3e8ff",
      border: "#e9d5ff",
    },
    dark: {
      primary: "#a78bfa",
      secondary: "#4c1d95",
      accent: "#f472b6",
      background: "#0d0818",
      card: "#160e28",
      foreground: "#fdf4ff",
      muted: "#22163d",
      border: "#2e1d52",
    },
  },
  "aurora-teal": {
    id: "aurora-teal",
    name: "Aurora Cyan & Mint Gradient",
    description: "Polar cyan and luminous mint green with midnight deep dark",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
    light: {
      primary: "#0891b2",
      secondary: "#ecfeff",
      accent: "#059669",
      background: "#f4fdfc",
      card: "#ffffff",
      foreground: "#164e63",
      muted: "#cffafe",
      border: "#a5f3fc",
    },
    dark: {
      primary: "#22d3ee",
      secondary: "#164e63",
      accent: "#34d399",
      background: "#041417",
      card: "#092226",
      foreground: "#ecfeff",
      muted: "#0d3339",
      border: "#13464e",
    },
  },
  "rose-quartz": {
    id: "rose-quartz",
    name: "Rose Quartz Glamour",
    description: "Blush coral and cashmere rose gold with smoky velvet undertones",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)",
    light: {
      primary: "#e11d48",
      secondary: "#fff1f2",
      accent: "#f43f5e",
      background: "#fffbfc",
      card: "#ffffff",
      foreground: "#4c0519",
      muted: "#ffe4e6",
      border: "#fecdd3",
    },
    dark: {
      primary: "#fb7185",
      secondary: "#4c0519",
      accent: "#fda4af",
      background: "#16080e",
      card: "#240f18",
      foreground: "#fff1f2",
      muted: "#361625",
      border: "#481f33",
    },
  },
  "midnight-indigo": {
    id: "midnight-indigo",
    name: "Imperial Cobalt Indigo Gradient",
    description: "High-contrast cobalt blending into deep electric indigo",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
    light: {
      primary: "#4338ca",
      secondary: "#eef2ff",
      accent: "#2563eb",
      background: "#f8faff",
      card: "#ffffff",
      foreground: "#1e1b4b",
      muted: "#e0e7ff",
      border: "#c7d2fe",
    },
    dark: {
      primary: "#818cf8",
      secondary: "#312e81",
      accent: "#60a5fa",
      background: "#060814",
      card: "#0e122b",
      foreground: "#eef2ff",
      muted: "#171c42",
      border: "#20275c",
    },
  },
  "copper-bronze": {
    id: "copper-bronze",
    name: "Sunset Terracotta & Copper",
    description: "Warm burnished copper and sunset terracotta with espresso darks",
    headingFont: "Outfit",
    bodyFont: "DM Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
    light: {
      primary: "#c2410c",
      secondary: "#fff7ed",
      accent: "#ea580c",
      background: "#fdfbf9",
      card: "#ffffff",
      foreground: "#431407",
      muted: "#ffedd5",
      border: "#fed7aa",
    },
    dark: {
      primary: "#fb923c",
      secondary: "#7c2d12",
      accent: "#f97316",
      background: "#140904",
      card: "#211007",
      foreground: "#ffedd5",
      muted: "#331b0e",
      border: "#482715",
    },
  },
  "monaco-azure": {
    id: "monaco-azure",
    name: "Monaco Azure Riviera",
    description: "Mediterranean azure and sapphire blue with pristine white and navy",
    headingFont: "Outfit",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
    light: {
      primary: "#0284c7",
      secondary: "#f0f9ff",
      accent: "#0ea5e9",
      background: "#f7fbfe",
      card: "#ffffff",
      foreground: "#0c4a6e",
      muted: "#e0f2fe",
      border: "#bae6fd",
    },
    dark: {
      primary: "#38bdf8",
      secondary: "#0c4a6e",
      accent: "#7dd3fc",
      background: "#05121b",
      card: "#0a1e2d",
      foreground: "#f0f9ff",
      muted: "#0e2d42",
      border: "#133c57",
    },
  },
  "amethyst-twilight": {
    id: "amethyst-twilight",
    name: "Amethyst Twilight Velvet",
    description: "Deep royal amethyst blending into radiant purple aurora",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
    light: {
      primary: "#7e22ce",
      secondary: "#faf5ff",
      accent: "#9333ea",
      background: "#fbf9ff",
      card: "#ffffff",
      foreground: "#3b0764",
      muted: "#f3e8ff",
      border: "#e9d5ff",
    },
    dark: {
      primary: "#c084fc",
      secondary: "#581c87",
      accent: "#d8b4fe",
      background: "#100619",
      card: "#1c0c2c",
      foreground: "#faf5ff",
      muted: "#2b1442",
      border: "#3b1c5c",
    },
  },
  "sage-botanical": {
    id: "sage-botanical",
    name: "Botanical Forest Sage",
    description: "Deep botanical pine and eucalyptus sage for eco-luxury residences",
    headingFont: "Poppins",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
    light: {
      primary: "#166534",
      secondary: "#f0fdf4",
      accent: "#16a34a",
      background: "#f8fcf9",
      card: "#ffffff",
      foreground: "#14532d",
      muted: "#dcfce7",
      border: "#bbf7d0",
    },
    dark: {
      primary: "#4ade80",
      secondary: "#14532d",
      accent: "#22c55e",
      background: "#051408",
      card: "#0a2210",
      foreground: "#f0fdf4",
      muted: "#0f3319",
      border: "#154723",
    },
  },
  "citrus-amber": {
    id: "citrus-amber",
    name: "Solar Citrus & Amber",
    description: "High-energy citrus gold and sunburst amber with charcoal undertones",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    light: {
      primary: "#d97706",
      secondary: "#fffbeb",
      accent: "#f59e0b",
      background: "#fffdf9",
      card: "#ffffff",
      foreground: "#451a03",
      muted: "#fef3c7",
      border: "#fde68a",
    },
    dark: {
      primary: "#fbbf24",
      secondary: "#78350f",
      accent: "#f59e0b",
      background: "#140e05",
      card: "#221809",
      foreground: "#fffbeb",
      muted: "#36270f",
      border: "#4c3715",
    },
  },
  "tokyo-magenta": {
    id: "tokyo-magenta",
    name: "Tokyo Neon Fuchsia",
    description: "Electrifying magenta fuchsia with deep midnight obsidian",
    headingFont: "Outfit",
    bodyFont: "Inter",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)",
    light: {
      primary: "#be185d",
      secondary: "#fdf2f8",
      accent: "#db2777",
      background: "#fff9fc",
      card: "#ffffff",
      foreground: "#500724",
      muted: "#fce7f3",
      border: "#fbcfe8",
    },
    dark: {
      primary: "#f472b6",
      secondary: "#500724",
      accent: "#fb7185",
      background: "#15050e",
      card: "#230a18",
      foreground: "#fdf2f8",
      muted: "#361227",
      border: "#4b1836",
    },
  },
  "titanium-slate": {
    id: "titanium-slate",
    name: "Titanium Industrial Slate",
    description: "Ultra-clean graphite, steel slate, and pure platinum highlights",
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: "0.375rem",
    gradient: "linear-gradient(135deg, #475569 0%, #64748b 100%)",
    light: {
      primary: "#334155",
      secondary: "#f8fafc",
      accent: "#475569",
      background: "#ffffff",
      card: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      border: "#e2e8f0",
    },
    dark: {
      primary: "#94a3b8",
      secondary: "#1e293b",
      accent: "#cbd5e1",
      background: "#0a0f18",
      card: "#131b2a",
      foreground: "#f8fafc",
      muted: "#1d283c",
      border: "#273752",
    },
  },
  "caribbean-sea": {
    id: "caribbean-sea",
    name: "Caribbean Turquoise Reef",
    description: "Tropical turquoise and radiant seafoam for coastal resorts and villas",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.625rem",
    gradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
    light: {
      primary: "#0f766e",
      secondary: "#f0fdfa",
      accent: "#0d9488",
      background: "#f6fcfb",
      card: "#ffffff",
      foreground: "#134e4a",
      muted: "#ccfbf1",
      border: "#99f6e4",
    },
    dark: {
      primary: "#2dd4bf",
      secondary: "#134e4a",
      accent: "#5eead4",
      background: "#041513",
      card: "#09221f",
      foreground: "#f0fdfa",
      muted: "#0e3530",
      border: "#144a44",
    },
  },
  "bordeaux-wine": {
    id: "bordeaux-wine",
    name: "Bordeaux Merlot & Ruby",
    description: "Heritage French wine red, velvety ruby, and smoked charcoal",
    headingFont: "Lora",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #881337 0%, #be123c 100%)",
    light: {
      primary: "#9f1239",
      secondary: "#fff1f2",
      accent: "#be123c",
      background: "#fffafb",
      card: "#ffffff",
      foreground: "#4c0519",
      muted: "#ffe4e6",
      border: "#fecdd3",
    },
    dark: {
      primary: "#fb7185",
      secondary: "#4c0519",
      accent: "#f43f5e",
      background: "#14050a",
      card: "#220911",
      foreground: "#fff1f2",
      muted: "#360f1c",
      border: "#4b1527",
    },
  },
  "sahara-dune": {
    id: "sahara-dune",
    name: "Sahara Sand & Caramel",
    description: "Warm caramel leather and golden desert dune warmth",
    headingFont: "Outfit",
    bodyFont: "DM Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
    light: {
      primary: "#92400e",
      secondary: "#fefce8",
      accent: "#b45309",
      background: "#fdfbf6",
      card: "#ffffff",
      foreground: "#451a03",
      muted: "#fef9c3",
      border: "#fde047",
    },
    dark: {
      primary: "#facc15",
      secondary: "#713f12",
      accent: "#fbbf24",
      background: "#140f06",
      card: "#21180a",
      foreground: "#fefce8",
      muted: "#332510",
      border: "#473417",
    },
  },
  "matrix-neo": {
    id: "matrix-neo",
    name: "Matrix Neo Lime Gradient",
    description: "High-tech electric lime and futuristic neo-green",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    radius: "0.375rem",
    gradient: "linear-gradient(135deg, #84cc16 0%, #10b981 100%)",
    light: {
      primary: "#4d7c0f",
      secondary: "#f7fee7",
      accent: "#65a30d",
      background: "#fbfdf6",
      card: "#ffffff",
      foreground: "#1a2e05",
      muted: "#ecfccb",
      border: "#d9f99d",
    },
    dark: {
      primary: "#a3e635",
      secondary: "#1a2e05",
      accent: "#4ade80",
      background: "#091404",
      card: "#112207",
      foreground: "#f7fee7",
      muted: "#1b340c",
      border: "#264911",
    },
  },
  "champagne-pearl": {
    id: "champagne-pearl",
    name: "Champagne Pearl & Ivory",
    description: "Iridescent champagne ivory, muted gold, and refined limestone",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #ca8a04 0%, #eab308 100%)",
    light: {
      primary: "#a16207",
      secondary: "#fefce8",
      accent: "#ca8a04",
      background: "#fffefa",
      card: "#ffffff",
      foreground: "#422006",
      muted: "#fef9c3",
      border: "#fef08a",
    },
    dark: {
      primary: "#fde047",
      secondary: "#713f12",
      accent: "#facc15",
      background: "#141206",
      card: "#221d0a",
      foreground: "#fefce8",
      muted: "#352e11",
      border: "#494017",
    },
  },
  "cosmic-void": {
    id: "cosmic-void",
    name: "Cosmic Deep Galaxy",
    description: "Stellar navy, deep cosmos sapphire, and stardust cyan",
    headingFont: "Outfit",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
    light: {
      primary: "#1d4ed8",
      secondary: "#eff6ff",
      accent: "#2563eb",
      background: "#f7faff",
      card: "#ffffff",
      foreground: "#172554",
      muted: "#dbeafe",
      border: "#bfdbfe",
    },
    dark: {
      primary: "#60a5fa",
      secondary: "#172554",
      accent: "#38bdf8",
      background: "#050914",
      card: "#0a1228",
      foreground: "#eff6ff",
      muted: "#101e40",
      border: "#172a5a",
    },
  },
  "peach-blossom": {
    id: "peach-blossom",
    name: "Japanese Coral Blossom",
    description: "Soft coral peach, apricot blossom, and morning mist",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.625rem",
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    light: {
      primary: "#c2410c",
      secondary: "#fff7ed",
      accent: "#ea580c",
      background: "#fffaf7",
      card: "#ffffff",
      foreground: "#431407",
      muted: "#ffedd5",
      border: "#fed7aa",
    },
    dark: {
      primary: "#fb923c",
      secondary: "#7c2d12",
      accent: "#f97316",
      background: "#150904",
      card: "#231007",
      foreground: "#fff7ed",
      muted: "#36190c",
      border: "#4d2411",
    },
  },
  "alpine-frost": {
    id: "alpine-frost",
    name: "Alpine Glacial Ice",
    description: "Glacier blue, arctic frost, and Scandinavian midnight",
    headingFont: "Poppins",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #7dd3fc 100%)",
    light: {
      primary: "#0369a1",
      secondary: "#f0f9ff",
      accent: "#0284c7",
      background: "#f8fbfe",
      card: "#ffffff",
      foreground: "#082f49",
      muted: "#e0f2fe",
      border: "#bae6fd",
    },
    dark: {
      primary: "#38bdf8",
      secondary: "#082f49",
      accent: "#7dd3fc",
      background: "#041018",
      card: "#081d2a",
      foreground: "#f0f9ff",
      muted: "#0d2e42",
      border: "#123f5b",
    },
  },
  "havana-tobacco": {
    id: "havana-tobacco",
    name: "Havana Tobacco & Rum",
    description: "Aged rum, Cuban cedar wood, and warm mahogany glow",
    headingFont: "Outfit",
    bodyFont: "DM Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
    light: {
      primary: "#7c2d12",
      secondary: "#fff7ed",
      accent: "#9a3412",
      background: "#fcfaf8",
      card: "#ffffff",
      foreground: "#431407",
      muted: "#ffedd5",
      border: "#fed7aa",
    },
    dark: {
      primary: "#fb923c",
      secondary: "#431407",
      accent: "#ea580c",
      background: "#140803",
      card: "#210e06",
      foreground: "#fff7ed",
      muted: "#34170a",
      border: "#49210e",
    },
  },
  "florence-clay": {
    id: "florence-clay",
    name: "Florence Tuscan Clay",
    description: "Rich Italian clay red, ancient terracotta, and warm limestone",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #be123c 0%, #e11d48 100%)",
    light: {
      primary: "#9f1239",
      secondary: "#fff1f2",
      accent: "#be123c",
      background: "#fdfafb",
      card: "#ffffff",
      foreground: "#4c0519",
      muted: "#ffe4e6",
      border: "#fecdd3",
    },
    dark: {
      primary: "#fb7185",
      secondary: "#4c0519",
      accent: "#fda4af",
      background: "#140509",
      card: "#220910",
      foreground: "#fff1f2",
      muted: "#360e1b",
      border: "#4c1427",
    },
  },
  "malibu-gradient": {
    id: "malibu-gradient",
    name: "Malibu Sunset Horizon Gradient",
    description: "Radiant coral pink transitioning into sunburst gold",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #facc15 100%)",
    light: {
      primary: "#e11d48",
      secondary: "#fff1f2",
      accent: "#ea580c",
      background: "#fffbfc",
      card: "#ffffff",
      foreground: "#4c0519",
      muted: "#ffe4e6",
      border: "#fed7aa",
    },
    dark: {
      primary: "#fb7185",
      secondary: "#7c2d12",
      accent: "#fb923c",
      background: "#15070c",
      card: "#240c14",
      foreground: "#fff1f2",
      muted: "#361320",
      border: "#4e1b2d",
    },
  },
  "electric-cobalt": {
    id: "electric-cobalt",
    name: "Electric Cobalt Pulse",
    description: "High-voltage royal blue with electric cyan energy",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    radius: "0.5rem",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)",
    light: {
      primary: "#1e40af",
      secondary: "#eff6ff",
      accent: "#0284c7",
      background: "#f7faff",
      card: "#ffffff",
      foreground: "#172554",
      muted: "#dbeafe",
      border: "#bae6fd",
    },
    dark: {
      primary: "#60a5fa",
      secondary: "#172554",
      accent: "#38bdf8",
      background: "#050a18",
      card: "#0a1430",
      foreground: "#eff6ff",
      muted: "#10214c",
      border: "#172f6a",
    },
  },
  "obsidian-diamond": {
    id: "obsidian-diamond",
    name: "Obsidian Diamond Elite",
    description: "Pure black obsidian, platinum silver, and diamond brilliance",
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: "0.375rem",
    gradient: "linear-gradient(135deg, #09090b 0%, #27272a 50%, #71717a 100%)",
    light: {
      primary: "#09090b",
      secondary: "#f4f4f5",
      accent: "#27272a",
      background: "#ffffff",
      card: "#ffffff",
      foreground: "#09090b",
      muted: "#f4f4f5",
      border: "#e4e4e7",
    },
    dark: {
      primary: "#ffffff",
      secondary: "#18181b",
      accent: "#e4e4e7",
      background: "#000000",
      card: "#09090b",
      foreground: "#ffffff",
      muted: "#18181b",
      border: "#27272a",
    },
  },
  "singapore-orchid": {
    id: "singapore-orchid",
    name: "Singapore Orchid Gradient",
    description: "Imperial orchid purple blending into radiant magenta fuchsia",
    headingFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    radius: "0.75rem",
    gradient: "linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #ec4899 100%)",
    light: {
      primary: "#9333ea",
      secondary: "#faf5ff",
      accent: "#c026d3",
      background: "#fcf8ff",
      card: "#ffffff",
      foreground: "#3b0764",
      muted: "#f3e8ff",
      border: "#f5d0fe",
    },
    dark: {
      primary: "#c084fc",
      secondary: "#581c87",
      accent: "#e879f9",
      background: "#11051b",
      card: "#1e0a30",
      foreground: "#faf5ff",
      muted: "#2d1047",
      border: "#3e1661",
    },
  },
};

export interface FontOption {
  id: string;
  name: string;
  category: "Sans-serif" | "Serif" | "Display";
  googleFontFamily?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans", category: "Sans-serif", googleFontFamily: "Plus+Jakarta+Sans:wght@300;400;500;600;700;800" },
  { id: "Inter", name: "Inter", category: "Sans-serif", googleFontFamily: "Inter:wght@300;400;500;600;700;800" },
  { id: "Poppins", name: "Poppins", category: "Sans-serif", googleFontFamily: "Poppins:wght@300;400;500;600;700;800" },
  { id: "Outfit", name: "Outfit", category: "Sans-serif", googleFontFamily: "Outfit:wght@300;400;500;600;700;800" },
  { id: "Montserrat", name: "Montserrat", category: "Sans-serif", googleFontFamily: "Montserrat:wght@300;400;500;600;700;800" },
  { id: "DM Sans", name: "DM Sans", category: "Sans-serif", googleFontFamily: "DM+Sans:wght@400;500;600;700" },
  { id: "Roboto", name: "Roboto", category: "Sans-serif", googleFontFamily: "Roboto:wght@300;400;500;700" },
  { id: "Playfair Display", name: "Playfair Display", category: "Serif", googleFontFamily: "Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400" },
  { id: "Lora", name: "Lora", category: "Serif", googleFontFamily: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400" },
  { id: "Cinzel", name: "Cinzel", category: "Serif", googleFontFamily: "Cinzel:wght@400;600;700;800;900" },
  { id: "Space Grotesk", name: "Space Grotesk", category: "Display", googleFontFamily: "Space+Grotesk:wght@400;500;600;700" },
  { id: "Syne", name: "Syne", category: "Display", googleFontFamily: "Syne:wght@400;500;600;700;800" },
  { id: "Geist Sans", name: "Geist Sans (System Default)", category: "Sans-serif" },
];

export const RADIUS_OPTIONS = [
  { value: "0rem", label: "Sharp (0px)" },
  { value: "0.375rem", label: "Subtle (6px)" },
  { value: "0.5rem", label: "Default (8px)" },
  { value: "0.75rem", label: "Rounded (12px)" },
  { value: "1rem", label: "Soft (16px)" },
];

/**
 * Safely format border radius to a valid CSS length string
 */
export function formatRadius(val?: string | number | null): string {
  if (!val) return "0.5rem";
  const str = String(val).trim();
  if (/^\d+(\.\d+)?$/.test(str)) {
    return `${str}rem`;
  }
  return str;
}

/**
 * Calculates accessible text color (#0f172a or #ffffff) based on background luminance
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor || typeof hexColor !== "string") return "#ffffff";
  const hex = hexColor.trim().replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return "#ffffff";
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155 ? "#0f172a" : "#ffffff";
}

/**
 * Generates Google Fonts URL for any selected Google Fonts
 */
export function getGoogleFontUrl(headingFont: string, bodyFont: string): string | null {
  const headingOpt = FONT_OPTIONS.find((f) => f.id === headingFont);
  const bodyOpt = FONT_OPTIONS.find((f) => f.id === bodyFont);

  const families: string[] = [];
  if (headingOpt?.googleFontFamily) {
    families.push(`family=${headingOpt.googleFontFamily}`);
  }
  if (bodyOpt?.googleFontFamily && bodyOpt.id !== headingOpt?.id) {
    families.push(`family=${bodyOpt.googleFontFamily}`);
  }

  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

/**
 * Generates full CSS stylesheet string representing the theme tokens
 */
export function generateThemeCss(tokens: ThemeTokens): string {
  const headingFontName = tokens.headingFont || "Plus Jakarta Sans";
  const bodyFontName = tokens.bodyFont || "Inter";

  const headingFamily =
    headingFontName === "Geist Sans"
      ? "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
      : `"${headingFontName}", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif`;

  const bodyFamily =
    bodyFontName === "Geist Sans"
      ? "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
      : `"${bodyFontName}", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif`;

  const lightPrimaryFg = getContrastTextColor(tokens.light.primary);
  const lightSecondaryFg = getContrastTextColor(tokens.light.secondary);
  const lightAccentFg = getContrastTextColor(tokens.light.accent);

  const darkPrimaryFg = getContrastTextColor(tokens.dark.primary);
  const darkSecondaryFg = getContrastTextColor(tokens.dark.secondary);
  const darkAccentFg = getContrastTextColor(tokens.dark.accent);

  return `
:root {
  --font-sans: ${bodyFamily};
  --font-heading: ${headingFamily};
  --radius: ${formatRadius(tokens.radius)};

  --theme-light-background: ${tokens.light.background};
  --theme-light-foreground: ${tokens.light.foreground};
  --theme-light-card: ${tokens.light.card};
  --theme-light-card-foreground: ${tokens.light.foreground};
  --theme-light-primary: ${tokens.light.primary};
  --theme-light-primary-foreground: ${lightPrimaryFg};
  --theme-light-secondary: ${tokens.light.secondary};
  --theme-light-secondary-foreground: ${lightSecondaryFg};
  --theme-light-muted: ${tokens.light.muted};
  --theme-light-muted-foreground: color-mix(in srgb, ${tokens.light.foreground} 62%, transparent);
  --theme-light-accent: ${tokens.light.accent};
  --theme-light-accent-foreground: ${lightAccentFg};
  --theme-light-border: ${tokens.light.border};
  --theme-light-input: ${tokens.light.border};
  --theme-light-ring: ${tokens.light.primary};

  --theme-dark-background: ${tokens.dark.background};
  --theme-dark-foreground: ${tokens.dark.foreground};
  --theme-dark-card: ${tokens.dark.card};
  --theme-dark-card-foreground: ${tokens.dark.foreground};
  --theme-dark-primary: ${tokens.dark.primary};
  --theme-dark-primary-foreground: ${darkPrimaryFg};
  --theme-dark-secondary: ${tokens.dark.secondary};
  --theme-dark-secondary-foreground: ${darkSecondaryFg};
  --theme-dark-muted: ${tokens.dark.muted};
  --theme-dark-muted-foreground: color-mix(in srgb, ${tokens.dark.foreground} 65%, transparent);
  --theme-dark-accent: ${tokens.dark.accent};
  --theme-dark-accent-foreground: ${darkAccentFg};
  --theme-dark-border: ${tokens.dark.border};
  --theme-dark-input: ${tokens.dark.border};
  --theme-dark-ring: ${tokens.dark.primary};

  /* Active tokens for light mode */
  --background: var(--theme-light-background);
  --foreground: var(--theme-light-foreground);
  --card: var(--theme-light-card);
  --card-foreground: var(--theme-light-card-foreground);
  --popover: var(--theme-light-card);
  --popover-foreground: var(--theme-light-card-foreground);
  --primary: var(--theme-light-primary);
  --primary-foreground: var(--theme-light-primary-foreground);
  --secondary: var(--theme-light-secondary);
  --secondary-foreground: var(--theme-light-secondary-foreground);
  --muted: var(--theme-light-muted);
  --muted-foreground: var(--theme-light-muted-foreground);
  --accent: var(--theme-light-accent);
  --accent-foreground: var(--theme-light-accent-foreground);
  --border: var(--theme-light-border);
  --input: var(--theme-light-input);
  --ring: var(--theme-light-ring);

  --sidebar: var(--theme-light-card);
  --sidebar-foreground: var(--theme-light-foreground);
  --sidebar-primary: var(--theme-light-primary);
  --sidebar-primary-foreground: var(--theme-light-primary-foreground);
  --sidebar-accent: var(--theme-light-muted);
  --sidebar-accent-foreground: var(--theme-light-foreground);
  --sidebar-border: var(--theme-light-border);
  --sidebar-ring: var(--theme-light-ring);

  --brand-primary: var(--primary);
  --brand-secondary: var(--secondary);
  --brand-accent: var(--primary);
  --brand-background: var(--background);
  --brand-text: var(--foreground);
  --brand-heading-font: var(--font-heading);
  --brand-body-font: var(--font-sans);
  --brand-radius: var(--radius);
}

.dark {
  /* Active tokens for dark mode */
  --background: var(--theme-dark-background);
  --foreground: var(--theme-dark-foreground);
  --card: var(--theme-dark-card);
  --card-foreground: var(--theme-dark-card-foreground);
  --popover: var(--theme-dark-card);
  --popover-foreground: var(--theme-dark-card-foreground);
  --primary: var(--theme-dark-primary);
  --primary-foreground: var(--theme-dark-primary-foreground);
  --secondary: var(--theme-dark-secondary);
  --secondary-foreground: var(--theme-dark-secondary-foreground);
  --muted: var(--theme-dark-muted);
  --muted-foreground: var(--theme-dark-muted-foreground);
  --accent: var(--theme-dark-accent);
  --accent-foreground: var(--theme-dark-accent-foreground);
  --border: var(--theme-dark-border);
  --input: var(--theme-dark-input);
  --ring: var(--theme-dark-ring);

  --sidebar: var(--theme-dark-card);
  --sidebar-foreground: var(--theme-dark-foreground);
  --sidebar-primary: var(--theme-dark-primary);
  --sidebar-primary-foreground: var(--theme-dark-primary-foreground);
  --sidebar-accent: var(--theme-dark-muted);
  --sidebar-accent-foreground: var(--theme-dark-foreground);
  --sidebar-border: var(--theme-dark-border);
  --sidebar-ring: var(--theme-dark-ring);

  --brand-primary: var(--primary);
  --brand-secondary: var(--secondary);
  --brand-accent: var(--primary);
  --brand-background: var(--background);
  --brand-text: var(--foreground);
}
`.trim();
}
