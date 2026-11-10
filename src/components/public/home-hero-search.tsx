"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Building2,
  Home,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "BUY" | "RENT" | "TOWNSHIP" | "COMMERCIAL";

export function HomeHeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("BUY");
  const [city, setCity] = useState("indore");
  const [propertyType, setPropertyType] = useState("");
  const [bhk, setBhk] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "TOWNSHIP") {
      router.push("/projects/evara-27-acre-luxury-township");
      return;
    }

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (propertyType) params.set("type", propertyType);
    if (bhk) params.set("bhk", bhk);
    if (budget) params.set("budget", budget);

    const basePath = activeTab === "RENT" ? "/rent" : "/buy";
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      {/* Interactive Tabs Header */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
        <div className="inline-flex rounded-2xl bg-card/85 backdrop-blur-md border border-border p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("BUY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "BUY"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Buy Luxury</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TOWNSHIP")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "TOWNSHIP"
                ? "bg-accent text-accent-foreground shadow-md shadow-accent/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>27-Acre Township</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RENT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "RENT"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Rent</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMMERCIAL")}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "COMMERCIAL"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Commercial</span>
          </button>
        </div>
      </div>

      {/* Glass Search Console Box */}
      <form
        onSubmit={handleSearch}
        className="rounded-3xl border border-border bg-card/90 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xl transition-colors"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* City Selection */}
          <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-muted/60 border border-border hover:border-primary/40 transition-colors">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Location / City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
              >
                <option value="indore">Indore (Super Corridor / Bypass)</option>
                <option value="bhopal">Bhopal (Arera / Hoshangabad)</option>
                <option value="ujjain">Ujjain (Mahakal Corridor)</option>
              </select>
            </div>
          </div>

          {/* Property Category */}
          <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-muted/60 border border-border hover:border-primary/40 transition-colors">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
              >
                <option value="">All Categories</option>
                <option value="luxury-township">27-Acre Township</option>
                <option value="high-rise">High-Rise Sky Towers</option>
                <option value="bungalow">Presidential Bungalows</option>
                <option value="penthouse">Penthouse Sky Mansions</option>
                <option value="commercial">Retail &amp; Showrooms</option>
              </select>
            </div>
          </div>

          {/* Configuration (BHK) */}
          <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-muted/60 border border-border hover:border-primary/40 transition-colors">
            <Home className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Configuration
              </label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
              >
                <option value="">Any Layout</option>
                <option value="3">3 BHK Luxury</option>
                <option value="4">4 BHK Royal</option>
                <option value="5">5 BHK Sky Villa</option>
                <option value="6">6 to 8 BHK Bungalow</option>
              </select>
            </div>
          </div>

          {/* Search Trigger Button */}
          <div className="sm:col-span-3">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-sm group"
            >
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>
                {activeTab === "TOWNSHIP" ? "Explore Evara 3D" : "Search Properties"}
              </span>
            </Button>
          </div>
        </div>

        {/* Quick Location & Verified Filter Pills */}
        <div className="mt-3.5 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-muted-foreground">Popular:</span>
            {[
              { label: "Evara 27-Acre", slug: "/projects/evara-27-acre-luxury-township" },
              { label: "Super Corridor Indore", slug: "/buy?locality=super-corridor" },
              { label: "Bypass Road Bungalows", slug: "/buy?type=bungalow" },
              { label: "NRI Investment Desk", slug: "/nri-investments" },
            ].map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => router.push(pill.slug)}
                className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 border border-border text-foreground/80 hover:text-foreground transition-colors text-[11px]"
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-primary text-[11px] font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>100% RERA Escrow Verified</span>
          </div>
        </div>
      </form>
    </div>
  );
}
